import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { pedirRecuperacao } from "./actions";

type Props = { searchParams: { erro?: string; enviado?: string } };

export default function EsqueciSenhaPage({ searchParams }: Props) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted p-4">
      <form action={pedirRecuperacao} className="w-full max-w-sm space-y-5 rounded-lg border bg-background p-6 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Recuperar senha</h1>
          <p className="text-sm text-muted-foreground">
            Informe seu e-mail. Se ele estiver cadastrado, enviamos um link para definir uma nova senha.
          </p>
        </div>

        {searchParams.enviado ? (
          <p className="rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900">
            Se o e-mail estiver cadastrado, o link chega em instantes. Confira também a caixa de spam.
          </p>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
        )}

        {searchParams.erro ? <p className="text-sm text-destructive">{searchParams.erro}</p> : null}

        {!searchParams.enviado ? (
          <Button type="submit" className="w-full">
            Enviar link
          </Button>
        ) : null}

        <p className="text-center text-sm">
          <Link href="/login" className="text-muted-foreground underline-offset-4 hover:underline">
            Voltar para o login
          </Link>
        </p>
      </form>
    </main>
  );
}
