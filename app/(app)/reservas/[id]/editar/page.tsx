import { notFound } from "next/navigation";

import { FormularioReserva } from "@/components/reservas/formulario";
import { exigirPermissao } from "@/lib/services/acesso";
import { obterReserva } from "@/lib/services/reservas";
import { createClient } from "@/lib/supabase/server";
import { valorParaCampo } from "@/lib/utils/formatacao";
import { atualizarReserva } from "../../actions";

export default async function EditarReservaPage({ params }: { params: { id: string } }) {
  const ctx = await exigirPermissao("reservations", "edit");
  const supabase = createClient();
  const [reserva, { data: clientes }] = await Promise.all([
    obterReserva(supabase, params.id),
    supabase.from("clients").select("id, business_unit_id, name").order("name"),
  ]);
  if (!reserva) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Editar reserva</h1>
        <p className="text-sm text-muted-foreground">{reserva.title}</p>
      </div>
      {reserva.status === "cancelled" || reserva.status === "completed" ? (
        <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">Reserva cancelada ou concluída não pode ser editada.</p>
      ) : (
        <FormularioReserva
          unidades={ctx.unidades}
          clientes={clientes ?? []}
          action={atualizarReserva.bind(null, reserva.id)}
          textoBotao="Salvar alterações"
          jaConfirmada={reserva.status === "confirmed"}
          valores={{
            business_unit_id: reserva.business_unit_id,
            client_id: reserva.client_id ?? "",
            title: reserva.title,
            start_date: reserva.start_date,
            end_date: reserva.end_date,
            total_amount: valorParaCampo(reserva.total_amount),
            status: reserva.status === "confirmed" ? "confirmed" : "pending",
            notes: reserva.notes ?? "",
          }}
        />
      )}
    </div>
  );
}
