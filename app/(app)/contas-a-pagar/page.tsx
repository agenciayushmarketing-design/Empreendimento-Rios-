import { PaginaListaContas, type BuscaContas } from "@/components/contas/pagina-lista";

export default function Page({ searchParams }: { searchParams: BuscaContas }) {
  return <PaginaListaContas tipo="pagar" searchParams={searchParams} />;
}
