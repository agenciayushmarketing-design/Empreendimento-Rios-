"use client";

// Formularios da ficha do animal: socios, pesagem, movimentacao de local e lancamento.
import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNativo } from "@/components/ui/select-nativo";
import type { EstadoFormulario } from "@/app/(app)/haras/actions";

type Acao = (prev: EstadoFormulario, fd: FormData) => Promise<EstadoFormulario>;
type Opcao = { id: string; name: string };

function Botao({ texto, variante }: { texto: string; variante?: "default" | "secondary" }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" variant={variante ?? "secondary"} disabled={pending}>
      {pending ? "Salvando..." : texto}
    </Button>
  );
}

export function FormularioSocios({
  clientes,
  atual,
  action,
}: {
  clientes: Opcao[];
  atual: { client_id: string; ownership_percentage: number }[];
  action: Acao;
}) {
  const [estado, formAction] = useFormState(action, {});
  const [linhas, setLinhas] = useState(atual.length > 0 ? atual.map((a) => ({ client_id: a.client_id, pct: String(a.ownership_percentage).replace(".", ",") })) : []);
  const total = linhas.reduce((s, l) => s + (Number(l.pct.replace(/\./g, "").replace(",", ".")) || 0), 0);

  return (
    <form action={formAction} className="space-y-3">
      {linhas.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sem sócios: 100% do proprietário principal.</p>
      ) : (
        <div className="space-y-2">
          {linhas.map((l, i) => (
            <div key={i} className="flex items-center gap-2">
              <SelectNativo
                name="socio_client_id"
                value={l.client_id}
                onChange={(e) => setLinhas(linhas.map((x, j) => (j === i ? { ...x, client_id: e.target.value } : x)))}
                className="flex-1"
                aria-label="Sócio"
              >
                <option value="">Selecione...</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </SelectNativo>
              <Input
                name="socio_percentual"
                value={l.pct}
                onChange={(e) => setLinhas(linhas.map((x, j) => (j === i ? { ...x, pct: e.target.value } : x)))}
                inputMode="decimal"
                className="w-24"
                placeholder="%"
                aria-label="Percentual"
              />
              <span className="text-sm text-muted-foreground">%</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => setLinhas(linhas.filter((_, j) => j !== i))}>
                Remover
              </Button>
            </div>
          ))}
          <p className={`text-sm ${Math.abs(total - 100) < 0.001 ? "text-muted-foreground" : "text-destructive"}`}>Total: {total.toLocaleString("pt-BR")}%</p>
        </div>
      )}
      {estado?.erro ? <p className="text-sm text-destructive">{estado?.erro}</p> : null}
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => setLinhas([...linhas, { client_id: "", pct: "" }])}>
          Adicionar sócio
        </Button>
        <Botao texto="Salvar sócios" variante="default" />
      </div>
    </form>
  );
}

export function FormularioPesagem({ hoje, action }: { hoje: string; action: Acao }) {
  const [estado, formAction] = useFormState(action, {});
  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <div className="space-y-1">
        <Label htmlFor="weighed_at">Data</Label>
        <Input id="weighed_at" name="weighed_at" type="date" defaultValue={hoje} className="w-[160px]" required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="weight_kg">Peso (kg)</Label>
        <Input id="weight_kg" name="weight_kg" inputMode="decimal" className="w-[120px]" required />
      </div>
      <div className="min-w-[160px] flex-1 space-y-1">
        <Label htmlFor="notes_peso">Obs.</Label>
        <Input id="notes_peso" name="notes" maxLength={200} />
      </div>
      <Botao texto="Registrar pesagem" />
      {estado?.erro ? <p className="w-full text-sm text-destructive">{estado?.erro}</p> : null}
    </form>
  );
}

export function FormularioMovimentacaoAnimal({ hoje, localAtual, action }: { hoje: string; localAtual: string; action: Acao }) {
  const [estado, formAction] = useFormState(action, {});
  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="from_location" value={localAtual} />
      <div className="space-y-1">
        <Label htmlFor="moved_at">Data</Label>
        <Input id="moved_at" name="moved_at" type="date" defaultValue={hoje} className="w-[160px]" required />
      </div>
      <div className="min-w-[160px] flex-1 space-y-1">
        <Label htmlFor="to_location">Para onde</Label>
        <Input id="to_location" name="to_location" maxLength={200} placeholder="Ex.: Pasto sul, Clínica X" required />
      </div>
      <div className="min-w-[160px] flex-1 space-y-1">
        <Label htmlFor="reason">Motivo</Label>
        <Input id="reason" name="reason" maxLength={200} />
      </div>
      <Botao texto="Registrar movimentação" />
      {estado?.erro ? <p className="w-full text-sm text-destructive">{estado?.erro}</p> : null}
    </form>
  );
}

export function FormularioLancamentoAnimal({ hoje, categorias, action }: { hoje: string; categorias: { id: string; name: string; type: string }[]; action: Acao }) {
  const [estado, formAction] = useFormState(action, {});
  const [tipo, setTipo] = useState<"income" | "expense">("expense");
  const cats = categorias.filter((c) => c.type === tipo);
  return (
    <form action={formAction} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[140px_1fr_1fr_150px_160px]">
        <div className="space-y-1">
          <Label htmlFor="type">Tipo</Label>
          <SelectNativo id="type" name="type" value={tipo} onChange={(e) => setTipo(e.target.value as "income" | "expense")}>
            <option value="expense">Despesa</option>
            <option value="income">Receita</option>
          </SelectNativo>
        </div>
        <div className="space-y-1">
          <Label htmlFor="description">Descrição</Label>
          <Input id="description" name="description" maxLength={200} required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="category_id">Categoria</Label>
          <SelectNativo id="category_id" name="category_id" defaultValue="">
            <option value="">Sem categoria</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </SelectNativo>
        </div>
        <div className="space-y-1">
          <Label htmlFor="amount">Valor (R$)</Label>
          <Input id="amount" name="amount" inputMode="decimal" placeholder="0,00" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="date">Data</Label>
          <Input id="date" name="date" type="date" defaultValue={hoje} required />
        </div>
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[200px] flex-1 space-y-1">
          <Label htmlFor="notes_lanc">Obs.</Label>
          <Input id="notes_lanc" name="notes" maxLength={300} />
        </div>
        <Botao texto="Lançar" variante="default" />
      </div>
      <p className="text-xs text-muted-foreground">O valor é rateado automaticamente entre os sócios na proporção cadastrada. Sem sócios, fica 100% com o proprietário.</p>
      {estado?.erro ? <p className="text-sm text-destructive">{estado?.erro}</p> : null}
    </form>
  );
}
