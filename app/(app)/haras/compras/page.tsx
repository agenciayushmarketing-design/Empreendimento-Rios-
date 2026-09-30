import { ModuloEmConstrucao } from "@/components/modulo-em-construcao";
import { exigirPermissao } from "@/lib/services/acesso";

export default async function Page() {
  await exigirPermissao("haras_purchases");
  return <ModuloEmConstrucao modulo="haras_purchases" />;
}
