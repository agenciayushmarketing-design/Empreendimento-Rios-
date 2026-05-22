import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "./actions";

type Props = { searchParams: { erro?: string } };

export default function LoginPage({ searchParams }: Props) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted p-4">
      <form
        action={login}
        className="w-full max-w-sm space-y-5 rounded-lg border bg-background p-6 shadow-sm"
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Empreendimento Rios
          </h1>
          <p className="text-sm text-muted-foreground">
            Entre com seu e-mail e senha.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>

        {searchParams.erro ? (
          <p className="text-sm text-destructive">{searchParams.erro}</p>
        ) : null}

        <Button type="submit" className="w-full">
          Entrar
        </Button>
      </form>
    </main>
  );
}
