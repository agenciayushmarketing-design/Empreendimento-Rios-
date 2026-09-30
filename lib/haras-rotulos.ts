// Rotulos do bloco haras. Sem importacoes de servidor: pode ser usado em componentes de cliente.
export const STATUS_ANIMAL = {
  active: "Ativo",
  sold: "Vendido",
  deceased: "Óbito",
  transferred: "Transferido",
} as const;

export const SEXO_ANIMAL = {
  macho: "Macho",
  femea: "Fêmea",
  castrado: "Castrado",
} as const;

export const STATUS_PARTE = {
  pending: "Pendente",
  settled: "Acertada",
  waived: "Dispensada",
} as const;

export const TIPOS_UNIDADE = {
  office: "Escritório",
  events: "Eventos",
  rental: "Locação",
  loans: "Empréstimos",
  haras: "Haras",
} as const;
