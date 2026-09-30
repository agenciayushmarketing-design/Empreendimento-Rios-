"use client";

// Seletor de unidade do header. "Todas as Unidades" = consolidado; uma unidade = filtro
// gerencial em todas as telas. A escolha vai para um cookie via server action.
import { useTransition } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { selecionarUnidade } from "@/app/(app)/actions";

export type UnidadeOpcao = { id: string; nome: string; cor: string };

export function UnitSelector({
  unidades,
  valorAtual,
}: {
  unidades: UnidadeOpcao[];
  valorAtual: string;
}) {
  const [pendente, startTransition] = useTransition();

  return (
    <Select
      value={valorAtual}
      disabled={pendente}
      onValueChange={(v) => startTransition(() => selecionarUnidade(v))}
    >
      <SelectTrigger className="w-[220px]" aria-label="Unidade de negócio">
        <SelectValue placeholder="Selecionar unidade" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="todas">Todas as Unidades</SelectItem>
        {unidades.map((u) => (
          <SelectItem key={u.id} value={u.id}>
            <span className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: u.cor }} />
              {u.nome}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
