"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { exigirPermissao } from "@/lib/services/acesso";
import { obterReserva, temConflito } from "@/lib/services/reservas";
import { createClient } from "@/lib/supabase/server";
import { comParametro, traduzirErroBanco } from "@/lib/utils/erros";
import { lerReserva, primeiroErro, reservaSchema } from "@/lib/validacao/reserva";

export type EstadoFormulario = { erro?: string };

function revalidar() {
  revalidatePath("/reservas");
  revalidatePath("/contas-a-receber");
  revalidatePath("/dashboard");
}

const MENSAGEM_CONFLITO = "Já existe uma reserva pendente ou confirmada nessa unidade nesse período.";

export async function criarReserva(_prev: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const ctx = await exigirPermissao("reservations", "create");
  const parsed = reservaSchema.safeParse(lerReserva(fd));
  if (!parsed.success) return { erro: primeiroErro(parsed) };
  const d = parsed.data;
  if (!ctx.unidades.some((u) => u.id === d.business_unit_id)) return { erro: "Você não tem acesso a essa unidade." };

  const supabase = createClient();
  if (await temConflito(supabase, d.business_unit_id, d.start_date, d.end_date, null)) return { erro: MENSAGEM_CONFLITO };

  // Se entrar como "confirmed", o trigger ja cria a conta a receber.
  const { error } = await supabase.from("reservations").insert({ ...d, created_by: ctx.userId });
  if (error) return { erro: traduzirErroBanco(error.message) };

  revalidar();
  redirect(`/reservas?ok=${d.status === "confirmed" ? "confirmada" : "criada"}`);
}

export async function atualizarReserva(id: string, _prev: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const ctx = await exigirPermissao("reservations", "edit");
  const parsed = reservaSchema.safeParse(lerReserva(fd));
  if (!parsed.success) return { erro: primeiroErro(parsed) };
  const d = parsed.data;
  if (!ctx.unidades.some((u) => u.id === d.business_unit_id)) return { erro: "Você não tem acesso a essa unidade." };

  const supabase = createClient();
  const atual = await obterReserva(supabase, id);
  if (!atual) return { erro: "Reserva não encontrada." };
  if (atual.status === "cancelled" || atual.status === "completed") return { erro: "Reserva cancelada ou concluída não pode ser editada." };
  if (await temConflito(supabase, d.business_unit_id, d.start_date, d.end_date, id)) return { erro: MENSAGEM_CONFLITO };

  // Status so avanca por aqui de pendente para confirmada; cancelar/concluir tem botao proprio.
  const status = atual.status === "confirmed" ? "confirmed" : d.status;
  const { error } = await supabase.from("reservations").update({ ...d, status }).eq("id", id);
  if (error) return { erro: traduzirErroBanco(error.message) };

  // A conta a receber criada na confirmacao nao acompanha edicoes de valor/data: avisa.
  revalidar();
  if (atual.status === "confirmed" && (atual.total_amount !== d.total_amount || atual.end_date !== d.end_date)) {
    redirect(comParametro("/reservas?ok=atualizada", "erro", "Valor ou data mudaram: ajuste também a conta a receber desta reserva."));
  }
  redirect("/reservas?ok=atualizada");
}

export async function alterarStatusReserva(fd: FormData) {
  await exigirPermissao("reservations", "edit");
  const id = String(fd.get("id") ?? "");
  const novo = String(fd.get("status") ?? "");
  const voltar = String(fd.get("voltar") ?? "/reservas");
  if (novo !== "confirmed" && novo !== "cancelled" && novo !== "completed") redirect(comParametro(voltar, "erro", "Situação inválida."));

  const supabase = createClient();
  const atual = await obterReserva(supabase, id);
  if (!atual) redirect(comParametro(voltar, "erro", "Reserva não encontrada."));
  if (novo === "confirmed" && (await temConflito(supabase, atual.business_unit_id, atual.start_date, atual.end_date, id))) {
    redirect(comParametro(voltar, "erro", MENSAGEM_CONFLITO));
  }

  const { error } = await supabase.from("reservations").update({ status: novo }).eq("id", id);
  revalidar();
  if (error) redirect(comParametro(voltar, "erro", traduzirErroBanco(error.message)));
  redirect(comParametro(voltar, "ok", novo === "confirmed" ? "confirmada" : novo === "cancelled" ? "cancelada" : "concluida"));
}

export async function excluirReserva(fd: FormData) {
  await exigirPermissao("reservations", "delete");
  const id = String(fd.get("id") ?? "");
  const voltar = String(fd.get("voltar") ?? "/reservas");

  const supabase = createClient();
  const atual = await obterReserva(supabase, id);
  if (!atual) redirect(comParametro(voltar, "erro", "Reserva não encontrada."));
  if (atual.status === "confirmed" || atual.status === "completed") {
    redirect(comParametro(voltar, "erro", "Reserva confirmada ou concluída não pode ser excluída. Cancele antes."));
  }

  const { error } = await supabase.from("reservations").delete().eq("id", id);
  revalidar();
  if (error) redirect(comParametro(voltar, "erro", traduzirErroBanco(error.message)));
  redirect(comParametro(voltar, "ok", "excluida"));
}
