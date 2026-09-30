import { Badge } from "@/components/ui/badge";
import type { StatusEmprestimo } from "@/lib/services/emprestimos";

export function StatusEmprestimoBadge({ status, atrasado }: { status: StatusEmprestimo; atrasado: number }) {
  if (status === "paid_off") return <Badge variant="sucesso">Quitado</Badge>;
  if (status === "defaulted") return <Badge variant="erro">Inadimplente</Badge>;
  if (atrasado > 0) return <Badge variant="erro">Em atraso</Badge>;
  return <Badge variant="alerta">Ativo</Badge>;
}
