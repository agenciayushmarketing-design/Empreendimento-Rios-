import { FormularioReserva } from "@/components/reservas/formulario";
import { exigirPermissao } from "@/lib/services/acesso";
import { createClient } from "@/lib/supabase/server";
import { lerUnidadeAtual, unidadeIdOuNull } from "@/lib/unidade-atual";
import { hojeISO } from "@/lib/utils/formatacao";
import { criarReserva } from "../actions";

export default async function NovaReservaPage() {
  const ctx = await exigirPermissao("reservations", "create");
  const { data: clientes } = await createClient().from("clients").select("id, business_unit_id, name").order("name");
  const unidadeId = unidadeIdOuNull(lerUnidadeAtual(ctx.unidades)) ?? (ctx.unidades.length === 1 ? ctx.unidades[0].id : "");
  const hoje = hojeISO();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nova reserva</h1>
        <p className="text-sm text-muted-foreground">Evento, locação ou hospedagem.</p>
      </div>
      <FormularioReserva
        unidades={ctx.unidades}
        clientes={clientes ?? []}
        action={criarReserva}
        textoBotao="Registrar"
        valores={{ business_unit_id: unidadeId, client_id: "", title: "", start_date: hoje, end_date: hoje, total_amount: "", status: "pending", notes: "" }}
      />
    </div>
  );
}
