"use server";

// Server actions compartilhadas por Contas a Pagar e Contas a Receber. As paginas fazem
// bind(null, tipo) antes de passar para os formularios.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { CONTAS, type TipoConta } from "@/lib/contas-config";
import { exigirPermissao } from "@/lib/services/acesso";
import { createClient } from "@/lib/supabase/server";
import { comParametro, traduzirErroBanco } from "@/lib/utils/erros";
import { baixaSchema, contaSchema, lerConta, primeiroErro } from "@/lib/validacao/conta";

export type EstadoFormulario = { erro?: string };

function revalidar(tipo: TipoConta) {
  revalidatePath(CONTAS[tipo].rota);
  revalidatePath("/movimentacoes");
  revalidatePath("/contas-bancarias");
  revalidatePath("/dashboard");
}

function paraLinha(tipo: TipoConta, d: ReturnType<typeof contaSchema.parse>) {
  const comum = {
    business_unit_id: d.business_unit_id,
    description: d.description,
    amount: d.amount,
    due_date: d.due_date,
    category_id: d.category_id,
    preferred_bank_account_id: d.preferred_bank_account_id,
  };
  return tipo === "pagar"
    ? { ...comum, supplier_id: d.pessoa_id, notes: d.notes }
    : { ...comum, client_id: d.pessoa_id };
}

export async function criarConta(tipo: TipoConta, _prev: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const cfg = CONTAS[tipo];
  const ctx = await exigirPermissao(cfg.modulo, "create");
  const parsed = contaSchema.safeParse(lerConta(fd));
  if (!parsed.success) return { erro: primeiroErro(parsed) };
  const d = parsed.data;
  if (!ctx.unidades.some((u) => u.id === d.business_unit_id)) return { erro: "Você não tem acesso a essa unidade." };

  const supabase = createClient();

  if (tipo === "pagar" && d.recorrente) {
    // A funcao do banco cria o modelo e ja gera a primeira conta do mes.
    const { error } = await supabase.rpc("create_recurring_payable", {
      _payload: {
        business_unit_id: d.business_unit_id,
        supplier_id: d.pessoa_id,
        category_id: d.category_id,
        description: d.description,
        amount: d.amount,
        frequency: "monthly",
        // Sem dia informado, usa o dia do primeiro vencimento (limitado a 28 para todo mes ter).
        day_of_month: d.day_of_month ?? Math.min(Number(d.due_date.slice(8, 10)) || 1, 28),
        start_date: d.due_date,
        end_date: d.end_date,
        notes: d.notes,
      },
    });
    if (error) return { erro: traduzirErroBanco(error.message) };
    revalidar(tipo);
    redirect(`${cfg.rota}?ok=recorrente`);
  }

  const linha = { ...paraLinha(tipo, d), created_by: ctx.userId };
  const { error } =
    tipo === "pagar"
      ? await supabase.from("payables").insert(linha as never)
      : await supabase.from("receivables").insert(linha as never);
  if (error) return { erro: traduzirErroBanco(error.message) };

  revalidar(tipo);
  redirect(`${cfg.rota}?ok=criada`);
}

export async function atualizarConta(tipo: TipoConta, id: string, _prev: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const cfg = CONTAS[tipo];
  const ctx = await exigirPermissao(cfg.modulo, "edit");
  const parsed = contaSchema.safeParse(lerConta(fd));
  if (!parsed.success) return { erro: primeiroErro(parsed) };
  const d = parsed.data;
  if (!ctx.unidades.some((u) => u.id === d.business_unit_id)) return { erro: "Você não tem acesso a essa unidade." };

  const supabase = createClient();
  const linha = paraLinha(tipo, d);
  const { error } =
    tipo === "pagar"
      ? await supabase.from("payables").update(linha as never).eq("id", id).eq("status", "pending")
      : await supabase.from("receivables").update(linha as never).eq("id", id).eq("status", "pending");
  if (error) return { erro: traduzirErroBanco(error.message) };

  revalidar(tipo);
  redirect(`${cfg.rota}?ok=atualizada`);
}

export async function excluirConta(tipo: TipoConta, fd: FormData) {
  const cfg = CONTAS[tipo];
  await exigirPermissao(cfg.modulo, "delete");
  const id = String(fd.get("id") ?? "");
  const voltar = String(fd.get("voltar") ?? cfg.rota);
  const supabase = createClient();

  const { error } =
    tipo === "pagar"
      ? await supabase.from("payables").delete().eq("id", id).neq("status", "paid")
      : await supabase.from("receivables").delete().eq("id", id).neq("status", "paid");
  revalidar(tipo);
  if (error) redirect(comParametro(voltar, "erro", traduzirErroBanco(error.message)));
  redirect(comParametro(voltar, "ok", "excluida"));
}

// Baixa: a funcao do banco (versao com _bank_account_id) valida a conta bancaria, cria a
// movimentacao de caixa ja com a conta e marca a conta como paga. O nome do parametro
// desambigua a sobrecarga de 3 argumentos que tambem existe no banco.
export async function baixarConta(tipo: TipoConta, id: string, _prev: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const cfg = CONTAS[tipo];
  await exigirPermissao(cfg.modulo, "edit");
  const parsed = baixaSchema.safeParse({
    payment_date: String(fd.get("payment_date") ?? ""),
    category_id: String(fd.get("category_id") ?? ""),
    bank_account_id: String(fd.get("bank_account_id") ?? ""),
  });
  if (!parsed.success) return { erro: primeiroErro(parsed) };
  const d = parsed.data;

  const args = {
    _id: id,
    _payment_date: d.payment_date,
    _account_category_id: d.category_id as unknown as string,
    _bank_account_id: d.bank_account_id as unknown as string,
  };
  const supabase = createClient();
  const { error } =
    tipo === "pagar" ? await supabase.rpc("mark_payable_paid", args) : await supabase.rpc("mark_receivable_paid", args);
  if (error) return { erro: traduzirErroBanco(error.message) };

  revalidar(tipo);
  redirect(`${cfg.rota}?ok=baixada`);
}

export async function estornarConta(tipo: TipoConta, fd: FormData) {
  const cfg = CONTAS[tipo];
  await exigirPermissao(cfg.modulo, "edit");
  const id = String(fd.get("id") ?? "");
  const voltar = String(fd.get("voltar") ?? cfg.rota);

  const supabase = createClient();
  const { error } =
    tipo === "pagar"
      ? await supabase.rpc("unmark_payable_paid", { _id: id })
      : await supabase.rpc("unmark_receivable_paid", { _id: id });
  revalidar(tipo);
  if (error) redirect(comParametro(voltar, "erro", traduzirErroBanco(error.message)));
  redirect(comParametro(voltar, "ok", "estornada"));
}

export async function encerrarRecorrencia(fd: FormData) {
  await exigirPermissao("payables", "delete");
  const id = String(fd.get("id") ?? "");
  const voltar = "/contas-a-pagar";
  const { error } = await createClient().rpc("cancel_recurring_payable_series", { _template_id: id });
  revalidar("pagar");
  if (error) redirect(comParametro(voltar, "erro", traduzirErroBanco(error.message)));
  redirect(comParametro(voltar, "ok", "recorrencia_encerrada"));
}
