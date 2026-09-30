import Link from "next/link";

import { Mensagens } from "@/components/mensagens";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectNativo } from "@/components/ui/select-nativo";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { exigirHaras, SEXO_ANIMAL, STATUS_ANIMAL } from "@/lib/haras";
import { listarAnimais } from "@/lib/services/haras";
import { createClient } from "@/lib/supabase/server";
import { formatarData } from "@/lib/utils/formatacao";

type Busca = { status?: string; q?: string; ok?: string; erro?: string };

const TEXTOS_OK = { excluido: "Animal excluído." };

function StatusAnimalBadge({ status }: { status: keyof typeof STATUS_ANIMAL }) {
  const v = status === "active" ? "sucesso" : status === "sold" ? "secondary" : status === "deceased" ? "erro" : "outline";
  return <Badge variant={v}>{STATUS_ANIMAL[status]}</Badge>;
}

export default async function AnimaisPage({ searchParams }: { searchParams: Busca }) {
  const { haras } = await exigirHaras();
  const status = (Object.keys(STATUS_ANIMAL) as (keyof typeof STATUS_ANIMAL)[]).find((s) => s === searchParams.status) ?? (searchParams.status === "todos" ? undefined : "active");
  const busca = searchParams.q?.trim() || undefined;
  const animais = await listarAnimais(createClient(), haras.id, status, busca);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Animais</h1>
          <p className="text-sm text-muted-foreground">{haras.nome} · {animais.length} {status ? STATUS_ANIMAL[status].toLowerCase() + (animais.length === 1 ? "" : "s") : "no total"}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost"><Link href="/haras">Voltar ao haras</Link></Button>
          <Button asChild><Link href="/haras/animais/novo">Novo animal</Link></Button>
        </div>
      </div>

      <Mensagens ok={searchParams.ok} erro={searchParams.erro} textosOk={TEXTOS_OK} />

      <form method="get" className="grid items-end gap-3 rounded-lg border p-4 sm:grid-cols-[auto_1fr_auto]">
        <div className="space-y-1">
          <label htmlFor="status" className="text-xs text-muted-foreground">Situação</label>
          <SelectNativo id="status" name="status" defaultValue={status ?? "todos"} className="w-[160px]">
            <option value="todos">Todos</option>
            {(Object.keys(STATUS_ANIMAL) as (keyof typeof STATUS_ANIMAL)[]).map((s) => (
              <option key={s} value={s}>{STATUS_ANIMAL[s]}</option>
            ))}
          </SelectNativo>
        </div>
        <div className="space-y-1">
          <label htmlFor="q" className="text-xs text-muted-foreground">Buscar por nome</label>
          <Input id="q" name="q" defaultValue={searchParams.q ?? ""} />
        </div>
        <Button type="submit" variant="secondary">Filtrar</Button>
      </form>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Animal</TableHead>
              <TableHead>Tipo / sexo</TableHead>
              <TableHead>Proprietário</TableHead>
              <TableHead>Entrada</TableHead>
              <TableHead>Situação</TableHead>
              <TableHead className="w-[1%]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {animais.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">Nenhum animal com esses filtros.</TableCell>
              </TableRow>
            ) : (
              animais.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <div className="font-medium">{a.name}</div>
                    {a.registration_code ? <div className="text-xs text-muted-foreground">Registro {a.registration_code}</div> : null}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{[a.animal_type, a.sex ? SEXO_ANIMAL[a.sex] : null].filter(Boolean).join(" · ") || "—"}</TableCell>
                  <TableCell>
                    {a.proprietario}
                    {a.socios > 0 ? <span className="ml-1 text-xs text-muted-foreground">+{a.socios} sócio(s)</span> : null}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formatarData(a.entry_date)}</TableCell>
                  <TableCell><StatusAnimalBadge status={a.status} /></TableCell>
                  <TableCell>
                    <Button asChild variant="ghost" size="sm"><Link href={`/haras/animais/${a.id}`}>Ficha</Link></Button>
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
