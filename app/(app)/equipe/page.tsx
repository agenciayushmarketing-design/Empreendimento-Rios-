import { ModuloEmConstrucao } from "@/components/modulo-em-construcao";
import { exigirPermissao } from "@/lib/services/acesso";

export default async function Page() {
  await exigirPermissao("team");
  return <ModuloEmConstrucao modulo="team" />;
}
