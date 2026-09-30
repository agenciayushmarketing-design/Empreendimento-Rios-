import Link from "next/link";
import { notFound } from "next/navigation";

import { FormularioCliente } from "@/components/clientes/formulario";
import { Button } from "@/components/ui/button";
import { exigirPermissao } from "@/lib/services/acesso";
import { obterCliente } from "@/lib/services/cadastros";
import { createClient } from "@/lib/supabase/server";
import { atualizarCliente } from "../../actions";

export default async function EditarClientePage({ params }: { params: { id: string } }) {
  const ctx = await exigirPermissao("clients", "edit");
  const cli = await obterCliente(createClient(), params.id);
  if (!cli) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Editar cliente</h1>
        <p className="text-sm text-muted-foreground">{cli.name}</p>
      </div>
      <FormularioCliente
        unidades={ctx.unidades}
        action={atualizarCliente.bind(null, cli.id)}
        textoBotao="Salvar alterações"
        valores={{ business_unit_id: cli.business_unit_id, name: cli.name, email: cli.email ?? "", phone: cli.phone ?? "" }}
      />
      <Button asChild variant="ghost">
        <Link href="/clientes">Voltar</Link>
      </Button>
    </div>
  );
}
