import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/server";
import { trocarSenha } from "./actions";

type Props = { searchParams: { erro?: string } };

export default async function TrocarSenhaPage({ searchParams }: Props) {
  const {
    data: { user },
  } = await createClient().auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted p-4">
      <form action={trocarSenha} className="w-full max-w-sm space-y-5 rounded-lg border bg-background p-6 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Defina uma nova senha</h1>
          <p className="text-sm text-muted-foreground">
            Escolha uma senha com pelo menos 8 caracteres para continuar.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="senha">Nova senha</Label>
          <Input id="senha" name="senha" type="password" autoComplete="new-password" minLength={8} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmacao">Confirme a nova senha</Label>
          <Input id="confirmacao" name="confirmacao" type="password" autoComplete="new-password" minLength={8} required />
        </div>

        {searchParams.erro ? <p className="text-sm text-destructive">{searchParams.erro}</p> : null}

        <Button type="submit" className="w-full">
          Salvar nova senha
        </Button>
      </form>
    </main>
  );
}
