-- Hardening apontado pelo advisor do Supabase (seguranca + performance).
-- Seguro rodar mais de uma vez. Aplicar pelo SQL Editor do projeto.

-- 1) pg_net estava no schema public. Nada depende dela; recriar em extensions.
DROP EXTENSION IF EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- 2) Funcoes do schema public nao devem ser executaveis por anon (visitante sem login).
--    O app so usa o banco com usuario autenticado.
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM anon;

-- 3) Indices duplicados (mesma definicao, nomes diferentes).
DROP INDEX IF EXISTS public.idx_hpi_purchase_id;
DROP INDEX IF EXISTS public.idx_hpi_payable_id;
DROP INDEX IF EXISTS public.idx_hpci_commission_id;
DROP INDEX IF EXISTS public.idx_hpci_payable_id;
DROP INDEX IF EXISTS public.idx_si_sale;

-- 4) Chaves estrangeiras sem indice nas tabelas de uso frequente.
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions (category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_client ON public.transactions (client_id);
CREATE INDEX IF NOT EXISTS idx_receivables_client ON public.receivables (client_id);
CREATE INDEX IF NOT EXISTS idx_receivables_transaction ON public.receivables (transaction_id);
CREATE INDEX IF NOT EXISTS idx_receivables_paid_account_category ON public.receivables (paid_account_category_id);
CREATE INDEX IF NOT EXISTS idx_receivables_preferred_bank ON public.receivables (preferred_bank_account_id);
CREATE INDEX IF NOT EXISTS idx_payables_preferred_bank ON public.payables (preferred_bank_account_id);
CREATE INDEX IF NOT EXISTS idx_loans_client ON public.loans (client_id);
CREATE INDEX IF NOT EXISTS idx_user_unit_access_bu ON public.user_unit_access (business_unit_id);
CREATE INDEX IF NOT EXISTS idx_bank_contracts_bank_account ON public.bank_contracts (bank_account_id);
CREATE INDEX IF NOT EXISTS idx_bank_contracts_expense_category ON public.bank_contracts (expense_category_id);
CREATE INDEX IF NOT EXISTS idx_hri_client ON public.haras_recurring_invoices (client_id);
CREATE INDEX IF NOT EXISTS idx_hrii_invoice ON public.haras_recurring_invoice_items (recurring_invoice_id);
CREATE INDEX IF NOT EXISTS idx_hrr_invoice ON public.haras_recurring_runs (invoice_id);
CREATE INDEX IF NOT EXISTS idx_haras_weight_animal ON public.haras_animal_weight_history (animal_id);
CREATE INDEX IF NOT EXISTS idx_haras_movements_animal ON public.haras_animal_movements (animal_id);
CREATE INDEX IF NOT EXISTS idx_haras_purchases_supplier ON public.haras_purchases (supplier_id);
CREATE INDEX IF NOT EXISTS idx_animal_sales_auction_lot ON public.animal_sales (auction_lot_id);
CREATE INDEX IF NOT EXISTS idx_auction_lot_animals_sale ON public.auction_lot_animals (sale_id);
