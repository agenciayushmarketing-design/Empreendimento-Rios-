import { FormularioAnimal } from "@/components/haras/formulario-animal";
import { exigirHaras } from "@/lib/haras";
import { listarClientesHaras } from "@/lib/services/haras";
import { createClient } from "@/lib/supabase/server";
import { hojeISO } from "@/lib/utils/formatacao";
import { criarAnimal } from "../../actions";

export default async function NovoAnimalPage() {
  const { haras } = await exigirHaras();
  const clientes = await listarClientesHaras(createClient(), haras.id);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Novo animal</h1>
        <p className="text-sm text-muted-foreground">Sócios, pesagens e lançamentos entram depois, na ficha.</p>
      </div>
      <FormularioAnimal
        clientes={clientes}
        action={criarAnimal}
        textoBotao="Cadastrar animal"
        voltarPara="/haras/animais"
        valores={{ name: "", animal_type: "", sex: "", registration_code: "", birth_date: "", entry_date: hojeISO(), primary_client_id: "", origin: "", location_note: "", emergency_phone: "", notes: "" }}
      />
    </div>
  );
}
