"use client";

// Cadastro de usuario: dados, papel, unidades e matriz de permissoes por modulo.
// Admin enxerga tudo, entao a matriz e desabilitada quando o papel e admin.
import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNativo } from "@/components/ui/select-nativo";
import type { EstadoFormulario } from "@/app/(app)/equipe/actions";
import { MODULOS } from "@/lib/modulos";

const ACOES: { chave: string; rotulo: string }[] = [
  { chave: "view", rotulo: "Ver" },
  { chave: "create", rotulo: "Criar" },
  { chave: "edit", rotulo: "Editar" },
  { chave: "delete", rotulo: "Excluir" },
];

export type ValoresUsuario = {
  full_name: string;
  email: string;
  role: "admin" | "member";
  is_active: boolean;
  unidades: string[];
  permissoes: string[]; // "modulo:acao"
};

type Props = {
  unidades: { id: string; nome: string }[];
  valores: ValoresUsuario;
  action: (prev: EstadoFormulario, fd: FormData) => Promise<EstadoFormulario>;
  textoBotao: string;
  modo: "criar" | "editar";
  proprioUsuario?: boolean;
};

function Botao({ texto }: { texto: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando..." : texto}
    </Button>
  );
}

export function FormularioUsuario({ unidades, valores, action, textoBotao, modo, proprioUsuario }: Props) {
  const [estado, formAction] = useFormState(action, {});
  const [role, setRole] = useState<"admin" | "member">(valores.role);
  const [perms, setPerms] = useState<Set<string>>(new Set(valores.permissoes));

  const admin = role === "admin";

  function alternar(chave: string) {
    setPerms((atual) => {
      const novo = new Set(atual);
      if (novo.has(chave)) novo.delete(chave);
      else novo.add(chave);
      return novo;
    });
  }

  function alternarModulo(modulo: string) {
    setPerms((atual) => {
      const novo = new Set(atual);
      const todas = ACOES.every((a) => novo.has(`${modulo}:${a.chave}`));
      for (const a of ACOES) {
        if (todas) novo.delete(`${modulo}:${a.chave}`);
        else novo.add(`${modulo}:${a.chave}`);
      }
      return novo;
    });
  }

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="full_name">Nome</Label>
          <Input id="full_name" name="full_name" defaultValue={valores.full_name} maxLength={120} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail (login)</Label>
          <Input id="email" name="email" type="email" defaultValue={valores.email} disabled={modo === "editar"} required={modo === "criar"} />
          {modo === "editar" ? <input type="hidden" name="email" value={valores.email} /> : null}
        </div>
      </div>

      {modo === "criar" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="password">Senha provisória</Label>
            <Input id="password" name="password" type="text" autoComplete="off" minLength={8} required />
            <p className="text-xs text-muted-foreground">Passe esta senha para a pessoa. No primeiro login o sistema obriga a trocar.</p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="role">Papel</Label>
          <SelectNativo id="role" name="role" value={role} onChange={(e) => setRole(e.target.value as "admin" | "member")} disabled={proprioUsuario}>
            <option value="member">Membro (acesso por módulo e unidade)</option>
            <option value="admin">Administrador (acesso total)</option>
          </SelectNativo>
          {proprioUsuario ? <input type="hidden" name="role" value={valores.role} /> : null}
        </div>
        <div className="space-y-2">
          <Label>Situação</Label>
          <label className="flex h-10 items-center gap-2 rounded-md border px-3 text-sm">
            <input type="checkbox" name="is_active" defaultChecked={valores.is_active} disabled={proprioUsuario} className="h-4 w-4" />
            Ativo (pode entrar no sistema)
          </label>
          {proprioUsuario ? <input type="hidden" name="is_active" value="on" /> : null}
        </div>
      </div>

      <fieldset disabled={admin} className={admin ? "opacity-50" : ""}>
        <legend className="text-sm font-medium">Unidades que pode ver</legend>
        <p className="pb-2 text-xs text-muted-foreground">{admin ? "Administrador vê todas as unidades." : "Sem nenhuma marcada, a pessoa não vê nada."}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {unidades.map((u) => (
            <label key={u.id} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
              <input type="checkbox" name="unidades" value={u.id} defaultChecked={valores.unidades.includes(u.id)} className="h-4 w-4" />
              {u.nome}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset disabled={admin} className={admin ? "opacity-50" : ""}>
        <legend className="text-sm font-medium">Permissões por módulo</legend>
        <p className="pb-2 text-xs text-muted-foreground">
          {admin ? "Administrador tem todas as permissões." : "Clique no nome do módulo para marcar ou desmarcar a linha inteira."}
        </p>
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Módulo</th>
                {ACOES.map((a) => (
                  <th key={a.chave} className="px-3 py-2 text-center font-medium">
                    {a.rotulo}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODULOS.filter((m) => m.chave !== "team").map((m) => (
                <tr key={m.chave} className="border-t">
                  <td className="px-3 py-2">
                    <button type="button" onClick={() => alternarModulo(m.chave)} className="text-left underline-offset-4 hover:underline">
                      {m.rotulo}
                    </button>
                  </td>
                  {ACOES.map((a) => {
                    const chave = `${m.chave}:${a.chave}`;
                    return (
                      <td key={chave} className="px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          name="permissoes"
                          value={chave}
                          checked={perms.has(chave)}
                          onChange={() => alternar(chave)}
                          aria-label={`${m.rotulo}: ${a.rotulo}`}
                          className="h-4 w-4"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </fieldset>

      {estado.erro ? <p className="text-sm text-destructive">{estado.erro}</p> : null}

      <div className="flex items-center gap-3">
        <Botao texto={textoBotao} />
        <Button asChild variant="ghost">
          <Link href="/equipe">Voltar</Link>
        </Button>
      </div>
    </form>
  );
}
