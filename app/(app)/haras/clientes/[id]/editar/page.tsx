import { notFound } from "next/navigation";

import { FormularioClienteHaras } from "@/components/haras/formularios-cadastro";
import { exigirHaras } from "@/lib/haras";
import { createClient } from "@/lib/supabase/server";
import { atualizarClienteHaras } from "../../../actions";

export default async function EditarClienteHarasPage({ params }: { params: { id: string } }) {
  await exigirHaras();
  const { data: c } = await createClient()
    .from("haras_clients")
    .select("id, name, document, email, phone, address, is_owner_account, notes")
    .eq("id", params.id)
    .maybeSingle();
  if (!c) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Editar cliente do haras</h1>
        <p className="text-sm text-muted-foreground">{c.name}</p>
      </div>
      <div className="max-w-2xl">
        <FormularioClienteHaras
          action={atualizarClienteHaras.bind(null, c.id)}
          textoBotao="Salvar alterações"
          valores={{
            name: c.name, document: c.document ?? "", email: c.email ?? "", phone: c.phone ?? "", address: c.address ?? "",
            is_owner_account: c.is_owner_account, notes: c.notes ?? "",
          }}
        />
      </div>
    </div>
  );
}
