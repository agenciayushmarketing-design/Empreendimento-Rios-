"use client";

import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNativo } from "@/components/ui/select-nativo";
import type { EstadoFormulario } from "@/app/(app)/funcionarios/actions";
import { formatarMoeda, parseValorBR } from "@/lib/utils/formatacao";

export type ValoresFuncionario = {
  business_unit_id: string;
  full_name: string;
  role: string;
  document: string;
  admission_date: string;
  default_base_salary: string;
  default_transport: string;
  default_meal: string;
  default_inss: string;
  default_fgts: string;
  default_other: string;
  notes: string;
};

type Props = {
  unidades: { id: string; nome: string }[];
  valores: ValoresFuncionario;
  action: (prev: EstadoFormulario, fd: FormData) => Promise<EstadoFormulario>;
  textoBotao: string;
};

function Botao({ texto }: { texto: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando..." : texto}
    </Button>
  );
}

const CAMPOS_VALOR: { chave: keyof ValoresFuncionario; rotulo: string; sinal: 1 | -1 }[] = [
  { chave: "default_base_salary", rotulo: "Salário base", sinal: 1 },
  { chave: "default_transport", rotulo: "Vale transporte", sinal: 1 },
  { chave: "default_meal", rotulo: "Vale refeição", sinal: 1 },
  { chave: "default_inss", rotulo: "INSS (desconto)", sinal: -1 },
  { chave: "default_fgts", rotulo: "FGTS (desconto)", sinal: -1 },
  { chave: "default_other", rotulo: "Outros descontos", sinal: -1 },
];

export function FormularioFuncionario({ unidades, valores, action, textoBotao }: Props) {
  const [estado, formAction] = useFormState(action, {});
  const [v, setV] = useState(valores);

  const liquido = useMemo(() => {
    const total = CAMPOS_VALOR.reduce((s, c) => s + c.sinal * (parseValorBR(v[c.chave]) ?? 0), 0);
    return Math.max(total, 0);
  }, [v]);

  const campo = (chave: keyof ValoresFuncionario) => ({
    value: v[chave],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setV({ ...v, [chave]: e.target.value }),
  });

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="business_unit_id">Unidade</Label>
          <SelectNativo id="business_unit_id" name="business_unit_id" {...campo("business_unit_id")} required>
            <option value="">Selecione...</option>
            {unidades.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </SelectNativo>
        </div>
        <div className="space-y-2">
          <Label htmlFor="full_name">Nome completo</Label>
          <Input id="full_name" name="full_name" {...campo("full_name")} maxLength={120} required />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="role">Função</Label>
          <Input id="role" name="role" {...campo("role")} maxLength={80} placeholder="Ex.: Caseiro" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="document">CPF</Label>
          <Input id="document" name="document" {...campo("document")} maxLength={30} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="admission_date">Admissão</Label>
          <Input id="admission_date" name="admission_date" type="date" {...campo("admission_date")} />
        </div>
      </div>

      <fieldset className="space-y-3 rounded-md border p-4">
        <legend className="px-1 text-sm font-medium">Valores mensais padrão (R$)</legend>
        <div className="grid gap-4 sm:grid-cols-3">
          {CAMPOS_VALOR.map((c) => (
            <div key={c.chave} className="space-y-2">
              <Label htmlFor={c.chave}>{c.rotulo}</Label>
              <Input id={c.chave} name={c.chave} inputMode="decimal" placeholder="0,00" {...campo(c.chave)} />
            </div>
          ))}
        </div>
        <p className="text-sm">
          Líquido estimado por mês: <strong>{formatarMoeda(liquido)}</strong>
        </p>
        <p className="text-xs text-muted-foreground">
          Esses valores alimentam a folha mensal. Proventos somam, descontos subtraem. O FGTS aqui é tratado como desconto porque foi
          assim que o sistema original modelou.
        </p>
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Input id="notes" name="notes" {...campo("notes")} maxLength={500} />
      </div>

      {estado.erro ? <p className="text-sm text-destructive">{estado.erro}</p> : null}

      <div className="flex items-center gap-3">
        <Botao texto={textoBotao} />
        <Button asChild variant="ghost">
          <Link href="/funcionarios">Voltar</Link>
        </Button>
      </div>
    </form>
  );
}
