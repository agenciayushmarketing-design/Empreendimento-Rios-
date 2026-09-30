import Link from "next/link";
import { redirect } from "next/navigation";

import { FormularioUnidade } from "@/components/equipe/formulario-unidade";
import { Mensagens } from "@/components/mensagens";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TIPOS_UNIDADE } from "@/lib/haras";
import { carregarContextoAcesso } from "@/lib/services/acesso";
import { atualizarUnidade, criarUnidade } from "./actions";

type Busca = { ok?: string; erro?: string };

const TEXTOS_OK = { criada: "Unidade criada. Ela já aparece no seletor do topo.", atualizada: "Unidade atualizada." };

export default async function UnidadesPage({ searchParams }: { searchParams: Busca }) {
  const ctx = await carregarContextoAcesso();
  if (!ctx) redirect("/login");
  if (!ctx.isAdmin) redirect("/dashboard?erro=sem-acesso");

  const tiposUsados = new Set(ctx.unidades.map((u) => u.tipo));
  const tiposLivres = (Object.keys(TIPOS_UNIDADE) as (keyof typeof TIPOS_UNIDADE)[]).filter((t) => !tiposUsados.has(t));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Unidades de negócio</h1>
          <p className="text-sm text-muted-foreground">Os negócios da empresa. Cada tipo só pode existir uma vez.</p>
        </div>
        <Button asChild variant="ghost">
          <Link href="/equipe">Voltar</Link>
        </Button>
      </div>

      <Mensagens ok={searchParams.ok} erro={searchParams.erro} textosOk={TEXTOS_OK} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ctx.unidades.map((u) => (
          <Card key={u.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: u.cor }} />
                <CardTitle className="text-base">{u.nome}</CardTitle>
                <Badge variant="outline">{TIPOS_UNIDADE[u.tipo]}</Badge>
              </div>
              <CardDescription>Editar nome e cor</CardDescription>
            </CardHeader>
            <CardContent>
              <FormularioUnidade modo="editar" action={atualizarUnidade.bind(null, u.id)} valores={{ name: u.nome, type: u.tipo, color: u.cor }} tiposDisponiveis={[]} />
            </CardContent>
          </Card>
        ))}
      </div>

      {tiposLivres.length > 0 ? (
        <Card className="max-w-xl">
          <CardHeader className="pb-2">
            <CardTitle>Nova unidade</CardTitle>
            <CardDescription>
              Tipos ainda não usados: {tiposLivres.map((t) => TIPOS_UNIDADE[t]).join(", ")}.
              {tiposLivres.includes("haras") ? " O módulo Haras só aparece no menu depois que a unidade Haras existir." : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormularioUnidade modo="criar" action={criarUnidade} valores={{ name: "", type: tiposLivres[0], color: "#1E3A5F" }} tiposDisponiveis={tiposLivres} />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
