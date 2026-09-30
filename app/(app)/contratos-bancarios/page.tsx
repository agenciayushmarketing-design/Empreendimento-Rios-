import { ModuloEmConstrucao } from "@/components/modulo-em-construcao";
import { exigirPermissao } from "@/lib/services/acesso";

export default async function Page() {
  await exigirPermissao("bank_contracts");
  return <ModuloEmConstrucao modulo="bank_contracts" />;
}
