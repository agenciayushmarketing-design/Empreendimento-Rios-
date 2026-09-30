"use client";

// Previa da folha com selecao de quem entra e geracao do lote.
import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { EstadoFormulario } from "@/app/(app)/funcionarios/actions";
import type { PreviaFolha } from "@/lib/services/funcionarios";
import { formatarMoeda } from "@/lib/utils/formatacao";

type Props = {
  unidadeId: string;
  periodo: string;
  vencimentoPadrao: string;
  previa: PreviaFolha[];
  podeGerar: boolean;
  action: (prev: EstadoFormulario, fd: FormData) => Promise<EstadoFormulario>;
};

function Botao({ qtd, total }: { qtd: number; total: number }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || qtd === 0}>
      {pending ? "Gerando..." : `Gerar folha (${qtd}) · ${formatarMoeda(total)}`}
    </Button>
  );
}

export function FormularioFolha({ unidadeId, periodo, vencimentoPadrao, previa, podeGerar, action }: Props) {
  const [estado, formAction] = useFormState(action, {});
  const [marcados, setMarcados] = useState<Set<string>>(new Set(previa.filter((p) => !p.already_generated).map((p) => p.employee_id)));

  function alternar(id: string) {
    setMarcados((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  const selecionados = previa.filter((p) => marcados.has(p.employee_id));
  const total = selecionados.reduce((s, p) => s + p.net_amount, 0);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="business_unit_id" value={unidadeId} />
      <input type="hidden" name="periodo" value={periodo} />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]"></TableHead>
            <TableHead>Funcionário</TableHead>
            <TableHead className="text-right">Proventos</TableHead>
            <TableHead className="text-right">Descontos</TableHead>
            <TableHead className="text-right">Líquido</TableHead>
            <TableHead>Situação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {previa.map((p) => {
            const proventos = p.base_salary + p.transport + p.meal;
            const descontos = p.inss + p.fgts + p.other;
            return (
              <TableRow key={p.employee_id} className={p.already_generated ? "opacity-60" : ""}>
                <TableCell>
                  <input
                    type="checkbox"
                    name="employee_ids"
                    value={p.employee_id}
                    checked={marcados.has(p.employee_id)}
                    disabled={p.already_generated}
                    onChange={() => alternar(p.employee_id)}
                    aria-label={`Incluir ${p.employee_name}`}
                    className="h-4 w-4"
                  />
                </TableCell>
                <TableCell className="font-medium">{p.employee_name}</TableCell>
                <TableCell className="text-right">{formatarMoeda(proventos)}</TableCell>
                <TableCell className="text-right text-red-700">{descontos > 0 ? `- ${formatarMoeda(descontos)}` : "—"}</TableCell>
                <TableCell className="text-right font-medium">{formatarMoeda(p.net_amount)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {p.already_generated ? "Já gerada neste mês" : p.net_amount <= 0 ? "Sem valores cadastrados" : "A gerar"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-2">
          <Label htmlFor="due_date">Vencimento das contas</Label>
          <Input id="due_date" name="due_date" type="date" defaultValue={vencimentoPadrao} className="w-[180px]" required />
        </div>
        {podeGerar ? <Botao qtd={selecionados.length} total={total} /> : null}
      </div>
      <p className="text-xs text-muted-foreground">
        Cada funcionário vira uma conta a pagar &quot;Folha MM/AAAA - Nome&quot; na categoria de folha da unidade. A baixa é feita em Contas a Pagar.
      </p>
      {estado?.erro ? <p className="text-sm text-destructive">{estado?.erro}</p> : null}
    </form>
  );
}
