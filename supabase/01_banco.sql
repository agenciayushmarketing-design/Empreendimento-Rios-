-- ============================================================
-- EMPREENDIMENTO RIOS - Sprint 0 - Estrutura e dados iniciais
-- Rode este arquivo UMA VEZ, no SQL Editor do Supabase.
-- Cria: os tipos, as 6 tabelas-base, as regras de seguranca (RLS)
-- e os dados iniciais (empresa, 4 unidades, 1 conta, categorias).
-- E seguro rodar de novo: nada e duplicado.
-- ============================================================

-- ---------- TIPOS (enums) ----------
DO $$ BEGIN CREATE TYPE papel_usuario AS ENUM ('dona','operador');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE tipo_unidade AS ENUM ('escritorio','espaco','chacara','emprestimos','haras');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE tipo_conta_financeira AS ENUM ('conta_corrente','caixa_fisico','aplicacao','outro');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE tipo_pessoa AS ENUM ('fisica','juridica');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN CREATE TYPE tipo_categoria AS ENUM ('receita','despesa','movimentacao_patrimonial');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ---------- TABELAS ----------
CREATE TABLE IF NOT EXISTS empresas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS perfis (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  empresa_id uuid NOT NULL REFERENCES empresas(id),
  nome text NOT NULL,
  papel papel_usuario NOT NULL DEFAULT 'operador',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS unidades_negocio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES empresas(id),
  nome text NOT NULL,
  tipo tipo_unidade NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contas_financeiras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES empresas(id),
  nome text NOT NULL,
  tipo tipo_conta_financeira NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pessoas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES empresas(id),
  nome text NOT NULL,
  tipo_pessoa tipo_pessoa NOT NULL,
  documento text,
  telefone text,
  email text,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES empresas(id),
  unidade_id uuid REFERENCES unidades_negocio(id),
  nome text NOT NULL,
  tipo tipo_categoria NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------- FUNCAO AUXILIAR DE SEGURANCA ----------
-- Retorna a empresa do usuario logado. Usada pelas regras de RLS abaixo.
CREATE OR REPLACE FUNCTION empresa_do_usuario()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT empresa_id FROM perfis WHERE id = auth.uid()
$$;

-- ---------- RLS (Row Level Security) ----------
-- Liga a trava: por padrao ninguem ve nada; as policies abrem o acesso certo.
ALTER TABLE empresas            ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfis              ENABLE ROW LEVEL SECURITY;
ALTER TABLE unidades_negocio    ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_financeiras  ENABLE ROW LEVEL SECURITY;
ALTER TABLE pessoas             ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias          ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS perfis_select ON perfis;
CREATE POLICY perfis_select ON perfis FOR SELECT TO authenticated
  USING (id = auth.uid());

DROP POLICY IF EXISTS empresas_select ON empresas;
CREATE POLICY empresas_select ON empresas FOR SELECT TO authenticated
  USING (id = empresa_do_usuario());

DROP POLICY IF EXISTS unidades_all ON unidades_negocio;
CREATE POLICY unidades_all ON unidades_negocio FOR ALL TO authenticated
  USING (empresa_id = empresa_do_usuario())
  WITH CHECK (empresa_id = empresa_do_usuario());

DROP POLICY IF EXISTS contas_all ON contas_financeiras;
CREATE POLICY contas_all ON contas_financeiras FOR ALL TO authenticated
  USING (empresa_id = empresa_do_usuario())
  WITH CHECK (empresa_id = empresa_do_usuario());

DROP POLICY IF EXISTS pessoas_all ON pessoas;
CREATE POLICY pessoas_all ON pessoas FOR ALL TO authenticated
  USING (empresa_id = empresa_do_usuario())
  WITH CHECK (empresa_id = empresa_do_usuario());

DROP POLICY IF EXISTS categorias_all ON categorias;
CREATE POLICY categorias_all ON categorias FOR ALL TO authenticated
  USING (empresa_id = empresa_do_usuario())
  WITH CHECK (empresa_id = empresa_do_usuario());

-- ---------- DADOS INICIAIS ----------
DO $$
DECLARE
  v_empresa     uuid := '00000000-0000-0000-0000-000000000001';
  v_escritorio  uuid := '00000000-0000-0000-0000-000000000011';
  v_espaco      uuid := '00000000-0000-0000-0000-000000000012';
  v_chacara     uuid := '00000000-0000-0000-0000-000000000013';
  v_emprestimos uuid := '00000000-0000-0000-0000-000000000014';
BEGIN
  IF EXISTS (SELECT 1 FROM empresas) THEN
    RAISE NOTICE 'Dados iniciais ja existem - seed pulado.';
    RETURN;
  END IF;

  INSERT INTO empresas (id, nome) VALUES (v_empresa, 'Empreendimento Rios');

  INSERT INTO unidades_negocio (id, empresa_id, nome, tipo) VALUES
    (v_escritorio,  v_empresa, 'Escritório Contábil/Jurídico', 'escritorio'),
    (v_espaco,      v_empresa, 'Espaço Esperança',             'espaco'),
    (v_chacara,     v_empresa, 'Chácara de Aluguel',           'chacara'),
    (v_emprestimos, v_empresa, 'Operação de Empréstimos',      'emprestimos');

  INSERT INTO contas_financeiras (empresa_id, nome, tipo) VALUES
    (v_empresa, 'Conta Principal', 'conta_corrente');

  INSERT INTO categorias (empresa_id, unidade_id, nome, tipo) VALUES
    (v_empresa, v_escritorio, 'Honorários Tributários', 'receita'),
    (v_empresa, v_escritorio, 'Honorários Jurídicos',   'receita'),
    (v_empresa, v_escritorio, 'Mensalidade Contábil',   'receita'),
    (v_empresa, v_escritorio, 'Aluguel do Escritório',  'despesa'),
    (v_empresa, v_escritorio, 'Material de Escritório', 'despesa'),
    (v_empresa, v_escritorio, 'Energia',                'despesa'),
    (v_empresa, v_escritorio, 'Água',                   'despesa'),
    (v_empresa, v_escritorio, 'Internet',               'despesa'),
    (v_empresa, v_escritorio, 'Comissão de Parceiro',   'despesa'),
    (v_empresa, v_espaco, 'Locação de Espaço', 'receita'),
    (v_empresa, v_espaco, 'Buffet',            'receita'),
    (v_empresa, v_espaco, 'Manutenção',        'despesa'),
    (v_empresa, v_espaco, 'Energia',           'despesa'),
    (v_empresa, v_espaco, 'Água',              'despesa'),
    (v_empresa, v_espaco, 'Jardinagem',        'despesa'),
    (v_empresa, v_espaco, 'Reforma',           'despesa'),
    (v_empresa, v_chacara, 'Diárias',               'receita'),
    (v_empresa, v_chacara, 'Taxa de Limpeza',       'receita'),
    (v_empresa, v_chacara, 'Manutenção da Chácara', 'despesa'),
    (v_empresa, v_chacara, 'Energia',               'despesa'),
    (v_empresa, v_chacara, 'Água',                  'despesa'),
    (v_empresa, v_chacara, 'Jardinagem',            'despesa'),
    (v_empresa, v_chacara, 'Caseiro',               'despesa'),
    (v_empresa, v_emprestimos, 'Juros Recebidos',     'receita'),
    (v_empresa, v_emprestimos, 'Custos Operacionais', 'despesa'),
    (v_empresa, v_emprestimos, 'Capital Emprestado',  'movimentacao_patrimonial'),
    (v_empresa, v_emprestimos, 'Retorno de Capital',  'movimentacao_patrimonial'),
    (v_empresa, NULL, 'Aporte do Dono',               'movimentacao_patrimonial'),
    (v_empresa, NULL, 'Retirada do Dono',             'movimentacao_patrimonial'),
    (v_empresa, NULL, 'Transferência entre Contas',   'movimentacao_patrimonial'),
    (v_empresa, NULL, 'Transferência entre Negócios', 'movimentacao_patrimonial'),
    (v_empresa, NULL, 'Saldo Inicial',                'movimentacao_patrimonial');

  RAISE NOTICE 'Seed concluido: 1 empresa, 4 unidades, 1 conta, 32 categorias.';
END $$;
