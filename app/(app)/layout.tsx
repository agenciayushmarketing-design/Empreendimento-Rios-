import { redirect } from "next/navigation";

import { Header } from "@/components/header";
import { Nav } from "@/components/nav";
import { MODULOS } from "@/lib/modulos";
import { carregarContextoAcesso, pode } from "@/lib/services/acesso";
import { createClient } from "@/lib/supabase/server";
import { lerUnidadeAtual } from "@/lib/unidade-atual";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const ctx = await carregarContextoAcesso();

  // Defesa: o middleware ja redireciona, mas nenhuma rota autenticada carrega sem usuario.
  if (!ctx) redirect("/login");

  if (!ctx.ativo) {
    // Logado no Auth mas sem profile ativo (o trigger handle_new_user() cria o profile no
    // primeiro login; is_active=false significa que o admin desativou).
    await createClient().auth.signOut();
    redirect("/login?erro=" + encodeURIComponent("Usuário sem perfil ativo. Contate o administrador."));
  }

  if (ctx.deveTrocarSenha) redirect("/trocar-senha");

  const unidadeAtual = lerUnidadeAtual(ctx.unidades);
  const itensNav = MODULOS.filter((m) => pode(ctx, m.chave, "view")).map((m) => ({
    rota: m.rota,
    rotulo: m.rotulo,
    icone: m.icone,
  }));
  // O bloco haras nao e um app_module: entra para quem enxerga a unidade do tipo haras.
  if (ctx.unidades.some((u) => u.tipo === "haras")) {
    const pos = itensNav.findIndex((i) => i.rota === "/vendas");
    itensNav.splice(pos === -1 ? itensNav.length : pos, 0, { rota: "/haras", rotulo: "Haras", icone: "haras" });
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-14 shrink-0 border-r md:w-60">
        <div className="hidden h-[57px] items-center border-b px-5 text-sm font-semibold tracking-tight md:flex">
          Empreendimento Rios
        </div>
        <Nav itens={itensNav} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          nome={ctx.nome}
          email={ctx.email}
          isAdmin={ctx.isAdmin}
          unidades={ctx.unidades.map((u) => ({ id: u.id, nome: u.nome, cor: u.cor }))}
          unidadeAtual={unidadeAtual}
        />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
