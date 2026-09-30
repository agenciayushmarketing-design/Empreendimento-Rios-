-- ============================================================
-- EMPREENDIMENTO RIOS - Sprint 0 - Vincular seu usuario de login
-- Rode DEPOIS de criar seu usuario em Authentication > Users.
-- Se voce usou outro e-mail, troque-o na linha indicada.
-- ============================================================

INSERT INTO perfis (id, empresa_id, nome, papel)
SELECT
  u.id,
  '00000000-0000-0000-0000-000000000001',   -- empresa Empreendimento Rios
  'Mateus',
  'operador'
FROM auth.users u
WHERE u.email = 'agenciayushmarketing@gmail.com'   -- <-- troque aqui se usou outro e-mail
ON CONFLICT (id) DO NOTHING;

-- Conferencia: deve mostrar 1 linha com seu perfil e a empresa.
SELECT p.nome, p.papel, e.nome AS empresa
FROM perfis p
JOIN empresas e ON e.id = p.empresa_id;
