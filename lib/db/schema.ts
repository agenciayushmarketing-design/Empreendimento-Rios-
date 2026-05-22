// Schema do banco - Empreendimento Rios.
// Sprint 0: 6 tabelas-base. As tabelas financeiras entram nos sprints seguintes.
// Convencao: nomes em portugues snake_case; ids uuid; timestamps com fuso.

import { pgTable, pgEnum, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";

/* ---------- Enums ---------- */

export const papelUsuario = pgEnum("papel_usuario", ["dona", "operador"]);

export const tipoUnidade = pgEnum("tipo_unidade", [
  "escritorio",
  "espaco",
  "chacara",
  "emprestimos",
  "haras",
]);

export const tipoContaFinanceira = pgEnum("tipo_conta_financeira", [
  "conta_corrente",
  "caixa_fisico",
  "aplicacao",
  "outro",
]);

export const tipoPessoa = pgEnum("tipo_pessoa", ["fisica", "juridica"]);

export const tipoCategoria = pgEnum("tipo_categoria", [
  "receita",
  "despesa",
  "movimentacao_patrimonial",
]);

/* ---------- Tabelas-base ---------- */

// Raiz de isolamento. Uma linha hoje; a RLS filtra tudo por empresa_id.
export const empresas = pgTable("empresas", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Liga o usuario do Supabase Auth a uma empresa. id = auth.users.id, por isso sem default.
export const perfis = pgTable("perfis", {
  id: uuid("id").primaryKey(),
  empresaId: uuid("empresa_id").notNull().references(() => empresas.id),
  nome: text("nome").notNull(),
  papel: papelUsuario("papel").notNull().default("operador"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Os negocios da dona. O enum aceita 'haras', mas nenhuma unidade haras e criada agora.
export const unidadesNegocio = pgTable("unidades_negocio", {
  id: uuid("id").primaryKey().defaultRandom(),
  empresaId: uuid("empresa_id").notNull().references(() => empresas.id),
  nome: text("nome").notNull(),
  tipo: tipoUnidade("tipo").notNull(),
  ativo: boolean("ativo").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Carteiras (Itau, Caixa Fisico...). Sem coluna de saldo: o saldo de abertura e uma movimentacao.
export const contasFinanceiras = pgTable("contas_financeiras", {
  id: uuid("id").primaryKey().defaultRandom(),
  empresaId: uuid("empresa_id").notNull().references(() => empresas.id),
  nome: text("nome").notNull(),
  tipo: tipoContaFinanceira("tipo").notNull(),
  ativo: boolean("ativo").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Cadastro unico: cliente, fornecedor, hospede e tomador sao a mesma tabela.
export const pessoas = pgTable("pessoas", {
  id: uuid("id").primaryKey().defaultRandom(),
  empresaId: uuid("empresa_id").notNull().references(() => empresas.id),
  nome: text("nome").notNull(),
  tipoPessoa: tipoPessoa("tipo_pessoa").notNull(),
  documento: text("documento"),
  telefone: text("telefone"),
  email: text("email"),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Plano de contas dinamico. unidade_id nulo = categoria transversal (ex.: Aporte do Dono).
export const categorias = pgTable("categorias", {
  id: uuid("id").primaryKey().defaultRandom(),
  empresaId: uuid("empresa_id").notNull().references(() => empresas.id),
  unidadeId: uuid("unidade_id").references(() => unidadesNegocio.id),
  nome: text("nome").notNull(),
  tipo: tipoCategoria("tipo").notNull(),
  ativo: boolean("ativo").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
