import { PaginaBaixarConta } from "@/components/contas/paginas-formulario";

export default function Page({ params }: { params: { id: string } }) {
  return <PaginaBaixarConta tipo="pagar" id={params.id} />;
}
