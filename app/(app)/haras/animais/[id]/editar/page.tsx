import { notFound } from "next/navigation";

import { FormularioAnimal } from "@/components/haras/formulario-animal";
import { exigirHaras } from "@/lib/haras";
import { listarClientesHaras, obterAnimal } from "@/lib/services/haras";
import { createClient } from "@/lib/supabase/server";
import { atualizarAnimal } from "../../../actions";

export default async function EditarAnimalPage({ params }: { params: { id: string } }) {
  const { haras } = await exigirHaras();
  const supabase = createClient();
  const [a, clientes] = await Promise.all([obterAnimal(supabase, params.id), listarClientesHaras(supabase, haras.id)]);
  if (!a) notFound();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Editar animal</h1>
        <p className="text-sm text-muted-foreground">{a.name}</p>
      </div>
      <FormularioAnimal
        clientes={clientes}
        action={atualizarAnimal.bind(null, a.id)}
        textoBotao="Salvar alterações"
        voltarPara={`/haras/animais/${a.id}`}
        valores={{
          name: a.name, animal_type: a.animal_type ?? "", sex: a.sex ?? "", registration_code: a.registration_code ?? "",
          birth_date: a.birth_date ?? "", entry_date: a.entry_date, primary_client_id: a.primary_client_id, origin: a.origin ?? "",
          location_note: a.location_note ?? "", emergency_phone: a.emergency_phone ?? "", notes: a.notes ?? "",
        }}
      />
    </div>
  );
}
