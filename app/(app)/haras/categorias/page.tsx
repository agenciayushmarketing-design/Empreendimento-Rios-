import Link from "next/link";

import { BotaoExcluir } from "@/components/botao-excluir";
import { FormularioCategoriaHaras } from "@/components/haras/formularios-cadastro";
import { Mensagens } from "@/components/mensagens";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { exigirHaras } from "@/lib/haras";
import { listarCategoriasHaras } from "@/lib/services/haras";
import { createClient } from "@/lib/supabase/server";
import { criarCategoriaHaras, excluirCategoriaHaras } from "../actions";

type Busca = { ok?: string; erro?: string };

const TEXTOS_OK = { criada: "Categoria criada.", excluida: "Categoria excluída." };

export default async function CategoriasHarasPage({ searchParams }: { searchParams: Busca }) {
  const { haras } = await exigirHaras();
  const categorias = await listarCategoriasHaras(createClient(), haras.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Categorias do haras</h1>
          <p className="text-sm text-muted-foreground">Tipos de custo e receita lançados por animal. Separadas das categorias do caixa.</p>
        </div>
        <Button asChild variant="ghost">
          <Link href="/haras">Voltar ao haras</Link>
        </Button>
      </div>

      <Mensagens ok={searchParams.ok} erro={searchParams.erro} textosOk={TEXTOS_OK} />

      <Card>
        <CardHeader className="pb-3"><CardTitle>Nova categoria</CardTitle></CardHeader>
        <CardContent><FormularioCategoriaHaras action={criarCategoriaHaras} /></CardContent>
      </Card>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="w-[130px]">Tipo</TableHead>
              <TableHead className="w-[1%]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categorias.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="py-10 text-center text-muted-foreground">
                  Nenhuma categoria. Sugestões: Ração, Veterinário, Ferrageamento, Cobertura, Prêmio.
                </TableCell>
              </TableRow>
            ) : (
              categorias.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.type === "income" ? <Badge variant="sucesso">Receita</Badge> : <Badge variant="erro">Despesa</Badge>}</TableCell>
                  <TableCell>
                    <BotaoExcluir action={excluirCategoriaHaras} id={c.id} voltar="/haras/categorias" mensagem={`Excluir "${c.name}"? Não é possível se houver lançamentos nela.`} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
