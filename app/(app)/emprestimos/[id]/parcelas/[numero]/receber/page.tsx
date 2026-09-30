import { notFound } from "next/navigation";

import { FormularioRecebimento } from "@/components/emprestimos/formulario-recebimento";
import { exigirPermissao } from "@/lib/services/acesso";
import { obterEmprestimo } from "@/lib/services/emprestimos";
import { opcoesDoFormulario } from "@/lib/services/movimentacoes";
import { createClient } from "@/lib/supabase/server";
import { formatarData, formatarMoeda, hojeISO } from "@/lib/utils/formatacao";
import { receberParcela } from "../../../../actions";

export default async function ReceberParcelaPage({ params }: { params: { id: string; numero: string } }) {
  await exigirPermissao("loans", "edit");
  const supabase = createClient();
  const numero = Number(params.numero);
  const [e, opcoes] = await Promise.all([obterEmprestimo(supabase, params.id), opcoesDoFormulario(supabase)]);
  if (!e) notFound();
  const parcela = e.parcelas.find((p) => p.installment_number === numero);
  if (!parcela) notFound();

  const categorias = opcoes.categorias.filter((c) => c.business_unit_id === e.business_unit_id && c.type === "income");
  const contas = opcoes.contas.filter((c) => c.unidades.length === 0 || c.unidades.includes(e.business_unit_id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Receber parcela {numero}/{e.term_months}
        </h1>
        <p className="text-sm text-muted-foreground">
          {e.clienteNome} · {formatarMoeda(parcela.amount)} · vencimento {formatarData(parcela.due_date)}
        </p>
      </div>
      {parcela.status === "paid" ? (
        <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">Esta parcela já foi recebida.</p>
      ) : (
        <FormularioRecebimento loanId={e.id} categorias={categorias} contas={contas} hoje={hojeISO()} action={receberParcela.bind(null, e.id, numero)} />
      )}
    </div>
  );
}
