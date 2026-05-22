// Servico de unidades de negocio. Sprint 0: apenas listagem para o seletor do header.
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { unidadesNegocio } from "@/lib/db/schema";

export async function listarUnidadesAtivas(empresaId: string) {
  return db
    .select({
      id: unidadesNegocio.id,
      nome: unidadesNegocio.nome,
      tipo: unidadesNegocio.tipo,
    })
    .from(unidadesNegocio)
    .where(
      and(
        eq(unidadesNegocio.empresaId, empresaId),
        eq(unidadesNegocio.ativo, true)
      )
    )
    .orderBy(unidadesNegocio.nome);
}
