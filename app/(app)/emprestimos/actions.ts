"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { exigirPermissao } from "@/lib/services/acesso";
import { descricaoParcela, obterEmprestimo } from "@/lib/services/emprestimos";
import { createClient } from "@/lib/supabase/server";
import { comParametro, traduzirErroBanco } from "@/lib/utils/erros";
import { emprestimoSchema, lerEmprestimo, primeiroErro, recebimentoSchema } from "@/lib/validacao/emprestimo";

export type EstadoFormulario = { erro?: string };

function revalidar(id?: string) {
  revalidatePath("/emprestimos");
  if (id) revalidatePath(`/emprestimos/${id}`);
  revalidatePath("/movimentacoes");
  revalidatePath("/dashboard");
}

export async function criarEmprestimo(_prev: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const ctx = await exigirPermissao("loans", "create");
  const parsed = emprestimoSchema.safeParse(lerEmprestimo(fd));
  if (!parsed.success) return { erro: primeiroErro(parsed) };
  const d = parsed.data;
  if (!ctx.unidades.some((u) => u.id === d.business_unit_id)) return { erro: "Você não tem acesso a essa unidade." };

  // O trigger generate_loan_installments cria as parcelas logo apos o insert.
  const { data, error } = await createClient()
    .from("loans")
    .insert({ ...d, created_by: ctx.userId })
    .select("id")
    .single();
  if (error || !data) return { erro: traduzirErroBanco(error?.message ?? "sem retorno") };

  revalidar(data.id);
  redirect(`/emprestimos/${data.id}?ok=criado`);
}

export async function alterarStatusEmprestimo(fd: FormData) {
  await exigirPermissao("loans", "edit");
  const id = String(fd.get("id") ?? "");
  const status = String(fd.get("status") ?? "");
  if (status !== "active" && status !== "defaulted") redirect(comParametro(`/emprestimos/${id}`, "erro", "Status inválido."));

  const { error } = await createClient().from("loans").update({ status }).eq("id", id);
  revalidar(id);
  if (error) redirect(comParametro(`/emprestimos/${id}`, "erro", traduzirErroBanco(error.message)));
  redirect(comParametro(`/emprestimos/${id}`, "ok", status === "defaulted" ? "inadimplente" : "reativado"));
}

export async function excluirEmprestimo(fd: FormData) {
  await exigirPermissao("loans", "delete");
  const id = String(fd.get("id") ?? "");
  const supabase = createClient();

  const e = await obterEmprestimo(supabase, id);
  if (!e) redirect(comParametro("/emprestimos", "erro", "Empréstimo não encontrado."));
  if (e.pagas > 0) redirect(comParametro(`/emprestimos/${id}`, "erro", "Empréstimo com parcelas recebidas não pode ser excluído. Estorne as parcelas antes."));

  // As parcelas caem em cascata (FK ON DELETE CASCADE).
  const { error } = await supabase.from("loans").delete().eq("id", id);
  revalidar();
  if (error) redirect(comParametro(`/emprestimos/${id}`, "erro", traduzirErroBanco(error.message)));
  redirect(comParametro("/emprestimos", "ok", "excluido"));
}

// Recebimento: cria a movimentacao de caixa (receita) e marca a parcela como paga.
// Se a parcela for a ultima em aberto, o emprestimo vira "quitado".
export async function receberParcela(loanId: string, numero: number, _prev: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const ctx = await exigirPermissao("loans", "edit");
  const parsed = recebimentoSchema.safeParse({
    payment_date: String(fd.get("payment_date") ?? ""),
    category_id: String(fd.get("category_id") ?? ""),
    bank_account_id: String(fd.get("bank_account_id") ?? ""),
  });
  if (!parsed.success) return { erro: primeiroErro(parsed) };
  const d = parsed.data;

  const supabase = createClient();
  const e = await obterEmprestimo(supabase, loanId);
  if (!e) return { erro: "Empréstimo não encontrado." };
  const parcela = e.parcelas.find((p) => p.installment_number === numero);
  if (!parcela) return { erro: "Parcela não encontrada." };
  if (parcela.status === "paid") return { erro: "Esta parcela já foi recebida." };

  const { data: tx, error: eTx } = await supabase
    .from("transactions")
    .insert({
      business_unit_id: e.business_unit_id,
      date: d.payment_date,
      description: descricaoParcela(e, numero),
      category_id: d.category_id,
      type: "income",
      amount: parcela.amount,
      status: "paid",
      client_id: e.client_id,
      bank_account_id: d.bank_account_id,
      created_by: ctx.userId,
    })
    .select("id")
    .single();
  if (eTx || !tx) return { erro: traduzirErroBanco(eTx?.message ?? "sem retorno") };

  const { error: eParc } = await supabase
    .from("loan_installments")
    .update({ status: "paid", paid_at: `${d.payment_date}T12:00:00Z` })
    .eq("id", parcela.id);
  if (eParc) {
    await supabase.from("transactions").delete().eq("id", tx.id);
    return { erro: traduzirErroBanco(eParc.message) };
  }

  const restantes = e.parcelas.filter((p) => p.id !== parcela.id && p.status !== "paid" && p.status !== "cancelled").length;
  if (restantes === 0) await supabase.from("loans").update({ status: "paid_off" }).eq("id", loanId);

  revalidar(loanId);
  redirect(`/emprestimos/${loanId}?ok=recebida`);
}

// Estorno: volta a parcela para pendente e remove a movimentacao gerada (achada pela descricao).
export async function estornarParcela(fd: FormData) {
  await exigirPermissao("loans", "edit");
  const loanId = String(fd.get("loan_id") ?? "");
  const numero = Number(fd.get("numero") ?? 0);
  const voltar = `/emprestimos/${loanId}`;

  const supabase = createClient();
  const e = await obterEmprestimo(supabase, loanId);
  if (!e) redirect(comParametro("/emprestimos", "erro", "Empréstimo não encontrado."));
  const parcela = e.parcelas.find((p) => p.installment_number === numero);
  if (!parcela || parcela.status !== "paid") redirect(comParametro(voltar, "erro", "Parcela não está recebida."));

  const { error: eParc } = await supabase.from("loan_installments").update({ status: "pending", paid_at: null }).eq("id", parcela.id);
  if (eParc) redirect(comParametro(voltar, "erro", traduzirErroBanco(eParc.message)));

  const { data: txs } = await supabase
    .from("transactions")
    .select("id")
    .eq("business_unit_id", e.business_unit_id)
    .eq("description", descricaoParcela(e, numero))
    .eq("amount", parcela.amount)
    .eq("type", "income")
    .limit(1);
  let aviso: string | null = null;
  if (txs && txs.length > 0) {
    const { error } = await supabase.from("transactions").delete().eq("id", txs[0].id);
    if (error) aviso = `Parcela reaberta, mas a movimentação não pôde ser removida: ${traduzirErroBanco(error.message)}`;
  } else {
    aviso = "Parcela reaberta. A movimentação de caixa correspondente não foi encontrada; confira em Movimentações.";
  }

  if (e.status === "paid_off") await supabase.from("loans").update({ status: "active" }).eq("id", loanId);

  revalidar(loanId);
  if (aviso) redirect(comParametro(voltar, "erro", aviso));
  redirect(comParametro(voltar, "ok", "estornada"));
}
