import { Badge } from "@/components/ui/badge";
import type { StatusContrato } from "@/lib/services/contratos-bancarios";

export function StatusContratoBadge({ status, atrasadas }: { status: StatusContrato; atrasadas: number }) {
  if (status === "paid_off") return <Badge variant="sucesso">Quitado</Badge>;
  if (status === "renegotiated") return <Badge variant="secondary">Renegociado</Badge>;
  if (status === "cancelled") return <Badge variant="secondary">Cancelado</Badge>;
  if (atrasadas > 0) return <Badge variant="erro">Em atraso</Badge>;
  return <Badge variant="alerta">Ativo</Badge>;
}
