import { notFound } from "next/navigation";

import { FormularioBaixa } from "@/components/contas/formulario-baixa";
import { FormularioConta } from "@/components/contas/formulario";
import { CONTAS, type TipoConta } from "@/lib/contas-config";
import { exigirPermissao } from "@/lib/services/acesso";
import { obterConta } from "@/lib/services/contas";
import { opcoesDoFormulario } from "@/lib/services/movimentacoes";
import { createClient } from "@/lib/supabase/server";
import { lerUnidadeAtual, unidadeIdOuNull } from "@/lib/unidade-atual";
import { formatarData, formatarMoeda, hojeISO, valorParaCampo } from "@/lib/utils/formatacao";
import { atualizarConta, baixarConta, criarConta } from "@/app/(app)/contas-actions";

export async function PaginaNovaConta({ tipo }: { tipo: TipoConta }) {
  const cfg = CONTAS[tipo];
  const ctx = await exigirPermissao(cfg.modulo, "create");
  const opcoes = await opcoesDoFormulario(createClient());
  const unidadeId = unidadeIdOuNull(lerUnidadeAtual(ctx.unidades)) ?? (ctx.unidades.length === 1 ? ctx.unidades[0].id : "");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nova {cfg.singular}</h1>
        <p className="text-sm text-muted-foreground">
          {tipo === "pagar" ? "Uma despesa prevista. A baixa gera a saída de caixa." : "Um valor a receber. A baixa gera a entrada de caixa."}
        </p>
      </div>
      <FormularioConta
        cfg={cfg}
        unidades={ctx.unidades}
        opcoes={opcoes}
        action={criarConta.bind(null, tipo)}
        textoBotao="Registrar"
        permitirRecorrencia
        valores={{
          business_unit_id: unidadeId,
          description: "",
          amount: "",
          due_date: hojeISO(),
          category_id: "",
          pessoa_id: "",
          preferred_bank_account_id: "",
          notes: "",
        }}
      />
    </div>
  );
}

export async function PaginaEditarConta({ tipo, id }: { tipo: TipoConta; id: string }) {
  const cfg = CONTAS[tipo];
  const ctx = await exigirPermissao(cfg.modulo, "edit");
  const supabase = createClient();
  const [conta, opcoes] = await Promise.all([obterConta(supabase, tipo, id), opcoesDoFormulario(supabase)]);
  if (!conta) notFound();

  let bloqueada: string | undefined;
  if (conta.status === "paid") bloqueada = `Esta conta já foi ${cfg.baixaFeita.toLowerCase()}. Para alterar, estorne a baixa na lista.`;
  else if (conta.status !== "pending" && conta.status !== "overdue") bloqueada = "Esta conta não está em aberto.";
  else if (conta.closed_at) bloqueada = "Esta conta está em período fechado. Reabra o período antes de alterar.";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Editar {cfg.singular}</h1>
        <p className="text-sm text-muted-foreground">{conta.description}</p>
      </div>
      <FormularioConta
        cfg={cfg}
        unidades={ctx.unidades}
        opcoes={opcoes}
        action={atualizarConta.bind(null, tipo, conta.id)}
        textoBotao="Salvar alterações"
        bloqueada={bloqueada}
        valores={{
          business_unit_id: conta.business_unit_id,
          description: conta.description,
          amount: valorParaCampo(conta.amount),
          due_date: conta.due_date,
          category_id: conta.category_id ?? "",
          pessoa_id: conta.pessoa_id ?? "",
          preferred_bank_account_id: conta.preferred_bank_account_id ?? "",
          notes: conta.notes ?? "",
        }}
      />
    </div>
  );
}

export async function PaginaBaixarConta({ tipo, id }: { tipo: TipoConta; id: string }) {
  const cfg = CONTAS[tipo];
  await exigirPermissao(cfg.modulo, "edit");
  const supabase = createClient();
  const [conta, opcoes] = await Promise.all([obterConta(supabase, tipo, id), opcoesDoFormulario(supabase)]);
  if (!conta) notFound();

  const categorias = opcoes.categorias.filter((c) => c.business_unit_id === conta.business_unit_id && c.type === cfg.tipoCategoria);
  const contas = opcoes.contas.filter((c) => c.unidades.length === 0 || c.unidades.includes(conta.business_unit_id));
  const jaBaixada = conta.status === "paid";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{cfg.verboBaixa}: {conta.description}</h1>
        <p className="text-sm text-muted-foreground">
          Valor {formatarMoeda(conta.amount)} · vencimento {formatarData(conta.due_date)}
        </p>
      </div>
      {jaBaixada ? (
        <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          Esta conta já foi {cfg.baixaFeita.toLowerCase()}. Para refazer, estorne a baixa na lista.
        </p>
      ) : (
        <FormularioBaixa
          cfg={cfg}
          categorias={categorias}
          contas={contas}
          action={baixarConta.bind(null, tipo, conta.id)}
          valores={{
            payment_date: hojeISO(),
            category_id: conta.category_id ?? "",
            bank_account_id: conta.preferred_bank_account_id ?? "",
          }}
        />
      )}
    </div>
  );
}
