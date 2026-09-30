import { PaginaEditarConta } from "@/components/contas/paginas-formulario";

export default function Page({ params }: { params: { id: string } }) {
  return <PaginaEditarConta tipo="receber" id={params.id} />;
}
