"use client";

// Menu lateral. Recebe so os modulos que o usuario pode ver (decidido no servidor).
// Em telas pequenas mostra apenas os icones.
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { NavIcone } from "@/components/nav-icones";

export type ItemNav = { rota: string; rotulo: string; icone: string };

export function Nav({ itens }: { itens: ItemNav[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-2" aria-label="Módulos">
      {itens.map((item) => {
        const ativo = pathname === item.rota || pathname.startsWith(item.rota + "/");
        return (
          <Link
            key={item.rota}
            href={item.rota}
            title={item.rotulo}
            aria-current={ativo ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              ativo
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <NavIcone nome={item.icone} className="h-4 w-4 shrink-0" />
            <span className="hidden md:inline">{item.rotulo}</span>
          </Link>
        );
      })}
    </nav>
  );
}
