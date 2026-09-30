import Link from "next/link";

import { BotaoExcluir } from "@/components/botao-excluir";
import { FormularioClienteHaras } from "@/components/haras/formularios-cadastro";
import { Mensagens } from "@/components/mensagens";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { exigirHaras } from "@/lib/haras";
import { listarClientesHaras } from "@/lib/services/haras";
import { createClient } from "@/lib/supabase/server";
import { criarClienteHaras, excluirClienteHaras } from "../actions";

type Busca = { q?: string; ok?: string; erro?: string };

const TEXTOS_OK = { criado: "Cliente do haras cadastrado.", atualizado: "Cliente atualizado.", excluido: "Cliente excluído." };

export default async function ClientesHarasPage({ searchParams }: { searchParams: Busca }) {
  const { haras } = await exigirHaras();
  const busca = searchParams.q?.trim() || undefined;
  const clientes = await listarClientesHaras(createClient(), haras.id, busca);
  const voltar = busca ? `/haras/clientes?q=${encodeURIComponent(busca)}` : "/haras/clientes";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Proprietários e sócios</h1>
          <p className="text-sm text-muted-foreground">Quem é dono, total ou em parte, dos animais do haras.</p>
        </div>
        <Button asChild variant="ghost">
          <Link href="/haras">Voltar ao haras</Link>
        </Button>
      </div>

      <Mensagens ok={searchParams.ok} erro={searchParams.erro} textosOk={TEXTOS_OK} />

      <Card>
        <CardHeader className="pb-3"><CardTitle>Novo cliente do haras</CardTitle></CardHeader>
        <CardContent>
          <FormularioClienteHaras
            compacto
            action={criarClienteHaras}
            textoBotao="Cadastrar"
            valores={{ name: "", document: "", email: "", phone: "", address: "", is_owner_account: false, notes: "" }}
          />
        </CardContent>
      </Card>

      <form method="get" className="flex max-w-md items-end gap-2">
        <div className="flex-1 space-y-1">
          <label htmlFor="q" className="text-xs text-muted-foreground">Buscar por nome</label>
          <Input id="q" name="q" defaultValue={searchParams.q ?? ""} />
        </div>
        <Button type="submit" variant="secondary">Buscar</Button>
      </form>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead className="w-[1%]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">Nenhum cliente do haras cadastrado.</TableCell>
              </TableRow>
            ) : (
              clientes.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <span className="font-medium">{c.name}</span>
                    {c.is_owner_account ? <Badge variant="outline" className="ml-2">Conta da dona</Badge> : null}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.document ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{[c.phone, c.email].filter(Boolean).join(" · ") || "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/haras/clientes/${c.id}/editar`}>Editar</Link>
                      </Button>
                      <BotaoExcluir action={excluirClienteHaras} id={c.id} voltar={voltar} mensagem={`Excluir "${c.name}"? Não é possível se for dono ou sócio de algum animal.`} />
                    </div>
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
