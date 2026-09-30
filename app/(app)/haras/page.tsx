import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { unidadeHaras } from "@/lib/haras";
import { carregarContextoAcesso } from "@/lib/services/acesso";
import { painelHaras } from "@/lib/services/haras";
import { createClient } from "@/lib/supabase/server";
import { formatarMoeda } from "@/lib/utils/formatacao";

export default async function HarasPage() {
  const ctx = await carregarContextoAcesso();
  if (!ctx) redirect("/login");
  const haras = unidadeHaras(ctx);

  if (!haras) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Haras</h1>
        <p className="max-w-xl text-sm text-muted-foreground">
          {ctx.isAdmin
            ? "A unidade do tipo Haras ainda não existe. Crie em Equipe e Acessos, Unidades de negócio, e o módulo aparece no menu."
            : "Você não tem acesso à unidade Haras. Peça ao administrador para liberar."}
        </p>
        {ctx.isAdmin ? (
          <Button asChild>
            <Link href="/equipe/unidades">Criar unidade Haras</Link>
          </Button>
        ) : null}
      </div>
    );
  }

  const p = await painelHaras(createClient(), haras.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Haras</h1>
        <p className="text-sm text-muted-foreground">{haras.nome} · animais, proprietários, custos e receitas por animal</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle>Animais ativos</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">{p.animaisAtivos}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle>Proprietários e sócios</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">{p.clientes}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Lançamentos do mês</CardTitle>
            <CardDescription>Receitas e despesas por animal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="flex justify-between"><span>Receitas</span><span className="font-medium text-emerald-700">{formatarMoeda(p.receitasMes)}</span></div>
            <div className="flex justify-between"><span>Despesas</span><span className="font-medium text-red-700">{formatarMoeda(p.despesasMes)}</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Partes pendentes</CardTitle>
            <CardDescription>Rateios ainda não acertados com sócios</CardDescription>
          </CardHeader>
          <CardContent className={`text-2xl font-semibold ${p.partesPendentes > 0 ? "text-amber-700" : ""}`}>{p.partesPendentes}</CardContent>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Animais</CardTitle>
            <CardDescription>Cadastro, sócios, pesagens, movimentações e lançamentos por animal.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild><Link href="/haras/animais">Abrir animais</Link></Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Proprietários e sócios</CardTitle>
            <CardDescription>Quem é dono de cada animal e recebe o rateio.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline"><Link href="/haras/clientes">Abrir clientes do haras</Link></Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Categorias</CardTitle>
            <CardDescription>Tipos de custo e receita por animal (ração, veterinário, cobertura).</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline"><Link href="/haras/categorias">Abrir categorias</Link></Button>
          </CardContent>
        </Card>
      </section>

      <p className="text-xs text-muted-foreground">
        Vendas de animais, compras e reprodução ficam em módulos próprios, liberados por feature flag quando a cliente estiver pronta.
      </p>
    </div>
  );
}
