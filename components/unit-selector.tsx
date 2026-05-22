"use client";

// Seletor de unidade do header. Coracao da navegacao: "Todas as Unidades" = consolidado;
// uma unidade especifica = filtro gerencial em todas as telas abaixo.
// Sprint 0: estado local apenas (lista as 4 unidades). Sprint 1 vai persistir
// a selecao (cookie + server action) e propagar o filtro pelo app.

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type UnidadeOpcao = { id: string; nome: string };

export function UnitSelector({ unidades }: { unidades: UnidadeOpcao[] }) {
  const [valor, setValor] = useState<string>("todas");

  return (
    <Select value={valor} onValueChange={setValor}>
      <SelectTrigger className="w-[240px]">
        <SelectValue placeholder="Selecionar unidade" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="todas">Todas as Unidades</SelectItem>
        {unidades.map((u) => (
          <SelectItem key={u.id} value={u.id}>
            {u.nome}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
