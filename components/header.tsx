import { Button } from "@/components/ui/button";
import { UnitSelector, type UnidadeOpcao } from "@/components/unit-selector";
import { logout } from "@/app/(app)/actions";

type HeaderProps = {
  nome: string;
  email: string;
  isAdmin: boolean;
  unidades: UnidadeOpcao[];
  unidadeAtual: string;
};

export function Header({ nome, email, isAdmin, unidades, unidadeAtual }: HeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4 border-b bg-background px-4 py-3 md:px-6">
      <div className="flex items-center gap-4">
        <span className="hidden text-sm font-semibold tracking-tight sm:inline">
          Empreendimento Rios
        </span>
        <UnitSelector unidades={unidades} valorAtual={unidadeAtual} />
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <div className="text-sm leading-tight">{nome}</div>
          <div className="text-xs text-muted-foreground">
            {isAdmin ? "Administrador" : "Membro"} · {email}
          </div>
        </div>
        <form action={logout}>
          <Button type="submit" variant="ghost" size="sm">
            Sair
          </Button>
        </form>
      </div>
    </header>
  );
}
