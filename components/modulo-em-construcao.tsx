import { moduloPorChave, type Modulo } from "@/lib/modulos";

export function ModuloEmConstrucao({ modulo }: { modulo: Modulo }) {
  const info = moduloPorChave(modulo);
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold tracking-tight">{info.rotulo}</h1>
      <p className="text-sm text-muted-foreground">
        Módulo em construção. As tabelas e regras já existem no banco; a tela chega nas próximas fases.
      </p>
    </div>
  );
}
