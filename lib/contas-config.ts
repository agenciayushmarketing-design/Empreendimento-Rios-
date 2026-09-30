// Contas a pagar e a receber compartilham telas e regras; o que muda esta aqui.
import type { Modulo } from "@/lib/modulos";

export type TipoConta = "pagar" | "receber";

export type ConfigConta = {
  tipo: TipoConta;
  modulo: Modulo;
  rota: string;
  titulo: string;
  singular: string; // "conta a pagar"
  pessoaRotulo: string; // "Fornecedor" / "Cliente"
  tipoCategoria: "expense" | "income";
  verboBaixa: string; // "Pagar" / "Receber"
  baixaFeita: string; // "Paga" / "Recebida"
  temRecorrencia: boolean;
};

export const CONTAS: Record<TipoConta, ConfigConta> = {
  pagar: {
    tipo: "pagar",
    modulo: "payables",
    rota: "/contas-a-pagar",
    titulo: "Contas a Pagar",
    singular: "conta a pagar",
    pessoaRotulo: "Fornecedor",
    tipoCategoria: "expense",
    verboBaixa: "Pagar",
    baixaFeita: "Paga",
    temRecorrencia: true,
  },
  receber: {
    tipo: "receber",
    modulo: "receivables",
    rota: "/contas-a-receber",
    titulo: "Contas a Receber",
    singular: "conta a receber",
    pessoaRotulo: "Cliente",
    tipoCategoria: "income",
    verboBaixa: "Receber",
    baixaFeita: "Recebida",
    temRecorrencia: false,
  },
};
