import Link from "next/link";
import { notFound } from "next/navigation";

import { FormularioCategoria } from "@/components/categorias/formulario";
import { Button } from "@/components/ui/button";
import { exigirPermissao } from "@/lib/services/acesso";
import { obterCategoria } from "@/lib/services/cadastros";
import { createClient } from "@/lib/supabase/server";
import { atualizarCategoria } from "../../actions";

export default async function EditarCategoriaPage({ params }: { params: { id: string } }) {
  const ctx = await exigirPermissao("categories", "edit");
  const cat = await obterCategoria(createClient(), params.id);
  if (!cat) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Editar categoria</h1>
        {cat.is_payroll ? (
          <p className="text-sm text-muted-foreground">Categoria de folha de pagamento: só o nome pode ser alterado.</p>
        ) : null}
      </div>
      <FormularioCategoria
        unidades={ctx.unidades}
        action={atualizarCategoria.bind(null, cat.id)}
        textoBotao="Salvar alterações"
        somenteNome={cat.is_payroll}
        valores={{ business_unit_id: cat.business_unit_id, name: cat.name, type: cat.type }}
      />
      <Button asChild variant="ghost">
        <Link href="/categorias">Voltar</Link>
      </Button>
    </div>
  );
}
