import { Button } from "@/components/ui/button";
import { UnitSelector, type UnidadeOpcao } from "@/components/unit-selector";
import { logout } from "@/app/(app)/actions";

type HeaderProps = {
  userEmail: string;
  unidades: UnidadeOpcao[];
};

export function Header({ userEmail, unidades }: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b bg-background px-6 py-3">
      <div className="flex items-center gap-6">
        <span className="text-sm font-semibold tracking-tight">
          Empreendimento Rios
        </span>
        <UnitSelector unidades={unidades} />
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-muted-foreground sm:inline">
          {userEmail}
        </span>
        <form action={logout}>
          <Button type="submit" variant="ghost" size="sm">
            Sair
          </Button>
        </form>
      </div>
    </header>
  );
}
