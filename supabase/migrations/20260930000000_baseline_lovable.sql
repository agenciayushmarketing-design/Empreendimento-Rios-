-- ============================================================
-- EMPREENDIMENTO RIOS - Baseline do banco (schema herdado do Lovable)
-- Gerado em 2026-09-30 a partir do projeto Supabase rios-homolog (sgzpnihxnetrmbcfiuwq).
--
-- Este arquivo e o ponto zero do versionamento do banco. Recria do zero:
-- extensoes, enums, tabelas, funcoes, constraints, indices, views, triggers,
-- RLS + policies, buckets de storage, jobs pg_cron e o seed minimo.
--
-- A partir daqui, toda alteracao de schema entra como nova migration em
-- supabase/migrations/. Nunca editar este arquivo depois de aplicado.
-- ============================================================

-- ---------- EXTENSOES ----------
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ---------- ENUMS ----------
CREATE TYPE public.app_module AS ENUM ('dashboard', 'cash_flow', 'receivables', 'clients', 'categories', 'loans', 'team', 'reservations', 'sales', 'payables', 'bank_accounts', 'bank_contracts', 'employees', 'haras_purchases');
CREATE TYPE public.app_role AS ENUM ('admin', 'member');
CREATE TYPE public.auction_lot_status AS ENUM ('draft', 'scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.bank_account_type AS ENUM ('checking', 'savings', 'cash', 'card', 'investment', 'other');
CREATE TYPE public.bank_contract_status AS ENUM ('active', 'paid_off', 'renegotiated', 'cancelled');
CREATE TYPE public.bank_contract_type AS ENUM ('working_capital', 'loan', 'consortium', 'revolving', 'discounted_bill');
CREATE TYPE public.business_unit_type AS ENUM ('office', 'events', 'rental', 'loans', 'haras');
CREATE TYPE public.haras_follicle_recommendation AS ENUM ('aguardar', 'hormonio', 'cobrir_agora', 'cobrir_24h', 'cobrir_48h', 'nao_cobrir');
CREATE TYPE public.haras_ovary_side AS ENUM ('esquerdo', 'direito');
CREATE TYPE public.haras_uterine_edema AS ENUM ('ausente', 'leve', 'moderado', 'acentuado');
CREATE TYPE public.loan_status AS ENUM ('active', 'paid_off', 'defaulted');
CREATE TYPE public.notification_type AS ENUM ('due_soon_receivable', 'due_soon_payable', 'became_overdue', 'sale_installment_paid', 'sale_installment_due_soon', 'sale_installment_overdue');
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'overdue', 'renegotiated', 'cancelled');
CREATE TYPE public.permission_action AS ENUM ('view', 'create', 'edit', 'delete');
CREATE TYPE public.repro_breeding_method AS ENUM ('monta_natural', 'ia_fresco', 'ia_refrigerado', 'ia_congelado', 'te');
CREATE TYPE public.repro_breeding_status AS ENUM ('agendado', 'realizado', 'cancelado');
CREATE TYPE public.repro_diagnostic_method AS ENUM ('us', 'palpacao', 'sangue', 'outro');
CREATE TYPE public.repro_diagnostic_result AS ENUM ('positivo', 'negativo', 'duvidoso', 'reabsorcao', 'obito_fetal');
CREATE TYPE public.repro_embryo_container AS ENUM ('palheta', 'criotubo', 'outro');
CREATE TYPE public.repro_embryo_origin AS ENUM ('te', 'opu_fiv', 'importado');
CREATE TYPE public.repro_embryo_outcome AS ENUM ('pendente', 'prenhez_confirmada', 'perdida', 'nao_prenhez');
CREATE TYPE public.repro_embryo_stage AS ENUM ('d6', 'd7', 'd8', 'expandido', 'eclodido', 'outro');
CREATE TYPE public.repro_embryo_status AS ENUM ('disponivel', 'transferido', 'descartado', 'perdido');
CREATE TYPE public.repro_libido AS ENUM ('baixa', 'media', 'boa', 'excelente');
CREATE TYPE public.repro_movement_kind AS ENUM ('in', 'out', 'reversal');
CREATE TYPE public.repro_movement_reason AS ENUM ('coleta', 'ia', 'te', 'venda', 'descarte', 'ajuste', 'estorno', 'fiv');
CREATE TYPE public.repro_pregnancy_status AS ENUM ('em_andamento', 'concluida', 'abortada', 'confirmada', 'perdida', 'cancelada');
CREATE TYPE public.repro_semen_container AS ENUM ('palheta', 'pellet', 'ampola');
CREATE TYPE public.repro_semen_type AS ENUM ('fresco', 'refrigerado', 'congelado');
CREATE TYPE public.repro_sex AS ENUM ('macho', 'femea', 'castrado');
CREATE TYPE public.reservation_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE public.sale_payment_method AS ENUM ('cash', 'installments', 'financed');
CREATE TYPE public.sale_status AS ENUM ('draft', 'active', 'completed', 'cancelled');
CREATE TYPE public.transaction_type AS ENUM ('income', 'expense');

-- ---------- TABELAS ----------
CREATE TABLE public.animal_sales (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_unit_id uuid NOT NULL,
  animal_id uuid NOT NULL,
  buyer_client_id uuid NOT NULL,
  auction_lot_id uuid,
  sale_date date NOT NULL DEFAULT CURRENT_DATE,
  total_amount numeric(14,2) NOT NULL,
  down_payment numeric(14,2) NOT NULL DEFAULT 0,
  down_payment_date date,
  installments_count integer NOT NULL DEFAULT 1,
  first_due_date date,
  payment_method sale_payment_method NOT NULL DEFAULT 'cash'::sale_payment_method,
  status sale_status NOT NULL DEFAULT 'active'::sale_status,
  paid_account_category_id uuid,
  commission numeric(14,2) NOT NULL DEFAULT 0,
  sale_type text NOT NULL DEFAULT 'direct'::text,
  commission_client_id uuid,
  commission_category_id uuid,
  commission_due_date date,
  commission_payable_id uuid,
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  contract_path text,
  contract_generated_at timestamp with time zone,
  product_type text NOT NULL DEFAULT 'whole'::text,
  share_pct numeric(5,2),
  sire_animal_id uuid,
  donor_animal_id uuid,
  recipient_animal_id uuid,
  covering_mare_note text,
  crop_year integer,
  commission_mode text NOT NULL DEFAULT 'payable'::text,
  commission_receivable_id uuid,
  cancelled_at timestamp with time zone,
  cancelled_by uuid,
  cancel_reason text
);

CREATE TABLE public.auction_lot_animals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  auction_lot_id uuid NOT NULL,
  animal_id uuid NOT NULL,
  lot_number integer,
  minimum_bid numeric(14,2),
  hammer_price numeric(14,2),
  sale_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.auction_lots (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_unit_id uuid NOT NULL,
  name text NOT NULL,
  auction_date date,
  location text,
  status auction_lot_status NOT NULL DEFAULT 'draft'::auction_lot_status,
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  entity text NOT NULL,
  entity_id uuid,
  action text NOT NULL,
  business_unit_id uuid,
  user_id uuid,
  payload jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.bank_account_units (
  bank_account_id uuid NOT NULL,
  business_unit_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.bank_accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type bank_account_type NOT NULL DEFAULT 'checking'::bank_account_type,
  bank_name text,
  agency text,
  account_number text,
  initial_balance numeric(14,2) NOT NULL DEFAULT 0,
  initial_balance_date date NOT NULL DEFAULT CURRENT_DATE,
  color text,
  icon text,
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.bank_contracts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_unit_id uuid NOT NULL,
  institution text NOT NULL,
  contract_number text NOT NULL,
  contract_type bank_contract_type NOT NULL,
  principal numeric(14,2) NOT NULL,
  contract_date date NOT NULL,
  installments_count integer,
  installment_amount numeric(14,2),
  first_due_date date,
  interest_rate_info numeric(8,4),
  bank_account_id uuid,
  expense_category_id uuid,
  notes text,
  status bank_contract_status NOT NULL DEFAULT 'active'::bank_contract_status,
  settled_at timestamp with time zone,
  settlement_amount numeric(14,2),
  renegotiated_from_id uuid,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  principal_credit_transaction_id uuid
);

CREATE TABLE public.business_units (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type business_unit_type NOT NULL,
  icon text NOT NULL DEFAULT 'building-2'::text,
  color text NOT NULL DEFAULT '#1E3A5F'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_unit_id uuid NOT NULL,
  name text NOT NULL,
  type transaction_type NOT NULL,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  is_payroll boolean NOT NULL DEFAULT false
);

CREATE TABLE public.clients (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_unit_id uuid NOT NULL,
  name text NOT NULL,
  email text,
  phone text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.employees (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_unit_id uuid NOT NULL,
  full_name text NOT NULL,
  role text,
  document text,
  admission_date date,
  is_active boolean NOT NULL DEFAULT true,
  default_base_salary numeric(14,2) NOT NULL DEFAULT 0,
  default_transport numeric(14,2) NOT NULL DEFAULT 0,
  default_meal numeric(14,2) NOT NULL DEFAULT 0,
  default_inss numeric(14,2) NOT NULL DEFAULT 0,
  default_fgts numeric(14,2) NOT NULL DEFAULT 0,
  default_other numeric(14,2) NOT NULL DEFAULT 0,
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.haras_animal_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_unit_id uuid NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.haras_animal_movements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  animal_id uuid NOT NULL,
  moved_at date NOT NULL DEFAULT CURRENT_DATE,
  from_location text,
  to_location text NOT NULL,
  reason text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.haras_animal_partners (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  animal_id uuid NOT NULL,
  client_id uuid NOT NULL,
  ownership_percentage numeric(5,2) NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.haras_animal_transaction_shares (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL,
  client_id uuid NOT NULL,
  ownership_percentage numeric(5,2) NOT NULL,
  share_amount numeric(14,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text,
  settled_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.haras_animal_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_unit_id uuid NOT NULL,
  animal_id uuid NOT NULL,
  category_id uuid,
  type text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  description text NOT NULL,
  amount numeric(14,2) NOT NULL,
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.haras_animal_weight_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  animal_id uuid NOT NULL,
  weighed_at date NOT NULL DEFAULT CURRENT_DATE,
  weight_kg numeric(8,2) NOT NULL,
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.haras_animals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_unit_id uuid NOT NULL,
  name text NOT NULL,
  animal_type text,
  registration_code text,
  birth_date date,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  exit_date date,
  status text NOT NULL DEFAULT 'active'::text,
  primary_client_id uuid NOT NULL,
  location_note text,
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  emergency_phone text,
  origin text,
  owner_share_amount numeric,
  owner_share_percentage numeric DEFAULT 100,
  sex repro_sex
);

CREATE TABLE public.haras_breeding_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_unit_id uuid NOT NULL,
  mare_id uuid NOT NULL,
  stallion_id uuid,
  method repro_breeding_method NOT NULL,
  scheduled_at timestamp with time zone NOT NULL,
  performed_at timestamp with time zone,
  status repro_breeding_status NOT NULL DEFAULT 'agendado'::repro_breeding_status,
  semen_batch_id uuid,
  doses_used integer,
  semen_movement_id uuid,
  embryo_id uuid,
  embryo_transfer_id uuid,
  perform_attempts integer NOT NULL DEFAULT 0,
  notes text,
  cancel_reason text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.haras_clients (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_unit_id uuid NOT NULL,
  name text NOT NULL,
  document text,
  email text,
  phone text,
  address text,
  is_owner_account boolean NOT NULL DEFAULT false,
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.haras_embryo_transfers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  embryo_id uuid NOT NULL,
  business_unit_id uuid NOT NULL,
  recipient_mare_id uuid NOT NULL,
  transfer_date timestamp with time zone NOT NULL DEFAULT now(),
  outcome repro_embryo_outcome NOT NULL DEFAULT 'pendente'::repro_embryo_outcome,
  notes text,
  cancelled_at timestamp with time zone,
  cancelled_by uuid,
  cancel_reason text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.haras_embryos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_unit_id uuid NOT NULL,
  code text NOT NULL,
  donor_mare_id uuid,
  sire_stallion_id uuid,
  origin repro_embryo_origin NOT NULL,
  production_date date,
  stage repro_embryo_stage NOT NULL,
  grade text,
  container repro_embryo_container NOT NULL,
  status repro_embryo_status NOT NULL DEFAULT 'disponivel'::repro_embryo_status,
  storage_location text,
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  fiv_batch_id uuid
);

CREATE TABLE public.haras_feature_flags (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_unit_id uuid,
  flag_name text NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.haras_fiv_batches (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_unit_id uuid NOT NULL,
  opu_session_id uuid NOT NULL,
  stallion_id uuid NOT NULL,
  semen_batch_id uuid,
  doses_used integer NOT NULL,
  fertilized_at timestamp with time zone NOT NULL DEFAULT now(),
  oocytes_used integer NOT NULL,
  cleaved integer,
  blastocysts integer,
  status text NOT NULL DEFAULT 'em_cultivo'::text,
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.haras_follicle_exams (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_unit_id uuid NOT NULL,
  mare_id uuid NOT NULL,
  examined_at timestamp with time zone NOT NULL DEFAULT now(),
  examined_by text,
  uterine_edema haras_uterine_edema,
  cervix_tone text,
  corpus_luteum_side text,
  follicle_dominant_mm numeric,
  ovulation_confirmed boolean NOT NULL DEFAULT false,
  ovulation_side haras_ovary_side,
  recommendation haras_follicle_recommendation,
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.haras_follicle_readings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL,
  business_unit_id uuid NOT NULL,
  ovary_side haras_ovary_side NOT NULL,
  diameter_mm numeric NOT NULL,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.haras_opu_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_unit_id uuid NOT NULL,
  donor_mare_id uuid NOT NULL,
  performed_at timestamp with time zone NOT NULL DEFAULT now(),
  performed_by text,
  location_id uuid,
  oocytes_total integer NOT NULL DEFAULT 0,
  oocytes_viable integer NOT NULL DEFAULT 0,
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.haras_partner_locations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_unit_id uuid NOT NULL,
  client_id uuid NOT NULL,
  name text NOT NULL,
  address text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.haras_pregnancies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_unit_id uuid NOT NULL,
  mare_id uuid NOT NULL,
  stallion_id uuid,
  donor_mare_id uuid,
  breeding_session_id uuid,
  conception_date date NOT NULL,
  gestation_days integer NOT NULL,
  status repro_pregnancy_status NOT NULL DEFAULT 'em_andamento'::repro_pregnancy_status,
  outcome_date date,
  outcome_notes text,
  offspring_animal_id uuid,
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.haras_pregnancy_diagnostics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  pregnancy_id uuid NOT NULL,
  business_unit_id uuid NOT NULL,
  diagnosed_at timestamp with time zone NOT NULL,
  method repro_diagnostic_method NOT NULL,
  result repro_diagnostic_result NOT NULL,
  observed_days integer,
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.haras_purchase_commission_installments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_unit_id uuid NOT NULL,
  commission_id uuid NOT NULL,
  installment_number integer NOT NULL,
  amount numeric(14,2) NOT NULL,
  due_date date NOT NULL,
  paid_date date,
  status payment_status NOT NULL DEFAULT 'pending'::payment_status,
  payable_id uuid,
  transaction_id uuid,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  reversed_at timestamp with time zone,
  reversed_by uuid,
  reversal_reason text,
  reversal_transaction_id uuid
);

CREATE TABLE public.haras_purchase_commissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_unit_id uuid NOT NULL,
  purchase_id uuid NOT NULL,
  commission_type text NOT NULL,
  commission_percentage numeric(6,3),
  commission_amount numeric(14,2) NOT NULL,
  recipient_name text,
  payment_condition text NOT NULL,
  installment_count integer NOT NULL DEFAULT 1,
  first_due_date date,
  auto_create_bills boolean NOT NULL DEFAULT false,
  purchase_status text NOT NULL DEFAULT 'pendente'::text,
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  expense_category_id uuid
);

CREATE TABLE public.haras_purchase_installments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_unit_id uuid NOT NULL,
  purchase_id uuid NOT NULL,
  installment_number integer NOT NULL,
  amount numeric(14,2) NOT NULL,
  due_date date NOT NULL,
  paid_date date,
  status payment_status NOT NULL DEFAULT 'pending'::payment_status,
  payable_id uuid,
  transaction_id uuid,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  reversed_at timestamp with time zone,
  reversed_by uuid,
  reversal_reason text,
  reversal_transaction_id uuid
);

CREATE TABLE public.haras_purchases (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_unit_id uuid NOT NULL,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  purchase_type text NOT NULL,
  purchase_date date NOT NULL DEFAULT CURRENT_DATE,
  seller_name text,
  contract_url text,
  supplier_id uuid,
  total_amount numeric(14,2) NOT NULL,
  payment_condition text NOT NULL,
  installment_count integer NOT NULL DEFAULT 1,
  first_due_date date,
  auto_create_bills boolean NOT NULL DEFAULT false,
  purchase_status text NOT NULL DEFAULT 'pendente'::text,
  has_down_payment boolean NOT NULL DEFAULT false,
  down_payment_amount numeric(14,2),
  down_payment_date date,
  animal_id uuid,
  participation_percentage numeric(5,2),
  estimated_total_value numeric(14,2),
  create_new_animal boolean NOT NULL DEFAULT false,
  quantity_purchased numeric(10,2),
  quantity_used numeric(10,2) NOT NULL DEFAULT 0,
  expiration_date date,
  storage_location text,
  stallion_name text,
  notes text,
  expense_category_id uuid,
  client_request_id uuid,
  cancelled_at timestamp with time zone,
  cancelled_by uuid,
  cancellation_reason text
);

CREATE TABLE public.haras_recurring_invoice_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  recurring_invoice_id uuid NOT NULL,
  service_id uuid,
  description text DEFAULT ''::text,
  unit_price numeric(14,2) NOT NULL,
  quantity numeric(10,2) NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  line_total numeric(14,2) GENERATED ALWAYS AS ((unit_price * quantity)) STORED
);

CREATE TABLE public.haras_recurring_invoices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_unit_id uuid NOT NULL,
  client_id uuid NOT NULL,
  description text DEFAULT ''::text,
  frequency text NOT NULL,
  next_run_date date NOT NULL,
  end_date date,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  animal_id uuid,
  day_of_month integer NOT NULL DEFAULT 1,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  total_amount numeric(14,2) NOT NULL DEFAULT 0
);

CREATE TABLE public.haras_recurring_runs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL,
  ran_at timestamp with time zone NOT NULL DEFAULT now(),
  receivable_id uuid,
  status text NOT NULL DEFAULT 'success'::text,
  notes text,
  source text NOT NULL DEFAULT 'manual'::text,
  generated_count integer NOT NULL DEFAULT 0,
  business_unit_id uuid,
  created_by uuid
);

CREATE TABLE public.haras_reproduction_settings (
  business_unit_id uuid NOT NULL,
  default_gestation_days integer NOT NULL DEFAULT 340,
  enabled boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  breeding_upcoming_days integer NOT NULL DEFAULT 7,
  diagnostic_due_min_days integer NOT NULL DEFAULT 15,
  diagnostic_due_max_days integer NOT NULL DEFAULT 200,
  diagnostic_recheck_days integer NOT NULL DEFAULT 30,
  dpp_soon_days integer NOT NULL DEFAULT 14,
  dpp_overdue_days integer NOT NULL DEFAULT 7
);

CREATE TABLE public.haras_semen_batches (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_unit_id uuid NOT NULL,
  collection_id uuid NOT NULL,
  stallion_id uuid NOT NULL,
  semen_type repro_semen_type NOT NULL,
  container repro_semen_container NOT NULL,
  total_doses integer NOT NULL,
  doses_available integer NOT NULL DEFAULT 0,
  storage_location text,
  code text NOT NULL,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.haras_semen_collections (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_unit_id uuid NOT NULL,
  stallion_id uuid NOT NULL,
  collected_at date NOT NULL,
  volume_ml numeric(8,2),
  concentration_millions_per_ml numeric(10,2),
  motility_pct integer,
  libido repro_libido,
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.haras_semen_movements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_unit_id uuid NOT NULL,
  batch_id uuid NOT NULL,
  kind repro_movement_kind NOT NULL,
  reason repro_movement_reason NOT NULL,
  doses integer NOT NULL,
  signed_doses integer NOT NULL DEFAULT 0,
  ref_type text,
  ref_id uuid,
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  idempotency_key text,
  reversed_by uuid,
  fiv_batch_id uuid
);

CREATE TABLE public.haras_services (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_unit_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  default_price numeric(14,2),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  category text,
  notes text,
  created_by uuid
);

CREATE TABLE public.haras_shadow_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  feature text NOT NULL,
  source_table text,
  source_id uuid,
  business_unit_id uuid,
  payload_old jsonb,
  payload_new jsonb,
  diverged boolean NOT NULL DEFAULT false,
  note text,
  ran_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.loan_installments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  loan_id uuid NOT NULL,
  installment_number integer NOT NULL,
  due_date date NOT NULL,
  amount numeric(14,2) NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending'::payment_status,
  paid_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.loans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_unit_id uuid NOT NULL,
  client_id uuid NOT NULL,
  principal numeric(14,2) NOT NULL,
  monthly_rate numeric(8,5) NOT NULL,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  term_months integer NOT NULL,
  status loan_status NOT NULL DEFAULT 'active'::loan_status,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  business_unit_id uuid,
  type notification_type NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  entity_table text,
  entity_id uuid,
  read_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.payables (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_unit_id uuid NOT NULL,
  supplier_id uuid,
  category_id uuid,
  description text NOT NULL,
  amount numeric(14,2) NOT NULL,
  due_date date NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending'::payment_status,
  paid_at date,
  paid_account_category_id uuid,
  transaction_id uuid,
  closed_at timestamp with time zone,
  recurring_payable_id uuid,
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  preferred_bank_account_id uuid,
  original_due_date date,
  original_amount numeric,
  rescheduled_count integer NOT NULL DEFAULT 0,
  last_reschedule_reason text,
  last_rescheduled_at timestamp with time zone,
  payroll_breakdown jsonb,
  employee_id uuid,
  payroll_period date,
  payroll_batch_id uuid,
  bank_contract_id uuid,
  contract_installment_number integer
);

CREATE TABLE public.profiles (
  id uuid NOT NULL,
  full_name text NOT NULL DEFAULT ''::text,
  email text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  must_change_password boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.receivables (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_unit_id uuid NOT NULL,
  client_id uuid,
  description text NOT NULL,
  amount numeric(14,2) NOT NULL,
  due_date date NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending'::payment_status,
  transaction_id uuid,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  closed_at timestamp with time zone,
  paid_at date,
  paid_account_category_id uuid,
  recurring_invoice_id uuid,
  category_id uuid,
  preferred_bank_account_id uuid,
  haras_client_id uuid
);

CREATE TABLE public.recurring_payables (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_unit_id uuid NOT NULL,
  supplier_id uuid,
  category_id uuid,
  description text NOT NULL,
  amount numeric(14,2) NOT NULL,
  frequency text NOT NULL DEFAULT 'monthly'::text,
  day_of_month integer NOT NULL,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  next_run_date date NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.reservations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_unit_id uuid NOT NULL,
  client_id uuid,
  title text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  total_amount numeric(14,2) NOT NULL DEFAULT 0,
  status reservation_status NOT NULL DEFAULT 'pending'::reservation_status,
  notes text,
  receivable_id uuid,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.sale_installment_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  installment_id uuid NOT NULL,
  kind text NOT NULL,
  sent_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.sale_installments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL,
  installment_number integer NOT NULL,
  due_date date NOT NULL,
  amount numeric(14,2) NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending'::payment_status,
  paid_at date,
  receivable_id uuid,
  interest_amount numeric(14,2) NOT NULL DEFAULT 0,
  fine_amount numeric(14,2) NOT NULL DEFAULT 0,
  discount_amount numeric(14,2) NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  parent_installment_id uuid
);

CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  business_unit_id uuid NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  description text NOT NULL,
  category_id uuid,
  type transaction_type NOT NULL,
  amount numeric(14,2) NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending'::payment_status,
  client_id uuid,
  attachment_url text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  closed_at timestamp with time zone,
  bank_account_id uuid,
  reconciled_at timestamp with time zone,
  reconciled_by uuid,
  is_adjustment boolean NOT NULL DEFAULT false,
  adjustment_reason text,
  is_transfer boolean NOT NULL DEFAULT false,
  transfer_group_id uuid,
  transfer_counterpart_account_id uuid
);

CREATE TABLE public.user_module_permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  module app_module NOT NULL,
  action permission_action NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.user_unit_access (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  business_unit_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- ---------- FUNCOES ----------
-- Corpos nao sao validados na criacao: funcoes referenciam umas as outras e tabelas em qualquer ordem.
SET check_function_bodies = off;

CREATE OR REPLACE FUNCTION public._create_bank_contract_impl(_payload jsonb, _renegotiated_from uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_bu uuid := (_payload->>'business_unit_id')::uuid;
  v_institution text := _payload->>'institution';
  v_number text := _payload->>'contract_number';
  v_type public.bank_contract_type := (_payload->>'contract_type')::public.bank_contract_type;
  v_principal numeric := (_payload->>'principal')::numeric;
  v_contract_date date := (_payload->>'contract_date')::date;
  v_installments int := NULLIF(_payload->>'installments_count','')::int;
  v_inst_amount numeric := NULLIF(_payload->>'installment_amount','')::numeric;
  v_first_due date := NULLIF(_payload->>'first_due_date','')::date;
  v_rate numeric := NULLIF(_payload->>'interest_rate_info','')::numeric;
  v_bank uuid := NULLIF(_payload->>'bank_account_id','')::uuid;
  v_cat uuid;
  v_income_cat uuid := NULLIF(_payload->>'principal_income_category_id','')::uuid;
  v_notes text := _payload->>'notes';
  v_contract_id uuid;
  v_due date;
  v_day int;
  v_y int; v_m int;
  n int;
  v_created_payables int := 0;
  v_credit_tx_id uuid;
  v_cat_type public.transaction_type;
  v_cat_bu uuid;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Não autenticado' USING ERRCODE='42501'; END IF;
  IF v_bu IS NULL THEN RAISE EXCEPTION 'Unidade obrigatória'; END IF;
  IF NOT public.has_permission(v_uid,'bank_contracts'::app_module,'create'::permission_action)
     OR NOT public.can_access_unit(v_uid, v_bu) THEN
    RAISE EXCEPTION 'Sem permissão' USING ERRCODE='42501';
  END IF;

  IF v_type <> 'revolving' THEN
    SELECT id INTO v_cat
      FROM public.categories
     WHERE business_unit_id = v_bu
       AND type = 'expense'
       AND lower(name) = 'empréstimos - parcelas'
     LIMIT 1;
    IF v_cat IS NULL THEN
      INSERT INTO public.categories (business_unit_id, name, type, created_by)
      VALUES (v_bu, 'Empréstimos - parcelas', 'expense', v_uid)
      RETURNING id INTO v_cat;
    END IF;
  END IF;

  INSERT INTO public.bank_contracts (
    business_unit_id, institution, contract_number, contract_type,
    principal, contract_date, installments_count, installment_amount, first_due_date,
    interest_rate_info, bank_account_id, expense_category_id, notes,
    renegotiated_from_id, created_by
  ) VALUES (
    v_bu, v_institution, v_number, v_type,
    v_principal, v_contract_date,
    CASE WHEN v_type='revolving' THEN NULL ELSE v_installments END,
    CASE WHEN v_type='revolving' THEN NULL ELSE v_inst_amount END,
    CASE WHEN v_type='revolving' THEN NULL ELSE v_first_due END,
    v_rate, v_bank, v_cat, v_notes, _renegotiated_from, v_uid
  ) RETURNING id INTO v_contract_id;

  IF v_type <> 'revolving' THEN
    v_day := EXTRACT(DAY FROM v_first_due)::int;
    FOR n IN 1..v_installments LOOP
      v_due := (v_first_due + ((n-1) || ' months')::interval)::date;
      v_y := EXTRACT(YEAR FROM v_due)::int;
      v_m := EXTRACT(MONTH FROM v_due)::int;
      v_due := make_date(v_y, v_m, LEAST(v_day, 28));

      INSERT INTO public.payables (
        business_unit_id, category_id, description, amount, due_date, status,
        bank_contract_id, contract_installment_number, created_by
      ) VALUES (
        v_bu, v_cat,
        'Parcela ' || n || '/' || v_installments || ' — ' || v_institution || ' #' || v_number,
        v_inst_amount, v_due, 'pending',
        v_contract_id, n, v_uid
      );
      v_created_payables := v_created_payables + 1;
    END LOOP;
  END IF;

  IF _renegotiated_from IS NULL
     AND v_bank IS NOT NULL
     AND v_principal > 0
     AND v_type IN ('loan','working_capital','revolving','discounted_bill')
  THEN
    IF NOT public.can_use_bank_account(v_uid, v_bank, v_bu) THEN
      RAISE EXCEPTION 'Sem permissão na conta bancária escolhida' USING ERRCODE='42501';
    END IF;

    IF v_income_cat IS NOT NULL THEN
      SELECT type, business_unit_id INTO v_cat_type, v_cat_bu
        FROM public.categories WHERE id = v_income_cat;
      IF v_cat_bu IS NULL THEN
        RAISE EXCEPTION 'Categoria de entrada não encontrada';
      END IF;
      IF v_cat_bu <> v_bu THEN
        RAISE EXCEPTION 'Categoria de entrada deve pertencer à mesma unidade';
      END IF;
      IF v_cat_type <> 'income' THEN
        RAISE EXCEPTION 'Categoria de entrada deve ser do tipo receita';
      END IF;
    ELSE
      SELECT id INTO v_income_cat
        FROM public.categories
       WHERE business_unit_id = v_bu
         AND type = 'income'
         AND lower(name) = 'empréstimos recebidos'
       LIMIT 1;
      IF v_income_cat IS NULL THEN
        INSERT INTO public.categories (business_unit_id, name, type, created_by)
        VALUES (v_bu, 'Empréstimos recebidos', 'income', v_uid)
        RETURNING id INTO v_income_cat;
      END IF;
    END IF;

    INSERT INTO public.transactions (
      business_unit_id, date, description, category_id, type, amount, status,
      bank_account_id, created_by
    ) VALUES (
      v_bu, v_contract_date,
      'Crédito de contrato bancário — ' || v_institution || ' #' || v_number,
      v_income_cat, 'income', v_principal, 'paid',
      v_bank, v_uid
    ) RETURNING id INTO v_credit_tx_id;

    UPDATE public.bank_contracts
       SET principal_credit_transaction_id = v_credit_tx_id
     WHERE id = v_contract_id;

    INSERT INTO public.audit_log (user_id, action, entity, entity_id, business_unit_id, payload)
    VALUES (v_uid, 'bank_contract.principal_credited', 'bank_contract', v_contract_id, v_bu,
            jsonb_build_object(
              'transaction_id', v_credit_tx_id,
              'amount', v_principal,
              'bank_account_id', v_bank,
              'category_id', v_income_cat
            ));
  END IF;

  INSERT INTO public.audit_log (user_id, action, entity, entity_id, business_unit_id, payload)
  VALUES (
    v_uid,
    CASE WHEN _renegotiated_from IS NULL THEN 'bank_contract.create' ELSE 'bank_contract.create_from_renegotiation' END,
    'bank_contract', v_contract_id, v_bu,
    jsonb_build_object(
      'institution', v_institution,
      'contract_number', v_number,
      'contract_type', v_type,
      'principal', v_principal,
      'installments_created', v_created_payables,
      'bank_account_id', v_bank,
      'renegotiated_from_id', _renegotiated_from,
      'principal_credit_transaction_id', v_credit_tx_id
    )
  );

  RETURN v_contract_id;
END $function$
;

CREATE OR REPLACE FUNCTION public._haras_regenerate_shares(_tx_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_animal uuid; v_amount numeric; v_primary uuid; v_parts jsonb;
BEGIN
  SELECT animal_id, amount INTO v_animal, v_amount FROM public.haras_animal_transactions WHERE id=_tx_id;
  IF v_animal IS NULL THEN RETURN; END IF;
  DELETE FROM public.haras_animal_transaction_shares WHERE transaction_id=_tx_id;
  SELECT jsonb_agg(jsonb_build_object('client_id',client_id,'ownership_percentage',ownership_percentage))
    INTO v_parts FROM public.haras_animal_partners WHERE animal_id=v_animal;
  IF v_parts IS NULL OR jsonb_array_length(v_parts)=0 THEN
    SELECT primary_client_id INTO v_primary FROM public.haras_animals WHERE id=v_animal;
    v_parts := jsonb_build_array(jsonb_build_object('client_id',v_primary,'ownership_percentage',100));
  END IF;
  INSERT INTO public.haras_animal_transaction_shares (transaction_id, client_id, ownership_percentage, share_amount)
  SELECT _tx_id, s.client_id, s.ownership_percentage, s.share_amount
    FROM public._haras_split_largest_remainder(v_amount, v_parts) s;
END $function$
;

CREATE OR REPLACE FUNCTION public._haras_split_largest_remainder(_amount numeric, _parts jsonb)
 RETURNS TABLE(client_id uuid, ownership_percentage numeric, share_amount numeric)
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
DECLARE total_cents bigint := round(_amount * 100)::bigint; n int; sum_floor bigint := 0; remainder bigint;
BEGIN
  CREATE TEMP TABLE _tmp_parts (idx int, client_id uuid, pct numeric, raw_cents numeric, floor_cents bigint, remainder_frac numeric) ON COMMIT DROP;
  INSERT INTO _tmp_parts SELECT row_number() OVER (), (p->>'client_id')::uuid, (p->>'ownership_percentage')::numeric,
    total_cents * (p->>'ownership_percentage')::numeric / 100,
    floor(total_cents * (p->>'ownership_percentage')::numeric / 100)::bigint,
    (total_cents * (p->>'ownership_percentage')::numeric / 100) - floor(total_cents * (p->>'ownership_percentage')::numeric / 100)
    FROM jsonb_array_elements(_parts) p;
  SELECT count(*), COALESCE(sum(floor_cents),0) INTO n, sum_floor FROM _tmp_parts;
  IF n = 0 THEN RETURN; END IF;
  remainder := total_cents - sum_floor;
  UPDATE _tmp_parts SET floor_cents = floor_cents + 1 WHERE idx IN (SELECT idx FROM _tmp_parts ORDER BY remainder_frac DESC, idx ASC LIMIT remainder);
  RETURN QUERY SELECT t.client_id, t.pct, (t.floor_cents::numeric/100) FROM _tmp_parts t ORDER BY t.idx;
END $function$
;

CREATE OR REPLACE FUNCTION public.a_haras_fiv_validate()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_session RECORD;
  v_stallion RECORD;
  v_semen RECORD;
  v_used_by_others integer;
  v_has_embryos boolean;
BEGIN
  -- Lock session row to avoid race conditions on oocyte accounting
  SELECT business_unit_id, oocytes_viable
    INTO v_session
    FROM public.haras_opu_sessions
    WHERE id = NEW.opu_session_id
    FOR UPDATE;

  IF v_session IS NULL THEN
    RAISE EXCEPTION 'FIV_SESSION_NOT_FOUND' USING ERRCODE = 'foreign_key_violation';
  END IF;

  -- Force BU from session
  IF NEW.business_unit_id IS NULL THEN
    NEW.business_unit_id := v_session.business_unit_id;
  ELSIF NEW.business_unit_id <> v_session.business_unit_id THEN
    RAISE EXCEPTION 'FIV_BU_MISMATCH' USING ERRCODE = 'check_violation';
  END IF;

  -- Stallion checks
  SELECT business_unit_id, sex INTO v_stallion
    FROM public.haras_animals WHERE id = NEW.stallion_id;
  IF v_stallion IS NULL THEN
    RAISE EXCEPTION 'FIV_STALLION_NOT_FOUND' USING ERRCODE = 'foreign_key_violation';
  END IF;
  IF v_stallion.business_unit_id <> NEW.business_unit_id THEN
    RAISE EXCEPTION 'FIV_BU_MISMATCH' USING ERRCODE = 'check_violation';
  END IF;
  IF v_stallion.sex IS DISTINCT FROM 'macho'::public.repro_sex THEN
    RAISE EXCEPTION 'FIV_STALLION_MUST_BE_MALE' USING ERRCODE = 'check_violation';
  END IF;

  -- Semen batch (optional) same BU
  IF NEW.semen_batch_id IS NOT NULL THEN
    SELECT business_unit_id INTO v_semen
      FROM public.haras_semen_batches WHERE id = NEW.semen_batch_id;
    IF v_semen IS NULL THEN
      RAISE EXCEPTION 'FIV_SEMEN_BATCH_NOT_FOUND' USING ERRCODE = 'foreign_key_violation';
    END IF;
    IF v_semen.business_unit_id <> NEW.business_unit_id THEN
      RAISE EXCEPTION 'FIV_SEMEN_BU_MISMATCH' USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  -- Oocytes accounting
  SELECT COALESCE(SUM(oocytes_used), 0) INTO v_used_by_others
    FROM public.haras_fiv_batches
    WHERE opu_session_id = NEW.opu_session_id
      AND (TG_OP = 'INSERT' OR id <> NEW.id);

  IF v_used_by_others + NEW.oocytes_used > v_session.oocytes_viable THEN
    RAISE EXCEPTION 'FIV_OOCYTES_EXCEEDED' USING ERRCODE = 'check_violation';
  END IF;

  -- Prevent reopening a finalized batch that already has embryos
  IF TG_OP = 'UPDATE' AND OLD.status = 'concluido' AND NEW.status <> 'concluido' THEN
    SELECT EXISTS(SELECT 1 FROM public.haras_embryos WHERE fiv_batch_id = OLD.id)
      INTO v_has_embryos;
    IF v_has_embryos THEN
      RAISE EXCEPTION 'FIV_CANNOT_REOPEN_WITH_EMBRYOS' USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.a_haras_opu_validate()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_mare RECORD;
BEGIN
  IF NEW.performed_at > now() + interval '1 minute' THEN
    RAISE EXCEPTION 'OPU_IN_FUTURE' USING ERRCODE = 'check_violation';
  END IF;
  IF NEW.oocytes_viable > NEW.oocytes_total THEN
    RAISE EXCEPTION 'OPU_VIABLE_EXCEEDS_TOTAL' USING ERRCODE = 'check_violation';
  END IF;

  SELECT business_unit_id, sex INTO v_mare
  FROM public.haras_animals WHERE id = NEW.donor_mare_id;

  IF v_mare IS NULL THEN
    RAISE EXCEPTION 'OPU_DONOR_NOT_FOUND' USING ERRCODE = 'foreign_key_violation';
  END IF;
  IF v_mare.business_unit_id <> NEW.business_unit_id THEN
    RAISE EXCEPTION 'OPU_BU_MISMATCH' USING ERRCODE = 'check_violation';
  END IF;
  IF v_mare.sex IS DISTINCT FROM 'femea'::public.repro_sex THEN
    RAISE EXCEPTION 'OPU_DONOR_MUST_BE_FEMALE' USING ERRCODE = 'check_violation';
  END IF;

  IF NEW.performed_by IS NOT NULL THEN
    NEW.performed_by := NULLIF(btrim(NEW.performed_by), '');
  END IF;

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.add_revolving_charge(_payload jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_contract_id uuid := (_payload->>'contract_id')::uuid;
  v_amount numeric := (_payload->>'amount')::numeric;
  v_desc text := _payload->>'description';
  v_due date := (_payload->>'due_date')::date;
  v_cat uuid := (_payload->>'expense_category_id')::uuid;
  v_bu uuid;
  v_status public.bank_contract_status;
  v_type public.bank_contract_type;
  v_institution text;
  v_number text;
  v_cat_bu uuid; v_cat_type text;
  v_payable_id uuid;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Não autenticado' USING ERRCODE='42501'; END IF;
  IF v_contract_id IS NULL THEN RAISE EXCEPTION 'Contrato obrigatório'; END IF;
  IF v_amount IS NULL OR v_amount <= 0 THEN RAISE EXCEPTION 'Valor inválido'; END IF;
  IF v_due IS NULL THEN RAISE EXCEPTION 'Vencimento obrigatório'; END IF;
  IF v_cat IS NULL THEN RAISE EXCEPTION 'Categoria obrigatória'; END IF;

  SELECT business_unit_id, status, contract_type, institution, contract_number
    INTO v_bu, v_status, v_type, v_institution, v_number
    FROM public.bank_contracts WHERE id = v_contract_id;

  IF v_bu IS NULL THEN RAISE EXCEPTION 'Contrato não encontrado'; END IF;
  IF v_type <> 'revolving' THEN RAISE EXCEPTION 'Somente contratos rotativos aceitam lançamentos avulsos'; END IF;
  IF v_status <> 'active' THEN RAISE EXCEPTION 'Contrato não está ativo'; END IF;

  IF NOT public.has_permission(v_uid,'bank_contracts'::app_module,'edit'::permission_action)
     OR NOT public.has_permission(v_uid,'payables'::app_module,'create'::permission_action)
     OR NOT public.can_access_unit(v_uid, v_bu) THEN
    RAISE EXCEPTION 'Sem permissão' USING ERRCODE='42501';
  END IF;

  SELECT business_unit_id, type INTO v_cat_bu, v_cat_type
    FROM public.categories WHERE id = v_cat;
  IF v_cat_bu IS NULL THEN RAISE EXCEPTION 'Categoria não encontrada'; END IF;
  IF v_cat_bu <> v_bu THEN RAISE EXCEPTION 'Categoria pertence a outra unidade'; END IF;
  IF v_cat_type <> 'expense' THEN RAISE EXCEPTION 'Categoria deve ser de despesa'; END IF;

  INSERT INTO public.payables (
    business_unit_id, category_id, description, amount, due_date, status,
    bank_contract_id, notes, created_by
  ) VALUES (
    v_bu, v_cat,
    COALESCE(NULLIF(trim(v_desc),''), 'Lançamento rotativo — ' || v_institution || ' #' || v_number),
    v_amount, v_due, 'pending',
    v_contract_id, '[Lançamento rotativo]', v_uid
  ) RETURNING id INTO v_payable_id;

  INSERT INTO public.audit_log (user_id, action, entity, entity_id, business_unit_id, payload)
  VALUES (v_uid, 'bank_contract.revolving_charge', 'bank_contract', v_contract_id, v_bu,
          jsonb_build_object(
            'payable_id', v_payable_id,
            'amount', v_amount,
            'due_date', v_due
          ));

  RETURN v_payable_id;
END $function$
;

CREATE OR REPLACE FUNCTION public.admin_replace_user_permissions(_caller_id uuid, _user_id uuid, _is_active boolean, _perms jsonb, _unit_ids uuid[])
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_perm jsonb;
  v_module text;
  v_action text;
BEGIN
  IF _caller_id IS NULL OR _user_id IS NULL THEN
    RAISE EXCEPTION 'Parâmetros obrigatórios ausentes';
  END IF;
  IF NOT public.is_admin(_caller_id) THEN
    RAISE EXCEPTION 'Apenas administradores podem editar permissões';
  END IF;
  IF _caller_id = _user_id THEN
    RAISE EXCEPTION 'Não é possível editar suas próprias permissões';
  END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin') THEN
    RAISE EXCEPTION 'Não é possível editar permissões de outro administrador';
  END IF;

  IF _perms IS NOT NULL THEN
    FOR v_perm IN SELECT * FROM jsonb_array_elements(_perms) LOOP
      v_module := v_perm->>'module';
      v_action := v_perm->>'action';
      BEGIN
        PERFORM v_module::app_module;
      EXCEPTION WHEN invalid_text_representation OR undefined_object THEN
        RAISE EXCEPTION 'Módulo inválido: %', v_module;
      END;
      BEGIN
        PERFORM v_action::permission_action;
      EXCEPTION WHEN invalid_text_representation OR undefined_object THEN
        RAISE EXCEPTION 'Ação inválida: %', v_action;
      END;
    END LOOP;
  END IF;

  IF _unit_ids IS NOT NULL AND array_length(_unit_ids, 1) > 0 THEN
    IF (SELECT count(*) FROM public.business_units WHERE id = ANY(_unit_ids))
       <> array_length(_unit_ids, 1) THEN
      RAISE EXCEPTION 'Uma ou mais unidades de negócio não existem';
    END IF;
  END IF;

  UPDATE public.profiles SET is_active = COALESCE(_is_active, is_active) WHERE id = _user_id;

  DELETE FROM public.user_module_permissions WHERE user_id = _user_id;
  IF _perms IS NOT NULL AND jsonb_array_length(_perms) > 0 THEN
    INSERT INTO public.user_module_permissions (user_id, module, action)
    SELECT _user_id, (p->>'module')::app_module, (p->>'action')::permission_action
    FROM jsonb_array_elements(_perms) p
    ON CONFLICT DO NOTHING;
  END IF;

  DELETE FROM public.user_unit_access WHERE user_id = _user_id;
  IF _unit_ids IS NOT NULL AND array_length(_unit_ids, 1) > 0 THEN
    INSERT INTO public.user_unit_access (user_id, business_unit_id)
    SELECT _user_id, unnest(_unit_ids)
    ON CONFLICT DO NOTHING;
  END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.can_access_unit(_user_id uuid, _unit_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT public.is_admin(_user_id)
    OR EXISTS (SELECT 1 FROM public.user_unit_access WHERE user_id = _user_id AND business_unit_id = _unit_id)
$function$
;

CREATE OR REPLACE FUNCTION public.can_use_bank_account(_user_id uuid, _bank_account_id uuid, _business_unit_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    EXISTS (SELECT 1 FROM public.bank_accounts b WHERE b.id = _bank_account_id AND b.is_active)
    AND (
      public.is_admin(_user_id)
      OR NOT EXISTS (SELECT 1 FROM public.bank_account_units WHERE bank_account_id = _bank_account_id)
      OR EXISTS (
        SELECT 1 FROM public.bank_account_units
        WHERE bank_account_id = _bank_account_id AND business_unit_id = _business_unit_id
      )
    )
$function$
;

CREATE OR REPLACE FUNCTION public.can_view_bank_account(_user_id uuid, _bank_account_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    public.is_admin(_user_id)
    OR NOT EXISTS (SELECT 1 FROM public.bank_account_units WHERE bank_account_id = _bank_account_id)
    OR EXISTS (
      SELECT 1 FROM public.bank_account_units bau
      JOIN public.user_unit_access uua ON uua.business_unit_id = bau.business_unit_id
      WHERE bau.bank_account_id = _bank_account_id AND uua.user_id = _user_id
    )
$function$
;

CREATE OR REPLACE FUNCTION public.cancel_animal_sale(_sale_id uuid, _reason text)
 RETURNS animal_sales
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_sale public.animal_sales%ROWTYPE;
  v_before jsonb;
  v_paid_count int;
  v_reason text := trim(coalesce(_reason, ''));
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Não autenticado' USING ERRCODE = '42501';
  END IF;
  IF length(v_reason) < 10 THEN
    RAISE EXCEPTION 'Informe um motivo com pelo menos 10 caracteres';
  END IF;

  SELECT * INTO v_sale FROM public.animal_sales WHERE id = _sale_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Venda não encontrada'; END IF;
  IF v_sale.status = 'cancelled' THEN RAISE EXCEPTION 'Venda já está cancelada'; END IF;

  -- Permissão: admin OU (acesso à BU + sales.delete)
  IF NOT (
    public.is_admin(auth.uid())
    OR (
      public.can_access_unit(auth.uid(), v_sale.business_unit_id)
      AND public.has_permission(auth.uid(), 'sales', 'delete')
    )
  ) THEN
    RAISE EXCEPTION 'Sem permissão para cancelar esta venda' USING ERRCODE = '42501';
  END IF;

  -- Bloqueios de escopo do Item 2a
  IF v_sale.contract_path IS NOT NULL THEN
    RAISE EXCEPTION 'Contrato já foi emitido — use o estorno completo';
  END IF;

  SELECT COUNT(*) INTO v_paid_count
    FROM public.sale_installments
    WHERE sale_id = _sale_id AND status = 'paid';
  IF v_paid_count > 0 THEN
    RAISE EXCEPTION 'Existem % parcela(s) paga(s) — use o estorno completo', v_paid_count;
  END IF;

  v_before := to_jsonb(v_sale);

  -- 1) Marca venda
  UPDATE public.animal_sales
     SET status = 'cancelled',
         cancelled_at = now(),
         cancelled_by = auth.uid(),
         cancel_reason = v_reason,
         updated_at = now()
   WHERE id = _sale_id
   RETURNING * INTO v_sale;

  -- 2) Cancela parcelas em aberto
  UPDATE public.sale_installments
     SET status = 'cancelled', updated_at = now()
   WHERE sale_id = _sale_id AND status IN ('pending','overdue');

  -- 3) Cancela comissão em aberto (payable e/ou receivable)
  IF v_sale.commission_payable_id IS NOT NULL THEN
    UPDATE public.payables
       SET status = 'cancelled', updated_at = now()
     WHERE id = v_sale.commission_payable_id AND status <> 'paid';
  END IF;
  IF v_sale.commission_receivable_id IS NOT NULL THEN
    UPDATE public.receivables
       SET status = 'cancelled', updated_at = now()
     WHERE id = v_sale.commission_receivable_id AND status <> 'paid';
  END IF;

  -- 4) Libera lote (se veio de leilão)
  UPDATE public.auction_lot_animals
     SET sale_id = NULL, hammer_price = NULL
   WHERE sale_id = _sale_id;

  -- 5) Devolve animal ao status 'active'
  UPDATE public.haras_animals
     SET status = 'active'
   WHERE id = v_sale.animal_id AND status = 'sold';

  -- 6) Audit log
  INSERT INTO public.audit_log(entity, entity_id, action, business_unit_id, user_id, payload)
  VALUES (
    'animal_sales', _sale_id, 'cancel_animal_sale',
    v_sale.business_unit_id, auth.uid(),
    jsonb_build_object(
      'reason', v_reason,
      'before', v_before,
      'commission_payable_id', v_sale.commission_payable_id,
      'commission_receivable_id', v_sale.commission_receivable_id,
      'auction_lot_id', v_sale.auction_lot_id,
      'animal_id', v_sale.animal_id
    )
  );

  RETURN v_sale;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.cancel_recurring_payable_series(_template_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_bu uuid;
BEGIN
  SELECT business_unit_id INTO v_bu FROM public.recurring_payables WHERE id=_template_id;
  IF v_bu IS NULL THEN RAISE EXCEPTION 'Recorrência não encontrada'; END IF;
  IF NOT public.has_permission(auth.uid(),'payables'::app_module,'delete'::permission_action) OR NOT public.can_access_unit(auth.uid(),v_bu) THEN
    RAISE EXCEPTION 'Sem permissão' USING ERRCODE='42501'; END IF;
  UPDATE public.recurring_payables SET is_active=false, updated_at=now() WHERE id=_template_id;
  DELETE FROM public.payables WHERE recurring_payable_id=_template_id AND status='pending' AND due_date > CURRENT_DATE;
END $function$
;

CREATE OR REPLACE FUNCTION public.cleanup_sale_commission_payable()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_status public.payment_status;
BEGIN
  IF OLD.commission_payable_id IS NULL THEN RETURN OLD; END IF;
  SELECT status INTO v_status FROM public.payables WHERE id=OLD.commission_payable_id;
  IF v_status IS NULL THEN RETURN OLD; END IF;
  IF v_status='paid' THEN
    UPDATE public.payables SET description=description||' [venda excluída]', updated_at=now() WHERE id=OLD.commission_payable_id;
  ELSE DELETE FROM public.payables WHERE id=OLD.commission_payable_id; END IF;
  RETURN OLD;
END $function$
;

CREATE OR REPLACE FUNCTION public.cleanup_sale_commission_receivable()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_status public.payment_status;
BEGIN
  PERFORM set_config('app.bypass_close', 'on', true);
  IF OLD.commission_receivable_id IS NULL THEN RETURN OLD; END IF;
  SELECT status INTO v_status FROM public.receivables WHERE id = OLD.commission_receivable_id;
  IF v_status IS NULL THEN RETURN OLD; END IF;
  IF v_status = 'paid' THEN
    UPDATE public.receivables
      SET description = description || ' [venda excluída]', updated_at = now()
      WHERE id = OLD.commission_receivable_id;
  ELSE
    DELETE FROM public.receivables WHERE id = OLD.commission_receivable_id;
  END IF;
  RETURN OLD;
END $function$
;

CREATE OR REPLACE FUNCTION public.close_receivable(_id uuid)
 RETURNS timestamp with time zone
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE _closed timestamptz;
BEGIN
  UPDATE public.receivables SET closed_at = COALESCE(closed_at, now()) WHERE id = _id RETURNING closed_at INTO _closed;
  IF NOT FOUND THEN RAISE EXCEPTION 'Recebível % não encontrado ou sem permissão', _id USING ERRCODE = 'P0002'; END IF;
  RETURN _closed;
END; $function$
;

CREATE OR REPLACE FUNCTION public.close_transaction(_id uuid)
 RETURNS timestamp with time zone
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE _closed timestamptz;
BEGIN
  UPDATE public.transactions SET closed_at = COALESCE(closed_at, now()) WHERE id = _id RETURNING closed_at INTO _closed;
  IF NOT FOUND THEN RAISE EXCEPTION 'Transação % não encontrada ou sem permissão', _id USING ERRCODE = 'P0002'; END IF;
  RETURN _closed;
END; $function$
;

CREATE OR REPLACE FUNCTION public.create_animal_sale(_payload jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_bu uuid := (_payload->>'business_unit_id')::uuid;
  v_animal uuid := (_payload->>'animal_id')::uuid;
  v_buyer uuid := (_payload->>'buyer_client_id')::uuid;
  v_lot uuid := NULLIF(_payload->>'auction_lot_id','')::uuid;
  v_sale_date date := COALESCE((_payload->>'sale_date')::date, CURRENT_DATE);
  v_total numeric := (_payload->>'total_amount')::numeric;
  v_down numeric := COALESCE((_payload->>'down_payment')::numeric, 0);
  v_inst_count int := COALESCE((_payload->>'installments_count')::int, 1);
  v_first_due date := NULLIF(_payload->>'first_due_date','')::date;
  v_method public.sale_payment_method := COALESCE((_payload->>'payment_method')::public.sale_payment_method, 'cash');
  v_pay_cat uuid := NULLIF(_payload->>'paid_account_category_id','')::uuid;
  v_paid_bank uuid := NULLIF(_payload->>'paid_bank_account_id','')::uuid;
  v_notes text := _payload->>'notes';
  v_commission numeric := COALESCE((_payload->>'commission')::numeric, 0);
  v_sale_type text := COALESCE(_payload->>'sale_type', 'direct');
  v_down_date date;
  v_sale_id uuid; v_animal_bu uuid; v_remain numeric;
  v_per_cents bigint; v_total_cents bigint; v_remainder_cents bigint;
  v_i int; v_amount numeric; v_due date; v_recv_id uuid;
BEGIN
  IF NOT public.has_permission(auth.uid(),'sales'::app_module,'create'::permission_action) OR NOT public.can_access_unit(auth.uid(), v_bu) THEN
    RAISE EXCEPTION 'Sem permissão' USING ERRCODE='42501'; END IF;
  IF NOT public.is_feature_enabled(v_bu, 'sales_enabled') THEN RAISE EXCEPTION 'Módulo Vendas não habilitado'; END IF;
  IF v_sale_type NOT IN ('direct','auction') THEN RAISE EXCEPTION 'sale_type inválido'; END IF;
  IF v_commission < 0 THEN RAISE EXCEPTION 'Comissão negativa'; END IF;
  SELECT business_unit_id INTO v_animal_bu FROM public.haras_animals WHERE id=v_animal;
  IF v_animal_bu IS NULL THEN RAISE EXCEPTION 'Animal não encontrado'; END IF;
  IF v_animal_bu <> v_bu THEN RAISE EXCEPTION 'Animal em outra unidade'; END IF;
  IF v_down > v_total THEN RAISE EXCEPTION 'Entrada > total'; END IF;
  v_down_date := COALESCE(NULLIF(_payload->>'down_payment_date','')::date, v_sale_date);
  IF v_down > 0 AND v_down_date < v_sale_date THEN RAISE EXCEPTION 'Data entrada anterior à venda'; END IF;
  v_remain := v_total - v_down;
  IF v_method='cash' OR v_remain=0 THEN v_inst_count := 0;
  ELSE IF v_first_due IS NULL THEN RAISE EXCEPTION 'first_due_date obrigatório'; END IF; END IF;
  INSERT INTO public.animal_sales (business_unit_id, animal_id, buyer_client_id, auction_lot_id, sale_date, total_amount, down_payment, down_payment_date, installments_count, first_due_date, payment_method, status, paid_account_category_id, notes, created_by, commission, sale_type)
  VALUES (v_bu, v_animal, v_buyer, v_lot, v_sale_date, v_total, v_down, CASE WHEN v_down>0 THEN v_down_date ELSE NULL END, GREATEST(v_inst_count,1), v_first_due, v_method, 'active', v_pay_cat, v_notes, auth.uid(), v_commission, v_sale_type)
  RETURNING id INTO v_sale_id;
  IF v_lot IS NOT NULL THEN
    UPDATE public.auction_lot_animals SET sale_id=v_sale_id, hammer_price=COALESCE(hammer_price, v_total)
      WHERE auction_lot_id=v_lot AND animal_id=v_animal AND sale_id IS NULL;
  END IF;
  IF v_down > 0 THEN
    INSERT INTO public.receivables (business_unit_id, client_id, description, amount, due_date, status, created_by)
    VALUES (v_bu, v_buyer, 'Venda animal (entrada) - sale:'||v_sale_id, v_down, v_down_date, 'pending', auth.uid())
    RETURNING id INTO v_recv_id;
    INSERT INTO public.sale_installments (sale_id, installment_number, due_date, amount, receivable_id)
    VALUES (v_sale_id, 0, v_down_date, v_down, v_recv_id);
    IF v_pay_cat IS NOT NULL THEN PERFORM public.mark_receivable_paid(v_recv_id, v_down_date, v_pay_cat, v_paid_bank); END IF;
  END IF;
  IF v_inst_count > 0 AND v_remain > 0 THEN
    v_total_cents := round(v_remain * 100)::bigint;
    v_per_cents := v_total_cents / v_inst_count;
    v_remainder_cents := v_total_cents - (v_per_cents * v_inst_count);
    FOR v_i IN 1..v_inst_count LOOP
      v_amount := v_per_cents::numeric / 100;
      IF v_i = v_inst_count THEN v_amount := v_amount + (v_remainder_cents::numeric / 100); END IF;
      v_due := (v_first_due + ((v_i - 1) || ' months')::interval)::date;
      INSERT INTO public.receivables (business_unit_id, client_id, description, amount, due_date, status, created_by)
      VALUES (v_bu, v_buyer, 'Venda animal parcela '||v_i||'/'||v_inst_count||' - sale:'||v_sale_id, v_amount, v_due, 'pending', auth.uid())
      RETURNING id INTO v_recv_id;
      INSERT INTO public.sale_installments (sale_id, installment_number, due_date, amount, receivable_id)
      VALUES (v_sale_id, v_i, v_due, v_amount, v_recv_id);
    END LOOP;
  END IF;
  RETURN v_sale_id;
END $function$
;

CREATE OR REPLACE FUNCTION public.create_animal_sale_custom(_payload jsonb, _installments jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_bu uuid := (_payload->>'business_unit_id')::uuid;
  v_animal uuid := (_payload->>'animal_id')::uuid;
  v_buyer uuid := (_payload->>'buyer_client_id')::uuid;
  v_lot uuid := NULLIF(_payload->>'auction_lot_id','')::uuid;
  v_sale_date date := COALESCE((_payload->>'sale_date')::date, CURRENT_DATE);
  v_total numeric := (_payload->>'total_amount')::numeric;
  v_down numeric := COALESCE((_payload->>'down_payment')::numeric, 0);
  v_down_date date;
  v_method public.sale_payment_method := COALESCE((_payload->>'payment_method')::public.sale_payment_method, 'installments');
  v_pay_cat uuid := NULLIF(_payload->>'paid_account_category_id','')::uuid;
  v_notes text := _payload->>'notes';
  v_commission numeric := COALESCE((_payload->>'commission')::numeric, 0);
  v_sale_type text := COALESCE(_payload->>'sale_type','direct');
  v_inst_count int;
  v_sum_check numeric;
  v_remain numeric;
  v_animal_bu uuid;
  v_sale_id uuid;
  v_recv_id uuid;
  r jsonb;
  v_first_due date;
BEGIN
  IF NOT public.has_permission(auth.uid(),'sales'::app_module,'create'::permission_action) OR NOT public.can_access_unit(auth.uid(), v_bu) THEN
    RAISE EXCEPTION 'Sem permissão' USING ERRCODE='42501'; END IF;
  IF NOT public.is_feature_enabled(v_bu, 'sales_enabled') THEN RAISE EXCEPTION 'Módulo Vendas não habilitado'; END IF;
  IF v_sale_type NOT IN ('direct','auction') THEN RAISE EXCEPTION 'sale_type inválido'; END IF;
  IF v_commission < 0 THEN RAISE EXCEPTION 'Comissão negativa'; END IF;

  SELECT business_unit_id INTO v_animal_bu FROM public.haras_animals WHERE id = v_animal;
  IF v_animal_bu IS NULL THEN RAISE EXCEPTION 'Animal não encontrado'; END IF;
  IF v_animal_bu <> v_bu THEN RAISE EXCEPTION 'Animal em outra unidade'; END IF;
  IF v_down > v_total THEN RAISE EXCEPTION 'Entrada > total'; END IF;

  v_down_date := COALESCE(NULLIF(_payload->>'down_payment_date','')::date, v_sale_date);
  IF v_down > 0 AND v_down_date < v_sale_date THEN RAISE EXCEPTION 'Data entrada anterior à venda'; END IF;

  v_remain := v_total - v_down;

  -- Validate installments array
  IF _installments IS NULL OR jsonb_typeof(_installments) <> 'array' OR jsonb_array_length(_installments) = 0 THEN
    RAISE EXCEPTION 'Lista de parcelas vazia';
  END IF;

  SELECT count(*), COALESCE(sum((x->>'amount')::numeric),0)
    INTO v_inst_count, v_sum_check
    FROM jsonb_array_elements(_installments) x;

  IF round(v_sum_check * 100) <> round(v_remain * 100) THEN
    RAISE EXCEPTION 'Soma das parcelas (%) difere do saldo a parcelar (%)', v_sum_check, v_remain;
  END IF;

  -- Validate each item
  FOR r IN SELECT * FROM jsonb_array_elements(_installments) LOOP
    IF (r->>'amount')::numeric <= 0 THEN RAISE EXCEPTION 'Parcela com valor inválido'; END IF;
    IF (r->>'due_date')::date < v_sale_date THEN RAISE EXCEPTION 'Vencimento anterior à venda'; END IF;
  END LOOP;

  SELECT MIN((x->>'due_date')::date) INTO v_first_due FROM jsonb_array_elements(_installments) x;

  INSERT INTO public.animal_sales (business_unit_id, animal_id, buyer_client_id, auction_lot_id, sale_date,
                                    total_amount, down_payment, down_payment_date, installments_count, first_due_date,
                                    payment_method, status, paid_account_category_id, notes, created_by, commission, sale_type)
  VALUES (v_bu, v_animal, v_buyer, v_lot, v_sale_date, v_total, v_down,
          CASE WHEN v_down > 0 THEN v_down_date ELSE NULL END,
          v_inst_count, v_first_due, v_method, 'active', v_pay_cat, v_notes, auth.uid(), v_commission, v_sale_type)
  RETURNING id INTO v_sale_id;

  IF v_lot IS NOT NULL THEN
    UPDATE public.auction_lot_animals SET sale_id = v_sale_id, hammer_price = COALESCE(hammer_price, v_total)
      WHERE auction_lot_id = v_lot AND animal_id = v_animal AND sale_id IS NULL;
  END IF;

  -- Entrada
  IF v_down > 0 THEN
    INSERT INTO public.receivables (business_unit_id, client_id, description, amount, due_date, status, created_by)
    VALUES (v_bu, v_buyer, 'Venda animal (entrada) - sale:'||v_sale_id, v_down, v_down_date, 'pending', auth.uid())
    RETURNING id INTO v_recv_id;
    INSERT INTO public.sale_installments (sale_id, installment_number, due_date, amount, receivable_id)
    VALUES (v_sale_id, 0, v_down_date, v_down, v_recv_id);
    IF v_pay_cat IS NOT NULL THEN PERFORM public.mark_receivable_paid(v_recv_id, v_down_date, v_pay_cat); END IF;
  END IF;

  -- Parcelas customizadas
  FOR r IN SELECT * FROM jsonb_array_elements(_installments) LOOP
    INSERT INTO public.receivables (business_unit_id, client_id, description, amount, due_date, status, created_by)
    VALUES (v_bu, v_buyer,
            'Venda animal parcela '||(r->>'installment_number')||'/'||v_inst_count||' - sale:'||v_sale_id,
            (r->>'amount')::numeric, (r->>'due_date')::date, 'pending', auth.uid())
    RETURNING id INTO v_recv_id;
    INSERT INTO public.sale_installments (sale_id, installment_number, due_date, amount, receivable_id)
    VALUES (v_sale_id, (r->>'installment_number')::int, (r->>'due_date')::date, (r->>'amount')::numeric, v_recv_id);
  END LOOP;

  RETURN v_sale_id;
END $function$
;

CREATE OR REPLACE FUNCTION public.create_animal_sale_v2(_payload jsonb, _installments jsonb, _buyer_new jsonb DEFAULT NULL::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_bu uuid := (_payload->>'business_unit_id')::uuid;
  v_product_type text := COALESCE(_payload->>'product_type','whole');
  v_animal uuid := NULLIF(_payload->>'animal_id','')::uuid;
  v_sire uuid := NULLIF(_payload->>'sire_animal_id','')::uuid;
  v_donor uuid := NULLIF(_payload->>'donor_animal_id','')::uuid;
  v_recipient uuid := NULLIF(_payload->>'recipient_animal_id','')::uuid;
  v_covering_note text := _payload->>'covering_mare_note';
  v_crop_year int := NULLIF(_payload->>'crop_year','')::int;
  v_share_pct numeric := NULLIF(_payload->>'share_pct','')::numeric;
  v_buyer uuid := NULLIF(_payload->>'buyer_client_id','')::uuid;
  v_lot uuid := NULLIF(_payload->>'auction_lot_id','')::uuid;
  v_sale_date date := COALESCE((_payload->>'sale_date')::date, CURRENT_DATE);
  v_total numeric := (_payload->>'total_amount')::numeric;
  v_down numeric := COALESCE((_payload->>'down_payment')::numeric, 0);
  v_down_date date;
  v_method public.sale_payment_method := COALESCE((_payload->>'payment_method')::public.sale_payment_method, 'installments');
  v_pay_cat uuid := NULLIF(_payload->>'paid_account_category_id','')::uuid;
  v_notes text := _payload->>'notes';
  v_commission numeric := COALESCE((_payload->>'commission')::numeric, 0);
  v_commission_mode text := COALESCE(_payload->>'commission_mode','payable');
  v_sale_type text := COALESCE(_payload->>'sale_type','direct');
  v_inst_count int := 0;
  v_sum_check numeric := 0;
  v_remain numeric;
  v_animal_bu uuid;
  v_sale_id uuid;
  v_recv_id uuid;
  v_first_due date;
  r jsonb;
  v_anchor_animal uuid;
  v_has_installments boolean;
BEGIN
  IF NOT public.has_permission(auth.uid(),'sales'::app_module,'create'::permission_action)
     OR NOT public.can_access_unit(auth.uid(), v_bu) THEN
    RAISE EXCEPTION 'Sem permissão' USING ERRCODE='42501';
  END IF;
  IF NOT public.is_feature_enabled(v_bu, 'sales_enabled') THEN RAISE EXCEPTION 'Módulo Vendas não habilitado'; END IF;
  IF v_product_type NOT IN ('whole','share','embryo','pregnancy','covering') THEN
    RAISE EXCEPTION 'product_type inválido';
  END IF;
  IF v_sale_type NOT IN ('direct','auction') THEN RAISE EXCEPTION 'sale_type inválido'; END IF;
  IF v_commission_mode NOT IN ('payable','receivable','net') THEN RAISE EXCEPTION 'commission_mode inválido'; END IF;
  IF v_commission < 0 THEN RAISE EXCEPTION 'Comissão negativa'; END IF;
  IF v_total <= 0 THEN RAISE EXCEPTION 'Total inválido'; END IF;
  IF v_down > v_total THEN RAISE EXCEPTION 'Entrada > total'; END IF;

  IF v_buyer IS NULL AND _buyer_new IS NOT NULL AND jsonb_typeof(_buyer_new) = 'object' AND COALESCE(_buyer_new->>'name','') <> '' THEN
    INSERT INTO public.haras_clients (business_unit_id, name, email, phone, created_by)
    VALUES (v_bu, _buyer_new->>'name', NULLIF(_buyer_new->>'email',''), NULLIF(_buyer_new->>'phone',''), auth.uid())
    RETURNING id INTO v_buyer;
  END IF;
  IF v_buyer IS NULL THEN RAISE EXCEPTION 'Comprador obrigatório'; END IF;

  IF v_product_type = 'whole' THEN
    IF v_animal IS NULL THEN RAISE EXCEPTION 'Animal obrigatório para venda inteira'; END IF;
    v_anchor_animal := v_animal;
  ELSIF v_product_type = 'share' THEN
    IF v_animal IS NULL THEN RAISE EXCEPTION 'Animal obrigatório para venda de cota'; END IF;
    IF v_share_pct IS NULL OR v_share_pct <= 0 OR v_share_pct > 100 THEN
      RAISE EXCEPTION 'Percentual da cota inválido';
    END IF;
    v_anchor_animal := v_animal;
  ELSIF v_product_type = 'embryo' THEN
    IF v_donor IS NULL THEN RAISE EXCEPTION 'Doadora obrigatória para venda de embrião'; END IF;
    v_anchor_animal := COALESCE(v_animal, v_donor);
    v_animal := v_anchor_animal;
  ELSIF v_product_type = 'pregnancy' THEN
    IF v_animal IS NULL THEN RAISE EXCEPTION 'Matriz obrigatória para venda de ventre'; END IF;
    IF v_sire IS NULL THEN RAISE EXCEPTION 'Garanhão (pai) obrigatório para venda de ventre'; END IF;
    v_anchor_animal := v_animal;
  ELSIF v_product_type = 'covering' THEN
    IF v_sire IS NULL THEN RAISE EXCEPTION 'Garanhão obrigatório para venda de cobertura'; END IF;
    v_anchor_animal := COALESCE(v_animal, v_sire);
    v_animal := v_anchor_animal;
  END IF;

  SELECT business_unit_id INTO v_animal_bu FROM public.haras_animals WHERE id = v_anchor_animal;
  IF v_animal_bu IS NULL THEN RAISE EXCEPTION 'Animal âncora não encontrado'; END IF;
  IF v_animal_bu <> v_bu THEN RAISE EXCEPTION 'Animal em outra unidade'; END IF;

  v_down_date := COALESCE(NULLIF(_payload->>'down_payment_date','')::date, v_sale_date);
  IF v_down > 0 AND v_down_date < v_sale_date THEN RAISE EXCEPTION 'Data entrada anterior à venda'; END IF;

  v_remain := v_total - v_down;
  v_has_installments := _installments IS NOT NULL AND jsonb_typeof(_installments) = 'array' AND jsonb_array_length(_installments) > 0;

  -- Se restar saldo, parcelas são obrigatórias
  IF v_remain > 0 AND NOT v_has_installments THEN
    RAISE EXCEPTION 'Lista de parcelas vazia';
  END IF;

  -- Se veio parcelas, validar
  IF v_has_installments THEN
    SELECT count(*), COALESCE(sum((x->>'amount')::numeric),0)
      INTO v_inst_count, v_sum_check
      FROM jsonb_array_elements(_installments) x;

    IF round(v_sum_check * 100) <> round(v_remain * 100) THEN
      RAISE EXCEPTION 'Soma das parcelas (%) difere do saldo a parcelar (%)', v_sum_check, v_remain;
    END IF;

    FOR r IN SELECT * FROM jsonb_array_elements(_installments) LOOP
      IF (r->>'amount')::numeric <= 0 THEN RAISE EXCEPTION 'Parcela com valor inválido'; END IF;
      IF (r->>'due_date')::date < v_sale_date THEN RAISE EXCEPTION 'Vencimento anterior à venda'; END IF;
    END LOOP;

    SELECT MIN((x->>'due_date')::date) INTO v_first_due FROM jsonb_array_elements(_installments) x;
  ELSE
    -- Cash: sem parcelas, primeira "data" é a da entrada
    v_first_due := v_down_date;
  END IF;

  INSERT INTO public.animal_sales (
    business_unit_id, animal_id, buyer_client_id, auction_lot_id, sale_date,
    total_amount, down_payment, down_payment_date, installments_count, first_due_date,
    payment_method, status, paid_account_category_id, notes, created_by, commission, sale_type,
    product_type, share_pct, sire_animal_id, donor_animal_id, recipient_animal_id,
    covering_mare_note, crop_year, commission_mode
  )
  VALUES (
    v_bu, v_animal, v_buyer, v_lot, v_sale_date,
    v_total, v_down,
    CASE WHEN v_down > 0 THEN v_down_date ELSE NULL END,
    v_inst_count, v_first_due,
    v_method, 'active', v_pay_cat, v_notes, auth.uid(), v_commission, v_sale_type,
    v_product_type, v_share_pct, v_sire, v_donor, v_recipient,
    v_covering_note, v_crop_year, v_commission_mode
  )
  RETURNING id INTO v_sale_id;

  IF v_lot IS NOT NULL THEN
    UPDATE public.auction_lot_animals
      SET sale_id = v_sale_id, hammer_price = COALESCE(hammer_price, v_total)
      WHERE auction_lot_id = v_lot AND animal_id = v_animal AND sale_id IS NULL;
  END IF;

  IF v_down > 0 THEN
    INSERT INTO public.receivables (business_unit_id, haras_client_id, description, amount, due_date, status, created_by)
    VALUES (v_bu, v_buyer, 'Venda animal (entrada) - sale:'||v_sale_id, v_down, v_down_date, 'pending', auth.uid())
    RETURNING id INTO v_recv_id;
    INSERT INTO public.sale_installments (sale_id, installment_number, due_date, amount, receivable_id)
    VALUES (v_sale_id, 0, v_down_date, v_down, v_recv_id);
    IF v_pay_cat IS NOT NULL THEN
      PERFORM public.mark_receivable_paid(v_recv_id, v_down_date, v_pay_cat);
    END IF;
  END IF;

  IF v_has_installments THEN
    FOR r IN SELECT * FROM jsonb_array_elements(_installments) LOOP
      INSERT INTO public.receivables (business_unit_id, haras_client_id, description, amount, due_date, status, created_by)
      VALUES (v_bu, v_buyer,
              'Venda animal parcela '||(r->>'installment_number')||'/'||v_inst_count||' - sale:'||v_sale_id,
              (r->>'amount')::numeric, (r->>'due_date')::date, 'pending', auth.uid())
      RETURNING id INTO v_recv_id;
      INSERT INTO public.sale_installments (sale_id, installment_number, due_date, amount, receivable_id)
      VALUES (v_sale_id, (r->>'installment_number')::int, (r->>'due_date')::date, (r->>'amount')::numeric, v_recv_id);
    END LOOP;
  END IF;

  RETURN v_sale_id;
END $function$
;

CREATE OR REPLACE FUNCTION public.create_bank_adjustment(_bank_account_id uuid, _amount numeric, _direction text, _reason text, _date date DEFAULT CURRENT_DATE)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user UUID := auth.uid();
  v_tx_id UUID;
  v_unit_id UUID;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF _amount IS NULL OR _amount <= 0 THEN RAISE EXCEPTION 'amount must be > 0'; END IF;
  IF _direction NOT IN ('in','out') THEN RAISE EXCEPTION 'direction must be in or out'; END IF;
  IF _reason IS NULL OR length(trim(_reason)) < 10 THEN RAISE EXCEPTION 'reason required (min 10 chars)'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.bank_accounts b WHERE b.id = _bank_account_id) THEN
    RAISE EXCEPTION 'bank account not found';
  END IF;

  SELECT bu.business_unit_id INTO v_unit_id
    FROM public.bank_account_units bu WHERE bu.bank_account_id = _bank_account_id LIMIT 1;
  IF v_unit_id IS NULL THEN
    SELECT uua.business_unit_id INTO v_unit_id
      FROM public.user_unit_access uua WHERE uua.user_id = v_user LIMIT 1;
  END IF;
  IF v_unit_id IS NULL THEN RAISE EXCEPTION 'no unit resolvable for this adjustment'; END IF;

  IF NOT public.has_permission(v_user, 'cash_flow'::app_module, 'edit'::permission_action) THEN
    RAISE EXCEPTION 'Sem permissão para movimentar caixa';
  END IF;
  IF NOT public.can_access_unit(v_user, v_unit_id) THEN
    RAISE EXCEPTION 'Sem acesso à unidade da conta';
  END IF;

  INSERT INTO public.transactions (
    business_unit_id, type, amount, description, date,
    bank_account_id, is_adjustment, adjustment_reason, created_by, status
  ) VALUES (
    v_unit_id,
    CASE WHEN _direction = 'in' THEN 'income' ELSE 'expense' END,
    _amount, 'Ajuste de saldo: ' || _reason, _date,
    _bank_account_id, true, _reason, v_user, 'completed'
  ) RETURNING id INTO v_tx_id;

  RETURN v_tx_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_bank_contract(_payload jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN public._create_bank_contract_impl(_payload, NULL);
END $function$
;

CREATE OR REPLACE FUNCTION public.create_bank_transfer(_from_account_id uuid, _to_account_id uuid, _amount numeric, _date date, _description text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_group_id uuid := gen_random_uuid();
  v_user uuid := auth.uid();
  v_from_bu uuid; v_to_bu uuid;
  v_from_name text; v_to_name text;
  v_from_active boolean; v_to_active boolean;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Usuário não autenticado'; END IF;
  IF _from_account_id = _to_account_id THEN RAISE EXCEPTION 'Conta de origem e destino devem ser diferentes'; END IF;
  IF _amount IS NULL OR _amount <= 0 THEN RAISE EXCEPTION 'Valor da transferência deve ser maior que zero'; END IF;
  IF _date IS NULL THEN RAISE EXCEPTION 'Data da transferência é obrigatória'; END IF;

  SELECT name, is_active INTO v_from_name, v_from_active FROM public.bank_accounts WHERE id = _from_account_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Conta de origem não encontrada'; END IF;
  IF NOT v_from_active THEN RAISE EXCEPTION 'Conta de origem inativa'; END IF;

  SELECT name, is_active INTO v_to_name, v_to_active FROM public.bank_accounts WHERE id = _to_account_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Conta de destino não encontrada'; END IF;
  IF NOT v_to_active THEN RAISE EXCEPTION 'Conta de destino inativa'; END IF;

  SELECT business_unit_id INTO v_from_bu FROM public.bank_account_units WHERE bank_account_id = _from_account_id LIMIT 1;
  SELECT business_unit_id INTO v_to_bu   FROM public.bank_account_units WHERE bank_account_id = _to_account_id   LIMIT 1;
  IF v_from_bu IS NULL THEN v_from_bu := v_to_bu; END IF;
  IF v_to_bu   IS NULL THEN v_to_bu   := v_from_bu; END IF;
  IF v_from_bu IS NULL THEN RAISE EXCEPTION 'Nenhuma unidade vinculada às contas envolvidas'; END IF;

  IF NOT public.has_permission(v_user, 'cash_flow'::app_module, 'edit'::permission_action) THEN
    RAISE EXCEPTION 'Sem permissão para movimentar caixa';
  END IF;
  IF NOT public.can_access_unit(v_user, v_from_bu) THEN
    RAISE EXCEPTION 'Sem acesso à unidade da conta de origem';
  END IF;
  IF NOT public.can_access_unit(v_user, v_to_bu) THEN
    RAISE EXCEPTION 'Sem acesso à unidade da conta de destino';
  END IF;

  INSERT INTO public.transactions (
    business_unit_id, type, amount, date, description,
    bank_account_id, is_transfer, transfer_group_id, transfer_counterpart_account_id, created_by
  ) VALUES (
    v_from_bu, 'expense'::transaction_type, _amount, _date,
    COALESCE(_description, 'Transferência para ' || v_to_name),
    _from_account_id, true, v_group_id, _to_account_id, v_user
  );

  INSERT INTO public.transactions (
    business_unit_id, type, amount, date, description,
    bank_account_id, is_transfer, transfer_group_id, transfer_counterpart_account_id, created_by
  ) VALUES (
    v_to_bu, 'income'::transaction_type, _amount, _date,
    COALESCE(_description, 'Transferência de ' || v_from_name),
    _to_account_id, true, v_group_id, _from_account_id, v_user
  );

  RETURN v_group_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_recurring_payable(_payload jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_bu uuid := (_payload->>'business_unit_id')::uuid;
  v_supplier uuid := NULLIF(_payload->>'supplier_id','')::uuid;
  v_cat uuid := NULLIF(_payload->>'category_id','')::uuid;
  v_desc text := _payload->>'description';
  v_amount numeric := (_payload->>'amount')::numeric;
  v_freq text := COALESCE(_payload->>'frequency','monthly');
  v_dom int := (_payload->>'day_of_month')::int;
  v_start date := COALESCE((_payload->>'start_date')::date, CURRENT_DATE);
  v_end date := NULLIF(_payload->>'end_date','')::date;
  v_notes text := _payload->>'notes';
  v_first_due date; v_template_id uuid; v_y int; v_m int;
BEGIN
  IF NOT public.has_permission(auth.uid(),'payables'::app_module,'create'::permission_action) OR NOT public.can_access_unit(auth.uid(), v_bu) THEN
    RAISE EXCEPTION 'Sem permissão' USING ERRCODE='42501'; END IF;
  v_y := EXTRACT(YEAR FROM v_start)::int; v_m := EXTRACT(MONTH FROM v_start)::int;
  v_first_due := make_date(v_y, v_m, LEAST(v_dom,28));
  IF v_first_due < v_start THEN
    IF v_freq='monthly' THEN v_first_due := (v_first_due + INTERVAL '1 month')::date;
    ELSIF v_freq='quarterly' THEN v_first_due := (v_first_due + INTERVAL '3 months')::date;
    ELSE v_first_due := (v_first_due + INTERVAL '1 year')::date; END IF;
    v_y := EXTRACT(YEAR FROM v_first_due)::int; v_m := EXTRACT(MONTH FROM v_first_due)::int;
    v_first_due := make_date(v_y, v_m, LEAST(v_dom,28));
  END IF;
  IF v_end IS NOT NULL AND v_first_due > v_end THEN RAISE EXCEPTION 'Término anterior à primeira parcela'; END IF;
  INSERT INTO public.recurring_payables (business_unit_id, supplier_id, category_id, description, amount, frequency, day_of_month, start_date, end_date, next_run_date, notes, created_by)
  VALUES (v_bu, v_supplier, v_cat, v_desc, v_amount, v_freq, v_dom, v_start, v_end, v_first_due, v_notes, auth.uid())
  RETURNING id INTO v_template_id;
  PERFORM public.generate_recurring_payables(v_bu, 'manual');
  RETURN v_template_id;
END $function$
;

CREATE OR REPLACE FUNCTION public.delete_animal_sale(_sale_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_sale public.animal_sales%ROWTYPE;
BEGIN
  SELECT * INTO v_sale FROM public.animal_sales WHERE id=_sale_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Venda não encontrada'; END IF;
  IF NOT public.has_permission(auth.uid(),'sales'::app_module,'delete'::permission_action) OR NOT public.can_access_unit(auth.uid(), v_sale.business_unit_id) THEN
    RAISE EXCEPTION 'Sem permissão' USING ERRCODE='42501'; END IF;
  UPDATE public.receivables SET description = description || ' [venda excluída]', updated_at=now()
    WHERE id IN (SELECT receivable_id FROM public.sale_installments WHERE sale_id=_sale_id AND status='paid' AND receivable_id IS NOT NULL);
  DELETE FROM public.receivables WHERE id IN (SELECT receivable_id FROM public.sale_installments WHERE sale_id=_sale_id AND status<>'paid' AND receivable_id IS NOT NULL);
  UPDATE public.haras_animals SET status='active', updated_at=now() WHERE id=v_sale.animal_id AND status='sold';
  DELETE FROM public.animal_sales WHERE id=_sale_id;
END $function$
;

CREATE OR REPLACE FUNCTION public.enforce_haras_contract_upload()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'storage'
AS $function$
DECLARE
v_mime text := NEW.metadata->>'mimetype';
v_size bigint := COALESCE((NEW.metadata->>'size')::bigint, 0);
BEGIN
IF NEW.bucket_id <> 'haras-purchase-contracts' THEN
RETURN NEW;
END IF;
IF v_mime NOT IN ('application/pdf','image/png','image/jpeg','image/webp') THEN
RAISE EXCEPTION 'invalid_mime_type' USING ERRCODE = '22023';
END IF;
IF v_size > 10485760 THEN
RAISE EXCEPTION 'file_too_large' USING ERRCODE = '22023';
END IF;
RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.enforce_period_close()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE v_bu uuid; v_closed timestamptz; v_bypass text;
BEGIN
  v_bypass := current_setting('haras.bypass_close_lock', true);
  IF v_bypass = 'on' THEN RETURN COALESCE(NEW, OLD); END IF;
  v_bu := COALESCE(OLD.business_unit_id, NEW.business_unit_id);
  v_closed := OLD.closed_at;
  IF NOT public.is_feature_enabled(v_bu, 'closing_lock_enabled') THEN RETURN COALESCE(NEW, OLD); END IF;
  IF v_closed IS NULL THEN RETURN COALESCE(NEW, OLD); END IF;
  RAISE EXCEPTION 'Registro fechado em % não pode ser alterado nem excluído. Reabra o período antes.', v_closed USING ERRCODE = 'P0001';
END; $function$
;

CREATE OR REPLACE FUNCTION public.fanout_sale_installment_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_installment public.sale_installments%ROWTYPE;
  v_sale public.animal_sales%ROWTYPE;
  v_animal_name text;
  v_buyer_name text;
  v_flag_on boolean;
  v_type public.notification_type;
  v_title text;
  v_body text;
  v_link text;
  v_user_id uuid;
BEGIN
  -- 1) Mapeia kind → enum
  v_type := CASE NEW.kind
    WHEN 'due_soon' THEN 'sale_installment_due_soon'::public.notification_type
    WHEN 'overdue' THEN 'sale_installment_overdue'::public.notification_type
    ELSE NULL
  END;
  IF v_type IS NULL THEN
    RETURN NEW;
  END IF;

  -- 2) Busca parcela + venda
  SELECT * INTO v_installment FROM public.sale_installments WHERE id = NEW.installment_id;
  IF NOT FOUND THEN RETURN NEW; END IF;
  SELECT * INTO v_sale FROM public.animal_sales WHERE id = v_installment.sale_id;
  IF NOT FOUND THEN RETURN NEW; END IF;

  -- 3) Checa feature flag da BU
  SELECT enabled INTO v_flag_on
  FROM public.haras_feature_flags
  WHERE business_unit_id = v_sale.business_unit_id
    AND flag_name = 'sale_notifications_inapp_enabled'
  LIMIT 1;
  IF v_flag_on IS NOT TRUE THEN
    RETURN NEW;
  END IF;

  -- 4) Enriquecimento (nomes)
  SELECT name INTO v_animal_name FROM public.haras_animals WHERE id = v_sale.animal_id;
  SELECT name INTO v_buyer_name FROM public.haras_clients WHERE id = v_sale.buyer_client_id;

  v_link := '/haras/vendas/' || v_sale.id::text;
  v_title := CASE v_type
    WHEN 'sale_installment_due_soon'::public.notification_type
      THEN 'Parcela ' || v_installment.installment_number || ' vence em ' || to_char(v_installment.due_date, 'DD/MM')
    ELSE 'Parcela ' || v_installment.installment_number || ' venceu em ' || to_char(v_installment.due_date, 'DD/MM')
  END;
  v_body := COALESCE(v_animal_name, 'Venda') ||
            COALESCE(' — ' || v_buyer_name, '') ||
            ' • R$ ' || to_char(v_installment.amount, 'FM999G999G990D00');

  -- 5) Fanout para usuários com acesso à BU
  BEGIN
    FOR v_user_id IN
      SELECT user_id FROM public.user_unit_access
      WHERE business_unit_id = v_sale.business_unit_id
    LOOP
      INSERT INTO public.notifications(
        user_id, business_unit_id, type, title, body, link,
        entity_table, entity_id
      ) VALUES (
        v_user_id, v_sale.business_unit_id, v_type, v_title, v_body, v_link,
        'sale_installments', v_installment.id
      )
      ON CONFLICT (user_id, type, entity_table, entity_id) WHERE read_at IS NULL DO NOTHING;
    END LOOP;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'fanout_sale_installment_notification failed: %', SQLERRM;
  END;

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_loan_installments()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE i INTEGER; installment_amount NUMERIC(14,2); rate NUMERIC(10,8);
BEGIN
  rate := NEW.monthly_rate;
  IF rate = 0 THEN
    installment_amount := ROUND(NEW.principal / NEW.term_months, 2);
  ELSE
    installment_amount := ROUND(
      NEW.principal * (rate * POWER(1 + rate, NEW.term_months))
      / (POWER(1 + rate, NEW.term_months) - 1), 2);
  END IF;
  FOR i IN 1..NEW.term_months LOOP
    INSERT INTO public.loan_installments (loan_id, installment_number, due_date, amount)
    VALUES (NEW.id, i, NEW.start_date + (i || ' months')::INTERVAL, installment_amount);
  END LOOP;
  RETURN NEW;
END; $function$
;

CREATE OR REPLACE FUNCTION public.generate_monthly_payroll(_unit_id uuid, _period date, _due_date date, _category_id uuid, _employee_ids uuid[] DEFAULT NULL::uuid[])
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_period date := date_trunc('month', _period)::date;
  v_batch_id uuid := gen_random_uuid();
  v_created int := 0;
  v_skipped int := 0;
  v_errors jsonb := '[]'::jsonb;
  v_emp record;
  v_uid uuid := auth.uid();
  v_cat_payroll boolean;
  v_net numeric;
  v_items jsonb;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Não autenticado' USING ERRCODE='42501'; END IF;
  IF _unit_id IS NULL THEN RAISE EXCEPTION 'Unidade obrigatória'; END IF;
  IF _due_date IS NULL THEN RAISE EXCEPTION 'Vencimento obrigatório'; END IF;
  IF _category_id IS NULL THEN RAISE EXCEPTION 'Categoria obrigatória'; END IF;
  IF NOT public.can_access_unit(v_uid, _unit_id) THEN RAISE EXCEPTION 'Sem permissão' USING ERRCODE='42501'; END IF;
  IF NOT public.has_permission(v_uid, 'payables'::app_module, 'create'::permission_action) THEN
    RAISE EXCEPTION 'Sem permissão' USING ERRCODE='42501';
  END IF;

  SELECT COALESCE(is_payroll,false) INTO v_cat_payroll FROM public.categories WHERE id = _category_id;
  IF NOT v_cat_payroll THEN RAISE EXCEPTION 'Categoria não é de folha de pagamento'; END IF;

  FOR v_emp IN
    SELECT e.*
    FROM public.employees e
    WHERE e.business_unit_id = _unit_id AND e.is_active = true
      AND (_employee_ids IS NULL OR e.id = ANY(_employee_ids))
  LOOP
    BEGIN
      v_items := '[]'::jsonb;
      IF COALESCE(v_emp.default_base_salary,0) > 0 THEN
        v_items := v_items || jsonb_build_object('id', gen_random_uuid()::text, 'label','Salário base','amount', v_emp.default_base_salary, 'kind','credit');
      END IF;
      IF COALESCE(v_emp.default_transport,0) > 0 THEN
        v_items := v_items || jsonb_build_object('id', gen_random_uuid()::text, 'label','Transporte','amount', v_emp.default_transport, 'kind','credit');
      END IF;
      IF COALESCE(v_emp.default_meal,0) > 0 THEN
        v_items := v_items || jsonb_build_object('id', gen_random_uuid()::text, 'label','Refeição','amount', v_emp.default_meal, 'kind','credit');
      END IF;
      IF COALESCE(v_emp.default_inss,0) > 0 THEN
        v_items := v_items || jsonb_build_object('id', gen_random_uuid()::text, 'label','INSS','amount', v_emp.default_inss, 'kind','debit');
      END IF;
      IF COALESCE(v_emp.default_fgts,0) > 0 THEN
        v_items := v_items || jsonb_build_object('id', gen_random_uuid()::text, 'label','FGTS','amount', v_emp.default_fgts, 'kind','debit');
      END IF;
      IF COALESCE(v_emp.default_other,0) > 0 THEN
        v_items := v_items || jsonb_build_object('id', gen_random_uuid()::text, 'label','Outros descontos','amount', v_emp.default_other, 'kind','debit');
      END IF;

      IF jsonb_array_length(v_items) = 0 THEN
        v_errors := v_errors || jsonb_build_object('employee_id', v_emp.id, 'name', v_emp.full_name, 'error','Sem valores padrão cadastrados');
        CONTINUE;
      END IF;

      v_net := GREATEST(
        COALESCE(v_emp.default_base_salary,0) + COALESCE(v_emp.default_transport,0) + COALESCE(v_emp.default_meal,0)
        - COALESCE(v_emp.default_inss,0) - COALESCE(v_emp.default_fgts,0) - COALESCE(v_emp.default_other,0), 0);
      IF v_net <= 0 THEN
        v_errors := v_errors || jsonb_build_object('employee_id', v_emp.id, 'name', v_emp.full_name, 'error','Líquido zero ou negativo');
        CONTINUE;
      END IF;

      INSERT INTO public.payables (
        business_unit_id, category_id, employee_id, description, amount,
        due_date, status, created_by, payroll_period, payroll_batch_id, payroll_breakdown
      )
      VALUES (
        _unit_id, _category_id, v_emp.id,
        'Folha ' || to_char(v_period, 'MM/YYYY') || ' - ' || v_emp.full_name,
        v_net, _due_date, 'pending', v_uid, v_period, v_batch_id,
        jsonb_build_object('items', v_items, 'total', v_net, 'notes','')
      );
      v_created := v_created + 1;
    EXCEPTION
      WHEN unique_violation THEN v_skipped := v_skipped + 1;
      WHEN OTHERS THEN
        v_errors := v_errors || jsonb_build_object('employee_id', v_emp.id, 'name', v_emp.full_name, 'error', SQLERRM);
    END;
  END LOOP;

  INSERT INTO public.audit_log (user_id, action, entity, entity_id, business_unit_id, payload)
  VALUES (v_uid, 'payroll.batch_generate', 'payables', v_batch_id, _unit_id,
    jsonb_build_object('period', v_period, 'due_date', _due_date, 'category_id', _category_id,
      'created', v_created, 'skipped', v_skipped, 'errors', v_errors));

  RETURN jsonb_build_object('batch_id', v_batch_id, 'period', v_period,
    'created', v_created, 'skipped', v_skipped, 'errors', v_errors);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_recurring_payables(_unit_id uuid DEFAULT NULL::uuid, _source text DEFAULT 'manual'::text)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE r RECORD; v_count int := 0; v_inserted int; v_next date; v_y int; v_m int;
BEGIN
  FOR r IN SELECT * FROM public.recurring_payables
    WHERE is_active AND next_run_date <= CURRENT_DATE AND start_date <= CURRENT_DATE
      AND (end_date IS NULL OR next_run_date <= end_date) AND amount > 0
      AND (_unit_id IS NULL OR business_unit_id = _unit_id)
      AND (_source = 'cron' OR can_access_unit(auth.uid(), business_unit_id))
  LOOP
    INSERT INTO public.payables (business_unit_id, supplier_id, category_id, description, amount, due_date, status, created_by, recurring_payable_id, notes)
    VALUES (r.business_unit_id, r.supplier_id, r.category_id, r.description, r.amount, r.next_run_date, 'pending', r.created_by, r.id, r.notes)
    ON CONFLICT (recurring_payable_id, due_date) DO NOTHING;
    GET DIAGNOSTICS v_inserted = ROW_COUNT;
    IF r.frequency='monthly' THEN v_next := r.next_run_date + INTERVAL '1 month';
    ELSIF r.frequency='quarterly' THEN v_next := r.next_run_date + INTERVAL '3 months';
    ELSE v_next := r.next_run_date + INTERVAL '1 year'; END IF;
    v_y := EXTRACT(YEAR FROM v_next)::int; v_m := EXTRACT(MONTH FROM v_next)::int;
    v_next := make_date(v_y, v_m, LEAST(r.day_of_month, 28));
    IF r.end_date IS NOT NULL AND v_next > r.end_date THEN
      UPDATE public.recurring_payables SET is_active=false, next_run_date=v_next, updated_at=now() WHERE id=r.id;
    ELSE UPDATE public.recurring_payables SET next_run_date=v_next, updated_at=now() WHERE id=r.id; END IF;
    v_count := v_count + v_inserted;
  END LOOP;
  RETURN v_count;
END $function$
;

CREATE OR REPLACE FUNCTION public.generate_recurring_receivables(_unit_id uuid DEFAULT NULL::uuid, _source text DEFAULT 'manual'::text)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE r RECORD; v_count int := 0; v_next date; v_y int; v_m int; v_recv_id uuid;
BEGIN
  FOR r IN SELECT * FROM public.haras_recurring_invoices
    WHERE is_active AND next_run_date <= CURRENT_DATE AND start_date <= CURRENT_DATE
      AND (end_date IS NULL OR next_run_date <= end_date) AND total_amount > 0
      AND (_unit_id IS NULL OR business_unit_id = _unit_id)
      AND (_source = 'cron' OR can_access_unit(auth.uid(), business_unit_id))
  LOOP
    INSERT INTO public.receivables (business_unit_id, client_id, description, amount, due_date, status, created_by, recurring_invoice_id)
    VALUES (r.business_unit_id, r.client_id, r.description, r.total_amount, r.next_run_date, 'pending', r.created_by, r.id)
    RETURNING id INTO v_recv_id;
    INSERT INTO public.haras_recurring_runs (invoice_id, ran_at, receivable_id, status, source, generated_count, business_unit_id, created_by)
    VALUES (r.id, now(), v_recv_id, 'success', _source, 1, r.business_unit_id, r.created_by);

    IF r.frequency='monthly' THEN v_next := r.next_run_date + INTERVAL '1 month';
    ELSIF r.frequency='quarterly' THEN v_next := r.next_run_date + INTERVAL '3 months';
    ELSE v_next := r.next_run_date + INTERVAL '1 year'; END IF;
    v_y := EXTRACT(YEAR FROM v_next)::int; v_m := EXTRACT(MONTH FROM v_next)::int;
    v_next := make_date(v_y, v_m, LEAST(r.day_of_month, 28));

    IF r.end_date IS NOT NULL AND v_next > r.end_date THEN
      UPDATE public.haras_recurring_invoices SET is_active=false, next_run_date=v_next, updated_at=now() WHERE id=r.id;
    ELSE
      UPDATE public.haras_recurring_invoices SET next_run_date=v_next, updated_at=now() WHERE id=r.id;
    END IF;
    v_count := v_count + 1;
  END LOOP;
  RETURN v_count;
END $function$
;

CREATE OR REPLACE FUNCTION public.get_bank_account_balance(_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_row public.bank_account_balances%ROWTYPE;
BEGIN
  IF NOT public.can_view_bank_account(auth.uid(), _id) THEN RAISE EXCEPTION 'Sem permissão' USING ERRCODE='42501'; END IF;
  SELECT * INTO v_row FROM public.bank_account_balances WHERE bank_account_id = _id;
  RETURN jsonb_build_object(
    'realized', COALESCE(v_row.realized_balance, 0),
    'total_income', COALESCE(v_row.total_income, 0),
    'total_expense', COALESCE(v_row.total_expense, 0),
    'last_movement_date', v_row.last_movement_date,
    'movements_count', COALESCE(v_row.movements_count, 0)
  );
END $function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE is_first_user BOOLEAN;
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email)
  ON CONFLICT (id) DO NOTHING;

  SELECT NOT EXISTS (SELECT 1 FROM public.user_roles) INTO is_first_user;
  IF is_first_user THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'member') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END; $function$
;

CREATE OR REPLACE FUNCTION public.haras_cancel_purchase(_id uuid, _reason text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_p RECORD; v_bu uuid;
BEGIN
IF auth.uid() IS NULL THEN RAISE EXCEPTION 'unauthenticated'; END IF;
SELECT * INTO v_p FROM public.haras_purchases WHERE id = _id FOR UPDATE;
IF v_p IS NULL THEN RAISE EXCEPTION 'purchase_not_found'; END IF;
v_bu := v_p.business_unit_id;
IF NOT public.can_access_unit(auth.uid(), v_bu) THEN RAISE EXCEPTION 'forbidden_unit'; END IF;
IF NOT public.has_permission(auth.uid(),'haras_purchases'::app_module,'edit'::permission_action)
THEN RAISE EXCEPTION 'forbidden_action'; END IF;
IF NOT public.is_feature_enabled(v_bu,'haras_purchases')
THEN RAISE EXCEPTION 'feature_disabled'; END IF;
IF v_p.purchase_status = 'cancelled' THEN RETURN _id; END IF;
IF EXISTS (SELECT 1 FROM public.haras_purchase_installments
WHERE purchase_id = _id AND status = 'paid')
OR EXISTS (SELECT 1 FROM public.haras_purchase_commission_installments hpci
JOIN public.haras_purchase_commissions hpc ON hpc.id = hpci.commission_id
WHERE hpc.purchase_id = _id AND hpci.status = 'paid') THEN
RAISE EXCEPTION 'purchase_has_paid_installments';
END IF;
IF EXISTS (
SELECT 1 FROM public.payables p
WHERE p.status <> 'open'
AND (p.id IN (SELECT payable_id FROM public.haras_purchase_installments
WHERE purchase_id = _id AND payable_id IS NOT NULL)
OR p.id IN (SELECT hpci.payable_id FROM public.haras_purchase_commission_installments hpci
JOIN public.haras_purchase_commissions hpc ON hpc.id = hpci.commission_id
WHERE hpc.purchase_id = _id AND hpci.payable_id IS NOT NULL))
) THEN
RAISE EXCEPTION 'purchase_has_paid_payables';
END IF;
DELETE FROM public.payables
WHERE id IN (SELECT payable_id FROM public.haras_purchase_installments
WHERE purchase_id = _id AND payable_id IS NOT NULL);
DELETE FROM public.haras_purchase_installments WHERE purchase_id = _id;
DELETE FROM public.payables
WHERE id IN (SELECT hpci.payable_id FROM public.haras_purchase_commission_installments hpci
JOIN public.haras_purchase_commissions hpc ON hpc.id = hpci.commission_id
WHERE hpc.purchase_id = _id AND hpci.payable_id IS NOT NULL);
DELETE FROM public.haras_purchase_commission_installments hpci
USING public.haras_purchase_commissions hpc
WHERE hpci.commission_id = hpc.id AND hpc.purchase_id = _id;
DELETE FROM public.haras_purchase_commissions WHERE purchase_id = _id;
UPDATE public.haras_purchases
SET purchase_status = 'cancelled',
cancelled_at = now(),
cancelled_by = auth.uid(),
cancellation_reason = NULLIF(trim(coalesce(_reason,'')),''),
updated_at = now()
WHERE id = _id;
RETURN _id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.haras_create_purchase(_payload jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
v_bu uuid := (_payload->>'business_unit_id')::uuid;
v_ptype text := _payload->>'purchase_type';
v_pcond text := _payload->>'payment_condition';
v_total numeric := (_payload->>'total_amount')::numeric;
v_n int := COALESCE((_payload->>'installment_count')::int, 1);
v_first_due date := NULLIF(_payload->>'first_due_date','')::date;
v_has_down boolean := COALESCE((_payload->>'has_down_payment')::boolean, false);
v_down_amt numeric := NULLIF(_payload->>'down_payment_amount','')::numeric;
v_down_dt  date    := NULLIF(_payload->>'down_payment_date','')::date;
v_has_comm boolean := COALESCE((_payload->>'has_commission')::boolean, false);
v_client_req uuid := NULLIF(_payload->>'client_request_id','')::uuid;
v_animal_id uuid := NULLIF(_payload->>'animal_id','')::uuid;
v_part_pct numeric := NULLIF(_payload->>'participation_percentage','')::numeric;
v_animal_bu uuid;
v_cat_name text;
v_cat_id uuid;
v_purchase_id uuid;
v_commission_id uuid;
v_base numeric; v_each numeric; v_last numeric;
v_i int; v_amt numeric; v_due date;
v_comm_n int; v_comm_first date; v_comm_total numeric;
BEGIN
IF auth.uid() IS NULL THEN RAISE EXCEPTION 'unauthenticated'; END IF;
IF v_bu IS NULL THEN RAISE EXCEPTION 'business_unit_id required'; END IF;
IF NOT public.can_access_unit(auth.uid(), v_bu) THEN RAISE EXCEPTION 'forbidden_unit'; END IF;
IF NOT public.has_permission(auth.uid(),'haras_purchases'::app_module,'create'::permission_action)
THEN RAISE EXCEPTION 'forbidden_action'; END IF;
IF NOT public.is_feature_enabled(v_bu,'haras_purchases')
THEN RAISE EXCEPTION 'feature_disabled'; END IF;
PERFORM set_config('statement_timeout','10s', true);
IF v_client_req IS NOT NULL THEN
SELECT id INTO v_purchase_id
FROM public.haras_purchases
WHERE business_unit_id = v_bu AND client_request_id = v_client_req
LIMIT 1;
IF v_purchase_id IS NOT NULL THEN
RETURN v_purchase_id;
END IF;
END IF;
IF v_ptype NOT IN ('animal','coverage','embryo') THEN RAISE EXCEPTION 'invalid purchase_type: %', v_ptype; END IF;
IF v_pcond NOT IN ('a_vista','parcelado') THEN RAISE EXCEPTION 'invalid payment_condition: %', v_pcond; END IF;
IF v_pcond = 'parcelado' AND (v_n < 2 OR v_first_due IS NULL) THEN RAISE EXCEPTION 'parcelado requires installment_count>=2 and first_due_date'; END IF;
IF v_pcond = 'a_vista' THEN v_n := 1; END IF;
IF v_total IS NULL OR v_total <= 0 THEN RAISE EXCEPTION 'total_amount required > 0'; END IF;
IF v_has_down THEN
IF v_pcond <> 'parcelado' THEN RAISE EXCEPTION 'down_payment requires parcelado'; END IF;
IF v_down_amt IS NULL OR v_down_amt <= 0 OR v_down_amt >= v_total OR v_down_dt IS NULL THEN
RAISE EXCEPTION 'invalid down payment';
END IF;
END IF;
IF v_ptype <> 'animal' THEN
v_animal_id := NULL;
v_part_pct := NULL;
ELSE
IF v_animal_id IS NOT NULL THEN
SELECT business_unit_id INTO v_animal_bu FROM public.haras_animals WHERE id = v_animal_id;
IF v_animal_bu IS NULL THEN RAISE EXCEPTION 'animal_not_found'; END IF;
IF v_animal_bu <> v_bu THEN RAISE EXCEPTION 'animal_bu_mismatch'; END IF;
END IF;
IF v_part_pct IS NOT NULL AND (v_part_pct <= 0 OR v_part_pct > 100) THEN
RAISE EXCEPTION 'invalid_participation_percentage';
END IF;
END IF;
v_cat_name := CASE v_ptype
WHEN 'animal'   THEN 'Compra de Animal'
WHEN 'coverage' THEN 'Compra de Cobertura'
WHEN 'embryo'   THEN 'Compra de Embrião'
END;
SELECT id INTO v_cat_id FROM public.categories
WHERE business_unit_id = v_bu AND type = 'expense' AND name = v_cat_name LIMIT 1;
IF v_cat_id IS NULL THEN
RAISE EXCEPTION 'expense category not seeded for BU % name %', v_bu, v_cat_name;
END IF;
INSERT INTO public.haras_purchases (
business_unit_id, purchase_type, purchase_date, seller_name, contract_url,
supplier_id, total_amount, payment_condition, installment_count, first_due_date,
has_down_payment, down_payment_amount, down_payment_date,
has_commission, purchase_status, notes, created_by, expense_category_id,
client_request_id, animal_id, participation_percentage
) VALUES (
v_bu, v_ptype,
COALESCE(NULLIF(_payload->>'purchase_date','')::date, CURRENT_DATE),
NULLIF(_payload->>'seller_name',''),
NULLIF(_payload->>'contract_url',''),
NULLIF(_payload->>'supplier_id','')::uuid,
v_total, v_pcond, v_n, v_first_due,
v_has_down, v_down_amt, v_down_dt,
v_has_comm, 'pendente', NULLIF(_payload->>'notes',''),
auth.uid(), v_cat_id,
v_client_req, v_animal_id, v_part_pct
) RETURNING id INTO v_purchase_id;
v_base := CASE WHEN v_has_down THEN v_total - v_down_amt ELSE v_total END;
v_each := round(v_base / v_n, 2);
v_last := v_base - (v_each * (v_n - 1));
FOR v_i IN 1..v_n LOOP
v_amt := CASE WHEN v_i = v_n THEN v_last ELSE v_each END;
v_due := CASE WHEN v_pcond='a_vista' THEN COALESCE(v_first_due, CURRENT_DATE)
ELSE (v_first_due + ((v_i - 1) || ' month')::interval)::date END;
INSERT INTO public.haras_purchase_installments (
business_unit_id, purchase_id, installment_number, amount, due_date, status, created_by
) VALUES (v_bu, v_purchase_id, v_i, v_amt, v_due, 'pending', auth.uid());
END LOOP;
IF v_has_comm THEN
v_comm_total := (_payload->>'commission_amount')::numeric;
IF v_comm_total IS NULL OR v_comm_total <= 0 THEN RAISE EXCEPTION 'commission_amount required > 0'; END IF;
v_comm_n := COALESCE((_payload->>'commission_installment_count')::int, 1);
v_comm_first := NULLIF(_payload->>'commission_first_due_date','')::date;
SELECT id INTO v_cat_id FROM public.categories
WHERE business_unit_id = v_bu AND type='expense' AND name = 'Comissão sobre Compra' LIMIT 1;
IF v_cat_id IS NULL THEN RAISE EXCEPTION 'commission expense category not seeded'; END IF;
INSERT INTO public.haras_purchase_commissions (
business_unit_id, purchase_id, commission_type, commission_percentage, commission_amount,
recipient_name, payment_condition, installment_count, first_due_date,
auto_create_bills, purchase_status, notes, created_by, expense_category_id
) VALUES (
v_bu, v_purchase_id,
COALESCE(_payload->>'commission_type','fixed'),
NULLIF(_payload->>'commission_percentage','')::numeric,
v_comm_total,
NULLIF(_payload->>'recipient_name',''),
COALESCE(_payload->>'commission_payment_condition','a_vista'),
v_comm_n, v_comm_first, false, 'pendente',
NULLIF(_payload->>'commission_notes',''), auth.uid(), v_cat_id
) RETURNING id INTO v_commission_id;
v_each := round(v_comm_total / v_comm_n, 2);
v_last := v_comm_total - (v_each * (v_comm_n - 1));
FOR v_i IN 1..v_comm_n LOOP
v_amt := CASE WHEN v_i = v_comm_n THEN v_last ELSE v_each END;
v_due := (COALESCE(v_comm_first, v_first_due, CURRENT_DATE) + ((v_i - 1) || ' month')::interval)::date;
INSERT INTO public.haras_purchase_commission_installments (
business_unit_id, commission_id, installment_number, amount, due_date, status, created_by
) VALUES (v_bu, v_commission_id, v_i, v_amt, v_due, 'pending', auth.uid());
END LOOP;
END IF;
RETURN v_purchase_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.haras_embryo_transfers_validate()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  v_embryo_bu uuid;
  v_rec_bu uuid; v_rec_sex public.repro_sex;
BEGIN
  SELECT business_unit_id INTO v_embryo_bu FROM public.haras_embryos WHERE id = NEW.embryo_id;
  IF v_embryo_bu IS NULL THEN RAISE EXCEPTION 'Embrião não encontrado'; END IF;
  IF v_embryo_bu <> NEW.business_unit_id THEN RAISE EXCEPTION 'Transferência pertence a outra unidade que o embrião'; END IF;

  SELECT business_unit_id, sex INTO v_rec_bu, v_rec_sex
    FROM public.haras_animals WHERE id = NEW.recipient_mare_id;
  IF v_rec_bu IS NULL THEN RAISE EXCEPTION 'Receptora não encontrada'; END IF;
  IF v_rec_bu <> NEW.business_unit_id THEN RAISE EXCEPTION 'Receptora pertence a outra unidade'; END IF;
  IF v_rec_sex IN ('macho','castrado') THEN RAISE EXCEPTION 'Receptora deve ser fêmea'; END IF;

  RETURN NEW;
END $function$
;

CREATE OR REPLACE FUNCTION public.haras_embryos_validate()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  v_donor_bu uuid; v_donor_sex public.repro_sex;
  v_sire_bu  uuid; v_sire_sex  public.repro_sex;
BEGIN
  IF NEW.donor_mare_id IS NOT NULL THEN
    SELECT business_unit_id, sex INTO v_donor_bu, v_donor_sex
      FROM public.haras_animals WHERE id = NEW.donor_mare_id;
    IF v_donor_bu IS NULL THEN RAISE EXCEPTION 'Doadora não encontrada'; END IF;
    IF v_donor_bu <> NEW.business_unit_id THEN RAISE EXCEPTION 'Doadora pertence a outra unidade'; END IF;
    IF v_donor_sex IN ('macho','castrado') THEN RAISE EXCEPTION 'Doadora deve ser fêmea'; END IF;
  END IF;

  IF NEW.sire_stallion_id IS NOT NULL THEN
    SELECT business_unit_id, sex INTO v_sire_bu, v_sire_sex
      FROM public.haras_animals WHERE id = NEW.sire_stallion_id;
    IF v_sire_bu IS NULL THEN RAISE EXCEPTION 'Garanhão não encontrado'; END IF;
    IF v_sire_bu <> NEW.business_unit_id THEN RAISE EXCEPTION 'Garanhão pertence a outra unidade'; END IF;
    IF v_sire_sex = 'femea' THEN RAISE EXCEPTION 'Garanhão não pode ser fêmea'; END IF;
  END IF;

  RETURN NEW;
END $function$
;

CREATE OR REPLACE FUNCTION public.haras_fiv_finalize(_batch_id uuid, _blastocysts integer, _stage repro_embryo_stage DEFAULT 'd7'::repro_embryo_stage, _container repro_embryo_container DEFAULT 'palheta'::repro_embryo_container, _produced_at timestamp with time zone DEFAULT now())
 RETURNS uuid[]
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_batch RECORD;
  v_session RECORD;
  v_ids uuid[] := ARRAY[]::uuid[];
  v_new_id uuid;
  v_code text;
  v_existing integer;
  i integer;
BEGIN
  IF _blastocysts IS NULL OR _blastocysts < 0 THEN
    RAISE EXCEPTION 'FIV_INVALID_BLASTOCYSTS' USING ERRCODE = 'check_violation';
  END IF;

  SELECT * INTO v_batch FROM public.haras_fiv_batches WHERE id = _batch_id FOR UPDATE;
  IF v_batch IS NULL THEN
    RAISE EXCEPTION 'FIV_NOT_FOUND' USING ERRCODE = 'no_data_found';
  END IF;

  IF NOT (public.is_admin(auth.uid()) OR public.can_access_unit(auth.uid(), v_batch.business_unit_id)) THEN
    RAISE EXCEPTION 'FIV_FORBIDDEN' USING ERRCODE = 'insufficient_privilege';
  END IF;

  SELECT COUNT(*) INTO v_existing FROM public.haras_embryos WHERE fiv_batch_id = _batch_id;
  IF v_batch.status = 'concluido' AND v_existing > 0 THEN
    RAISE EXCEPTION 'FIV_ALREADY_FINALIZED' USING ERRCODE = 'unique_violation';
  END IF;

  SELECT donor_mare_id INTO v_session FROM public.haras_opu_sessions WHERE id = v_batch.opu_session_id;

  UPDATE public.haras_fiv_batches
    SET blastocysts = _blastocysts,
        status = 'concluido'
    WHERE id = _batch_id;

  IF _blastocysts > 0 THEN
    FOR i IN 1.._blastocysts LOOP
      v_code := 'FIV-' || to_char(_produced_at, 'YYMMDD') || '-' || substr(_batch_id::text, 1, 4) || '-' || i::text;
      INSERT INTO public.haras_embryos(
        business_unit_id, code, donor_mare_id, sire_stallion_id,
        origin, production_date, stage, container, status, fiv_batch_id, created_by
      ) VALUES (
        v_batch.business_unit_id, v_code, v_session.donor_mare_id, v_batch.stallion_id,
        'opu_fiv'::public.repro_embryo_origin, _produced_at::date, _stage, _container,
        'disponivel'::public.repro_embryo_status, _batch_id, auth.uid()
      ) RETURNING id INTO v_new_id;
      v_ids := v_ids || v_new_id;
    END LOOP;
  END IF;

  RETURN v_ids;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.haras_generate_payables_for_purchase(_purchase_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
v_p RECORD; v_i RECORD; v_c RECORD; v_ci RECORD;
v_created int := 0; v_pay_id uuid; v_entrada_cat uuid; v_entrada_marker text;
BEGIN
IF auth.uid() IS NULL THEN RAISE EXCEPTION 'unauthenticated'; END IF;
SELECT * INTO v_p FROM public.haras_purchases WHERE id = _purchase_id;
IF v_p IS NULL THEN RAISE EXCEPTION 'purchase not found'; END IF;
IF NOT public.can_access_unit(auth.uid(), v_p.business_unit_id) THEN RAISE EXCEPTION 'forbidden_unit'; END IF;
IF NOT public.has_permission(auth.uid(),'haras_purchases'::app_module,'create'::permission_action)
THEN RAISE EXCEPTION 'forbidden_action'; END IF;
IF NOT public.is_feature_enabled(v_p.business_unit_id,'haras_purchases')
THEN RAISE EXCEPTION 'feature_disabled'; END IF;
PERFORM set_config('statement_timeout','10s', true);
IF v_p.has_down_payment THEN
v_entrada_marker := '[entrada:' || _purchase_id::text || ']';
IF NOT EXISTS (
SELECT 1 FROM public.payables
WHERE business_unit_id = v_p.business_unit_id AND notes LIKE '%' || v_entrada_marker || '%'
) THEN
SELECT id INTO v_entrada_cat FROM public.categories
WHERE business_unit_id = v_p.business_unit_id AND type='expense' AND name='Entrada de Compra Parcelada' LIMIT 1;
IF v_entrada_cat IS NULL THEN RAISE EXCEPTION 'entrada category not seeded'; END IF;
INSERT INTO public.payables (business_unit_id, supplier_id, category_id,
description, amount, due_date, status, notes, created_by)
VALUES (v_p.business_unit_id, v_p.supplier_id, v_entrada_cat,
format('Entrada compra %s — %s', v_p.purchase_type, COALESCE(v_p.seller_name,'')),
v_p.down_payment_amount, v_p.down_payment_date, 'pending',
v_entrada_marker, auth.uid());
v_created := v_created + 1;
END IF;
END IF;
FOR v_i IN
SELECT * FROM public.haras_purchase_installments
WHERE purchase_id = _purchase_id AND payable_id IS NULL AND status <> 'paid'
ORDER BY installment_number
LOOP
INSERT INTO public.payables (business_unit_id, supplier_id, category_id,
description, amount, due_date, status, created_by)
VALUES (v_p.business_unit_id, v_p.supplier_id, v_p.expense_category_id,
format('Compra %s #%s/%s — %s', v_p.purchase_type, v_i.installment_number, v_p.installment_count, COALESCE(v_p.seller_name,'')),
v_i.amount, v_i.due_date, 'pending', auth.uid())
RETURNING id INTO v_pay_id;
UPDATE public.haras_purchase_installments SET payable_id = v_pay_id WHERE id = v_i.id;
v_created := v_created + 1;
END LOOP;
FOR v_c IN SELECT * FROM public.haras_purchase_commissions WHERE purchase_id = _purchase_id LOOP
FOR v_ci IN
SELECT * FROM public.haras_purchase_commission_installments
WHERE commission_id = v_c.id AND payable_id IS NULL AND status <> 'paid'
ORDER BY installment_number
LOOP
INSERT INTO public.payables (business_unit_id, category_id,
description, amount, due_date, status, created_by)
VALUES (v_c.business_unit_id, v_c.expense_category_id,
format('Comissão compra #%s/%s — %s', v_ci.installment_number, v_c.installment_count, COALESCE(v_c.recipient_name,'')),
v_ci.amount, v_ci.due_date, 'pending', auth.uid())
RETURNING id INTO v_pay_id;
UPDATE public.haras_purchase_commission_installments SET payable_id = v_pay_id WHERE id = v_ci.id;
v_created := v_created + 1;
END LOOP;
END LOOP;
RETURN v_created;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.haras_pay_commission_installment(_installment_id uuid, _bank_account_id uuid, _paid_date date)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
v_i RECORD; v_c RECORD; v_tx_id uuid;
BEGIN
IF auth.uid() IS NULL THEN RAISE EXCEPTION 'unauthenticated'; END IF;
SELECT * INTO v_i FROM public.haras_purchase_commission_installments WHERE id = _installment_id;
IF v_i IS NULL THEN RAISE EXCEPTION 'installment not found'; END IF;
IF v_i.status = 'paid' THEN RAISE EXCEPTION 'installment already paid'; END IF;
SELECT * INTO v_c FROM public.haras_purchase_commissions WHERE id = v_i.commission_id;
IF NOT public.can_access_unit(auth.uid(), v_i.business_unit_id) THEN RAISE EXCEPTION 'forbidden_unit'; END IF;
IF NOT public.has_permission(auth.uid(),'haras_purchases'::app_module,'edit'::permission_action)
THEN RAISE EXCEPTION 'forbidden_action'; END IF;
IF NOT public.is_feature_enabled(v_i.business_unit_id,'haras_purchases')
THEN RAISE EXCEPTION 'feature_disabled'; END IF;
PERFORM set_config('statement_timeout','10s', true);
INSERT INTO public.transactions (business_unit_id, date, description, category_id, type, amount, status, bank_account_id, created_by)
VALUES (v_i.business_unit_id, COALESCE(_paid_date, CURRENT_DATE),
format('Comissão compra #%s/%s — %s', v_i.installment_number, v_c.installment_count, COALESCE(v_c.recipient_name,'')),
v_c.expense_category_id, 'expense', v_i.amount, 'paid', _bank_account_id, auth.uid())
RETURNING id INTO v_tx_id;
UPDATE public.haras_purchase_commission_installments
SET status='paid', paid_date = COALESCE(_paid_date, CURRENT_DATE), transaction_id = v_tx_id
WHERE id = _installment_id;
IF v_i.payable_id IS NOT NULL THEN
UPDATE public.payables
SET status='paid', paid_at = COALESCE(_paid_date, CURRENT_DATE),
transaction_id = v_tx_id, paid_account_category_id = v_c.expense_category_id
WHERE id = v_i.payable_id AND status <> 'paid';
END IF;
PERFORM public.haras_recompute_purchase_status(v_c.purchase_id);
RETURN v_tx_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.haras_pay_purchase_installment(_installment_id uuid, _bank_account_id uuid, _paid_date date)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
v_i RECORD; v_p RECORD; v_tx_id uuid;
BEGIN
IF auth.uid() IS NULL THEN RAISE EXCEPTION 'unauthenticated'; END IF;
SELECT * INTO v_i FROM public.haras_purchase_installments WHERE id = _installment_id;
IF v_i IS NULL THEN RAISE EXCEPTION 'installment not found'; END IF;
IF v_i.status = 'paid' THEN RAISE EXCEPTION 'installment already paid'; END IF;
SELECT * INTO v_p FROM public.haras_purchases WHERE id = v_i.purchase_id;
IF NOT public.can_access_unit(auth.uid(), v_i.business_unit_id) THEN RAISE EXCEPTION 'forbidden_unit'; END IF;
IF NOT public.has_permission(auth.uid(),'haras_purchases'::app_module,'edit'::permission_action)
THEN RAISE EXCEPTION 'forbidden_action'; END IF;
IF NOT public.is_feature_enabled(v_i.business_unit_id,'haras_purchases')
THEN RAISE EXCEPTION 'feature_disabled'; END IF;
PERFORM set_config('statement_timeout','10s', true);
INSERT INTO public.transactions (business_unit_id, date, description, category_id, type, amount, status, bank_account_id, created_by)
VALUES (v_i.business_unit_id, COALESCE(_paid_date, CURRENT_DATE),
format('Compra %s #%s/%s — %s', v_p.purchase_type, v_i.installment_number, v_p.installment_count, COALESCE(v_p.seller_name,'')),
v_p.expense_category_id, 'expense', v_i.amount, 'paid', _bank_account_id, auth.uid())
RETURNING id INTO v_tx_id;
UPDATE public.haras_purchase_installments
SET status='paid', paid_date = COALESCE(_paid_date, CURRENT_DATE), transaction_id = v_tx_id
WHERE id = _installment_id;
IF v_i.payable_id IS NOT NULL THEN
UPDATE public.payables
SET status='paid', paid_at = COALESCE(_paid_date, CURRENT_DATE),
transaction_id = v_tx_id, paid_account_category_id = v_p.expense_category_id
WHERE id = v_i.payable_id AND status <> 'paid';
END IF;
PERFORM public.haras_recompute_purchase_status(v_i.purchase_id);
RETURN v_tx_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.haras_recompute_purchase_status(_purchase_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
v_total int; v_paid int; v_new text;
v_c RECORD;
BEGIN
SELECT count(*), count(*) FILTER (WHERE status = 'paid')
INTO v_total, v_paid
FROM public.haras_purchase_installments WHERE purchase_id = _purchase_id;
IF v_total = 0 THEN
v_new := 'pendente';
ELSIF v_paid = 0 THEN
v_new := 'pendente';
ELSIF v_paid = v_total THEN
v_new := 'pago';
ELSE
v_new := 'parcial';
END IF;
UPDATE public.haras_purchases
SET purchase_status = v_new
WHERE id = _purchase_id AND purchase_status IS DISTINCT FROM v_new;
FOR v_c IN SELECT id FROM public.haras_purchase_commissions WHERE purchase_id = _purchase_id LOOP
SELECT count(*), count(*) FILTER (WHERE status = 'paid')
INTO v_total, v_paid
FROM public.haras_purchase_commission_installments WHERE commission_id = v_c.id;
IF v_total = 0 OR v_paid = 0 THEN v_new := 'pendente';
ELSIF v_paid = v_total THEN v_new := 'pago';
ELSE v_new := 'parcial';
END IF;
UPDATE public.haras_purchase_commissions
SET purchase_status = v_new
WHERE id = v_c.id AND purchase_status IS DISTINCT FROM v_new;
END LOOP;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.haras_reverse_commission_installment(_installment_id uuid, _reason text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
v_i RECORD;
v_c RECORD;
v_p RECORD;
v_tx_original RECORD;
v_tx_reversal_id uuid;
BEGIN
IF auth.uid() IS NULL THEN RAISE EXCEPTION 'unauthenticated'; END IF;
SELECT hp.* INTO v_p
FROM public.haras_purchases hp
JOIN public.haras_purchase_commissions hpc ON hpc.purchase_id = hp.id
JOIN public.haras_purchase_commission_installments hpci ON hpci.commission_id = hpc.id
WHERE hpci.id = _installment_id
FOR UPDATE OF hp;
IF v_p IS NULL THEN RAISE EXCEPTION 'installment_not_found'; END IF;
SELECT * INTO v_i
FROM public.haras_purchase_commission_installments
WHERE id = _installment_id
FOR UPDATE;
SELECT * INTO v_c FROM public.haras_purchase_commissions WHERE id = v_i.commission_id;
IF NOT public.can_access_unit(auth.uid(), v_i.business_unit_id) THEN RAISE EXCEPTION 'forbidden_unit'; END IF;
IF NOT public.has_permission(auth.uid(),'haras_purchases'::app_module,'edit'::permission_action)
THEN RAISE EXCEPTION 'forbidden_action'; END IF;
IF NOT public.is_feature_enabled(v_i.business_unit_id,'haras_purchases')
THEN RAISE EXCEPTION 'feature_disabled'; END IF;
IF v_p.purchase_status = 'cancelled' THEN RAISE EXCEPTION 'purchase_cancelled'; END IF;
IF v_i.status <> 'paid' THEN RAISE EXCEPTION 'installment_not_paid'; END IF;
IF v_i.transaction_id IS NULL THEN RAISE EXCEPTION 'installment_missing_transaction'; END IF;
SELECT * INTO v_tx_original FROM public.transactions WHERE id = v_i.transaction_id;
IF v_tx_original IS NULL THEN RAISE EXCEPTION 'installment_missing_transaction'; END IF;
INSERT INTO public.transactions (
business_unit_id, date, description, category_id, type, amount, status,
bank_account_id, created_by, is_adjustment, adjustment_reason
) VALUES (
v_i.business_unit_id, CURRENT_DATE,
format('Estorno comissão parcela #%s/%s (compra %s)',
v_i.installment_number, v_p.installment_count, v_p.purchase_type),
v_tx_original.category_id, 'income', v_tx_original.amount, 'paid',
v_tx_original.bank_account_id, auth.uid(), true,
format('Estorno comissão #%s — %s', v_i.installment_number, COALESCE(_reason,''))
) RETURNING id INTO v_tx_reversal_id;
UPDATE public.haras_purchase_commission_installments
SET status='open',
paid_date=NULL,
transaction_id=NULL,
reversed_at=now(),
reversed_by=auth.uid(),
reversal_reason=_reason,
reversal_transaction_id=v_tx_reversal_id
WHERE id = _installment_id;
IF v_i.payable_id IS NOT NULL THEN
UPDATE public.payables
SET status='open',
paid_at=NULL,
transaction_id=NULL,
paid_account_category_id=NULL
WHERE id = v_i.payable_id;
END IF;
PERFORM public.haras_recompute_purchase_status(v_p.id);
RETURN v_tx_reversal_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.haras_reverse_purchase_installment(_installment_id uuid, _reason text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
v_i RECORD;
v_p RECORD;
v_tx_original RECORD;
v_tx_reversal_id uuid;
BEGIN
IF auth.uid() IS NULL THEN RAISE EXCEPTION 'unauthenticated'; END IF;
SELECT hp.* INTO v_p
FROM public.haras_purchases hp
JOIN public.haras_purchase_installments hpi ON hpi.purchase_id = hp.id
WHERE hpi.id = _installment_id
FOR UPDATE OF hp;
IF v_p IS NULL THEN RAISE EXCEPTION 'installment_not_found'; END IF;
SELECT * INTO v_i
FROM public.haras_purchase_installments
WHERE id = _installment_id
FOR UPDATE;
IF NOT public.can_access_unit(auth.uid(), v_i.business_unit_id) THEN RAISE EXCEPTION 'forbidden_unit'; END IF;
IF NOT public.has_permission(auth.uid(),'haras_purchases'::app_module,'edit'::permission_action)
THEN RAISE EXCEPTION 'forbidden_action'; END IF;
IF NOT public.is_feature_enabled(v_i.business_unit_id,'haras_purchases')
THEN RAISE EXCEPTION 'feature_disabled'; END IF;
IF v_p.purchase_status = 'cancelled' THEN RAISE EXCEPTION 'purchase_cancelled'; END IF;
IF v_i.status <> 'paid' THEN RAISE EXCEPTION 'installment_not_paid'; END IF;
IF v_i.transaction_id IS NULL THEN RAISE EXCEPTION 'installment_missing_transaction'; END IF;
SELECT * INTO v_tx_original FROM public.transactions WHERE id = v_i.transaction_id;
IF v_tx_original IS NULL THEN RAISE EXCEPTION 'installment_missing_transaction'; END IF;
INSERT INTO public.transactions (
business_unit_id, date, description, category_id, type, amount, status,
bank_account_id, created_by, is_adjustment, adjustment_reason
) VALUES (
v_i.business_unit_id, CURRENT_DATE,
format('Estorno compra %s parcela #%s/%s — %s',
v_p.purchase_type, v_i.installment_number, v_p.installment_count,
COALESCE(v_p.seller_name,'')),
v_tx_original.category_id, 'income', v_tx_original.amount, 'paid',
v_tx_original.bank_account_id, auth.uid(), true,
format('Estorno parcela #%s — %s', v_i.installment_number, COALESCE(_reason,''))
) RETURNING id INTO v_tx_reversal_id;
UPDATE public.haras_purchase_installments
SET status='open',
paid_date=NULL,
transaction_id=NULL,
reversed_at=now(),
reversed_by=auth.uid(),
reversal_reason=_reason,
reversal_transaction_id=v_tx_reversal_id
WHERE id = _installment_id;
IF v_i.payable_id IS NOT NULL THEN
UPDATE public.payables
SET status='open',
paid_at=NULL,
transaction_id=NULL,
paid_account_category_id=NULL
WHERE id = v_i.payable_id;
END IF;
PERFORM public.haras_recompute_purchase_status(v_i.purchase_id);
RETURN v_tx_reversal_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.haras_update_purchase(_id uuid, _payload jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
v_p RECORD;
v_bu uuid;
v_ptype text;
v_pcond text;
v_total numeric;
v_n int;
v_first_due date;
v_has_down boolean;
v_down_amt numeric;
v_down_dt  date;
v_has_comm boolean;
v_cat_name text;
v_cat_id uuid;
v_commission_id uuid;
v_base numeric; v_each numeric; v_last numeric;
v_i int; v_amt numeric; v_due date;
v_comm_n int; v_comm_first date; v_comm_total numeric;
v_animal_id uuid;
v_part_pct numeric;
v_animal_bu uuid;
v_has_animal_key boolean;
v_has_part_key boolean;
BEGIN
IF auth.uid() IS NULL THEN RAISE EXCEPTION 'unauthenticated'; END IF;
SELECT * INTO v_p FROM public.haras_purchases WHERE id = _id FOR UPDATE;
IF v_p IS NULL THEN RAISE EXCEPTION 'purchase_not_found'; END IF;
v_bu := v_p.business_unit_id;
IF NOT public.can_access_unit(auth.uid(), v_bu) THEN RAISE EXCEPTION 'forbidden_unit'; END IF;
IF NOT public.has_permission(auth.uid(),'haras_purchases'::app_module,'edit'::permission_action)
THEN RAISE EXCEPTION 'forbidden_action'; END IF;
IF NOT public.is_feature_enabled(v_bu,'haras_purchases')
THEN RAISE EXCEPTION 'feature_disabled'; END IF;
IF v_p.purchase_status = 'cancelled' THEN RAISE EXCEPTION 'purchase_cancelled'; END IF;
IF EXISTS (SELECT 1 FROM public.haras_purchase_installments
WHERE purchase_id = _id AND status = 'paid') THEN
RAISE EXCEPTION 'purchase_has_paid_installments';
END IF;
IF EXISTS (SELECT 1 FROM public.haras_purchase_commission_installments hpci
JOIN public.haras_purchase_commissions hpc ON hpc.id = hpci.commission_id
WHERE hpc.purchase_id = _id AND hpci.status = 'paid') THEN
RAISE EXCEPTION 'purchase_has_paid_installments';
END IF;
PERFORM set_config('statement_timeout','10s', true);
v_ptype := COALESCE(_payload->>'purchase_type', v_p.purchase_type);
v_pcond := COALESCE(_payload->>'payment_condition', v_p.payment_condition);
v_total := COALESCE(NULLIF(_payload->>'total_amount','')::numeric, v_p.total_amount);
v_n := COALESCE(NULLIF(_payload->>'installment_count','')::int, v_p.installment_count);
v_first_due := COALESCE(NULLIF(_payload->>'first_due_date','')::date, v_p.first_due_date);
v_has_down := COALESCE((_payload->>'has_down_payment')::boolean, v_p.has_down_payment);
v_down_amt := COALESCE(NULLIF(_payload->>'down_payment_amount','')::numeric, v_p.down_payment_amount);
v_down_dt  := COALESCE(NULLIF(_payload->>'down_payment_date','')::date, v_p.down_payment_date);
v_has_comm := COALESCE((_payload->>'has_commission')::boolean, v_p.has_commission);
v_has_animal_key := _payload ? 'animal_id';
v_has_part_key := _payload ? 'participation_percentage';
v_animal_id := CASE WHEN v_has_animal_key THEN NULLIF(_payload->>'animal_id','')::uuid ELSE v_p.animal_id END;
v_part_pct := CASE WHEN v_has_part_key THEN NULLIF(_payload->>'participation_percentage','')::numeric ELSE v_p.participation_percentage END;
IF v_ptype NOT IN ('animal','coverage','embryo') THEN RAISE EXCEPTION 'invalid purchase_type: %', v_ptype; END IF;
IF v_pcond NOT IN ('a_vista','parcelado') THEN RAISE EXCEPTION 'invalid payment_condition: %', v_pcond; END IF;
IF v_pcond = 'parcelado' AND (v_n < 2 OR v_first_due IS NULL) THEN
RAISE EXCEPTION 'parcelado requires installment_count>=2 and first_due_date';
END IF;
IF v_pcond = 'a_vista' THEN v_n := 1; END IF;
IF v_total IS NULL OR v_total <= 0 THEN RAISE EXCEPTION 'total_amount required > 0'; END IF;
IF v_has_down THEN
IF v_pcond <> 'parcelado' THEN RAISE EXCEPTION 'down_payment requires parcelado'; END IF;
IF v_down_amt IS NULL OR v_down_amt <= 0 OR v_down_amt >= v_total OR v_down_dt IS NULL THEN
RAISE EXCEPTION 'invalid down payment';
END IF;
END IF;
IF v_ptype <> 'animal' THEN
v_animal_id := NULL;
v_part_pct := NULL;
ELSE
IF v_animal_id IS NOT NULL THEN
SELECT business_unit_id INTO v_animal_bu FROM public.haras_animals WHERE id = v_animal_id;
IF v_animal_bu IS NULL THEN RAISE EXCEPTION 'animal_not_found'; END IF;
IF v_animal_bu <> v_bu THEN RAISE EXCEPTION 'animal_bu_mismatch'; END IF;
END IF;
IF v_part_pct IS NOT NULL AND (v_part_pct <= 0 OR v_part_pct > 100) THEN
RAISE EXCEPTION 'invalid_participation_percentage';
END IF;
END IF;
v_cat_name := CASE v_ptype
WHEN 'animal'   THEN 'Compra de Animal'
WHEN 'coverage' THEN 'Compra de Cobertura'
WHEN 'embryo'   THEN 'Compra de Embrião'
END;
SELECT id INTO v_cat_id FROM public.categories
WHERE business_unit_id = v_bu AND type = 'expense' AND name = v_cat_name LIMIT 1;
IF v_cat_id IS NULL THEN
RAISE EXCEPTION 'expense category not seeded for BU % name %', v_bu, v_cat_name;
END IF;
UPDATE public.haras_purchases SET
purchase_type = v_ptype,
purchase_date = COALESCE(NULLIF(_payload->>'purchase_date','')::date, purchase_date),
seller_name = COALESCE(NULLIF(_payload->>'seller_name',''), seller_name),
supplier_id = COALESCE(NULLIF(_payload->>'supplier_id','')::uuid, supplier_id),
total_amount = v_total,
payment_condition = v_pcond,
installment_count = v_n,
first_due_date = v_first_due,
has_down_payment = v_has_down,
down_payment_amount = CASE WHEN v_has_down THEN v_down_amt ELSE NULL END,
down_payment_date = CASE WHEN v_has_down THEN v_down_dt ELSE NULL END,
has_commission = v_has_comm,
notes = COALESCE(NULLIF(_payload->>'notes',''), notes),
expense_category_id = v_cat_id,
animal_id = v_animal_id,
participation_percentage = v_part_pct,
updated_at = now()
WHERE id = _id;
DELETE FROM public.payables
WHERE id IN (
SELECT payable_id FROM public.haras_purchase_installments
WHERE purchase_id = _id AND payable_id IS NOT NULL
);
DELETE FROM public.haras_purchase_installments WHERE purchase_id = _id;
v_base := CASE WHEN v_has_down THEN v_total - v_down_amt ELSE v_total END;
v_each := round(v_base / v_n, 2);
v_last := v_base - (v_each * (v_n - 1));
FOR v_i IN 1..v_n LOOP
v_amt := CASE WHEN v_i = v_n THEN v_last ELSE v_each END;
v_due := CASE WHEN v_pcond='a_vista' THEN COALESCE(v_first_due, CURRENT_DATE)
ELSE (v_first_due + ((v_i - 1) || ' month')::interval)::date END;
INSERT INTO public.haras_purchase_installments (
business_unit_id, purchase_id, installment_number, amount, due_date, status, created_by
) VALUES (v_bu, _id, v_i, v_amt, v_due, 'pending', auth.uid());
END LOOP;
DELETE FROM public.payables
WHERE id IN (
SELECT hpci.payable_id FROM public.haras_purchase_commission_installments hpci
JOIN public.haras_purchase_commissions hpc ON hpc.id = hpci.commission_id
WHERE hpc.purchase_id = _id AND hpci.payable_id IS NOT NULL
);
DELETE FROM public.haras_purchase_commission_installments hpci
USING public.haras_purchase_commissions hpc
WHERE hpci.commission_id = hpc.id AND hpc.purchase_id = _id;
DELETE FROM public.haras_purchase_commissions WHERE purchase_id = _id;
IF v_has_comm THEN
v_comm_total := COALESCE(NULLIF(_payload->>'commission_amount','')::numeric, 0);
IF v_comm_total <= 0 THEN RAISE EXCEPTION 'commission_amount required > 0'; END IF;
v_comm_n := COALESCE(NULLIF(_payload->>'commission_installment_count','')::int, 1);
v_comm_first := NULLIF(_payload->>'commission_first_due_date','')::date;
SELECT id INTO v_cat_id FROM public.categories
WHERE business_unit_id = v_bu AND type='expense' AND name = 'Comissão sobre Compra' LIMIT 1;
IF v_cat_id IS NULL THEN RAISE EXCEPTION 'commission expense category not seeded'; END IF;
INSERT INTO public.haras_purchase_commissions (
business_unit_id, purchase_id, commission_type, commission_percentage, commission_amount,
recipient_name, payment_condition, installment_count, first_due_date,
auto_create_bills, purchase_status, notes, created_by, expense_category_id
) VALUES (
v_bu, _id,
COALESCE(_payload->>'commission_type','fixed'),
NULLIF(_payload->>'commission_percentage','')::numeric,
v_comm_total,
NULLIF(_payload->>'recipient_name',''),
COALESCE(_payload->>'commission_payment_condition','a_vista'),
v_comm_n, v_comm_first, false, 'pendente',
NULLIF(_payload->>'commission_notes',''), auth.uid(), v_cat_id
) RETURNING id INTO v_commission_id;
v_each := round(v_comm_total / v_comm_n, 2);
v_last := v_comm_total - (v_each * (v_comm_n - 1));
FOR v_i IN 1..v_comm_n LOOP
v_amt := CASE WHEN v_i = v_comm_n THEN v_last ELSE v_each END;
v_due := (COALESCE(v_comm_first, v_first_due, CURRENT_DATE) + ((v_i - 1) || ' month')::interval)::date;
INSERT INTO public.haras_purchase_commission_installments (
business_unit_id, commission_id, installment_number, amount, due_date, status, created_by
) VALUES (v_bu, v_commission_id, v_i, v_amt, v_due, 'pending', auth.uid());
END LOOP;
END IF;
PERFORM public.haras_recompute_purchase_status(_id);
RETURN _id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _module app_module, _action permission_action)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT public.is_admin(_user_id)
    OR EXISTS (SELECT 1 FROM public.user_module_permissions WHERE user_id = _user_id AND module = _module AND action = _action)
$function$
;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $function$
;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin') $function$
;

CREATE OR REPLACE FUNCTION public.is_feature_enabled(_unit_id uuid, _flag_name text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(
    (SELECT enabled FROM public.haras_feature_flags WHERE flag_name = _flag_name AND business_unit_id = _unit_id LIMIT 1),
    (SELECT enabled FROM public.haras_feature_flags WHERE flag_name = _flag_name AND business_unit_id IS NULL LIMIT 1),
    false);
$function$
;

CREATE OR REPLACE FUNCTION public.mark_overdue()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.receivables SET status='overdue', updated_at=now() WHERE status='pending' AND due_date < CURRENT_DATE;
  UPDATE public.loan_installments SET status='overdue' WHERE status='pending' AND due_date < CURRENT_DATE;
  UPDATE public.payables SET status='overdue', updated_at=now() WHERE status='pending' AND due_date < CURRENT_DATE;
  PERFORM public.notify_upcoming_dues();
END $function$
;

CREATE OR REPLACE FUNCTION public.mark_payable_paid(_id uuid, _payment_date date, _account_category_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE v_pay public.payables%ROWTYPE; v_tx_id uuid;
BEGIN
  SELECT * INTO v_pay FROM public.payables WHERE id = _id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Conta a pagar % não encontrada', _id; END IF;
  IF v_pay.status = 'paid' AND v_pay.transaction_id IS NOT NULL THEN RAISE EXCEPTION 'Conta já paga'; END IF;
  IF v_pay.closed_at IS NOT NULL AND public.is_feature_enabled(v_pay.business_unit_id,'closing_lock_enabled') THEN
    RAISE EXCEPTION 'Conta em período fechado.'; END IF;
  INSERT INTO public.transactions (business_unit_id, date, description, category_id, type, amount, status, client_id, created_by)
  VALUES (v_pay.business_unit_id, _payment_date, 'Pagamento: '||v_pay.description, _account_category_id, 'expense', v_pay.amount, 'paid', v_pay.supplier_id, auth.uid())
  RETURNING id INTO v_tx_id;
  UPDATE public.payables SET status='paid', paid_at=_payment_date, paid_account_category_id=_account_category_id, transaction_id=v_tx_id, updated_at=now() WHERE id=_id;
  RETURN v_tx_id;
END $function$
;

CREATE OR REPLACE FUNCTION public.mark_payable_paid(_id uuid, _payment_date date, _account_category_id uuid, _bank_account_id uuid DEFAULT NULL::uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE v_pay public.payables%ROWTYPE; v_tx_id uuid; v_ba_date date;
BEGIN
  SELECT * INTO v_pay FROM public.payables WHERE id=_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Conta a pagar % não encontrada', _id; END IF;
  IF v_pay.status='paid' AND v_pay.transaction_id IS NOT NULL THEN RAISE EXCEPTION 'Conta já paga'; END IF;
  IF v_pay.closed_at IS NOT NULL AND public.is_feature_enabled(v_pay.business_unit_id,'closing_lock_enabled') THEN
    RAISE EXCEPTION 'Conta em período fechado.'; END IF;
  IF _bank_account_id IS NOT NULL THEN
    IF NOT public.can_use_bank_account(auth.uid(), _bank_account_id, v_pay.business_unit_id) THEN
      RAISE EXCEPTION 'Conta bancária indisponível para esta unidade' USING ERRCODE='42501';
    END IF;
    SELECT initial_balance_date INTO v_ba_date FROM public.bank_accounts WHERE id=_bank_account_id;
    IF _payment_date < v_ba_date THEN RAISE EXCEPTION 'Data anterior ao saldo inicial da conta bancária'; END IF;
  END IF;
  INSERT INTO public.transactions (business_unit_id, date, description, category_id, type, amount, status, client_id, created_by, bank_account_id)
  VALUES (v_pay.business_unit_id, _payment_date, 'Pagamento: '||v_pay.description, _account_category_id, 'expense', v_pay.amount, 'paid', v_pay.supplier_id, auth.uid(), _bank_account_id)
  RETURNING id INTO v_tx_id;
  UPDATE public.payables SET status='paid', paid_at=_payment_date, paid_account_category_id=_account_category_id, transaction_id=v_tx_id, updated_at=now() WHERE id=_id;
  RETURN v_tx_id;
END $function$
;

CREATE OR REPLACE FUNCTION public.mark_receivable_paid(_id uuid, _payment_date date, _account_category_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE v_rec public.receivables%ROWTYPE; v_tx_id uuid;
BEGIN
  SELECT * INTO v_rec FROM public.receivables WHERE id = _id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Recebível % não encontrado', _id USING ERRCODE = 'P0002'; END IF;
  IF v_rec.status = 'paid' AND v_rec.transaction_id IS NOT NULL THEN RAISE EXCEPTION 'Recebível % já foi marcado como pago', _id USING ERRCODE = 'P0001'; END IF;
  IF v_rec.closed_at IS NOT NULL AND public.is_feature_enabled(v_rec.business_unit_id, 'closing_lock_enabled') THEN
    RAISE EXCEPTION 'Recebível está em período fechado. Reabra antes de marcar como pago.' USING ERRCODE = 'P0001';
  END IF;
  INSERT INTO public.transactions (business_unit_id, date, description, category_id, type, amount, status, client_id, created_by)
  VALUES (v_rec.business_unit_id, _payment_date, 'Recebimento: ' || v_rec.description, _account_category_id, 'income', v_rec.amount, 'paid', v_rec.client_id, auth.uid())
  RETURNING id INTO v_tx_id;
  UPDATE public.receivables SET status = 'paid', paid_at = _payment_date, paid_account_category_id = _account_category_id, transaction_id = v_tx_id, updated_at = now() WHERE id = _id;
  RETURN v_tx_id;
END; $function$
;

CREATE OR REPLACE FUNCTION public.mark_receivable_paid(_id uuid, _payment_date date, _account_category_id uuid, _bank_account_id uuid DEFAULT NULL::uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE v_rec public.receivables%ROWTYPE; v_tx_id uuid; v_ba_date date;
BEGIN
  SELECT * INTO v_rec FROM public.receivables WHERE id=_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Recebível % não encontrado', _id USING ERRCODE='P0002'; END IF;
  IF v_rec.status='paid' AND v_rec.transaction_id IS NOT NULL THEN RAISE EXCEPTION 'Recebível % já foi marcado como pago', _id USING ERRCODE='P0001'; END IF;
  IF v_rec.closed_at IS NOT NULL AND public.is_feature_enabled(v_rec.business_unit_id,'closing_lock_enabled') THEN
    RAISE EXCEPTION 'Recebível está em período fechado. Reabra antes de marcar como pago.' USING ERRCODE='P0001';
  END IF;
  IF _bank_account_id IS NOT NULL THEN
    IF NOT public.can_use_bank_account(auth.uid(), _bank_account_id, v_rec.business_unit_id) THEN
      RAISE EXCEPTION 'Conta bancária indisponível para esta unidade' USING ERRCODE='42501';
    END IF;
    SELECT initial_balance_date INTO v_ba_date FROM public.bank_accounts WHERE id=_bank_account_id;
    IF _payment_date < v_ba_date THEN RAISE EXCEPTION 'Data anterior ao saldo inicial da conta bancária'; END IF;
  END IF;
  INSERT INTO public.transactions (business_unit_id, date, description, category_id, type, amount, status, client_id, created_by, bank_account_id)
  VALUES (v_rec.business_unit_id, _payment_date, 'Recebimento: '||v_rec.description, _account_category_id, 'income', v_rec.amount, 'paid', v_rec.client_id, auth.uid(), _bank_account_id)
  RETURNING id INTO v_tx_id;
  UPDATE public.receivables SET status='paid', paid_at=_payment_date, paid_account_category_id=_account_category_id, transaction_id=v_tx_id, updated_at=now() WHERE id=_id;
  RETURN v_tx_id;
END; $function$
;

CREATE OR REPLACE FUNCTION public.notify_bu_users(_bu uuid, _module app_module, _type notification_type, _title text, _body text, _link text, _entity_table text, _entity_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.notifications
    (user_id, business_unit_id, type, title, body, link, entity_table, entity_id)
  SELECT DISTINCT u.user_id, _bu, _type, _title, _body, _link, _entity_table, _entity_id
  FROM public.user_unit_access u
  WHERE u.business_unit_id = _bu
    AND public.has_permission(u.user_id, _module, 'view'::public.permission_action)
  ON CONFLICT DO NOTHING;
EXCEPTION WHEN OTHERS THEN NULL;
END $function$
;

CREATE OR REPLACE FUNCTION public.notify_upcoming_dues()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT id, business_unit_id, description, due_date FROM public.receivables
     WHERE status = 'pending' AND due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 3
  LOOP
    PERFORM public.notify_bu_users(r.business_unit_id, 'receivables'::public.app_module,
      'due_soon_receivable',
      'A Receber vence em ' || (r.due_date - CURRENT_DATE) || 'd: ' || COALESCE(r.description,''),
      NULL, '/financeiro?tab=receber', 'receivables', r.id);
  END LOOP;

  FOR r IN
    SELECT id, business_unit_id, description, due_date FROM public.payables
     WHERE status = 'pending' AND due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 3
  LOOP
    PERFORM public.notify_bu_users(r.business_unit_id, 'payables'::public.app_module,
      'due_soon_payable',
      'A Pagar vence em ' || (r.due_date - CURRENT_DATE) || 'd: ' || COALESCE(r.description,''),
      NULL, '/financeiro?tab=pagar', 'payables', r.id);
  END LOOP;
EXCEPTION WHEN OTHERS THEN NULL;
END $function$
;

CREATE OR REPLACE FUNCTION public.notify_upcoming_sale_installments()
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_inserted integer := 0;
  r record;
  v_kind text;
  v_type notification_type;
  v_title text;
  v_body text;
  v_days integer;
BEGIN
  FOR r IN
    SELECT si.id AS installment_id,
           si.installment_number,
           si.due_date,
           si.amount,
           s.id AS sale_id,
           s.business_unit_id,
           a.name AS animal_name,
           c.name AS buyer_name,
           (si.due_date - CURRENT_DATE) AS delta_days
    FROM public.sale_installments si
    JOIN public.animal_sales s ON s.id = si.sale_id
    LEFT JOIN public.haras_animals a ON a.id = s.animal_id
    LEFT JOIN public.haras_clients c ON c.id = s.buyer_client_id
    WHERE si.status = 'pending'
      AND (si.due_date - CURRENT_DATE) IN (7, 3, 0, -1, -7)
  LOOP
    v_days := r.delta_days;
    v_kind := CASE v_days
                WHEN 7  THEN 'due_7d'
                WHEN 3  THEN 'due_3d'
                WHEN 0  THEN 'due_today'
                WHEN -1 THEN 'overdue_1d'
                WHEN -7 THEN 'overdue_7d'
              END;

    -- idempotência
    IF EXISTS (
      SELECT 1 FROM public.sale_installment_notifications
      WHERE installment_id = r.installment_id AND kind = v_kind
    ) THEN
      CONTINUE;
    END IF;

    v_type := CASE WHEN v_days < 0 THEN 'became_overdue'::notification_type
                   ELSE 'due_soon_receivable'::notification_type END;

    v_title := CASE
      WHEN v_days = 0  THEN 'Parcela vence hoje'
      WHEN v_days > 0  THEN 'Parcela vence em ' || v_days || ' dia(s)'
      WHEN v_days = -1 THEN 'Parcela venceu ontem'
      ELSE 'Parcela vencida há ' || abs(v_days) || ' dias'
    END;

    v_body := 'Parcela ' || r.installment_number
              || ' — R$ ' || to_char(r.amount, 'FM999G999G990D00')
              || COALESCE(' — ' || r.animal_name, '')
              || COALESCE(' / ' || r.buyer_name, '')
              || ' — venc. ' || to_char(r.due_date, 'DD/MM/YYYY');

    -- inserir uma notificação por usuário com acesso à BU
    INSERT INTO public.notifications (user_id, business_unit_id, type, title, body, link, entity_table, entity_id)
    SELECT uua.user_id, r.business_unit_id, v_type, v_title, v_body,
           '/haras/vendas?buyer=' || COALESCE(r.buyer_name, ''),
           'sale_installments', r.installment_id
    FROM public.user_unit_access uua
    WHERE uua.business_unit_id = r.business_unit_id;

    INSERT INTO public.sale_installment_notifications (installment_id, kind)
    VALUES (r.installment_id, v_kind);

    v_inserted := v_inserted + 1;
  END LOOP;

  RETURN v_inserted;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.on_reservation_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE new_rec_id UUID;
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'confirmed') OR (TG_OP = 'INSERT' AND NEW.status = 'confirmed') THEN
    IF NEW.receivable_id IS NULL THEN
      INSERT INTO public.receivables (business_unit_id, client_id, description, amount, due_date, status, created_by)
      VALUES (NEW.business_unit_id, NEW.client_id, 'Reserva: ' || NEW.title, NEW.total_amount, NEW.end_date, 'pending', NEW.created_by)
      RETURNING id INTO new_rec_id;
      NEW.receivable_id := new_rec_id;
    END IF;
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.status = 'confirmed' AND NEW.status = 'cancelled' THEN
    IF NEW.receivable_id IS NOT NULL THEN
      DELETE FROM public.receivables WHERE id = NEW.receivable_id AND status = 'pending';
      NEW.receivable_id := NULL;
    END IF;
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.status = 'confirmed' AND NEW.status = 'completed' THEN
    IF NEW.receivable_id IS NOT NULL THEN
      UPDATE public.receivables SET status = 'paid', updated_at = now() WHERE id = NEW.receivable_id AND status = 'pending';
    END IF;
  END IF;
  RETURN NEW;
END; $function$
;

CREATE OR REPLACE FUNCTION public.partial_pay_and_reschedule(_payable_id uuid, _amount_paid numeric, _bank_account_id uuid, _new_due_date date, _reason text, _payment_date date, _account_category_id uuid DEFAULT NULL::uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_pay public.payables%ROWTYPE;
  v_tx_id uuid;
  v_ba_date date;
  v_old_due date;
  v_old_amt numeric;
  v_new_amt numeric;
  v_reschedule boolean;
  v_uid uuid := auth.uid();
  v_amt_paid numeric := round(COALESCE(_amount_paid, 0)::numeric, 2);
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Usuário não autenticado' USING ERRCODE='42501'; END IF;
  SELECT * INTO v_pay FROM public.payables WHERE id = _payable_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Conta a pagar não encontrada'; END IF;
  IF NOT public.has_permission(v_uid,'payables'::app_module,'edit'::permission_action)
     OR NOT public.can_access_unit(v_uid, v_pay.business_unit_id) THEN
    RAISE EXCEPTION 'Sem permissão' USING ERRCODE='42501';
  END IF;
  IF v_pay.status = 'paid' THEN RAISE EXCEPTION 'Conta já foi marcada como paga'; END IF;
  IF v_pay.closed_at IS NOT NULL AND public.is_feature_enabled(v_pay.business_unit_id,'closing_lock_enabled') THEN
    RAISE EXCEPTION 'Conta em período fechado.';
  END IF;
  IF v_amt_paid < 0 THEN RAISE EXCEPTION 'Valor pago inválido'; END IF;
  IF v_amt_paid >= round(v_pay.amount::numeric, 2) THEN RAISE EXCEPTION 'Para pagamento total, use "Pagar total"'; END IF;
  IF _new_due_date IS NULL THEN RAISE EXCEPTION 'Nova data de vencimento é obrigatória'; END IF;
  IF _new_due_date < CURRENT_DATE THEN RAISE EXCEPTION 'Nova data de vencimento não pode ser no passado'; END IF;

  v_old_due := v_pay.due_date;
  v_old_amt := v_pay.amount;
  v_reschedule := _new_due_date <> v_old_due;

  IF v_amt_paid = 0 AND NOT v_reschedule THEN
    RAISE EXCEPTION 'Nada a fazer: informe um valor pago ou uma nova data';
  END IF;
  IF v_reschedule AND (_reason IS NULL OR length(btrim(_reason)) < 5) THEN
    RAISE EXCEPTION 'Motivo do reagendamento é obrigatório (mín. 5 caracteres)';
  END IF;

  IF v_amt_paid > 0 THEN
    IF _bank_account_id IS NULL THEN RAISE EXCEPTION 'Conta bancária é obrigatória para pagamento parcial'; END IF;
    IF _account_category_id IS NULL THEN _account_category_id := v_pay.category_id; END IF;
    IF _account_category_id IS NULL THEN RAISE EXCEPTION 'Categoria de despesa é obrigatória para pagamento parcial'; END IF;
    IF _payment_date IS NULL THEN _payment_date := CURRENT_DATE; END IF;

    IF NOT public.can_use_bank_account(v_uid, _bank_account_id, v_pay.business_unit_id) THEN
      RAISE EXCEPTION 'Conta bancária indisponível para esta unidade' USING ERRCODE='42501';
    END IF;
    SELECT initial_balance_date INTO v_ba_date FROM public.bank_accounts WHERE id = _bank_account_id;
    IF _payment_date < v_ba_date THEN RAISE EXCEPTION 'Data anterior ao saldo inicial da conta bancária'; END IF;

    INSERT INTO public.transactions
      (business_unit_id, date, description, category_id, type, amount, status, client_id, created_by, bank_account_id, payable_id)
    VALUES
      (v_pay.business_unit_id, _payment_date, 'Pagamento parcial: '||v_pay.description,
       _account_category_id, 'expense', v_amt_paid, 'paid', v_pay.supplier_id, v_uid, _bank_account_id, v_pay.id)
    RETURNING id INTO v_tx_id;
  END IF;

  v_new_amt := round((v_old_amt - v_amt_paid)::numeric, 2);

  UPDATE public.payables
     SET amount = v_new_amt,
         due_date = _new_due_date,
         original_amount = COALESCE(original_amount, v_old_amt),
         original_due_date = COALESCE(original_due_date, v_old_due),
         rescheduled_count = rescheduled_count + CASE WHEN v_reschedule THEN 1 ELSE 0 END,
         last_reschedule_reason = CASE WHEN v_reschedule THEN _reason ELSE last_reschedule_reason END,
         last_rescheduled_at = CASE WHEN v_reschedule THEN now() ELSE last_rescheduled_at END,
         status = CASE
           WHEN v_new_amt <= 0 THEN 'paid'
           WHEN _new_due_date >= CURRENT_DATE AND v_pay.status = 'overdue' THEN 'pending'
           ELSE v_pay.status
         END,
         updated_at = now()
   WHERE id = _payable_id;

  INSERT INTO public.audit_log (user_id, action, entity, entity_id, business_unit_id, payload)
  VALUES (
    v_uid,
    CASE WHEN v_amt_paid > 0 AND v_reschedule THEN 'payable.partial_pay_reschedule'
         WHEN v_amt_paid > 0 THEN 'payable.partial_pay'
         ELSE 'payable.reschedule' END,
    'payable',
    _payable_id,
    v_pay.business_unit_id,
    jsonb_build_object(
      'amount_paid', v_amt_paid,
      'remaining_amount', v_new_amt,
      'old_due_date', v_old_due,
      'new_due_date', _new_due_date,
      'reason', _reason,
      'bank_account_id', _bank_account_id,
      'transaction_id', v_tx_id,
      'original_amount', v_old_amt
    )
  );

  RETURN COALESCE(v_tx_id, _payable_id);
END $function$
;

CREATE OR REPLACE FUNCTION public.pay_sale_installment(_installment_id uuid, _payment_date date, _account_category_id uuid, _interest numeric DEFAULT 0, _fine numeric DEFAULT 0, _discount numeric DEFAULT 0)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_inst public.sale_installments%ROWTYPE; v_new_amount numeric; v_tx_id uuid;
BEGIN
  SELECT * INTO v_inst FROM public.sale_installments WHERE id=_installment_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Parcela não encontrada'; END IF;
  IF v_inst.receivable_id IS NULL THEN RAISE EXCEPTION 'Sem recebível'; END IF;
  v_new_amount := v_inst.amount + COALESCE(_interest,0) + COALESCE(_fine,0) - COALESCE(_discount,0);
  IF v_new_amount <= 0 THEN RAISE EXCEPTION 'Valor final inválido'; END IF;
  UPDATE public.receivables SET amount=v_new_amount, updated_at=now() WHERE id=v_inst.receivable_id;
  UPDATE public.sale_installments SET interest_amount=COALESCE(_interest,0), fine_amount=COALESCE(_fine,0), discount_amount=COALESCE(_discount,0), updated_at=now() WHERE id=_installment_id;
  v_tx_id := public.mark_receivable_paid(v_inst.receivable_id, _payment_date, _account_category_id);
  RETURN v_tx_id;
END $function$
;

CREATE OR REPLACE FUNCTION public.pay_sale_installment(_installment_id uuid, _payment_date date, _account_category_id uuid, _interest numeric DEFAULT 0, _fine numeric DEFAULT 0, _discount numeric DEFAULT 0, _bank_account_id uuid DEFAULT NULL::uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_inst public.sale_installments%ROWTYPE; v_new_amount numeric; v_tx_id uuid;
BEGIN
  SELECT * INTO v_inst FROM public.sale_installments WHERE id=_installment_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Parcela não encontrada'; END IF;
  IF v_inst.receivable_id IS NULL THEN RAISE EXCEPTION 'Sem recebível'; END IF;
  v_new_amount := v_inst.amount + COALESCE(_interest,0) + COALESCE(_fine,0) - COALESCE(_discount,0);
  IF v_new_amount <= 0 THEN RAISE EXCEPTION 'Valor final inválido'; END IF;
  UPDATE public.receivables SET amount=v_new_amount, updated_at=now() WHERE id=v_inst.receivable_id;
  UPDATE public.sale_installments SET interest_amount=COALESCE(_interest,0), fine_amount=COALESCE(_fine,0), discount_amount=COALESCE(_discount,0), updated_at=now() WHERE id=_installment_id;
  v_tx_id := public.mark_receivable_paid(v_inst.receivable_id, _payment_date, _account_category_id, _bank_account_id);
  RETURN v_tx_id;
END $function$
;

CREATE OR REPLACE FUNCTION public.preview_animal_share_split(_animal_id uuid, _amount numeric)
 RETURNS TABLE(client_id uuid, ownership_percentage numeric, share_amount numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_bu uuid; v_primary uuid; v_parts jsonb;
BEGIN
  SELECT business_unit_id, primary_client_id INTO v_bu, v_primary FROM public.haras_animals WHERE id=_animal_id;
  IF v_bu IS NULL THEN RAISE EXCEPTION 'Animal não encontrado'; END IF;
  IF NOT public.can_access_unit(auth.uid(), v_bu) THEN RAISE EXCEPTION 'Sem permissão'; END IF;
  IF _amount IS NULL OR _amount <= 0 THEN RETURN; END IF;
  SELECT jsonb_agg(jsonb_build_object('client_id',p.client_id,'ownership_percentage',p.ownership_percentage))
    INTO v_parts FROM public.haras_animal_partners p WHERE p.animal_id=_animal_id;
  IF v_parts IS NULL OR jsonb_array_length(v_parts)=0 THEN
    v_parts := jsonb_build_array(jsonb_build_object('client_id',v_primary,'ownership_percentage',100));
  END IF;
  RETURN QUERY SELECT s.client_id, s.ownership_percentage, s.share_amount FROM public._haras_split_largest_remainder(_amount, v_parts) s;
END $function$
;

CREATE OR REPLACE FUNCTION public.preview_monthly_payroll(_unit_id uuid, _period date)
 RETURNS TABLE(employee_id uuid, employee_name text, base_salary numeric, transport numeric, meal numeric, inss numeric, fgts numeric, other numeric, net_amount numeric, already_generated boolean, existing_payable_id uuid)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_period date := date_trunc('month', _period)::date;
BEGIN
  IF _unit_id IS NULL THEN RAISE EXCEPTION 'Unidade obrigatória'; END IF;
  IF NOT public.can_access_unit(auth.uid(), _unit_id) THEN RAISE EXCEPTION 'Sem permissão' USING ERRCODE='42501'; END IF;
  IF NOT public.has_permission(auth.uid(), 'payables'::app_module, 'view'::permission_action) THEN
    RAISE EXCEPTION 'Sem permissão' USING ERRCODE='42501';
  END IF;

  RETURN QUERY
  SELECT
    e.id,
    e.full_name,
    COALESCE(e.default_base_salary,0)::numeric,
    COALESCE(e.default_transport,0)::numeric,
    COALESCE(e.default_meal,0)::numeric,
    COALESCE(e.default_inss,0)::numeric,
    COALESCE(e.default_fgts,0)::numeric,
    COALESCE(e.default_other,0)::numeric,
    GREATEST(
      COALESCE(e.default_base_salary,0) + COALESCE(e.default_transport,0) + COALESCE(e.default_meal,0)
      - COALESCE(e.default_inss,0) - COALESCE(e.default_fgts,0) - COALESCE(e.default_other,0),
      0
    )::numeric,
    (existing.id IS NOT NULL),
    existing.id
  FROM public.employees e
  LEFT JOIN public.payables existing
    ON existing.employee_id = e.id AND existing.payroll_period = v_period
  WHERE e.business_unit_id = _unit_id AND e.is_active = true
  ORDER BY e.full_name;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.recalc_sale_installments(_sale_id uuid, _new_installments_count integer, _new_first_due_date date)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_sale public.animal_sales%ROWTYPE; v_paid_sum numeric; v_remain numeric;
  v_total_cents bigint; v_per_cents bigint; v_rem_cents bigint; v_i int;
  v_amount numeric; v_due date; v_recv_id uuid; v_max_num int;
BEGIN
  SELECT * INTO v_sale FROM public.animal_sales WHERE id=_sale_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Venda não encontrada'; END IF;
  IF NOT public.has_permission(auth.uid(),'sales'::app_module,'edit'::permission_action) OR NOT public.can_access_unit(auth.uid(),v_sale.business_unit_id) THEN
    RAISE EXCEPTION 'Sem permissão' USING ERRCODE='42501'; END IF;
  DELETE FROM public.receivables WHERE id IN (SELECT receivable_id FROM public.sale_installments WHERE sale_id=_sale_id AND status<>'paid' AND installment_number>=1 AND receivable_id IS NOT NULL);
  DELETE FROM public.sale_installments WHERE sale_id=_sale_id AND status<>'paid' AND installment_number>=1;
  SELECT COALESCE(SUM(amount),0) INTO v_paid_sum FROM public.sale_installments WHERE sale_id=_sale_id AND status='paid';
  v_remain := v_sale.total_amount - v_paid_sum;
  IF v_remain <= 0 THEN RETURN; END IF;
  IF _new_installments_count < 1 THEN RAISE EXCEPTION 'Parcelas inválidas'; END IF;
  SELECT COALESCE(MAX(installment_number),0) INTO v_max_num FROM public.sale_installments WHERE sale_id=_sale_id;
  v_total_cents := round(v_remain * 100)::bigint;
  v_per_cents := v_total_cents / _new_installments_count;
  v_rem_cents := v_total_cents - (v_per_cents * _new_installments_count);
  FOR v_i IN 1.._new_installments_count LOOP
    v_amount := v_per_cents::numeric / 100;
    IF v_i = _new_installments_count THEN v_amount := v_amount + (v_rem_cents::numeric / 100); END IF;
    v_due := (_new_first_due_date + ((v_i - 1) || ' months')::interval)::date;
    INSERT INTO public.receivables (business_unit_id, client_id, description, amount, due_date, status, created_by)
    VALUES (v_sale.business_unit_id, v_sale.buyer_client_id, 'Venda animal (recalc) - sale:'||_sale_id, v_amount, v_due, 'pending', auth.uid())
    RETURNING id INTO v_recv_id;
    INSERT INTO public.sale_installments (sale_id, installment_number, due_date, amount, receivable_id)
    VALUES (_sale_id, v_max_num + v_i, v_due, v_amount, v_recv_id);
  END LOOP;
  UPDATE public.animal_sales SET installments_count=v_max_num+_new_installments_count, first_due_date=COALESCE(first_due_date,_new_first_due_date), updated_at=now() WHERE id=_sale_id;
END $function$
;

CREATE OR REPLACE FUNCTION public.recalc_sale_installments_custom(_sale_id uuid, _installments jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_sale public.animal_sales%ROWTYPE;
  v_paid_sum numeric;
  v_remain numeric;
  v_sum_check numeric;
  v_max_num int;
  r jsonb;
  v_recv_id uuid;
BEGIN
  SELECT * INTO v_sale FROM public.animal_sales WHERE id = _sale_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Venda não encontrada'; END IF;
  IF NOT public.has_permission(auth.uid(),'sales'::app_module,'edit'::permission_action) OR NOT public.can_access_unit(auth.uid(), v_sale.business_unit_id) THEN
    RAISE EXCEPTION 'Sem permissão' USING ERRCODE='42501'; END IF;

  -- Limpa parcelas pendentes (mantém entrada nº 0 e pagas)
  DELETE FROM public.receivables
    WHERE id IN (SELECT receivable_id FROM public.sale_installments
                 WHERE sale_id = _sale_id AND status <> 'paid' AND installment_number >= 1 AND receivable_id IS NOT NULL);
  DELETE FROM public.sale_installments
    WHERE sale_id = _sale_id AND status <> 'paid' AND installment_number >= 1;

  SELECT COALESCE(SUM(amount),0) INTO v_paid_sum FROM public.sale_installments WHERE sale_id = _sale_id AND status = 'paid';
  v_remain := v_sale.total_amount - v_paid_sum;
  IF v_remain <= 0 THEN RETURN; END IF;

  IF _installments IS NULL OR jsonb_typeof(_installments) <> 'array' OR jsonb_array_length(_installments) = 0 THEN
    RAISE EXCEPTION 'Lista de parcelas vazia';
  END IF;

  SELECT COALESCE(sum((x->>'amount')::numeric),0) INTO v_sum_check FROM jsonb_array_elements(_installments) x;
  IF round(v_sum_check * 100) <> round(v_remain * 100) THEN
    RAISE EXCEPTION 'Soma das parcelas (%) difere do saldo restante (%)', v_sum_check, v_remain;
  END IF;

  SELECT COALESCE(MAX(installment_number),0) INTO v_max_num FROM public.sale_installments WHERE sale_id = _sale_id;

  FOR r IN SELECT * FROM jsonb_array_elements(_installments) LOOP
    IF (r->>'amount')::numeric <= 0 THEN RAISE EXCEPTION 'Parcela com valor inválido'; END IF;
    IF (r->>'due_date')::date < v_sale.sale_date THEN RAISE EXCEPTION 'Vencimento anterior à venda'; END IF;

    v_max_num := v_max_num + 1;
    INSERT INTO public.receivables (business_unit_id, client_id, description, amount, due_date, status, created_by)
    VALUES (v_sale.business_unit_id, v_sale.buyer_client_id,
            'Venda animal (recalc) - sale:'||_sale_id,
            (r->>'amount')::numeric, (r->>'due_date')::date, 'pending', auth.uid())
    RETURNING id INTO v_recv_id;
    INSERT INTO public.sale_installments (sale_id, installment_number, due_date, amount, receivable_id)
    VALUES (_sale_id, v_max_num, (r->>'due_date')::date, (r->>'amount')::numeric, v_recv_id);
  END LOOP;

  UPDATE public.animal_sales
    SET installments_count = v_max_num,
        first_due_date = LEAST(first_due_date, (SELECT MIN((x->>'due_date')::date) FROM jsonb_array_elements(_installments) x)),
        updated_at = now()
    WHERE id = _sale_id;
END $function$
;

CREATE OR REPLACE FUNCTION public.recompute_animal_transaction_shares(_tx_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_bu uuid;
BEGIN
  SELECT business_unit_id INTO v_bu FROM public.haras_animal_transactions WHERE id=_tx_id;
  IF v_bu IS NULL THEN RAISE EXCEPTION 'Lançamento não encontrado'; END IF;
  IF NOT public.can_access_unit(auth.uid(), v_bu) THEN RAISE EXCEPTION 'Sem permissão'; END IF;
  PERFORM public._haras_regenerate_shares(_tx_id);
END $function$
;

CREATE OR REPLACE FUNCTION public.reconcile_transaction(_transaction_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_tx public.transactions%ROWTYPE;
BEGIN
  SELECT * INTO v_tx FROM public.transactions WHERE id=_transaction_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Transação não encontrada'; END IF;
  IF NOT public.can_access_unit(auth.uid(), v_tx.business_unit_id) THEN RAISE EXCEPTION 'Sem permissão' USING ERRCODE='42501'; END IF;
  IF v_tx.bank_account_id IS NULL THEN RAISE EXCEPTION 'Transação sem conta bancária associada'; END IF;
  UPDATE public.transactions SET reconciled_at=now(), reconciled_by=auth.uid(), updated_at=now() WHERE id=_transaction_id;
END $function$
;

CREATE OR REPLACE FUNCTION public.renegotiate_bank_contract(_payload jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_from_id uuid := (_payload->>'from_contract_id')::uuid;
  v_new_payload jsonb := _payload->'new_contract';
  v_bu uuid;
  v_status public.bank_contract_status;
  v_cancelled int;
  v_new_id uuid;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Não autenticado' USING ERRCODE='42501'; END IF;
  IF v_from_id IS NULL THEN RAISE EXCEPTION 'Contrato de origem obrigatório'; END IF;
  IF v_new_payload IS NULL THEN RAISE EXCEPTION 'Dados do novo contrato obrigatórios'; END IF;

  PERFORM pg_advisory_xact_lock(hashtext(v_from_id::text));

  SELECT business_unit_id, status INTO v_bu, v_status
    FROM public.bank_contracts WHERE id = v_from_id FOR UPDATE;

  IF v_bu IS NULL THEN RAISE EXCEPTION 'Contrato de origem não encontrado'; END IF;
  IF v_status <> 'active' THEN RAISE EXCEPTION 'Somente contratos ativos podem ser renegociados'; END IF;

  IF NOT public.has_permission(v_uid,'bank_contracts'::app_module,'edit'::permission_action)
     OR NOT public.can_access_unit(v_uid, v_bu) THEN
    RAISE EXCEPTION 'Sem permissão' USING ERRCODE='42501';
  END IF;

  -- Força mesma BU (evita spoofing)
  v_new_payload := jsonb_set(v_new_payload, '{business_unit_id}', to_jsonb(v_bu::text));

  -- 1) Cancela parcelas pendentes do antigo
  WITH upd AS (
    UPDATE public.payables
       SET status = 'cancelled',
           notes = COALESCE(notes || E'\n','') || '[Cancelada por renegociação de contrato em ' || CURRENT_DATE || ']'
     WHERE bank_contract_id = v_from_id AND status = 'pending'
     RETURNING 1
  ) SELECT COUNT(*) INTO v_cancelled FROM upd;

  -- 2) Marca antigo como renegotiated
  UPDATE public.bank_contracts
     SET status = 'renegotiated', settled_at = now()
   WHERE id = v_from_id;

  -- 3) Cria novo contrato vinculado
  v_new_id := public._create_bank_contract_impl(v_new_payload, v_from_id);

  INSERT INTO public.audit_log (user_id, action, entity, entity_id, business_unit_id, payload)
  VALUES (v_uid, 'bank_contract.renegotiate', 'bank_contract', v_from_id, v_bu,
          jsonb_build_object(
            'from_id', v_from_id,
            'new_id', v_new_id,
            'payables_cancelled_count', v_cancelled
          ));

  RETURN v_new_id;
END $function$
;

CREATE OR REPLACE FUNCTION public.renegotiate_sale_installment(_installment_id uuid, _new_installments jsonb)
 RETURNS SETOF sale_installments
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_original public.sale_installments%ROWTYPE;
  v_sale public.animal_sales%ROWTYPE;
  v_row jsonb;
  v_next_num integer;
  v_sum numeric := 0;
BEGIN
  SELECT * INTO v_original FROM public.sale_installments WHERE id = _installment_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Parcela não encontrada'; END IF;
  IF v_original.status = 'paid' THEN RAISE EXCEPTION 'Não é possível renegociar uma parcela já paga'; END IF;
  IF v_original.status = 'renegotiated' THEN RAISE EXCEPTION 'Parcela já foi renegociada'; END IF;

  SELECT * INTO v_sale FROM public.animal_sales WHERE id = v_original.sale_id;
  IF NOT public.can_access_unit(auth.uid(), v_sale.business_unit_id) THEN
    RAISE EXCEPTION 'Sem permissão para esta unidade';
  END IF;
  IF v_sale.status = 'cancelled' THEN
    RAISE EXCEPTION 'Não é possível renegociar parcela de venda cancelada';
  END IF;

  IF jsonb_array_length(_new_installments) < 1 THEN
    RAISE EXCEPTION 'Informe ao menos 1 nova parcela';
  END IF;
  FOR v_row IN SELECT * FROM jsonb_array_elements(_new_installments) LOOP
    IF (v_row->>'amount')::numeric <= 0 THEN
      RAISE EXCEPTION 'Todas as parcelas devem ter valor > 0';
    END IF;
    v_sum := v_sum + (v_row->>'amount')::numeric;
  END LOOP;

  IF ABS(v_sum - v_original.amount) > 0.01 THEN
    RAISE EXCEPTION 'Soma das novas parcelas (%) difere do valor original (%)', v_sum, v_original.amount;
  END IF;

  UPDATE public.sale_installments
    SET status = 'renegotiated', updated_at = now()
    WHERE id = _installment_id;

  SELECT COALESCE(MAX(installment_number), 0) INTO v_next_num
    FROM public.sale_installments WHERE sale_id = v_original.sale_id;

  FOR v_row IN SELECT * FROM jsonb_array_elements(_new_installments) LOOP
    v_next_num := v_next_num + 1;
    INSERT INTO public.sale_installments(
      sale_id, installment_number, due_date, amount, status, parent_installment_id
    ) VALUES (
      v_original.sale_id, v_next_num, (v_row->>'due_date')::date,
      (v_row->>'amount')::numeric, 'pending', _installment_id
    );
  END LOOP;

  INSERT INTO public.audit_log(entity, entity_id, action, business_unit_id, user_id, payload)
  VALUES (
    'sale_installments', _installment_id, 'renegotiate_sale_installment',
    v_sale.business_unit_id, auth.uid(),
    jsonb_build_object(
      'original', jsonb_build_object('amount', v_original.amount, 'due_date', v_original.due_date),
      'new_installments', _new_installments
    )
  );

  RETURN QUERY
    SELECT * FROM public.sale_installments
    WHERE parent_installment_id = _installment_id
    ORDER BY installment_number;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.reopen_receivable(_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  PERFORM set_config('haras.bypass_close_lock', 'on', true);
  UPDATE public.receivables SET closed_at = NULL WHERE id = _id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Recebível % não encontrado ou sem permissão', _id USING ERRCODE = 'P0002'; END IF;
END; $function$
;

CREATE OR REPLACE FUNCTION public.reopen_transaction(_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  PERFORM set_config('haras.bypass_close_lock', 'on', true);
  UPDATE public.transactions SET closed_at = NULL WHERE id = _id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Transação % não encontrada ou sem permissão', _id USING ERRCODE = 'P0002'; END IF;
END; $function$
;

CREATE OR REPLACE FUNCTION public.replace_animal_partners(_animal_id uuid, _partners jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.haras_animals WHERE id = _animal_id) THEN
    RAISE EXCEPTION 'Animal não encontrado ou sem permissão';
  END IF;
  DELETE FROM public.haras_animal_partners WHERE animal_id = _animal_id;
  IF jsonb_array_length(COALESCE(_partners, '[]'::jsonb)) > 0 THEN
    INSERT INTO public.haras_animal_partners (animal_id, client_id, ownership_percentage)
    SELECT _animal_id, (p->>'client_id')::uuid, (p->>'ownership_percentage')::numeric
      FROM jsonb_array_elements(_partners) p;
  END IF;
END; $function$
;

CREATE OR REPLACE FUNCTION public.report_payroll_by_employee(_unit_id uuid, _start_date date, _end_date date)
 RETURNS TABLE(employee_id uuid, employee_name text, business_unit_id uuid, business_unit_name text, total_gross numeric, total_credits numeric, total_debits numeric, total_net numeric, entries_count integer)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF _start_date IS NULL OR _end_date IS NULL THEN
    RAISE EXCEPTION 'Datas obrigatórias';
  END IF;
  IF _end_date < _start_date THEN
    RAISE EXCEPTION 'Data final anterior à inicial';
  END IF;
  IF (_end_date - _start_date) > 366 THEN
    RAISE EXCEPTION 'Período máximo de 366 dias';
  END IF;

  RETURN QUERY
  WITH src AS (
    SELECT
      p.employee_id,
      e.full_name AS employee_name,
      p.business_unit_id,
      bu.name AS business_unit_name,
      p.amount,
      p.payroll_breakdown,
      CASE
        WHEN p.payroll_breakdown IS NOT NULL
             AND jsonb_typeof(p.payroll_breakdown->'items') = 'array'
        THEN COALESCE((
          SELECT SUM((item->>'amount')::numeric)
          FROM jsonb_array_elements(p.payroll_breakdown->'items') item
          WHERE item->>'kind' = 'credit'
        ), 0)
        ELSE p.amount
      END AS credits,
      CASE
        WHEN p.payroll_breakdown IS NOT NULL
             AND jsonb_typeof(p.payroll_breakdown->'items') = 'array'
        THEN COALESCE((
          SELECT SUM((item->>'amount')::numeric)
          FROM jsonb_array_elements(p.payroll_breakdown->'items') item
          WHERE item->>'kind' = 'debit'
        ), 0)
        ELSE 0
      END AS debits
    FROM public.payables p
    JOIN public.employees e ON e.id = p.employee_id
    JOIN public.business_units bu ON bu.id = p.business_unit_id
    WHERE p.employee_id IS NOT NULL
      AND p.due_date BETWEEN _start_date AND _end_date
      AND (_unit_id IS NULL OR p.business_unit_id = _unit_id)
      AND public.can_access_unit(auth.uid(), p.business_unit_id)
      AND public.has_permission(auth.uid(), 'payables'::app_module, 'view'::permission_action)
  )
  SELECT
    src.employee_id,
    src.employee_name,
    src.business_unit_id,
    src.business_unit_name,
    ROUND(SUM(src.credits)::numeric, 2) AS total_gross,
    ROUND(SUM(src.credits)::numeric, 2) AS total_credits,
    ROUND(SUM(src.debits)::numeric, 2) AS total_debits,
    ROUND(SUM(src.credits - src.debits)::numeric, 2) AS total_net,
    COUNT(*)::int AS entries_count
  FROM src
  GROUP BY src.employee_id, src.employee_name, src.business_unit_id, src.business_unit_name
  ORDER BY src.business_unit_name, src.employee_name;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.repro_cancel_breeding(p_session_id uuid, p_reason text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_sess haras_breeding_sessions%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'UNAUTHENTICATED'; END IF;
  IF p_reason IS NULL OR length(trim(p_reason)) = 0 THEN RAISE EXCEPTION 'BREEDING_REASON_REQUIRED'; END IF;

  SELECT * INTO v_sess FROM haras_breeding_sessions WHERE id = p_session_id FOR UPDATE;
  IF v_sess.id IS NULL THEN RAISE EXCEPTION 'BREEDING_SESSION_NOT_FOUND'; END IF;
  IF NOT (is_admin(v_uid) OR can_access_unit(v_uid, v_sess.business_unit_id)) THEN
    RAISE EXCEPTION 'FORBIDDEN_UNIT';
  END IF;
  IF v_sess.status <> 'agendado' THEN RAISE EXCEPTION 'BREEDING_ONLY_SCHEDULED_CAN_CANCEL'; END IF;

  PERFORM set_config('haras.breeding_bypass', 'on', true);
  UPDATE haras_breeding_sessions
     SET status = 'cancelado', cancel_reason = p_reason
   WHERE id = p_session_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.repro_cancel_embryo_transfer(p_transfer_id uuid, p_reason text)
 RETURNS TABLE(embryo_id uuid, embryo_status repro_embryo_status)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_bu uuid; v_embryo uuid; v_cancelled timestamptz; v_outcome public.repro_embryo_outcome;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sem autenticação'; END IF;
  IF p_reason IS NULL OR btrim(p_reason) = '' THEN RAISE EXCEPTION 'Motivo obrigatório'; END IF;

  SELECT business_unit_id, embryo_id, cancelled_at, outcome
    INTO v_bu, v_embryo, v_cancelled, v_outcome
    FROM public.haras_embryo_transfers WHERE id = p_transfer_id FOR UPDATE;
  IF v_bu IS NULL THEN RAISE EXCEPTION 'Transferência não encontrada'; END IF;

  IF NOT (public.is_admin(auth.uid()) OR public.can_access_unit(auth.uid(), v_bu)) THEN
    RAISE EXCEPTION 'Sem acesso à unidade';
  END IF;

  IF v_cancelled IS NOT NULL THEN RAISE EXCEPTION 'Transferência já cancelada'; END IF;
  IF v_outcome <> 'pendente' THEN RAISE EXCEPTION 'Só é possível cancelar transferências pendentes'; END IF;

  UPDATE public.haras_embryo_transfers
    SET cancelled_at = now(), cancelled_by = auth.uid(), cancel_reason = p_reason
    WHERE id = p_transfer_id;

  UPDATE public.haras_embryos SET status = 'disponivel' WHERE id = v_embryo;

  RETURN QUERY SELECT v_embryo, 'disponivel'::public.repro_embryo_status;
END $function$
;

CREATE OR REPLACE FUNCTION public.repro_cancel_pregnancy(p_pregnancy_id uuid, p_reason text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_preg haras_pregnancies%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'UNAUTHENTICATED'; END IF;
  IF p_reason IS NULL OR length(trim(p_reason)) = 0 THEN RAISE EXCEPTION 'PREGNANCY_REASON_REQUIRED'; END IF;

  SELECT * INTO v_preg FROM haras_pregnancies WHERE id = p_pregnancy_id FOR UPDATE;
  IF v_preg.id IS NULL THEN RAISE EXCEPTION 'PREGNANCY_NOT_FOUND'; END IF;
  IF NOT (is_admin(v_uid) OR can_access_unit(v_uid, v_preg.business_unit_id)) THEN
    RAISE EXCEPTION 'FORBIDDEN_UNIT';
  END IF;
  IF v_preg.status NOT IN ('em_andamento','confirmada') THEN
    RAISE EXCEPTION 'PREGNANCY_NOT_ACTIVE';
  END IF;

  PERFORM set_config('haras.pregnancy_bypass', 'on', true);
  UPDATE haras_pregnancies
     SET status = 'cancelada',
         outcome_date = CURRENT_DATE,
         outcome_notes = 'Cancelada: ' || p_reason
   WHERE id = p_pregnancy_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.repro_close_pregnancy(p_pregnancy_id uuid, p_outcome repro_pregnancy_status, p_outcome_date date, p_offspring_animal_id uuid DEFAULT NULL::uuid, p_notes text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_preg haras_pregnancies%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'UNAUTHENTICATED'; END IF;
  IF p_outcome NOT IN ('concluida','abortada','perdida') THEN
    RAISE EXCEPTION 'PREGNANCY_INVALID_OUTCOME';
  END IF;

  SELECT * INTO v_preg FROM haras_pregnancies WHERE id = p_pregnancy_id FOR UPDATE;
  IF v_preg.id IS NULL THEN RAISE EXCEPTION 'PREGNANCY_NOT_FOUND'; END IF;
  IF NOT (is_admin(v_uid) OR can_access_unit(v_uid, v_preg.business_unit_id)) THEN
    RAISE EXCEPTION 'FORBIDDEN_UNIT';
  END IF;
  IF v_preg.status NOT IN ('em_andamento','confirmada') THEN
    RAISE EXCEPTION 'PREGNANCY_NOT_ACTIVE';
  END IF;
  IF p_outcome = 'concluida' AND p_offspring_animal_id IS NULL THEN
    RAISE EXCEPTION 'PREGNANCY_OFFSPRING_REQUIRED';
  END IF;

  PERFORM set_config('haras.pregnancy_bypass', 'on', true);
  UPDATE haras_pregnancies
     SET status = p_outcome,
         outcome_date = p_outcome_date,
         outcome_notes = COALESCE(p_notes, outcome_notes),
         offspring_animal_id = COALESCE(p_offspring_animal_id, offspring_animal_id)
   WHERE id = p_pregnancy_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.repro_consume_semen(p_batch_id uuid, p_doses integer, p_reason repro_movement_reason, p_ref_type text DEFAULT NULL::text, p_ref_id uuid DEFAULT NULL::uuid, p_notes text DEFAULT NULL::text, p_idempotency_key text DEFAULT NULL::text)
 RETURNS TABLE(movement_id uuid, reused boolean, doses_available_after integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_bu uuid;
  v_avail int;
  v_mov_id uuid;
  v_existing_doses int;
  v_existing_reason public.repro_movement_reason;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'auth required';
  END IF;

  IF p_doses IS NULL OR p_doses < 1 OR p_doses > 10000 THEN
    RAISE EXCEPTION 'doses inválidas (permitido 1..10000)';
  END IF;

  IF p_reason IN ('coleta','estorno') THEN
    RAISE EXCEPTION 'reason % inválido para consumo', p_reason;
  END IF;

  SELECT business_unit_id, doses_available
    INTO v_bu, v_avail
  FROM public.haras_semen_batches
  WHERE id = p_batch_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'partida não encontrada';
  END IF;

  IF NOT (public.is_admin(v_uid) OR public.can_access_unit(v_uid, v_bu)) THEN
    RAISE EXCEPTION 'sem acesso à unidade';
  END IF;

  -- Idempotência
  IF p_idempotency_key IS NOT NULL THEN
    SELECT id, doses, reason
      INTO v_mov_id, v_existing_doses, v_existing_reason
    FROM public.haras_semen_movements
    WHERE batch_id = p_batch_id AND idempotency_key = p_idempotency_key;

    IF FOUND THEN
      IF v_existing_doses <> p_doses OR v_existing_reason <> p_reason THEN
        RAISE EXCEPTION 'idempotency_key conflita com movimento existente';
      END IF;
      RETURN QUERY
        SELECT v_mov_id, true, b.doses_available
        FROM public.haras_semen_batches b
        WHERE b.id = p_batch_id;
      RETURN;
    END IF;
  END IF;

  IF v_avail < p_doses THEN
    RAISE EXCEPTION 'estoque insuficiente (disponível=%, pedido=%)', v_avail, p_doses;
  END IF;

  INSERT INTO public.haras_semen_movements(
    business_unit_id, batch_id, kind, reason, doses,
    ref_type, ref_id, notes, idempotency_key, created_by
  ) VALUES (
    v_bu, p_batch_id, 'out', p_reason, p_doses,
    p_ref_type, p_ref_id, p_notes, p_idempotency_key, v_uid
  )
  RETURNING id INTO v_mov_id;

  RETURN QUERY
    SELECT v_mov_id, false, b.doses_available
    FROM public.haras_semen_batches b
    WHERE b.id = p_batch_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.repro_discard_embryo(p_embryo_id uuid, p_reason text, p_notes text DEFAULT NULL::text)
 RETURNS repro_embryo_status
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_bu uuid; v_status public.repro_embryo_status;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sem autenticação'; END IF;
  IF p_reason IS NULL OR btrim(p_reason) = '' THEN RAISE EXCEPTION 'Motivo obrigatório'; END IF;

  SELECT business_unit_id, status INTO v_bu, v_status
    FROM public.haras_embryos WHERE id = p_embryo_id FOR UPDATE;
  IF v_bu IS NULL THEN RAISE EXCEPTION 'Embrião não encontrado'; END IF;

  IF NOT (public.is_admin(auth.uid()) OR public.can_access_unit(auth.uid(), v_bu)) THEN
    RAISE EXCEPTION 'Sem acesso à unidade';
  END IF;

  IF v_status <> 'disponivel' THEN
    RAISE EXCEPTION 'Transição inválida: embrião está %', v_status;
  END IF;

  UPDATE public.haras_embryos
    SET status = 'descartado',
        notes = COALESCE(notes || E'\n', '') || 'Descarte: ' || p_reason || COALESCE(' — ' || p_notes, '')
    WHERE id = p_embryo_id;

  RETURN 'descartado';
END $function$
;

CREATE OR REPLACE FUNCTION public.repro_perform_breeding(p_session_id uuid, p_performed_at timestamp with time zone DEFAULT NULL::timestamp with time zone, p_notes text DEFAULT NULL::text)
 RETURNS TABLE(session_id uuid, semen_movement_id uuid, embryo_transfer_id uuid, reused boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_sess haras_breeding_sessions%ROWTYPE;
  v_ideam text;
  v_movement_id uuid;
  v_transfer_id uuid;
  v_reused boolean := false;
  v_perf_at timestamptz := COALESCE(p_performed_at, now());
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'UNAUTHENTICATED'; END IF;

  SELECT * INTO v_sess FROM haras_breeding_sessions WHERE id = p_session_id FOR UPDATE;
  IF v_sess.id IS NULL THEN RAISE EXCEPTION 'BREEDING_SESSION_NOT_FOUND'; END IF;
  IF NOT (is_admin(v_uid) OR can_access_unit(v_uid, v_sess.business_unit_id)) THEN
    RAISE EXCEPTION 'FORBIDDEN_UNIT';
  END IF;
  IF v_sess.status <> 'agendado' THEN RAISE EXCEPTION 'BREEDING_NOT_SCHEDULED'; END IF;

  PERFORM set_config('haras.breeding_bypass', 'on', true);

  IF v_sess.method IN ('ia_fresco','ia_refrigerado','ia_congelado') THEN
    v_ideam := 'breeding:' || v_sess.id::text || ':' || (v_sess.perform_attempts + 1)::text;
    SELECT c.movement_id, c.reused INTO v_movement_id, v_reused
    FROM repro_consume_semen(
      v_sess.semen_batch_id, v_sess.doses_used, 'ia'::repro_movement_reason,
      'breeding_session', v_sess.id, p_notes, v_ideam
    ) c;
  ELSIF v_sess.method = 'te' THEN
    SELECT t.transfer_id INTO v_transfer_id
    FROM repro_transfer_embryo(v_sess.embryo_id, v_sess.mare_id, v_perf_at, p_notes) t;
  END IF;

  UPDATE haras_breeding_sessions
     SET status = 'realizado',
         performed_at = v_perf_at,
         semen_movement_id = COALESCE(v_movement_id, semen_movement_id),
         embryo_transfer_id = COALESCE(v_transfer_id, embryo_transfer_id),
         perform_attempts = perform_attempts + 1,
         notes = COALESCE(p_notes, notes)
   WHERE id = p_session_id;

  session_id := p_session_id;
  semen_movement_id := v_movement_id;
  embryo_transfer_id := v_transfer_id;
  reused := v_reused;
  RETURN NEXT;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.repro_register_birth(p_pregnancy_id uuid, p_birth_date date, p_foal_name text, p_foal_sex text, p_animal_type text DEFAULT 'equino'::text, p_registration_code text DEFAULT NULL::text, p_notes text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_preg record;
  v_bio_mare_id uuid;
  v_mare_name text;
  v_stallion_name text;
  v_donor_name text;
  v_client_id uuid;
  v_foal_id uuid;
  v_notes text;
BEGIN
  IF p_pregnancy_id IS NULL OR p_birth_date IS NULL OR p_foal_name IS NULL OR p_foal_sex IS NULL THEN
    RAISE EXCEPTION 'missing_required_fields';
  END IF;

  SELECT * INTO v_preg FROM public.haras_pregnancies
    WHERE id = p_pregnancy_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'pregnancy_not_found'; END IF;

  IF NOT public.can_access_unit(auth.uid(), v_preg.business_unit_id) THEN
    RAISE EXCEPTION 'forbidden_business_unit';
  END IF;

  IF v_preg.status NOT IN ('em_andamento','confirmada') THEN
    RAISE EXCEPTION 'pregnancy_not_active';
  END IF;

  IF p_birth_date > CURRENT_DATE THEN RAISE EXCEPTION 'birth_in_future'; END IF;
  IF p_birth_date < v_preg.conception_date THEN RAISE EXCEPTION 'birth_before_conception'; END IF;
  IF p_birth_date > v_preg.conception_date + v_preg.gestation_days + 60 THEN
    RAISE EXCEPTION 'birth_out_of_gestation_window';
  END IF;

  v_bio_mare_id := COALESCE(v_preg.donor_mare_id, v_preg.mare_id);

  SELECT primary_client_id, name INTO v_client_id, v_mare_name
    FROM public.haras_animals WHERE id = v_bio_mare_id;
  IF v_client_id IS NULL THEN RAISE EXCEPTION 'mare_missing_primary_client'; END IF;

  IF v_preg.stallion_id IS NOT NULL THEN
    SELECT name INTO v_stallion_name FROM public.haras_animals WHERE id = v_preg.stallion_id;
  END IF;
  IF v_preg.donor_mare_id IS NOT NULL THEN
    SELECT name INTO v_donor_name FROM public.haras_animals WHERE id = v_preg.donor_mare_id;
  END IF;

  v_notes := 'Nascimento — Mãe: ' || COALESCE(v_mare_name,'?')
    || ' | Pai: ' || COALESCE(v_stallion_name,'?')
    || CASE WHEN v_donor_name IS NOT NULL THEN ' | Doadora: ' || v_donor_name ELSE '' END
    || CASE WHEN p_notes IS NOT NULL AND length(p_notes)>0 THEN E'\n' || p_notes ELSE '' END;

  EXECUTE format(
    'INSERT INTO public.haras_animals (business_unit_id,name,animal_type,sex,birth_date,entry_date,status,primary_client_id,owner_share_percentage,origin,registration_code,notes,created_by)
     VALUES ($1,$2,$3,$4::%s,$5,$5,''active'',$6,100,''nascimento'',$7,$8,$9) RETURNING id',
     (SELECT format_type(atttypid, atttypmod) FROM pg_attribute WHERE attrelid='public.haras_animals'::regclass AND attname='sex')
  )
  INTO v_foal_id
  USING v_preg.business_unit_id, p_foal_name, COALESCE(p_animal_type,'equino'),
        p_foal_sex, p_birth_date, v_client_id, p_registration_code, v_notes, auth.uid();

  PERFORM set_config('haras.pregnancy_bypass','on', true);
  UPDATE public.haras_pregnancies
    SET status = 'concluida',
        outcome_date = p_birth_date,
        outcome_notes = COALESCE(NULLIF(outcome_notes,''), '') ||
          CASE WHEN outcome_notes IS NOT NULL AND length(outcome_notes)>0 THEN E'\n' ELSE '' END
          || 'Parto registrado' || CASE WHEN p_notes IS NOT NULL THEN ': ' || p_notes ELSE '' END,
        offspring_animal_id = v_foal_id,
        updated_at = now()
    WHERE id = p_pregnancy_id;
  PERFORM set_config('haras.pregnancy_bypass','off', true);

  RETURN jsonb_build_object('pregnancy_id', p_pregnancy_id, 'offspring_animal_id', v_foal_id);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.repro_register_diagnostic(p_pregnancy_id uuid, p_diagnosed_at timestamp with time zone, p_method repro_diagnostic_method, p_result repro_diagnostic_result, p_observed_days integer DEFAULT NULL::integer, p_notes text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_preg haras_pregnancies%ROWTYPE;
  v_id uuid;
  v_new_status repro_pregnancy_status;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'UNAUTHENTICATED'; END IF;

  SELECT * INTO v_preg FROM haras_pregnancies WHERE id = p_pregnancy_id FOR UPDATE;
  IF v_preg.id IS NULL THEN RAISE EXCEPTION 'PREGNANCY_NOT_FOUND'; END IF;
  IF NOT (is_admin(v_uid) OR can_access_unit(v_uid, v_preg.business_unit_id)) THEN
    RAISE EXCEPTION 'FORBIDDEN_UNIT';
  END IF;
  IF v_preg.status NOT IN ('em_andamento','confirmada') THEN
    RAISE EXCEPTION 'PREGNANCY_NOT_ACTIVE';
  END IF;

  INSERT INTO haras_pregnancy_diagnostics(
    pregnancy_id, business_unit_id, diagnosed_at, method, result,
    observed_days, notes, created_by
  ) VALUES (
    p_pregnancy_id, v_preg.business_unit_id, p_diagnosed_at, p_method, p_result,
    p_observed_days, p_notes, v_uid
  ) RETURNING id INTO v_id;

  v_new_status := v_preg.status;
  IF v_preg.status = 'em_andamento' AND p_result = 'positivo' THEN
    v_new_status := 'confirmada';
  ELSIF v_preg.status = 'confirmada' AND p_result IN ('reabsorcao','obito_fetal') THEN
    v_new_status := 'perdida';
  END IF;

  IF v_new_status <> v_preg.status THEN
    PERFORM set_config('haras.pregnancy_bypass', 'on', true);
    UPDATE haras_pregnancies
       SET status = v_new_status,
           outcome_date = CASE WHEN v_new_status = 'perdida' THEN p_diagnosed_at::date ELSE outcome_date END,
           outcome_notes = CASE WHEN v_new_status = 'perdida'
                                THEN COALESCE(outcome_notes || E'\n','') || 'Perda: ' || p_result::text
                                ELSE outcome_notes END
     WHERE id = p_pregnancy_id;
  END IF;

  RETURN v_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.repro_register_pregnancy(p_business_unit_id uuid, p_mare_id uuid, p_stallion_id uuid DEFAULT NULL::uuid, p_donor_mare_id uuid DEFAULT NULL::uuid, p_breeding_session_id uuid DEFAULT NULL::uuid, p_conception_date date DEFAULT NULL::date, p_gestation_days integer DEFAULT NULL::integer, p_notes text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_sess haras_breeding_sessions%ROWTYPE;
  v_mare uuid := p_mare_id;
  v_stallion uuid := p_stallion_id;
  v_conception date := COALESCE(p_conception_date, CURRENT_DATE);
  v_gd integer := p_gestation_days;
  v_id uuid;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'UNAUTHENTICATED'; END IF;
  IF NOT (is_admin(v_uid) OR can_access_unit(v_uid, p_business_unit_id)) THEN
    RAISE EXCEPTION 'FORBIDDEN_UNIT';
  END IF;

  IF p_breeding_session_id IS NOT NULL THEN
    SELECT * INTO v_sess FROM haras_breeding_sessions WHERE id = p_breeding_session_id FOR UPDATE;
    IF v_sess.id IS NULL THEN RAISE EXCEPTION 'PREGNANCY_SESSION_NOT_FOUND'; END IF;
    IF v_sess.business_unit_id <> p_business_unit_id THEN RAISE EXCEPTION 'PREGNANCY_SESSION_BU_MISMATCH'; END IF;
    IF v_sess.status <> 'realizado' THEN RAISE EXCEPTION 'PREGNANCY_SESSION_MUST_BE_REALIZED'; END IF;
    v_mare := COALESCE(v_mare, v_sess.mare_id);
    v_stallion := COALESCE(v_stallion, v_sess.stallion_id);
    IF v_sess.performed_at IS NOT NULL AND p_conception_date IS NULL THEN
      v_conception := v_sess.performed_at::date;
    END IF;
  END IF;

  IF v_gd IS NULL THEN
    SELECT default_gestation_days INTO v_gd FROM haras_reproduction_settings WHERE business_unit_id = p_business_unit_id;
    v_gd := COALESCE(v_gd, 340);
  END IF;

  PERFORM set_config('haras.pregnancy_bypass', 'on', true);
  INSERT INTO haras_pregnancies(
    business_unit_id, mare_id, stallion_id, donor_mare_id,
    breeding_session_id, conception_date, gestation_days,
    status, notes, created_by
  ) VALUES (
    p_business_unit_id, v_mare, v_stallion, p_donor_mare_id,
    p_breeding_session_id, v_conception, v_gd,
    'em_andamento', p_notes, v_uid
  ) RETURNING id INTO v_id;

  RETURN v_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.repro_revert_birth(p_pregnancy_id uuid, p_reason text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_preg record;
  v_foal_id uuid;
  v_deps int;
  v_new_status repro_pregnancy_status;
  v_has_positive boolean;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN
    RAISE EXCEPTION 'only_admin_can_revert_birth';
  END IF;
  IF p_reason IS NULL OR length(trim(p_reason)) = 0 THEN
    RAISE EXCEPTION 'reason_required';
  END IF;

  SELECT * INTO v_preg FROM public.haras_pregnancies WHERE id=p_pregnancy_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'pregnancy_not_found'; END IF;
  IF NOT public.can_access_unit(auth.uid(), v_preg.business_unit_id) THEN
    RAISE EXCEPTION 'forbidden_business_unit';
  END IF;
  IF v_preg.status <> 'concluida' OR v_preg.offspring_animal_id IS NULL THEN
    RAISE EXCEPTION 'pregnancy_not_birthed';
  END IF;

  v_foal_id := v_preg.offspring_animal_id;

  SELECT
    (SELECT count(*) FROM haras_animal_movements WHERE animal_id=v_foal_id)
   +(SELECT count(*) FROM haras_animal_transactions WHERE animal_id=v_foal_id)
   +(SELECT count(*) FROM haras_animal_weight_history WHERE animal_id=v_foal_id)
   +(SELECT count(*) FROM animal_sales WHERE animal_id=v_foal_id)
   +(SELECT count(*) FROM haras_animal_partners WHERE animal_id=v_foal_id)
   +(SELECT count(*) FROM haras_breeding_sessions WHERE mare_id=v_foal_id OR stallion_id=v_foal_id)
   +(SELECT count(*) FROM haras_semen_collections WHERE stallion_id=v_foal_id)
   +(SELECT count(*) FROM haras_pregnancies WHERE mare_id=v_foal_id OR donor_mare_id=v_foal_id OR stallion_id=v_foal_id)
  INTO v_deps;

  IF v_deps > 0 THEN RAISE EXCEPTION 'foal_has_dependencies'; END IF;

  SELECT EXISTS(SELECT 1 FROM haras_pregnancy_diagnostics
    WHERE pregnancy_id=p_pregnancy_id AND result='positivo') INTO v_has_positive;
  v_new_status := CASE WHEN v_has_positive THEN 'confirmada'::repro_pregnancy_status
                       ELSE 'em_andamento'::repro_pregnancy_status END;

  PERFORM set_config('haras.pregnancy_bypass','on', true);
  UPDATE public.haras_pregnancies
    SET status = v_new_status,
        outcome_date = NULL,
        offspring_animal_id = NULL,
        outcome_notes = COALESCE(outcome_notes,'') ||
          CASE WHEN outcome_notes IS NOT NULL AND length(outcome_notes)>0 THEN E'\n' ELSE '' END
          || 'Parto revertido: ' || p_reason,
        updated_at = now()
    WHERE id = p_pregnancy_id;
  PERFORM set_config('haras.pregnancy_bypass','off', true);

  DELETE FROM public.haras_animals WHERE id = v_foal_id;

  RETURN jsonb_build_object('pregnancy_id', p_pregnancy_id, 'deleted_animal_id', v_foal_id, 'new_status', v_new_status);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.repro_revert_performed_breeding(p_session_id uuid, p_reason text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_sess haras_breeding_sessions%ROWTYPE;
  v_mv_reversed uuid;
  v_tr_cancelled timestamptz;
  v_tr_outcome repro_embryo_outcome;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'UNAUTHENTICATED'; END IF;
  IF p_reason IS NULL OR length(trim(p_reason)) = 0 THEN RAISE EXCEPTION 'BREEDING_REASON_REQUIRED'; END IF;

  SELECT * INTO v_sess FROM haras_breeding_sessions WHERE id = p_session_id FOR UPDATE;
  IF v_sess.id IS NULL THEN RAISE EXCEPTION 'BREEDING_SESSION_NOT_FOUND'; END IF;
  IF NOT (is_admin(v_uid) OR can_access_unit(v_uid, v_sess.business_unit_id)) THEN
    RAISE EXCEPTION 'FORBIDDEN_UNIT';
  END IF;
  IF v_sess.status <> 'realizado' THEN RAISE EXCEPTION 'BREEDING_NOT_REALIZED'; END IF;

  IF v_sess.semen_movement_id IS NOT NULL THEN
    SELECT reversed_by INTO v_mv_reversed FROM haras_semen_movements WHERE id = v_sess.semen_movement_id;
    IF v_mv_reversed IS NULL THEN
      PERFORM repro_revert_semen_movement(v_sess.semen_movement_id, 'Reversão de cobertura: ' || p_reason);
    END IF;
  END IF;

  IF v_sess.embryo_transfer_id IS NOT NULL THEN
    SELECT cancelled_at, outcome INTO v_tr_cancelled, v_tr_outcome
      FROM haras_embryo_transfers WHERE id = v_sess.embryo_transfer_id;
    IF v_tr_cancelled IS NULL AND v_tr_outcome = 'pendente' THEN
      PERFORM repro_cancel_embryo_transfer(v_sess.embryo_transfer_id, 'Reversão de cobertura: ' || p_reason);
    END IF;
  END IF;

  PERFORM set_config('haras.breeding_bypass', 'on', true);
  UPDATE haras_breeding_sessions
     SET status = 'agendado',
         performed_at = NULL,
         semen_movement_id = NULL,
         embryo_transfer_id = NULL,
         cancel_reason = p_reason
   WHERE id = p_session_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.repro_revert_semen_movement(p_movement_id uuid, p_notes text DEFAULT NULL::text)
 RETURNS TABLE(reversal_id uuid, doses_available_after integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_bu uuid;
  v_batch uuid;
  v_kind public.repro_movement_kind;
  v_reason public.repro_movement_reason;
  v_doses int;
  v_reversed_by uuid;
  v_new uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'auth required';
  END IF;

  SELECT business_unit_id, batch_id, kind, reason, doses, reversed_by
    INTO v_bu, v_batch, v_kind, v_reason, v_doses, v_reversed_by
  FROM public.haras_semen_movements
  WHERE id = p_movement_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'movimento não encontrado';
  END IF;

  IF NOT (public.is_admin(v_uid) OR public.can_access_unit(v_uid, v_bu)) THEN
    RAISE EXCEPTION 'sem acesso à unidade';
  END IF;

  IF v_reversed_by IS NOT NULL THEN
    RAISE EXCEPTION 'movimento já estornado';
  END IF;
  IF v_kind = 'reversal' THEN
    RAISE EXCEPTION 'não é possível estornar um estorno';
  END IF;
  IF v_reason = 'coleta' THEN
    RAISE EXCEPTION 'não é possível estornar o movimento inicial da coleta';
  END IF;

  PERFORM 1 FROM public.haras_semen_batches WHERE id = v_batch FOR UPDATE;

  INSERT INTO public.haras_semen_movements(
    business_unit_id, batch_id, kind, reason, doses,
    ref_type, ref_id, notes, created_by
  ) VALUES (
    v_bu, v_batch, 'reversal', 'estorno', v_doses,
    'reversal_of', p_movement_id, p_notes, v_uid
  )
  RETURNING id INTO v_new;

  UPDATE public.haras_semen_movements
     SET reversed_by = v_new
   WHERE id = p_movement_id;

  RETURN QUERY
    SELECT v_new, b.doses_available
    FROM public.haras_semen_batches b
    WHERE b.id = v_batch;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.repro_schedule_breeding(p_business_unit_id uuid, p_mare_id uuid, p_stallion_id uuid, p_method repro_breeding_method, p_scheduled_at timestamp with time zone, p_semen_batch_id uuid DEFAULT NULL::uuid, p_doses_used integer DEFAULT NULL::integer, p_embryo_id uuid DEFAULT NULL::uuid, p_notes text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_id uuid;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'UNAUTHENTICATED'; END IF;
  IF NOT (is_admin(v_uid) OR can_access_unit(v_uid, p_business_unit_id)) THEN
    RAISE EXCEPTION 'FORBIDDEN_UNIT';
  END IF;
  PERFORM set_config('haras.breeding_bypass', 'on', true);
  INSERT INTO haras_breeding_sessions(
    business_unit_id, mare_id, stallion_id, method, scheduled_at,
    semen_batch_id, doses_used, embryo_id, notes, created_by, status
  ) VALUES (
    p_business_unit_id, p_mare_id, p_stallion_id, p_method, p_scheduled_at,
    p_semen_batch_id, p_doses_used, p_embryo_id, p_notes, v_uid, 'agendado'
  ) RETURNING id INTO v_id;
  RETURN v_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.repro_transfer_embryo(p_embryo_id uuid, p_recipient_mare_id uuid, p_transfer_date timestamp with time zone DEFAULT NULL::timestamp with time zone, p_notes text DEFAULT NULL::text)
 RETURNS TABLE(transfer_id uuid, embryo_status repro_embryo_status)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_bu uuid; v_status public.repro_embryo_status;
  v_tid uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sem autenticação'; END IF;

  SELECT business_unit_id, status INTO v_bu, v_status
    FROM public.haras_embryos WHERE id = p_embryo_id FOR UPDATE;
  IF v_bu IS NULL THEN RAISE EXCEPTION 'Embrião não encontrado'; END IF;

  IF NOT (public.is_admin(auth.uid()) OR public.can_access_unit(auth.uid(), v_bu)) THEN
    RAISE EXCEPTION 'Sem acesso à unidade';
  END IF;

  IF v_status <> 'disponivel' THEN
    RAISE EXCEPTION 'Transição inválida: embrião está %', v_status;
  END IF;

  INSERT INTO public.haras_embryo_transfers (
    embryo_id, business_unit_id, recipient_mare_id, transfer_date, notes, created_by
  ) VALUES (
    p_embryo_id, v_bu, p_recipient_mare_id, COALESCE(p_transfer_date, now()), p_notes, auth.uid()
  ) RETURNING id INTO v_tid;

  UPDATE public.haras_embryos SET status = 'transferido' WHERE id = p_embryo_id;

  RETURN QUERY SELECT v_tid, 'transferido'::public.repro_embryo_status;
END $function$
;

CREATE OR REPLACE FUNCTION public.repro_update_embryo_transfer_outcome(p_transfer_id uuid, p_outcome repro_embryo_outcome, p_notes text DEFAULT NULL::text)
 RETURNS repro_embryo_outcome
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_bu uuid; v_cancelled timestamptz;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sem autenticação'; END IF;

  SELECT business_unit_id, cancelled_at INTO v_bu, v_cancelled
    FROM public.haras_embryo_transfers WHERE id = p_transfer_id FOR UPDATE;
  IF v_bu IS NULL THEN RAISE EXCEPTION 'Transferência não encontrada'; END IF;

  IF NOT (public.is_admin(auth.uid()) OR public.can_access_unit(auth.uid(), v_bu)) THEN
    RAISE EXCEPTION 'Sem acesso à unidade';
  END IF;

  IF v_cancelled IS NOT NULL THEN RAISE EXCEPTION 'Transferência cancelada'; END IF;

  UPDATE public.haras_embryo_transfers
    SET outcome = p_outcome,
        notes = CASE WHEN p_notes IS NULL OR btrim(p_notes)='' THEN notes
                     ELSE COALESCE(notes || E'\n', '') || p_notes END
    WHERE id = p_transfer_id;

  RETURN p_outcome;
END $function$
;

CREATE OR REPLACE FUNCTION public.reservation_overlaps(_unit_id uuid, _start date, _end date, _ignore_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (SELECT 1 FROM public.reservations WHERE business_unit_id = _unit_id AND status IN ('pending','confirmed') AND (_ignore_id IS NULL OR id <> _ignore_id) AND NOT (end_date < _start OR start_date > _end))
$function$
;

CREATE OR REPLACE FUNCTION public.reverse_bank_transfer(_transfer_group_id uuid, _reason text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user uuid := auth.uid();
  v_count int;
  v_from_id uuid;
  v_to_id uuid;
  v_amount numeric;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Usuário não autenticado'; END IF;
  SELECT COUNT(*) INTO v_count FROM public.transactions WHERE transfer_group_id = _transfer_group_id AND is_transfer = true;
  IF v_count <> 2 THEN RAISE EXCEPTION 'Transferência não encontrada ou já estornada'; END IF;

  SELECT bank_account_id, amount INTO v_from_id, v_amount
    FROM public.transactions WHERE transfer_group_id = _transfer_group_id AND type = 'expense'::transaction_type LIMIT 1;
  SELECT bank_account_id INTO v_to_id
    FROM public.transactions WHERE transfer_group_id = _transfer_group_id AND type = 'income'::transaction_type LIMIT 1;

  RETURN public.create_bank_transfer(v_to_id, v_from_id, v_amount, CURRENT_DATE,
    COALESCE(_reason, 'Estorno de transferência ' || _transfer_group_id::text));
END;
$function$
;

CREATE OR REPLACE FUNCTION public.revert_sale_installment_payment(_installment_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_inst public.sale_installments%ROWTYPE;
BEGIN
  SELECT * INTO v_inst FROM public.sale_installments WHERE id=_installment_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Parcela não encontrada'; END IF;
  IF v_inst.receivable_id IS NULL THEN RAISE EXCEPTION 'Sem recebível'; END IF;
  PERFORM public.unmark_receivable_paid(v_inst.receivable_id);
  UPDATE public.receivables SET amount = v_inst.amount - COALESCE(v_inst.interest_amount,0) - COALESCE(v_inst.fine_amount,0) + COALESCE(v_inst.discount_amount,0), updated_at=now() WHERE id=v_inst.receivable_id;
  UPDATE public.sale_installments SET interest_amount=0, fine_amount=0, discount_amount=0, updated_at=now() WHERE id=_installment_id;
  UPDATE public.animal_sales SET status='active', updated_at=now() WHERE id=v_inst.sale_id AND status='completed';
  UPDATE public.haras_animals SET status='active', updated_at=now() WHERE id=(SELECT animal_id FROM public.animal_sales WHERE id=v_inst.sale_id) AND status='sold';
END $function$
;

CREATE OR REPLACE FUNCTION public.rollback_payroll_batch(_batch_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_bu uuid;
  v_blocked int;
  v_deleted int;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Não autenticado' USING ERRCODE='42501'; END IF;
  IF _batch_id IS NULL THEN RAISE EXCEPTION 'Lote obrigatório'; END IF;

  SELECT business_unit_id INTO v_bu FROM public.payables
    WHERE payroll_batch_id = _batch_id LIMIT 1;
  IF v_bu IS NULL THEN RAISE EXCEPTION 'Lote não encontrado'; END IF;

  IF NOT public.can_access_unit(v_uid, v_bu) THEN
    RAISE EXCEPTION 'Sem permissão' USING ERRCODE='42501';
  END IF;
  IF NOT public.has_permission(v_uid, 'payables'::app_module, 'delete'::permission_action) THEN
    RAISE EXCEPTION 'Sem permissão' USING ERRCODE='42501';
  END IF;

  SELECT count(*) INTO v_blocked FROM public.payables
    WHERE payroll_batch_id = _batch_id AND status IN ('paid','partial');
  IF v_blocked > 0 THEN
    RAISE EXCEPTION 'Não é possível desfazer: % lançamento(s) já foram pagos ou parcialmente pagos', v_blocked;
  END IF;

  DELETE FROM public.payables
    WHERE payroll_batch_id = _batch_id AND status = 'pending';
  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  INSERT INTO public.audit_log (user_id, action, entity, entity_id, business_unit_id, payload)
  VALUES (v_uid, 'payroll.batch_rollback', 'payables', _batch_id, v_bu,
    jsonb_build_object('deleted', v_deleted));

  RETURN jsonb_build_object('deleted', v_deleted);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.seed_default_payroll_category()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.type::text = 'haras' THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.categories (name, type, is_payroll, business_unit_id, created_by)
  SELECT 'Folha de Pagamento', 'expense', true, NEW.id, NULL
  WHERE NOT EXISTS (
    SELECT 1 FROM public.categories c
    WHERE c.business_unit_id = NEW.id AND c.is_payroll = true
  );

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_animal_share_status(_share_id uuid, _status text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_bu uuid;
BEGIN
  IF _status NOT IN ('pending','settled','waived') THEN RAISE EXCEPTION 'Status inválido'; END IF;
  SELECT t.business_unit_id INTO v_bu FROM public.haras_animal_transaction_shares s
    JOIN public.haras_animal_transactions t ON t.id = s.transaction_id WHERE s.id=_share_id;
  IF v_bu IS NULL THEN RAISE EXCEPTION 'Parte não encontrada'; END IF;
  IF NOT public.can_access_unit(auth.uid(), v_bu) THEN RAISE EXCEPTION 'Sem permissão'; END IF;
  UPDATE public.haras_animal_transaction_shares SET status=_status, settled_at=CASE WHEN _status='settled' THEN now() ELSE NULL END WHERE id=_share_id;
END $function$
;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $function$
;

CREATE OR REPLACE FUNCTION public.settle_bank_contract(_payload jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_contract_id uuid := (_payload->>'contract_id')::uuid;
  v_amount numeric := (_payload->>'settlement_amount')::numeric;
  v_date date := COALESCE(NULLIF(_payload->>'payment_date','')::date, CURRENT_DATE);
  v_bank uuid := NULLIF(_payload->>'bank_account_id','')::uuid;
  v_cat uuid := NULLIF(_payload->>'expense_category_id','')::uuid;
  v_notes text := _payload->>'notes';
  v_bu uuid;
  v_status public.bank_contract_status;
  v_institution text;
  v_number text;
  v_pending_amount numeric;
  v_cancelled int;
  v_tx_id uuid;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Não autenticado' USING ERRCODE='42501'; END IF;
  IF v_contract_id IS NULL THEN RAISE EXCEPTION 'Contrato obrigatório'; END IF;
  IF v_amount IS NULL OR v_amount < 0 THEN RAISE EXCEPTION 'Valor de quitação inválido'; END IF;
  IF v_cat IS NULL THEN RAISE EXCEPTION 'Categoria de despesa obrigatória'; END IF;
  IF v_bank IS NULL THEN RAISE EXCEPTION 'Conta bancária obrigatória'; END IF;

  PERFORM pg_advisory_xact_lock(hashtext(v_contract_id::text));

  SELECT business_unit_id, status, institution, contract_number
    INTO v_bu, v_status, v_institution, v_number
    FROM public.bank_contracts WHERE id = v_contract_id FOR UPDATE;

  IF v_bu IS NULL THEN RAISE EXCEPTION 'Contrato não encontrado'; END IF;
  IF v_status <> 'active' THEN RAISE EXCEPTION 'Somente contratos ativos podem ser quitados'; END IF;

  IF NOT public.has_permission(v_uid,'bank_contracts'::app_module,'edit'::permission_action)
     OR NOT public.can_access_unit(v_uid, v_bu) THEN
    RAISE EXCEPTION 'Sem permissão' USING ERRCODE='42501';
  END IF;

  IF NOT public.can_use_bank_account(v_uid, v_bank, v_bu) THEN
    RAISE EXCEPTION 'Conta bancária indisponível para esta unidade';
  END IF;

  SELECT COALESCE(SUM(amount),0) INTO v_pending_amount
    FROM public.payables
    WHERE bank_contract_id = v_contract_id AND status = 'pending';

  -- 1) Registra a transação financeira da quitação
  IF v_amount > 0 THEN
    INSERT INTO public.transactions (
      business_unit_id, date, description, type, amount, status,
      bank_account_id, category_id, created_by
    ) VALUES (
      v_bu, v_date,
      'Quitação de contrato — ' || v_institution || ' #' || v_number,
      'expense', v_amount, 'paid',
      v_bank, v_cat, v_uid
    ) RETURNING id INTO v_tx_id;
  END IF;

  -- 2) Cancela as parcelas pendentes
  WITH upd AS (
    UPDATE public.payables
       SET status = 'cancelled',
           notes = COALESCE(notes || E'\n','') || '[Cancelada por quitação do contrato em ' || v_date || ']'
     WHERE bank_contract_id = v_contract_id AND status = 'pending'
     RETURNING 1
  )
  SELECT COUNT(*) INTO v_cancelled FROM upd;

  -- 3) Fecha o contrato
  UPDATE public.bank_contracts
     SET status = 'paid_off',
         settled_at = now(),
         settlement_amount = v_amount,
         notes = CASE
           WHEN v_notes IS NOT NULL AND length(trim(v_notes)) > 0
             THEN COALESCE(notes || E'\n','') || v_notes
           ELSE notes
         END
   WHERE id = v_contract_id;

  INSERT INTO public.audit_log (user_id, action, entity, entity_id, business_unit_id, payload)
  VALUES (v_uid, 'bank_contract.settle', 'bank_contract', v_contract_id, v_bu,
          jsonb_build_object(
            'settlement_amount', v_amount,
            'pending_amount_before', v_pending_amount,
            'payables_cancelled_count', v_cancelled,
            'transaction_id', v_tx_id,
            'bank_account_id', v_bank,
            'payment_date', v_date
          ));

  RETURN v_contract_id;
END $function$
;

CREATE OR REPLACE FUNCTION public.tg_audit_log()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_entity text := TG_TABLE_NAME;
  v_action text := lower(TG_OP);
  v_entity_id uuid;
  v_bu uuid;
  v_payload jsonb;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_entity_id := (to_jsonb(OLD)->>'id')::uuid;
    BEGIN v_bu := (to_jsonb(OLD)->>'business_unit_id')::uuid; EXCEPTION WHEN OTHERS THEN v_bu := NULL; END;
    v_payload := jsonb_build_object('before', to_jsonb(OLD));
  ELSIF TG_OP = 'INSERT' THEN
    v_entity_id := (to_jsonb(NEW)->>'id')::uuid;
    BEGIN v_bu := (to_jsonb(NEW)->>'business_unit_id')::uuid; EXCEPTION WHEN OTHERS THEN v_bu := NULL; END;
    v_payload := jsonb_build_object('after', to_jsonb(NEW));
  ELSE -- UPDATE
    v_entity_id := (to_jsonb(NEW)->>'id')::uuid;
    BEGIN v_bu := (to_jsonb(NEW)->>'business_unit_id')::uuid; EXCEPTION WHEN OTHERS THEN v_bu := NULL; END;
    -- Compute changed keys diff
    v_payload := jsonb_build_object(
      'before', (SELECT jsonb_object_agg(key, value) FROM jsonb_each(to_jsonb(OLD))
                 WHERE to_jsonb(NEW)->key IS DISTINCT FROM value),
      'after',  (SELECT jsonb_object_agg(key, value) FROM jsonb_each(to_jsonb(NEW))
                 WHERE to_jsonb(OLD)->key IS DISTINCT FROM value)
    );
    -- Skip noise: only updated_at changed
    IF (v_payload->'after') IS NULL OR (v_payload->'after') = '{}'::jsonb
       OR ((SELECT count(*) FROM jsonb_object_keys(v_payload->'after')) = 1
           AND (v_payload->'after') ? 'updated_at') THEN
      RETURN NEW;
    END IF;
  END IF;

  INSERT INTO public.audit_log (entity, entity_id, action, business_unit_id, user_id, payload)
  VALUES (v_entity, v_entity_id, v_action, v_bu, auth.uid(), v_payload);

  RETURN COALESCE(NEW, OLD);
EXCEPTION WHEN OTHERS THEN
  -- Never break business operations because of audit failure
  RETURN COALESCE(NEW, OLD);
END $function$
;

CREATE OR REPLACE FUNCTION public.tg_bank_contract_delete_credit_tx()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_closed timestamptz;
BEGIN
  IF OLD.principal_credit_transaction_id IS NOT NULL THEN
    SELECT closed_at INTO v_closed
      FROM public.transactions
     WHERE id = OLD.principal_credit_transaction_id;
    IF v_closed IS NOT NULL THEN
      RAISE EXCEPTION 'Não é possível excluir: crédito do contrato está em período fechado. Peça ao admin para reabrir.'
        USING ERRCODE='P0001';
    END IF;
    DELETE FROM public.transactions WHERE id = OLD.principal_credit_transaction_id;
  END IF;
  RETURN OLD;
END $function$
;

CREATE OR REPLACE FUNCTION public.tg_bank_contract_sync_status()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_contract_id uuid;
  v_status public.bank_contract_status;
  v_installments int;
  v_paid int;
BEGIN
  -- Escolhe o contrato afetado
  IF TG_OP = 'DELETE' THEN
    v_contract_id := OLD.bank_contract_id;
  ELSE
    v_contract_id := NEW.bank_contract_id;
    -- Guarda: não permitir alterar bank_contract_id de payable já pago
    IF TG_OP = 'UPDATE'
       AND OLD.status = 'paid'
       AND OLD.bank_contract_id IS DISTINCT FROM NEW.bank_contract_id THEN
      RAISE EXCEPTION 'Não é permitido alterar o contrato bancário de uma parcela já paga';
    END IF;
  END IF;

  IF v_contract_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  BEGIN
    PERFORM pg_advisory_xact_lock(hashtext(v_contract_id::text));

    SELECT status, installments_count INTO v_status, v_installments
      FROM public.bank_contracts WHERE id = v_contract_id;

    IF v_status IS DISTINCT FROM 'active' OR v_installments IS NULL THEN
      RETURN COALESCE(NEW, OLD);
    END IF;

    SELECT COUNT(*) INTO v_paid
      FROM public.payables
      WHERE bank_contract_id = v_contract_id AND status = 'paid';

    IF v_paid >= v_installments THEN
      UPDATE public.bank_contracts
         SET status = 'paid_off', settled_at = now()
       WHERE id = v_contract_id AND status = 'active';

      INSERT INTO public.audit_log (user_id, action, entity, entity_id, business_unit_id, payload)
      SELECT auth.uid(), 'bank_contract.auto_close', 'bank_contract', bc.id, bc.business_unit_id,
             jsonb_build_object('paid_count', v_paid, 'installments_count', v_installments)
        FROM public.bank_contracts bc WHERE bc.id = v_contract_id;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Nunca aborta o pagamento
    INSERT INTO public.audit_log (user_id, action, entity, entity_id, business_unit_id, payload)
    VALUES (auth.uid(), 'bank_contract.auto_close_error', 'bank_contract', v_contract_id, NULL,
            jsonb_build_object('sqlerrm', SQLERRM));
  END;

  RETURN COALESCE(NEW, OLD);
END $function$
;

CREATE OR REPLACE FUNCTION public.tg_bank_contract_validate()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_cat_bu uuid; v_cat_type text; v_reneg_bu uuid;
BEGIN
  IF NEW.contract_type = 'revolving' THEN
    IF NEW.installments_count IS NOT NULL OR NEW.installment_amount IS NOT NULL OR NEW.first_due_date IS NOT NULL THEN
      RAISE EXCEPTION 'Contrato rotativo não pode ter parcelas fixas';
    END IF;
  ELSE
    IF NEW.installments_count IS NULL OR NEW.installments_count <= 0 THEN
      RAISE EXCEPTION 'Quantidade de parcelas obrigatória e > 0';
    END IF;
    IF NEW.installment_amount IS NULL OR NEW.installment_amount <= 0 THEN
      RAISE EXCEPTION 'Valor da parcela obrigatório e > 0';
    END IF;
    IF NEW.first_due_date IS NULL THEN
      RAISE EXCEPTION 'Data do primeiro vencimento obrigatória';
    END IF;
  END IF;

  IF NEW.expense_category_id IS NOT NULL THEN
    SELECT business_unit_id, type INTO v_cat_bu, v_cat_type
      FROM public.categories WHERE id = NEW.expense_category_id;
    IF v_cat_bu IS NULL THEN RAISE EXCEPTION 'Categoria não encontrada'; END IF;
    IF v_cat_bu <> NEW.business_unit_id THEN RAISE EXCEPTION 'Categoria pertence a outra unidade'; END IF;
    IF v_cat_type <> 'expense' THEN RAISE EXCEPTION 'Categoria deve ser do tipo despesa'; END IF;
  END IF;

  IF NEW.bank_account_id IS NOT NULL THEN
    IF NOT public.can_use_bank_account(COALESCE(NEW.created_by, auth.uid()), NEW.bank_account_id, NEW.business_unit_id) THEN
      RAISE EXCEPTION 'Conta bancária indisponível para esta unidade';
    END IF;
  END IF;

  IF NEW.renegotiated_from_id IS NOT NULL THEN
    SELECT business_unit_id INTO v_reneg_bu FROM public.bank_contracts WHERE id = NEW.renegotiated_from_id;
    IF v_reneg_bu IS NULL THEN RAISE EXCEPTION 'Contrato de origem não encontrado'; END IF;
    IF v_reneg_bu <> NEW.business_unit_id THEN RAISE EXCEPTION 'Contrato de origem pertence a outra unidade'; END IF;
  END IF;

  RETURN NEW;
END $function$
;

CREATE OR REPLACE FUNCTION public.tg_haras_breeding_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_bypass boolean := current_setting('haras.breeding_bypass', true) = 'on';
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status <> 'agendado' AND NOT v_bypass THEN
      RAISE EXCEPTION 'BREEDING_STATUS_MUST_BE_SCHEDULED_ON_INSERT';
    END IF;
    RETURN NEW;
  END IF;

  -- UPDATE
  IF NOT v_bypass THEN
    IF NEW.status IS DISTINCT FROM OLD.status
       OR NEW.performed_at IS DISTINCT FROM OLD.performed_at
       OR NEW.semen_movement_id IS DISTINCT FROM OLD.semen_movement_id
       OR NEW.embryo_transfer_id IS DISTINCT FROM OLD.embryo_transfer_id
       OR NEW.perform_attempts IS DISTINCT FROM OLD.perform_attempts THEN
      RAISE EXCEPTION 'BREEDING_PROTECTED_FIELD_UPDATE_REQUIRES_RPC';
    END IF;
    IF OLD.status = 'realizado' THEN
      IF NEW.method IS DISTINCT FROM OLD.method
         OR NEW.mare_id IS DISTINCT FROM OLD.mare_id
         OR NEW.stallion_id IS DISTINCT FROM OLD.stallion_id
         OR NEW.semen_batch_id IS DISTINCT FROM OLD.semen_batch_id
         OR NEW.doses_used IS DISTINCT FROM OLD.doses_used
         OR NEW.embryo_id IS DISTINCT FROM OLD.embryo_id THEN
        RAISE EXCEPTION 'BREEDING_REALIZED_IS_IMMUTABLE';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.tg_haras_breeding_pregnancy_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF OLD.status = 'realizado' AND NEW.status IN ('agendado','cancelado') THEN
    IF EXISTS (
      SELECT 1 FROM haras_pregnancies
       WHERE breeding_session_id = OLD.id
         AND status IN ('em_andamento','confirmada')
    ) THEN
      RAISE EXCEPTION 'BREEDING_HAS_ACTIVE_PREGNANCY';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.tg_haras_breeding_validate()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_mare_bu uuid; v_mare_sex repro_sex;
  v_stallion_bu uuid; v_stallion_sex repro_sex;
  v_batch_bu uuid; v_batch_stallion uuid; v_batch_type repro_semen_type;
  v_embryo_bu uuid; v_embryo_status repro_embryo_status;
BEGIN
  -- Mare validation
  SELECT business_unit_id, sex INTO v_mare_bu, v_mare_sex
  FROM haras_animals WHERE id = NEW.mare_id;
  IF v_mare_bu IS NULL THEN RAISE EXCEPTION 'BREEDING_MARE_NOT_FOUND'; END IF;
  IF v_mare_bu <> NEW.business_unit_id THEN RAISE EXCEPTION 'BREEDING_MARE_BU_MISMATCH'; END IF;
  IF v_mare_sex IS DISTINCT FROM 'femea' THEN RAISE EXCEPTION 'BREEDING_MARE_MUST_BE_FEMALE'; END IF;

  -- Method-specific coherence
  IF NEW.method IN ('ia_fresco','ia_refrigerado','ia_congelado') THEN
    IF NEW.semen_batch_id IS NULL THEN RAISE EXCEPTION 'BREEDING_IA_REQUIRES_BATCH'; END IF;
    IF NEW.doses_used IS NULL OR NEW.doses_used < 1 THEN RAISE EXCEPTION 'BREEDING_IA_REQUIRES_DOSES'; END IF;
    IF NEW.embryo_id IS NOT NULL THEN RAISE EXCEPTION 'BREEDING_IA_NO_EMBRYO'; END IF;

    SELECT business_unit_id, stallion_id, semen_type
      INTO v_batch_bu, v_batch_stallion, v_batch_type
    FROM haras_semen_batches WHERE id = NEW.semen_batch_id;
    IF v_batch_bu IS NULL THEN RAISE EXCEPTION 'BREEDING_BATCH_NOT_FOUND'; END IF;
    IF v_batch_bu <> NEW.business_unit_id THEN RAISE EXCEPTION 'BREEDING_BATCH_BU_MISMATCH'; END IF;

    -- coherence semen_type <-> method
    IF (NEW.method = 'ia_fresco'      AND v_batch_type <> 'fresco')
    OR (NEW.method = 'ia_refrigerado' AND v_batch_type <> 'refrigerado')
    OR (NEW.method = 'ia_congelado'   AND v_batch_type <> 'congelado') THEN
      RAISE EXCEPTION 'BREEDING_METHOD_SEMEN_TYPE_MISMATCH';
    END IF;

    -- derive stallion_id from batch if null
    IF NEW.stallion_id IS NULL THEN
      NEW.stallion_id := v_batch_stallion;
    ELSIF NEW.stallion_id <> v_batch_stallion THEN
      RAISE EXCEPTION 'BREEDING_STALLION_BATCH_MISMATCH';
    END IF;

  ELSIF NEW.method = 'te' THEN
    IF NEW.embryo_id IS NULL THEN RAISE EXCEPTION 'BREEDING_TE_REQUIRES_EMBRYO'; END IF;
    IF NEW.semen_batch_id IS NOT NULL OR NEW.doses_used IS NOT NULL THEN
      RAISE EXCEPTION 'BREEDING_TE_NO_SEMEN';
    END IF;
    SELECT business_unit_id, status INTO v_embryo_bu, v_embryo_status
    FROM haras_embryos WHERE id = NEW.embryo_id;
    IF v_embryo_bu IS NULL THEN RAISE EXCEPTION 'BREEDING_EMBRYO_NOT_FOUND'; END IF;
    IF v_embryo_bu <> NEW.business_unit_id THEN RAISE EXCEPTION 'BREEDING_EMBRYO_BU_MISMATCH'; END IF;

  ELSIF NEW.method = 'monta_natural' THEN
    IF NEW.semen_batch_id IS NOT NULL OR NEW.doses_used IS NOT NULL OR NEW.embryo_id IS NOT NULL THEN
      RAISE EXCEPTION 'BREEDING_NATURAL_NO_STOCK';
    END IF;
    IF NEW.stallion_id IS NULL THEN RAISE EXCEPTION 'BREEDING_NATURAL_REQUIRES_STALLION'; END IF;
  END IF;

  -- Stallion sex check (when set)
  IF NEW.stallion_id IS NOT NULL THEN
    SELECT business_unit_id, sex INTO v_stallion_bu, v_stallion_sex
    FROM haras_animals WHERE id = NEW.stallion_id;
    IF v_stallion_bu IS NULL THEN RAISE EXCEPTION 'BREEDING_STALLION_NOT_FOUND'; END IF;
    IF v_stallion_bu <> NEW.business_unit_id THEN RAISE EXCEPTION 'BREEDING_STALLION_BU_MISMATCH'; END IF;
    IF v_stallion_sex IS DISTINCT FROM 'macho' THEN RAISE EXCEPTION 'BREEDING_STALLION_MUST_BE_MALE'; END IF;
  END IF;

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.tg_haras_categories_block_delete()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF EXISTS (SELECT 1 FROM public.haras_animal_transactions WHERE category_id = OLD.id) THEN
    RAISE EXCEPTION 'Categoria está em uso por lançamentos existentes';
  END IF;
  RETURN OLD;
END; $function$
;

CREATE OR REPLACE FUNCTION public.tg_haras_clients_block_delete_if_referenced()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE animal_names text;
BEGIN
  SELECT string_agg(name, ', ') INTO animal_names FROM public.haras_animals WHERE primary_client_id = OLD.id;
  IF animal_names IS NOT NULL THEN RAISE EXCEPTION 'Cliente é proprietário primário de: %', animal_names; END IF;
  IF EXISTS (SELECT 1 FROM public.haras_animal_partners WHERE client_id = OLD.id) THEN
    RAISE EXCEPTION 'Cliente é sócio de um ou mais animais — remova as participações antes';
  END IF;
  RETURN OLD;
END; $function$
;

CREATE OR REPLACE FUNCTION public.tg_haras_follicle_exam_validate()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE v_bu uuid; v_sex repro_sex;
BEGIN
  IF NEW.examined_at > now() THEN RAISE EXCEPTION 'FOLLICLE_EXAM_IN_FUTURE'; END IF;
  SELECT business_unit_id, sex INTO v_bu, v_sex FROM public.haras_animals WHERE id = NEW.mare_id;
  IF v_bu IS NULL THEN RAISE EXCEPTION 'FOLLICLE_MARE_NOT_FOUND'; END IF;
  IF v_bu <> NEW.business_unit_id THEN RAISE EXCEPTION 'FOLLICLE_BU_MISMATCH'; END IF;
  IF v_sex IS DISTINCT FROM 'femea'::repro_sex THEN RAISE EXCEPTION 'FOLLICLE_MARE_MUST_BE_FEMALE'; END IF;
  IF NEW.ovulation_confirmed AND NEW.ovulation_side IS NULL THEN
    RAISE EXCEPTION 'FOLLICLE_OVULATION_SIDE_REQUIRED';
  END IF;
  IF NEW.examined_by IS NOT NULL THEN NEW.examined_by := NULLIF(trim(NEW.examined_by),''); END IF;
  RETURN NEW;
END; $function$
;

CREATE OR REPLACE FUNCTION public.tg_haras_follicle_reading_validate()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE v_bu uuid;
BEGIN
  SELECT business_unit_id INTO v_bu FROM public.haras_follicle_exams WHERE id = NEW.exam_id;
  IF v_bu IS NULL THEN RAISE EXCEPTION 'FOLLICLE_EXAM_NOT_FOUND'; END IF;
  IF NEW.business_unit_id IS NULL THEN NEW.business_unit_id := v_bu;
  ELSIF NEW.business_unit_id <> v_bu THEN RAISE EXCEPTION 'FOLLICLE_BU_MISMATCH'; END IF;
  RETURN NEW;
END; $function$
;

CREATE OR REPLACE FUNCTION public.tg_haras_pregnancy_diagnostic_validate()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_bu uuid; v_conception date;
BEGIN
  SELECT business_unit_id, conception_date INTO v_bu, v_conception
  FROM haras_pregnancies WHERE id = NEW.pregnancy_id;
  IF v_bu IS NULL THEN RAISE EXCEPTION 'PREGNANCY_NOT_FOUND'; END IF;
  IF v_bu <> NEW.business_unit_id THEN RAISE EXCEPTION 'DIAGNOSTIC_BU_MISMATCH'; END IF;
  IF NEW.diagnosed_at::date < v_conception THEN
    RAISE EXCEPTION 'DIAGNOSTIC_BEFORE_CONCEPTION';
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.tg_haras_pregnancy_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_bypass boolean := current_setting('haras.pregnancy_bypass', true) = 'on';
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status <> 'em_andamento' AND NOT v_bypass THEN
      RAISE EXCEPTION 'PREGNANCY_STATUS_MUST_BE_EM_ANDAMENTO_ON_INSERT';
    END IF;
    RETURN NEW;
  END IF;

  IF NOT v_bypass THEN
    IF NEW.status IS DISTINCT FROM OLD.status
       OR NEW.outcome_date IS DISTINCT FROM OLD.outcome_date
       OR NEW.offspring_animal_id IS DISTINCT FROM OLD.offspring_animal_id
       OR NEW.gestation_days IS DISTINCT FROM OLD.gestation_days
       OR NEW.conception_date IS DISTINCT FROM OLD.conception_date
       OR NEW.mare_id IS DISTINCT FROM OLD.mare_id
       OR NEW.stallion_id IS DISTINCT FROM OLD.stallion_id
       OR NEW.donor_mare_id IS DISTINCT FROM OLD.donor_mare_id
       OR NEW.breeding_session_id IS DISTINCT FROM OLD.breeding_session_id THEN
      RAISE EXCEPTION 'PREGNANCY_PROTECTED_FIELD_UPDATE_REQUIRES_RPC';
    END IF;
  END IF;

  IF OLD.status IN ('concluida','abortada','perdida','cancelada') THEN
    IF NEW.mare_id IS DISTINCT FROM OLD.mare_id
       OR NEW.stallion_id IS DISTINCT FROM OLD.stallion_id
       OR NEW.donor_mare_id IS DISTINCT FROM OLD.donor_mare_id
       OR NEW.breeding_session_id IS DISTINCT FROM OLD.breeding_session_id
       OR NEW.conception_date IS DISTINCT FROM OLD.conception_date
       OR NEW.gestation_days IS DISTINCT FROM OLD.gestation_days
       OR NEW.status IS DISTINCT FROM OLD.status
       OR NEW.outcome_date IS DISTINCT FROM OLD.outcome_date
       OR NEW.offspring_animal_id IS DISTINCT FROM OLD.offspring_animal_id THEN
      RAISE EXCEPTION 'PREGNANCY_CLOSED_IS_IMMUTABLE';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.tg_haras_pregnancy_validate()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_mare_bu uuid; v_mare_sex repro_sex;
  v_stallion_bu uuid; v_stallion_sex repro_sex;
  v_donor_bu uuid; v_donor_sex repro_sex;
  v_session_bu uuid; v_session_status repro_breeding_status;
  v_off_bu uuid; v_off_birth date;
BEGIN
  IF NEW.conception_date > CURRENT_DATE THEN
    RAISE EXCEPTION 'PREGNANCY_CONCEPTION_IN_FUTURE';
  END IF;

  SELECT business_unit_id, sex INTO v_mare_bu, v_mare_sex FROM haras_animals WHERE id = NEW.mare_id;
  IF v_mare_bu IS NULL THEN RAISE EXCEPTION 'PREGNANCY_MARE_NOT_FOUND'; END IF;
  IF v_mare_bu <> NEW.business_unit_id THEN RAISE EXCEPTION 'PREGNANCY_MARE_BU_MISMATCH'; END IF;
  IF v_mare_sex IS DISTINCT FROM 'femea' THEN RAISE EXCEPTION 'PREGNANCY_MARE_MUST_BE_FEMALE'; END IF;

  IF NEW.stallion_id IS NOT NULL THEN
    SELECT business_unit_id, sex INTO v_stallion_bu, v_stallion_sex FROM haras_animals WHERE id = NEW.stallion_id;
    IF v_stallion_bu IS NULL THEN RAISE EXCEPTION 'PREGNANCY_STALLION_NOT_FOUND'; END IF;
    IF v_stallion_bu <> NEW.business_unit_id THEN RAISE EXCEPTION 'PREGNANCY_STALLION_BU_MISMATCH'; END IF;
    IF v_stallion_sex IS DISTINCT FROM 'macho' THEN RAISE EXCEPTION 'PREGNANCY_STALLION_MUST_BE_MALE'; END IF;
  END IF;

  IF NEW.donor_mare_id IS NOT NULL THEN
    SELECT business_unit_id, sex INTO v_donor_bu, v_donor_sex FROM haras_animals WHERE id = NEW.donor_mare_id;
    IF v_donor_bu IS NULL THEN RAISE EXCEPTION 'PREGNANCY_DONOR_NOT_FOUND'; END IF;
    IF v_donor_bu <> NEW.business_unit_id THEN RAISE EXCEPTION 'PREGNANCY_DONOR_BU_MISMATCH'; END IF;
    IF v_donor_sex IS DISTINCT FROM 'femea' THEN RAISE EXCEPTION 'PREGNANCY_DONOR_MUST_BE_FEMALE'; END IF;
  END IF;

  IF NEW.breeding_session_id IS NOT NULL THEN
    SELECT business_unit_id, status INTO v_session_bu, v_session_status
    FROM haras_breeding_sessions WHERE id = NEW.breeding_session_id;
    IF v_session_bu IS NULL THEN RAISE EXCEPTION 'PREGNANCY_SESSION_NOT_FOUND'; END IF;
    IF v_session_bu <> NEW.business_unit_id THEN RAISE EXCEPTION 'PREGNANCY_SESSION_BU_MISMATCH'; END IF;
    IF v_session_status <> 'realizado' THEN RAISE EXCEPTION 'PREGNANCY_SESSION_MUST_BE_REALIZED'; END IF;
  END IF;

  IF NEW.offspring_animal_id IS NOT NULL THEN
    SELECT business_unit_id, birth_date INTO v_off_bu, v_off_birth
    FROM haras_animals WHERE id = NEW.offspring_animal_id;
    IF v_off_bu IS NULL THEN RAISE EXCEPTION 'PREGNANCY_OFFSPRING_NOT_FOUND'; END IF;
    IF v_off_bu <> NEW.business_unit_id THEN RAISE EXCEPTION 'PREGNANCY_OFFSPRING_BU_MISMATCH'; END IF;
    IF v_off_birth IS NOT NULL AND NEW.outcome_date IS NOT NULL AND v_off_birth <> NEW.outcome_date THEN
      RAISE EXCEPTION 'PREGNANCY_OFFSPRING_BIRTH_MISMATCH';
    END IF;
  END IF;

  IF NEW.outcome_date IS NOT NULL AND NEW.outcome_date < NEW.conception_date THEN
    RAISE EXCEPTION 'PREGNANCY_OUTCOME_BEFORE_CONCEPTION';
  END IF;

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.tg_haras_purchase_bu_consistency()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
v_bu uuid;
BEGIN
IF TG_TABLE_NAME = 'haras_purchases' THEN
IF NEW.animal_id IS NOT NULL THEN
SELECT business_unit_id INTO v_bu FROM public.haras_animals WHERE id = NEW.animal_id;
IF v_bu IS DISTINCT FROM NEW.business_unit_id THEN
RAISE EXCEPTION 'animal_id % pertence a outra business_unit', NEW.animal_id;
END IF;
END IF;
IF NEW.supplier_id IS NOT NULL THEN
SELECT business_unit_id INTO v_bu FROM public.haras_clients WHERE id = NEW.supplier_id;
IF v_bu IS DISTINCT FROM NEW.business_unit_id THEN
RAISE EXCEPTION 'supplier_id % pertence a outra business_unit', NEW.supplier_id;
END IF;
END IF;
IF NEW.expense_category_id IS NOT NULL THEN
SELECT business_unit_id INTO v_bu FROM public.categories WHERE id = NEW.expense_category_id;
IF v_bu IS DISTINCT FROM NEW.business_unit_id THEN
RAISE EXCEPTION 'expense_category_id % pertence a outra business_unit', NEW.expense_category_id;
END IF;
END IF;
ELSIF TG_TABLE_NAME = 'haras_purchase_installments' THEN
SELECT business_unit_id INTO v_bu FROM public.haras_purchases WHERE id = NEW.purchase_id;
IF v_bu IS DISTINCT FROM NEW.business_unit_id THEN
RAISE EXCEPTION 'purchase_id % pertence a outra business_unit', NEW.purchase_id;
END IF;
IF NEW.payable_id IS NOT NULL THEN
SELECT business_unit_id INTO v_bu FROM public.payables WHERE id = NEW.payable_id;
IF v_bu IS DISTINCT FROM NEW.business_unit_id THEN
RAISE EXCEPTION 'payable_id % pertence a outra business_unit', NEW.payable_id;
END IF;
END IF;
IF NEW.transaction_id IS NOT NULL THEN
SELECT business_unit_id INTO v_bu FROM public.transactions WHERE id = NEW.transaction_id;
IF v_bu IS DISTINCT FROM NEW.business_unit_id THEN
RAISE EXCEPTION 'transaction_id % pertence a outra business_unit', NEW.transaction_id;
END IF;
END IF;
ELSIF TG_TABLE_NAME = 'haras_purchase_commissions' THEN
SELECT business_unit_id INTO v_bu FROM public.haras_purchases WHERE id = NEW.purchase_id;
IF v_bu IS DISTINCT FROM NEW.business_unit_id THEN
RAISE EXCEPTION 'purchase_id % pertence a outra business_unit', NEW.purchase_id;
END IF;
IF NEW.expense_category_id IS NOT NULL THEN
SELECT business_unit_id INTO v_bu FROM public.categories WHERE id = NEW.expense_category_id;
IF v_bu IS DISTINCT FROM NEW.business_unit_id THEN
RAISE EXCEPTION 'expense_category_id % pertence a outra business_unit', NEW.expense_category_id;
END IF;
END IF;
ELSIF TG_TABLE_NAME = 'haras_purchase_commission_installments' THEN
SELECT business_unit_id INTO v_bu FROM public.haras_purchase_commissions WHERE id = NEW.commission_id;
IF v_bu IS DISTINCT FROM NEW.business_unit_id THEN
RAISE EXCEPTION 'commission_id % pertence a outra business_unit', NEW.commission_id;
END IF;
IF NEW.payable_id IS NOT NULL THEN
SELECT business_unit_id INTO v_bu FROM public.payables WHERE id = NEW.payable_id;
IF v_bu IS DISTINCT FROM NEW.business_unit_id THEN
RAISE EXCEPTION 'payable_id % pertence a outra business_unit', NEW.payable_id;
END IF;
END IF;
IF NEW.transaction_id IS NOT NULL THEN
SELECT business_unit_id INTO v_bu FROM public.transactions WHERE id = NEW.transaction_id;
IF v_bu IS DISTINCT FROM NEW.business_unit_id THEN
RAISE EXCEPTION 'transaction_id % pertence a outra business_unit', NEW.transaction_id;
END IF;
END IF;
END IF;
RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.tg_haras_recompute_from_installment()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_pid uuid;
BEGIN
IF TG_TABLE_NAME = 'haras_purchase_installments' THEN
v_pid := COALESCE(NEW.purchase_id, OLD.purchase_id);
ELSE
SELECT purchase_id INTO v_pid FROM public.haras_purchase_commissions
WHERE id = COALESCE(NEW.commission_id, OLD.commission_id);
END IF;
IF v_pid IS NOT NULL THEN
PERFORM public.haras_recompute_purchase_status(v_pid);
END IF;
RETURN NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.tg_haras_tx_generate_shares()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN PERFORM public._haras_regenerate_shares(NEW.id); RETURN NEW; END $function$
;

CREATE OR REPLACE FUNCTION public.tg_haras_tx_validate()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE animal_bu uuid; cat_bu uuid; cat_type text;
BEGIN
  IF NEW.amount IS NULL OR NEW.amount <= 0 THEN RAISE EXCEPTION 'Valor do lançamento deve ser maior que zero'; END IF;
  SELECT business_unit_id INTO animal_bu FROM public.haras_animals WHERE id = NEW.animal_id;
  IF animal_bu IS NULL THEN RAISE EXCEPTION 'Animal não encontrado'; END IF;
  IF animal_bu <> NEW.business_unit_id THEN RAISE EXCEPTION 'Animal pertence a outra unidade de negócio'; END IF;
  IF NEW.category_id IS NOT NULL THEN
    SELECT business_unit_id, type INTO cat_bu, cat_type FROM public.haras_animal_categories WHERE id = NEW.category_id;
    IF cat_bu IS NULL THEN RAISE EXCEPTION 'Categoria não encontrada'; END IF;
    IF cat_bu <> NEW.business_unit_id THEN RAISE EXCEPTION 'Categoria pertence a outra unidade de negócio'; END IF;
    IF cat_type <> NEW.type THEN RAISE EXCEPTION 'Tipo da categoria (%) não corresponde ao tipo do lançamento (%)', cat_type, NEW.type; END IF;
  END IF;
  RETURN NEW;
END; $function$
;

CREATE OR REPLACE FUNCTION public.tg_hri_recalc_total()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_inv uuid; v_total numeric;
BEGIN
  v_inv := COALESCE(NEW.recurring_invoice_id, OLD.recurring_invoice_id);
  SELECT COALESCE(SUM(unit_price * quantity),0) INTO v_total FROM public.haras_recurring_invoice_items WHERE recurring_invoice_id = v_inv;
  UPDATE public.haras_recurring_invoices SET total_amount = v_total, updated_at = now() WHERE id = v_inv;
  RETURN COALESCE(NEW, OLD);
END $function$
;

CREATE OR REPLACE FUNCTION public.tg_notify_became_overdue()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_title text; v_link text; v_module public.app_module; v_bu uuid;
BEGIN
  IF NEW.status IS DISTINCT FROM 'overdue' OR OLD.status = 'overdue' THEN RETURN NEW; END IF;

  IF TG_TABLE_NAME = 'receivables' THEN
    v_module := 'receivables'; v_bu := NEW.business_unit_id;
    v_title := 'A Receber vencido: ' || COALESCE(NEW.description, '(sem descrição)');
    v_link := '/financeiro?tab=receber';
  ELSIF TG_TABLE_NAME = 'payables' THEN
    v_module := 'payables'; v_bu := NEW.business_unit_id;
    v_title := 'A Pagar vencido: ' || COALESCE(NEW.description, '(sem descrição)');
    v_link := '/financeiro?tab=pagar';
  ELSIF TG_TABLE_NAME = 'loan_installments' THEN
    SELECT l.business_unit_id INTO v_bu FROM public.loans l WHERE l.id = NEW.loan_id;
    v_module := 'loans';
    v_title := 'Parcela de empréstimo vencida (nº ' || NEW.installment_number || ')';
    v_link := '/emprestimos';
  ELSE RETURN NEW; END IF;

  PERFORM public.notify_bu_users(v_bu, v_module, 'became_overdue',
    v_title, NULL, v_link, TG_TABLE_NAME, NEW.id);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END $function$
;

CREATE OR REPLACE FUNCTION public.tg_notify_sale_installment_paid()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_bu uuid; v_title text;
BEGIN
  IF NEW.status IS DISTINCT FROM 'paid' OR OLD.status = 'paid' THEN RETURN NEW; END IF;
  SELECT s.business_unit_id INTO v_bu FROM public.animal_sales s WHERE s.id = NEW.sale_id;
  IF v_bu IS NULL THEN RETURN NEW; END IF;
  v_title := 'Parcela de venda paga (nº ' || NEW.installment_number || ')';
  PERFORM public.notify_bu_users(v_bu, 'sales'::public.app_module, 'sale_installment_paid',
    v_title, NULL, '/haras/vendas', 'sale_installments', NEW.id);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END $function$
;

CREATE OR REPLACE FUNCTION public.tg_sale_inst_sync_from_receivable()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_inst public.sale_installments%ROWTYPE;
  v_sale_id uuid;
  v_all_paid boolean;
  v_animal_id uuid;
  v_product_type text;
BEGIN
  SELECT * INTO v_inst FROM public.sale_installments WHERE receivable_id = NEW.id;
  IF NOT FOUND THEN RETURN NEW; END IF;

  UPDATE public.sale_installments
    SET status = NEW.status, paid_at = NEW.paid_at, updated_at = now()
    WHERE id = v_inst.id;

  v_sale_id := v_inst.sale_id;

  IF NEW.status = 'paid' THEN
    SELECT NOT EXISTS (
      SELECT 1 FROM public.sale_installments WHERE sale_id = v_sale_id AND status <> 'paid'
    ) INTO v_all_paid;

    IF v_all_paid THEN
      UPDATE public.animal_sales
        SET status = 'completed', updated_at = now()
        WHERE id = v_sale_id AND status <> 'completed';

      SELECT animal_id, product_type
        INTO v_animal_id, v_product_type
        FROM public.animal_sales WHERE id = v_sale_id;

      -- Só marca animal como vendido para Animal Inteiro e Ventre
      IF v_animal_id IS NOT NULL AND COALESCE(v_product_type, 'whole') IN ('whole','pregnancy') THEN
        UPDATE public.haras_animals
          SET status = 'sold', updated_at = now()
          WHERE id = v_animal_id AND status <> 'sold';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END $function$
;

CREATE OR REPLACE FUNCTION public.tg_semen_batch_after_insert()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.haras_semen_movements (
    business_unit_id, batch_id, kind, reason, doses, notes, created_by
  ) VALUES (
    NEW.business_unit_id, NEW.id, 'in', 'coleta', NEW.total_doses,
    'Movimento inicial da coleta', NEW.created_by
  );
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.tg_semen_batch_before_ins_upd()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  v_stallion_bu uuid;
BEGIN
  IF NEW.code IS NULL OR length(trim(NEW.code)) = 0 THEN
    NEW.code := 'SEM-' || to_char(now(), 'YYYYMMDD') || '-' || substr(gen_random_uuid()::text, 1, 6);
  END IF;

  SELECT business_unit_id INTO v_stallion_bu FROM public.haras_animals WHERE id = NEW.stallion_id;
  IF v_stallion_bu IS NULL THEN
    RAISE EXCEPTION 'Garanhão % não encontrado', NEW.stallion_id;
  END IF;
  IF v_stallion_bu <> NEW.business_unit_id THEN
    RAISE EXCEPTION 'Garanhão pertence a outra unidade (%). Partida deve estar na mesma unidade.', v_stallion_bu;
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.total_doses IS DISTINCT FROM OLD.total_doses THEN
    RAISE EXCEPTION 'total_doses é imutável. Use movimentações para ajustar o saldo.';
  END IF;

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.tg_semen_movement_recalc()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_batch_id uuid;
  v_new_available int;
BEGIN
  v_batch_id := COALESCE(NEW.batch_id, OLD.batch_id);

  SELECT COALESCE(SUM(signed_doses), 0) INTO v_new_available
  FROM public.haras_semen_movements
  WHERE batch_id = v_batch_id;

  IF v_new_available < 0 THEN
    RAISE EXCEPTION 'Estoque insuficiente na partida %: saldo ficaria em %', v_batch_id, v_new_available;
  END IF;

  UPDATE public.haras_semen_batches
  SET doses_available = v_new_available
  WHERE id = v_batch_id;

  RETURN COALESCE(NEW, OLD);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.tg_semen_movement_sign()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.signed_doses := CASE
    WHEN NEW.kind IN ('in','reversal') THEN NEW.doses
    WHEN NEW.kind = 'out' THEN -NEW.doses
    ELSE 0
  END;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.tg_sync_payable_to_haras_installment()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_ins uuid; v_ins_c uuid; v_pid uuid;
BEGIN
IF pg_trigger_depth() > 1 THEN RETURN NULL; END IF;
SELECT id, purchase_id INTO v_ins, v_pid
FROM public.haras_purchase_installments WHERE payable_id = NEW.id AND status <> 'paid' LIMIT 1;
IF v_ins IS NOT NULL THEN
UPDATE public.haras_purchase_installments
SET status='paid',
paid_date = COALESCE(NEW.paid_at, CURRENT_DATE),
transaction_id = COALESCE(NEW.transaction_id, transaction_id)
WHERE id = v_ins;
RETURN NULL;
END IF;
SELECT id INTO v_ins_c
FROM public.haras_purchase_commission_installments WHERE payable_id = NEW.id AND status <> 'paid' LIMIT 1;
IF v_ins_c IS NOT NULL THEN
UPDATE public.haras_purchase_commission_installments
SET status='paid',
paid_date = COALESCE(NEW.paid_at, CURRENT_DATE),
transaction_id = COALESCE(NEW.transaction_id, transaction_id)
WHERE id = v_ins_c;
END IF;
RETURN NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.tg_validate_partners_100_for_animal()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE total numeric(7,2); aid uuid;
BEGIN
  aid := COALESCE(NEW.animal_id, OLD.animal_id);
  SELECT COALESCE(SUM(ownership_percentage),0) INTO total FROM public.haras_animal_partners WHERE animal_id = aid;
  IF total <> 100 THEN
    RAISE EXCEPTION 'Soma das participações dos sócios do animal % deve ser 100 (atual %)', aid, total;
  END IF;
  RETURN NULL;
END; $function$
;

CREATE OR REPLACE FUNCTION public.tg_validate_primary_client_same_unit()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE cli_bu uuid;
BEGIN
  SELECT business_unit_id INTO cli_bu FROM public.haras_clients WHERE id = NEW.primary_client_id;
  IF cli_bu IS NULL THEN RAISE EXCEPTION 'Cliente proprietário primário não encontrado'; END IF;
  IF cli_bu <> NEW.business_unit_id THEN RAISE EXCEPTION 'Cliente proprietário primário pertence a outra unidade'; END IF;
  RETURN NEW;
END; $function$
;

CREATE OR REPLACE FUNCTION public.tg_write_audit()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN RETURN COALESCE(NEW, OLD); END $function$
;

CREATE OR REPLACE FUNCTION public.unmark_payable_paid(_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_pay public.payables%ROWTYPE;
BEGIN
  SELECT * INTO v_pay FROM public.payables WHERE id = _id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Conta a pagar não encontrada'; END IF;
  IF NOT public.has_permission(auth.uid(),'payables'::app_module,'edit'::permission_action) OR NOT public.can_access_unit(auth.uid(), v_pay.business_unit_id) THEN
    RAISE EXCEPTION 'Sem permissão' USING ERRCODE='42501'; END IF;
  IF v_pay.status <> 'paid' THEN RAISE EXCEPTION 'Conta não está paga'; END IF;
  IF v_pay.transaction_id IS NOT NULL THEN
    PERFORM set_config('haras.bypass_close_lock','on',true);
    DELETE FROM public.transactions WHERE id = v_pay.transaction_id;
  END IF;
  UPDATE public.payables SET status='pending', paid_at=NULL, paid_account_category_id=NULL, transaction_id=NULL, updated_at=now() WHERE id=_id;
END $function$
;

CREATE OR REPLACE FUNCTION public.unmark_receivable_paid(_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_rec public.receivables%ROWTYPE;
BEGIN
  SELECT * INTO v_rec FROM public.receivables WHERE id=_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Recebível não encontrado'; END IF;
  IF NOT public.has_permission(auth.uid(),'receivables'::app_module,'edit'::permission_action) OR NOT public.can_access_unit(auth.uid(),v_rec.business_unit_id) THEN
    RAISE EXCEPTION 'Sem permissão' USING ERRCODE='42501'; END IF;
  IF v_rec.status <> 'paid' THEN RAISE EXCEPTION 'Não está pago'; END IF;
  IF v_rec.transaction_id IS NOT NULL THEN
    PERFORM set_config('haras.bypass_close_lock','on',true);
    DELETE FROM public.transactions WHERE id=v_rec.transaction_id;
  END IF;
  UPDATE public.receivables SET status='pending', paid_at=NULL, paid_account_category_id=NULL, transaction_id=NULL, updated_at=now() WHERE id=_id;
END $function$
;

CREATE OR REPLACE FUNCTION public.unreconcile_transaction(_transaction_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_tx public.transactions%ROWTYPE;
BEGIN
  SELECT * INTO v_tx FROM public.transactions WHERE id=_transaction_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Transação não encontrada'; END IF;
  IF NOT public.can_access_unit(auth.uid(), v_tx.business_unit_id) THEN RAISE EXCEPTION 'Sem permissão' USING ERRCODE='42501'; END IF;
  IF v_tx.closed_at IS NOT NULL AND public.is_feature_enabled(v_tx.business_unit_id,'closing_lock_enabled') THEN
    RAISE EXCEPTION 'Transação em período fechado. Reabra antes.' USING ERRCODE='P0001';
  END IF;
  UPDATE public.transactions SET reconciled_at=NULL, reconciled_by=NULL, updated_at=now() WHERE id=_transaction_id;
END $function$
;

CREATE OR REPLACE FUNCTION public.update_animal_sale_meta(_sale_id uuid, _payload jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_sale public.animal_sales%ROWTYPE; v_new_buyer uuid; v_new_commission numeric; v_new_sale_type text; v_buyer_unit uuid;
BEGIN
  SELECT * INTO v_sale FROM public.animal_sales WHERE id=_sale_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Venda não encontrada'; END IF;
  IF NOT public.has_permission(auth.uid(),'sales'::app_module,'edit'::permission_action) OR NOT public.can_access_unit(auth.uid(), v_sale.business_unit_id) THEN
    RAISE EXCEPTION 'Sem permissão' USING ERRCODE='42501'; END IF;
  IF v_sale.status='cancelled' THEN RAISE EXCEPTION 'Cancelada'; END IF;
  v_new_buyer := COALESCE(NULLIF(_payload->>'buyer_client_id','')::uuid, v_sale.buyer_client_id);
  v_new_commission := COALESCE((_payload->>'commission')::numeric, v_sale.commission);
  v_new_sale_type := COALESCE(_payload->>'sale_type', v_sale.sale_type);
  IF v_sale.auction_lot_id IS NOT NULL THEN v_new_sale_type := 'auction'; END IF;
  IF v_new_sale_type NOT IN ('direct','auction') THEN RAISE EXCEPTION 'sale_type inválido'; END IF;
  IF v_new_commission < 0 THEN RAISE EXCEPTION 'Comissão negativa'; END IF;
  IF v_new_buyer IS DISTINCT FROM v_sale.buyer_client_id THEN
    SELECT business_unit_id INTO v_buyer_unit FROM public.haras_clients WHERE id=v_new_buyer;
    IF v_buyer_unit IS NULL OR v_buyer_unit<>v_sale.business_unit_id THEN RAISE EXCEPTION 'Comprador em outra unidade'; END IF;
  END IF;
  UPDATE public.animal_sales SET buyer_client_id=v_new_buyer, commission=v_new_commission, sale_type=v_new_sale_type,
    notes = CASE WHEN _payload ? 'notes' THEN _payload->>'notes' ELSE notes END, updated_at=now() WHERE id=_sale_id;
  IF v_new_buyer IS DISTINCT FROM v_sale.buyer_client_id THEN
    UPDATE public.receivables r SET client_id=v_new_buyer, updated_at=now()
      FROM public.sale_installments si WHERE si.sale_id=_sale_id AND r.id=si.receivable_id AND r.status='pending';
  END IF;
END $function$
;

CREATE OR REPLACE FUNCTION public.update_sale_installment_due_date(_installment_id uuid, _new_due date)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_inst public.sale_installments%ROWTYPE;
BEGIN
  SELECT * INTO v_inst FROM public.sale_installments WHERE id=_installment_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Parcela não encontrada'; END IF;
  IF v_inst.status='paid' THEN RAISE EXCEPTION 'Já paga'; END IF;
  UPDATE public.sale_installments SET due_date=_new_due, updated_at=now() WHERE id=_installment_id;
  IF v_inst.receivable_id IS NOT NULL THEN UPDATE public.receivables SET due_date=_new_due, updated_at=now() WHERE id=v_inst.receivable_id; END IF;
END $function$
;

CREATE OR REPLACE FUNCTION public.update_sale_installment_payment_date(_installment_id uuid, _new_paid_at date)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_inst public.sale_installments%ROWTYPE;
BEGIN
  SELECT * INTO v_inst FROM public.sale_installments WHERE id=_installment_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Parcela não encontrada'; END IF;
  IF v_inst.status <> 'paid' THEN RAISE EXCEPTION 'Não está paga'; END IF;
  UPDATE public.sale_installments SET paid_at=_new_paid_at, updated_at=now() WHERE id=_installment_id;
  IF v_inst.receivable_id IS NOT NULL THEN
    UPDATE public.receivables SET paid_at=_new_paid_at, updated_at=now() WHERE id=v_inst.receivable_id;
    UPDATE public.transactions SET date=_new_paid_at, updated_at=now() WHERE id=(SELECT transaction_id FROM public.receivables WHERE id=v_inst.receivable_id);
  END IF;
END $function$
;

CREATE OR REPLACE FUNCTION public.upsert_sale_commission_payable(_sale_id uuid, _payload jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_sale public.animal_sales%ROWTYPE;
  v_commission numeric; v_client_id uuid; v_category_id uuid; v_due_date date; v_due_effective date;
  v_payable_status public.payment_status; v_payable_id uuid; v_client_bu uuid; v_cat_bu uuid; v_cat_type text; v_description text;
BEGIN
  SELECT * INTO v_sale FROM public.animal_sales WHERE id=_sale_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Venda não encontrada'; END IF;
  IF NOT (public.has_permission(auth.uid(),'sales'::app_module,'edit'::permission_action) AND public.can_access_unit(auth.uid(), v_sale.business_unit_id)) THEN
    RAISE EXCEPTION 'Sem permissão'; END IF;
  v_commission := COALESCE((_payload->>'commission')::numeric, 0);
  v_client_id := NULLIF(_payload->>'commission_client_id','')::uuid;
  v_category_id := NULLIF(_payload->>'commission_category_id','')::uuid;
  v_due_date := NULLIF(_payload->>'commission_due_date','')::date;
  IF v_commission < 0 THEN RAISE EXCEPTION 'Comissão negativa'; END IF;
  v_due_effective := COALESCE(v_due_date, v_sale.sale_date);
  IF v_client_id IS NOT NULL THEN
    SELECT business_unit_id INTO v_client_bu FROM public.haras_clients WHERE id=v_client_id;
    IF v_client_bu IS NULL OR v_client_bu<>v_sale.business_unit_id THEN RAISE EXCEPTION 'Beneficiário em outra BU'; END IF;
  END IF;
  IF v_category_id IS NOT NULL THEN
    SELECT business_unit_id, type::text INTO v_cat_bu, v_cat_type FROM public.categories WHERE id=v_category_id;
    IF v_cat_bu IS NULL OR v_cat_bu<>v_sale.business_unit_id THEN RAISE EXCEPTION 'Categoria em outra BU'; END IF;
    IF v_cat_type<>'expense' THEN RAISE EXCEPTION 'Categoria deve ser despesa'; END IF;
  END IF;
  v_description := 'Comissão venda animal - sale:'||_sale_id::text;
  v_payable_id := v_sale.commission_payable_id;
  IF v_payable_id IS NOT NULL THEN
    SELECT status INTO v_payable_status FROM public.payables WHERE id=v_payable_id;
    IF v_payable_status IS NULL THEN v_payable_id := NULL;
    ELSIF v_payable_status='paid' THEN RAISE EXCEPTION 'Comissão já paga';
    ELSIF v_commission=0 THEN
      DELETE FROM public.payables WHERE id=v_payable_id;
      UPDATE public.animal_sales SET commission=0, commission_client_id=NULL, commission_category_id=NULL, commission_due_date=NULL, commission_payable_id=NULL, updated_at=now() WHERE id=_sale_id;
      RETURN NULL;
    ELSE
      IF v_client_id IS NULL OR v_category_id IS NULL THEN RAISE EXCEPTION 'Beneficiário e categoria obrigatórios'; END IF;
      UPDATE public.payables SET amount=v_commission, supplier_id=v_client_id, category_id=v_category_id, due_date=v_due_effective, description=v_description, updated_at=now() WHERE id=v_payable_id;
      UPDATE public.animal_sales SET commission=v_commission, commission_client_id=v_client_id, commission_category_id=v_category_id, commission_due_date=v_due_date, updated_at=now() WHERE id=_sale_id;
      RETURN v_payable_id;
    END IF;
  END IF;
  IF v_commission > 0 AND v_client_id IS NOT NULL AND v_category_id IS NOT NULL THEN
    INSERT INTO public.payables (business_unit_id, supplier_id, category_id, description, amount, due_date, status, created_by)
    VALUES (v_sale.business_unit_id, v_client_id, v_category_id, v_description, v_commission, v_due_effective, 'pending', auth.uid())
    RETURNING id INTO v_payable_id;
    UPDATE public.animal_sales SET commission=v_commission, commission_client_id=v_client_id, commission_category_id=v_category_id, commission_due_date=v_due_date, commission_payable_id=v_payable_id, updated_at=now() WHERE id=_sale_id;
    RETURN v_payable_id;
  END IF;
  UPDATE public.animal_sales SET commission=v_commission, commission_client_id=v_client_id, commission_category_id=v_category_id, commission_due_date=v_due_date, updated_at=now() WHERE id=_sale_id;
  RETURN NULL;
END $function$
;

CREATE OR REPLACE FUNCTION public.upsert_sale_commission_receivable(_sale_id uuid, _payload jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_sale public.animal_sales%ROWTYPE;
  v_amount numeric := COALESCE((_payload->>'commission')::numeric, 0);
  v_haras_client uuid := NULLIF(_payload->>'commission_client_id','')::uuid;
  v_category uuid := NULLIF(_payload->>'commission_category_id','')::uuid;
  v_due date := COALESCE(NULLIF(_payload->>'commission_due_date','')::date, CURRENT_DATE);
  v_recv_id uuid;
BEGIN
  SELECT * INTO v_sale FROM public.animal_sales WHERE id = _sale_id;
  IF v_sale.id IS NULL THEN RAISE EXCEPTION 'Venda não encontrada'; END IF;

  IF NOT public.has_permission(auth.uid(),'sales'::app_module,'edit'::permission_action)
     OR NOT public.can_access_unit(auth.uid(), v_sale.business_unit_id) THEN
    RAISE EXCEPTION 'Sem permissão' USING ERRCODE='42501';
  END IF;

  IF v_amount <= 0 OR v_haras_client IS NULL OR v_category IS NULL THEN
    RAISE EXCEPTION 'Comissão, beneficiário e categoria são obrigatórios';
  END IF;

  IF v_sale.commission_receivable_id IS NOT NULL THEN
    UPDATE public.receivables
      SET amount = v_amount,
          due_date = v_due,
          haras_client_id = v_haras_client,
          category_id = v_category,
          updated_at = now()
      WHERE id = v_sale.commission_receivable_id;
  ELSE
    INSERT INTO public.receivables (business_unit_id, haras_client_id, description, amount, due_date, status, created_by, category_id)
    VALUES (v_sale.business_unit_id, v_haras_client,
            'Comissão venda animal - sale:'||_sale_id,
            v_amount, v_due, 'pending', auth.uid(), v_category)
    RETURNING id INTO v_recv_id;

    UPDATE public.animal_sales
      SET commission_receivable_id = v_recv_id,
          commission = v_amount,
          commission_client_id = v_haras_client,
          commission_category_id = v_category,
          commission_due_date = v_due,
          commission_mode = 'receivable',
          updated_at = now()
      WHERE id = _sale_id;
  END IF;
END $function$
;

CREATE OR REPLACE FUNCTION public.validate_payable_employee()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_emp_bu uuid;
  v_emp_active boolean;
  v_cat_payroll boolean;
BEGIN
  IF NEW.employee_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT business_unit_id, is_active
    INTO v_emp_bu, v_emp_active
  FROM public.employees WHERE id = NEW.employee_id;

  IF v_emp_bu IS NULL THEN
    RAISE EXCEPTION 'Funcionário não encontrado';
  END IF;
  IF v_emp_bu <> NEW.business_unit_id THEN
    RAISE EXCEPTION 'Funcionário pertence a outra unidade';
  END IF;

  IF TG_OP = 'INSERT' AND NOT v_emp_active THEN
    RAISE EXCEPTION 'Funcionário está arquivado';
  END IF;

  IF NEW.category_id IS NOT NULL THEN
    SELECT COALESCE(is_payroll,false) INTO v_cat_payroll
      FROM public.categories WHERE id = NEW.category_id;
    IF NOT v_cat_payroll THEN
      RAISE EXCEPTION 'Categoria não é de folha de pagamento — desmarque o funcionário ou troque a categoria';
    END IF;
  END IF;

  RETURN NEW;
END $function$
;

RESET check_function_bodies;

-- ---------- CONSTRAINTS (PK, UNIQUE, CHECK, FK) ----------
ALTER TABLE public.animal_sales ADD CONSTRAINT animal_sales_pkey PRIMARY KEY (id);
ALTER TABLE public.auction_lot_animals ADD CONSTRAINT auction_lot_animals_pkey PRIMARY KEY (id);
ALTER TABLE public.auction_lots ADD CONSTRAINT auction_lots_pkey PRIMARY KEY (id);
ALTER TABLE public.audit_log ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);
ALTER TABLE public.bank_account_units ADD CONSTRAINT bank_account_units_pkey PRIMARY KEY (bank_account_id, business_unit_id);
ALTER TABLE public.bank_accounts ADD CONSTRAINT bank_accounts_pkey PRIMARY KEY (id);
ALTER TABLE public.bank_contracts ADD CONSTRAINT bank_contracts_pkey PRIMARY KEY (id);
ALTER TABLE public.business_units ADD CONSTRAINT business_units_pkey PRIMARY KEY (id);
ALTER TABLE public.categories ADD CONSTRAINT categories_pkey PRIMARY KEY (id);
ALTER TABLE public.clients ADD CONSTRAINT clients_pkey PRIMARY KEY (id);
ALTER TABLE public.employees ADD CONSTRAINT employees_pkey PRIMARY KEY (id);
ALTER TABLE public.haras_animal_categories ADD CONSTRAINT haras_animal_categories_pkey PRIMARY KEY (id);
ALTER TABLE public.haras_animal_movements ADD CONSTRAINT haras_animal_movements_pkey PRIMARY KEY (id);
ALTER TABLE public.haras_animal_partners ADD CONSTRAINT haras_animal_partners_pkey PRIMARY KEY (id);
ALTER TABLE public.haras_animal_transaction_shares ADD CONSTRAINT haras_animal_transaction_shares_pkey PRIMARY KEY (id);
ALTER TABLE public.haras_animal_transactions ADD CONSTRAINT haras_animal_transactions_pkey PRIMARY KEY (id);
ALTER TABLE public.haras_animal_weight_history ADD CONSTRAINT haras_animal_weight_history_pkey PRIMARY KEY (id);
ALTER TABLE public.haras_animals ADD CONSTRAINT haras_animals_pkey PRIMARY KEY (id);
ALTER TABLE public.haras_breeding_sessions ADD CONSTRAINT haras_breeding_sessions_pkey PRIMARY KEY (id);
ALTER TABLE public.haras_clients ADD CONSTRAINT haras_clients_pkey PRIMARY KEY (id);
ALTER TABLE public.haras_embryo_transfers ADD CONSTRAINT haras_embryo_transfers_pkey PRIMARY KEY (id);
ALTER TABLE public.haras_embryos ADD CONSTRAINT haras_embryos_pkey PRIMARY KEY (id);
ALTER TABLE public.haras_feature_flags ADD CONSTRAINT haras_feature_flags_pkey PRIMARY KEY (id);
ALTER TABLE public.haras_fiv_batches ADD CONSTRAINT haras_fiv_batches_pkey PRIMARY KEY (id);
ALTER TABLE public.haras_follicle_exams ADD CONSTRAINT haras_follicle_exams_pkey PRIMARY KEY (id);
ALTER TABLE public.haras_follicle_readings ADD CONSTRAINT haras_follicle_readings_pkey PRIMARY KEY (id);
ALTER TABLE public.haras_opu_sessions ADD CONSTRAINT haras_opu_sessions_pkey PRIMARY KEY (id);
ALTER TABLE public.haras_partner_locations ADD CONSTRAINT haras_partner_locations_pkey PRIMARY KEY (id);
ALTER TABLE public.haras_pregnancies ADD CONSTRAINT haras_pregnancies_pkey PRIMARY KEY (id);
ALTER TABLE public.haras_pregnancy_diagnostics ADD CONSTRAINT haras_pregnancy_diagnostics_pkey PRIMARY KEY (id);
ALTER TABLE public.haras_purchase_commission_installments ADD CONSTRAINT haras_purchase_commission_installments_pkey PRIMARY KEY (id);
ALTER TABLE public.haras_purchase_commissions ADD CONSTRAINT haras_purchase_commissions_pkey PRIMARY KEY (id);
ALTER TABLE public.haras_purchase_installments ADD CONSTRAINT haras_purchase_installments_pkey PRIMARY KEY (id);
ALTER TABLE public.haras_purchases ADD CONSTRAINT haras_purchases_pkey PRIMARY KEY (id);
ALTER TABLE public.haras_recurring_invoice_items ADD CONSTRAINT haras_recurring_invoice_items_pkey PRIMARY KEY (id);
ALTER TABLE public.haras_recurring_invoices ADD CONSTRAINT haras_recurring_invoices_pkey PRIMARY KEY (id);
ALTER TABLE public.haras_recurring_runs ADD CONSTRAINT haras_recurring_runs_pkey PRIMARY KEY (id);
ALTER TABLE public.haras_reproduction_settings ADD CONSTRAINT haras_reproduction_settings_pkey PRIMARY KEY (business_unit_id);
ALTER TABLE public.haras_semen_batches ADD CONSTRAINT haras_semen_batches_pkey PRIMARY KEY (id);
ALTER TABLE public.haras_semen_collections ADD CONSTRAINT haras_semen_collections_pkey PRIMARY KEY (id);
ALTER TABLE public.haras_semen_movements ADD CONSTRAINT haras_semen_movements_pkey PRIMARY KEY (id);
ALTER TABLE public.haras_services ADD CONSTRAINT haras_services_pkey PRIMARY KEY (id);
ALTER TABLE public.haras_shadow_log ADD CONSTRAINT haras_shadow_log_pkey PRIMARY KEY (id);
ALTER TABLE public.loan_installments ADD CONSTRAINT loan_installments_pkey PRIMARY KEY (id);
ALTER TABLE public.loans ADD CONSTRAINT loans_pkey PRIMARY KEY (id);
ALTER TABLE public.notifications ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);
ALTER TABLE public.payables ADD CONSTRAINT payables_pkey PRIMARY KEY (id);
ALTER TABLE public.profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);
ALTER TABLE public.receivables ADD CONSTRAINT receivables_pkey PRIMARY KEY (id);
ALTER TABLE public.recurring_payables ADD CONSTRAINT recurring_payables_pkey PRIMARY KEY (id);
ALTER TABLE public.reservations ADD CONSTRAINT reservations_pkey PRIMARY KEY (id);
ALTER TABLE public.sale_installment_notifications ADD CONSTRAINT sale_installment_notifications_pkey PRIMARY KEY (id);
ALTER TABLE public.sale_installments ADD CONSTRAINT sale_installments_pkey PRIMARY KEY (id);
ALTER TABLE public.transactions ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);
ALTER TABLE public.user_module_permissions ADD CONSTRAINT user_module_permissions_pkey PRIMARY KEY (id);
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);
ALTER TABLE public.user_unit_access ADD CONSTRAINT user_unit_access_pkey PRIMARY KEY (id);
ALTER TABLE public.auction_lot_animals ADD CONSTRAINT auction_lot_animals_auction_lot_id_animal_id_key UNIQUE (auction_lot_id, animal_id);
ALTER TABLE public.business_units ADD CONSTRAINT business_units_type_key UNIQUE (type);
ALTER TABLE public.haras_animal_categories ADD CONSTRAINT haras_animal_categories_business_unit_id_name_type_key UNIQUE (business_unit_id, name, type);
ALTER TABLE public.haras_animal_partners ADD CONSTRAINT haras_animal_partners_animal_id_client_id_key UNIQUE (animal_id, client_id);
ALTER TABLE public.haras_embryos ADD CONSTRAINT haras_embryos_bu_code_uk UNIQUE (business_unit_id, code);
ALTER TABLE public.haras_feature_flags ADD CONSTRAINT haras_feature_flags_business_unit_id_flag_name_key UNIQUE NULLS NOT DISTINCT (business_unit_id, flag_name);
ALTER TABLE public.haras_purchase_commission_installments ADD CONSTRAINT haras_purchase_commission_ins_commission_id_installment_num_key UNIQUE (commission_id, installment_number);
ALTER TABLE public.haras_purchase_commissions ADD CONSTRAINT haras_purchase_commissions_purchase_id_key UNIQUE (purchase_id);
ALTER TABLE public.haras_purchase_installments ADD CONSTRAINT haras_purchase_installments_purchase_id_installment_number_key UNIQUE (purchase_id, installment_number);
ALTER TABLE public.haras_semen_batches ADD CONSTRAINT haras_semen_batches_code_bu_unique UNIQUE (business_unit_id, code);
ALTER TABLE public.loan_installments ADD CONSTRAINT loan_installments_loan_id_installment_number_key UNIQUE (loan_id, installment_number);
ALTER TABLE public.sale_installment_notifications ADD CONSTRAINT sale_installment_notifications_installment_id_kind_key UNIQUE (installment_id, kind);
ALTER TABLE public.sale_installments ADD CONSTRAINT sale_installments_receivable_id_key UNIQUE (receivable_id);
ALTER TABLE public.sale_installments ADD CONSTRAINT sale_installments_sale_id_installment_number_key UNIQUE (sale_id, installment_number);
ALTER TABLE public.user_module_permissions ADD CONSTRAINT user_module_permissions_user_id_module_action_key UNIQUE (user_id, module, action);
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);
ALTER TABLE public.user_unit_access ADD CONSTRAINT user_unit_access_user_id_business_unit_id_key UNIQUE (user_id, business_unit_id);
ALTER TABLE public.animal_sales ADD CONSTRAINT animal_sales_commission_check CHECK ((commission >= (0)::numeric));
ALTER TABLE public.animal_sales ADD CONSTRAINT animal_sales_commission_mode_check CHECK ((commission_mode = ANY (ARRAY['payable'::text, 'receivable'::text, 'net'::text])));
ALTER TABLE public.animal_sales ADD CONSTRAINT animal_sales_down_payment_check CHECK ((down_payment >= (0)::numeric));
ALTER TABLE public.animal_sales ADD CONSTRAINT animal_sales_installments_count_check CHECK ((installments_count >= 1));
ALTER TABLE public.animal_sales ADD CONSTRAINT animal_sales_product_type_check CHECK ((product_type = ANY (ARRAY['whole'::text, 'share'::text, 'embryo'::text, 'pregnancy'::text, 'covering'::text])));
ALTER TABLE public.animal_sales ADD CONSTRAINT animal_sales_sale_type_check CHECK ((sale_type = ANY (ARRAY['direct'::text, 'auction'::text])));
ALTER TABLE public.animal_sales ADD CONSTRAINT animal_sales_share_pct_check CHECK (((share_pct IS NULL) OR ((share_pct > (0)::numeric) AND (share_pct <= (100)::numeric))));
ALTER TABLE public.animal_sales ADD CONSTRAINT animal_sales_total_amount_check CHECK ((total_amount > (0)::numeric));
ALTER TABLE public.bank_contracts ADD CONSTRAINT bank_contracts_principal_check CHECK ((principal > (0)::numeric));
ALTER TABLE public.haras_animal_categories ADD CONSTRAINT haras_animal_categories_type_check CHECK ((type = ANY (ARRAY['income'::text, 'expense'::text])));
ALTER TABLE public.haras_animal_partners ADD CONSTRAINT haras_animal_partners_ownership_percentage_check CHECK (((ownership_percentage > (0)::numeric) AND (ownership_percentage <= (100)::numeric)));
ALTER TABLE public.haras_animal_transaction_shares ADD CONSTRAINT haras_animal_transaction_shares_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'settled'::text, 'waived'::text])));
ALTER TABLE public.haras_animal_transactions ADD CONSTRAINT haras_animal_transactions_type_check CHECK ((type = ANY (ARRAY['income'::text, 'expense'::text])));
ALTER TABLE public.haras_animals ADD CONSTRAINT haras_animals_status_check CHECK ((status = ANY (ARRAY['active'::text, 'sold'::text, 'deceased'::text, 'transferred'::text])));
ALTER TABLE public.haras_breeding_sessions ADD CONSTRAINT haras_breeding_attempts_nonneg CHECK ((perform_attempts >= 0));
ALTER TABLE public.haras_breeding_sessions ADD CONSTRAINT haras_breeding_doses_positive CHECK (((doses_used IS NULL) OR (doses_used > 0)));
ALTER TABLE public.haras_embryos ADD CONSTRAINT haras_embryos_code_len_ck CHECK (((char_length(code) >= 1) AND (char_length(code) <= 60)));
ALTER TABLE public.haras_fiv_batches ADD CONSTRAINT haras_fiv_batches_blastocysts_check CHECK (((blastocysts IS NULL) OR (blastocysts >= 0)));
ALTER TABLE public.haras_fiv_batches ADD CONSTRAINT haras_fiv_batches_cleaved_check CHECK (((cleaved IS NULL) OR (cleaved >= 0)));
ALTER TABLE public.haras_fiv_batches ADD CONSTRAINT haras_fiv_batches_doses_used_check CHECK ((doses_used > 0));
ALTER TABLE public.haras_fiv_batches ADD CONSTRAINT haras_fiv_batches_oocytes_used_check CHECK ((oocytes_used > 0));
ALTER TABLE public.haras_fiv_batches ADD CONSTRAINT haras_fiv_batches_status_check CHECK ((status = ANY (ARRAY['em_cultivo'::text, 'concluido'::text, 'descartado'::text])));
ALTER TABLE public.haras_follicle_exams ADD CONSTRAINT haras_follicle_exams_cervix_tone_check CHECK (((cervix_tone IS NULL) OR (cervix_tone = ANY (ARRAY['flacida'::text, 'tonica'::text, 'intermediaria'::text]))));
ALTER TABLE public.haras_follicle_exams ADD CONSTRAINT haras_follicle_exams_corpus_luteum_side_check CHECK (((corpus_luteum_side IS NULL) OR (corpus_luteum_side = ANY (ARRAY['esquerdo'::text, 'direito'::text, 'ambos'::text, 'ausente'::text]))));
ALTER TABLE public.haras_follicle_exams ADD CONSTRAINT haras_follicle_exams_follicle_dominant_mm_check CHECK (((follicle_dominant_mm IS NULL) OR ((follicle_dominant_mm > (0)::numeric) AND (follicle_dominant_mm < (100)::numeric))));
ALTER TABLE public.haras_follicle_readings ADD CONSTRAINT haras_follicle_readings_diameter_mm_check CHECK (((diameter_mm > (0)::numeric) AND (diameter_mm < (100)::numeric)));
ALTER TABLE public.haras_opu_sessions ADD CONSTRAINT haras_opu_sessions_oocytes_total_check CHECK ((oocytes_total >= 0));
ALTER TABLE public.haras_opu_sessions ADD CONSTRAINT haras_opu_sessions_oocytes_viable_check CHECK ((oocytes_viable >= 0));
ALTER TABLE public.haras_pregnancies ADD CONSTRAINT haras_pregnancies_gestation_range CHECK (((gestation_days >= 200) AND (gestation_days <= 400)));
ALTER TABLE public.haras_pregnancy_diagnostics ADD CONSTRAINT haras_pregnancy_diagnostics_observed_range CHECK (((observed_days IS NULL) OR ((observed_days >= 0) AND (observed_days <= 400))));
ALTER TABLE public.haras_purchase_commission_installments ADD CONSTRAINT haras_purchase_commission_installments_amount_check CHECK ((amount > (0)::numeric));
ALTER TABLE public.haras_purchase_commission_installments ADD CONSTRAINT haras_purchase_commission_installments_installment_number_check CHECK ((installment_number >= 1));
ALTER TABLE public.haras_purchase_commissions ADD CONSTRAINT haras_pcom_installments_chk CHECK ((((payment_condition = 'a_vista'::text) AND (installment_count = 1)) OR ((payment_condition = 'parcelado'::text) AND (installment_count >= 2) AND (first_due_date IS NOT NULL))));
ALTER TABLE public.haras_purchase_commissions ADD CONSTRAINT haras_purchase_commissions_commission_amount_check CHECK ((commission_amount > (0)::numeric));
ALTER TABLE public.haras_purchase_commissions ADD CONSTRAINT haras_purchase_commissions_commission_percentage_check CHECK (((commission_percentage IS NULL) OR ((commission_percentage > (0)::numeric) AND (commission_percentage <= (100)::numeric))));
ALTER TABLE public.haras_purchase_commissions ADD CONSTRAINT haras_purchase_commissions_commission_type_check CHECK ((commission_type = ANY (ARRAY['percentage'::text, 'fixed'::text])));
ALTER TABLE public.haras_purchase_commissions ADD CONSTRAINT haras_purchase_commissions_installment_count_check CHECK ((installment_count >= 1));
ALTER TABLE public.haras_purchase_commissions ADD CONSTRAINT haras_purchase_commissions_payment_condition_check CHECK ((payment_condition = ANY (ARRAY['a_vista'::text, 'parcelado'::text])));
ALTER TABLE public.haras_purchase_commissions ADD CONSTRAINT haras_purchase_commissions_purchase_status_check CHECK ((purchase_status = ANY (ARRAY['pendente'::text, 'parcial'::text, 'pago'::text])));
ALTER TABLE public.haras_purchase_installments ADD CONSTRAINT haras_purchase_installments_amount_check CHECK ((amount > (0)::numeric));
ALTER TABLE public.haras_purchase_installments ADD CONSTRAINT haras_purchase_installments_installment_number_check CHECK ((installment_number >= 1));
ALTER TABLE public.haras_purchases ADD CONSTRAINT haras_purchases_down_payment_chk CHECK ((((has_down_payment = false) AND (down_payment_amount IS NULL) AND (down_payment_date IS NULL)) OR ((has_down_payment = true) AND (payment_condition = 'parcelado'::text) AND (down_payment_amount IS NOT NULL) AND (down_payment_amount > (0)::numeric) AND (down_payment_amount < total_amount) AND (down_payment_date IS NOT NULL))));
ALTER TABLE public.haras_purchases ADD CONSTRAINT haras_purchases_estimated_total_value_check CHECK (((estimated_total_value IS NULL) OR (estimated_total_value > (0)::numeric)));
ALTER TABLE public.haras_purchases ADD CONSTRAINT haras_purchases_installment_count_check CHECK ((installment_count >= 1));
ALTER TABLE public.haras_purchases ADD CONSTRAINT haras_purchases_installments_chk CHECK ((((payment_condition = 'a_vista'::text) AND (installment_count = 1)) OR ((payment_condition = 'parcelado'::text) AND (installment_count >= 2) AND (first_due_date IS NOT NULL))));
ALTER TABLE public.haras_purchases ADD CONSTRAINT haras_purchases_participation_percentage_check CHECK (((participation_percentage IS NULL) OR ((participation_percentage > (0)::numeric) AND (participation_percentage <= (100)::numeric))));
ALTER TABLE public.haras_purchases ADD CONSTRAINT haras_purchases_payment_condition_check CHECK ((payment_condition = ANY (ARRAY['a_vista'::text, 'parcelado'::text])));
ALTER TABLE public.haras_purchases ADD CONSTRAINT haras_purchases_purchase_status_check CHECK ((purchase_status = ANY (ARRAY['pendente'::text, 'parcial'::text, 'pago'::text])));
ALTER TABLE public.haras_purchases ADD CONSTRAINT haras_purchases_purchase_type_check CHECK ((purchase_type = ANY (ARRAY['animal'::text, 'coverage'::text, 'embryo'::text])));
ALTER TABLE public.haras_purchases ADD CONSTRAINT haras_purchases_quantity_purchased_check CHECK (((quantity_purchased IS NULL) OR (quantity_purchased > (0)::numeric)));
ALTER TABLE public.haras_purchases ADD CONSTRAINT haras_purchases_quantity_used_check CHECK ((quantity_used >= (0)::numeric));
ALTER TABLE public.haras_purchases ADD CONSTRAINT haras_purchases_quantity_used_chk CHECK (((quantity_purchased IS NULL) OR (quantity_used <= quantity_purchased)));
ALTER TABLE public.haras_purchases ADD CONSTRAINT haras_purchases_total_amount_check CHECK ((total_amount > (0)::numeric));
ALTER TABLE public.haras_recurring_invoices ADD CONSTRAINT haras_recurring_invoices_day_of_month_check CHECK (((day_of_month >= 1) AND (day_of_month <= 28)));
ALTER TABLE public.haras_recurring_invoices ADD CONSTRAINT haras_recurring_invoices_frequency_check CHECK ((frequency = ANY (ARRAY['monthly'::text, 'quarterly'::text, 'yearly'::text])));
ALTER TABLE public.haras_recurring_runs ADD CONSTRAINT haras_recurring_runs_source_check CHECK ((source = ANY (ARRAY['manual'::text, 'cron'::text])));
ALTER TABLE public.haras_recurring_runs ADD CONSTRAINT haras_recurring_runs_status_check CHECK ((status = ANY (ARRAY['success'::text, 'failed'::text, 'skipped'::text])));
ALTER TABLE public.haras_reproduction_settings ADD CONSTRAINT haras_reproduction_settings_default_gestation_days_check CHECK (((default_gestation_days >= 300) AND (default_gestation_days <= 380)));
ALTER TABLE public.haras_reproduction_settings ADD CONSTRAINT repro_settings_alert_ranges_chk CHECK ((((breeding_upcoming_days >= 1) AND (breeding_upcoming_days <= 400)) AND ((diagnostic_due_min_days >= 1) AND (diagnostic_due_min_days <= 400)) AND ((diagnostic_due_max_days >= 1) AND (diagnostic_due_max_days <= 400)) AND ((diagnostic_recheck_days >= 1) AND (diagnostic_recheck_days <= 400)) AND ((dpp_soon_days >= 1) AND (dpp_soon_days <= 400)) AND ((dpp_overdue_days >= 1) AND (dpp_overdue_days <= 400)) AND (diagnostic_due_min_days < diagnostic_due_max_days)));
ALTER TABLE public.haras_semen_batches ADD CONSTRAINT haras_semen_batches_total_doses_check CHECK ((total_doses > 0));
ALTER TABLE public.haras_semen_collections ADD CONSTRAINT haras_semen_collections_concentration_millions_per_ml_check CHECK (((concentration_millions_per_ml IS NULL) OR (concentration_millions_per_ml > (0)::numeric)));
ALTER TABLE public.haras_semen_collections ADD CONSTRAINT haras_semen_collections_motility_pct_check CHECK (((motility_pct IS NULL) OR ((motility_pct >= 0) AND (motility_pct <= 100))));
ALTER TABLE public.haras_semen_collections ADD CONSTRAINT haras_semen_collections_volume_ml_check CHECK (((volume_ml IS NULL) OR (volume_ml > (0)::numeric)));
ALTER TABLE public.haras_semen_movements ADD CONSTRAINT haras_semen_movements_doses_check CHECK ((doses > 0));
ALTER TABLE public.haras_semen_movements ADD CONSTRAINT haras_semen_movements_idempotency_key_check CHECK (((idempotency_key IS NULL) OR ((length(idempotency_key) >= 1) AND (length(idempotency_key) <= 100))));
ALTER TABLE public.loan_installments ADD CONSTRAINT loan_installments_amount_check CHECK ((amount >= (0)::numeric));
ALTER TABLE public.loans ADD CONSTRAINT loans_monthly_rate_check CHECK ((monthly_rate >= (0)::numeric));
ALTER TABLE public.loans ADD CONSTRAINT loans_principal_check CHECK ((principal > (0)::numeric));
ALTER TABLE public.loans ADD CONSTRAINT loans_term_months_check CHECK (((term_months > 0) AND (term_months <= 600)));
ALTER TABLE public.payables ADD CONSTRAINT payables_amount_check CHECK ((amount > (0)::numeric));
ALTER TABLE public.payables ADD CONSTRAINT payables_payroll_breakdown_shape CHECK (((payroll_breakdown IS NULL) OR ((jsonb_typeof((payroll_breakdown -> 'items'::text)) = 'array'::text) AND (jsonb_typeof((payroll_breakdown -> 'total'::text)) = 'number'::text) AND (((payroll_breakdown ->> 'total'::text))::numeric >= (0)::numeric) AND ((jsonb_array_length((payroll_breakdown -> 'items'::text)) >= 1) AND (jsonb_array_length((payroll_breakdown -> 'items'::text)) <= 50)))));
ALTER TABLE public.receivables ADD CONSTRAINT receivables_amount_check CHECK ((amount >= (0)::numeric));
ALTER TABLE public.recurring_payables ADD CONSTRAINT recurring_payables_amount_check CHECK ((amount > (0)::numeric));
ALTER TABLE public.recurring_payables ADD CONSTRAINT recurring_payables_day_of_month_check CHECK (((day_of_month >= 1) AND (day_of_month <= 28)));
ALTER TABLE public.recurring_payables ADD CONSTRAINT recurring_payables_frequency_check CHECK ((frequency = ANY (ARRAY['monthly'::text, 'quarterly'::text, 'yearly'::text])));
ALTER TABLE public.reservations ADD CONSTRAINT reservations_dates_chk CHECK ((end_date >= start_date));
ALTER TABLE public.sale_installment_notifications ADD CONSTRAINT sale_installment_notifications_kind_check CHECK ((kind = ANY (ARRAY['due_today'::text, 'due_3d'::text, 'due_7d'::text, 'overdue_1d'::text, 'overdue_7d'::text])));
ALTER TABLE public.sale_installments ADD CONSTRAINT sale_installments_amount_check CHECK ((amount > (0)::numeric));
ALTER TABLE public.transactions ADD CONSTRAINT transactions_amount_check CHECK ((amount >= (0)::numeric));
ALTER TABLE public.animal_sales ADD CONSTRAINT animal_sales_auction_lot_id_fkey FOREIGN KEY (auction_lot_id) REFERENCES auction_lots(id) ON DELETE SET NULL;
ALTER TABLE public.animal_sales ADD CONSTRAINT animal_sales_cancelled_by_fkey FOREIGN KEY (cancelled_by) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.animal_sales ADD CONSTRAINT animal_sales_commission_receivable_id_fkey FOREIGN KEY (commission_receivable_id) REFERENCES receivables(id) ON DELETE SET NULL;
ALTER TABLE public.animal_sales ADD CONSTRAINT animal_sales_donor_animal_id_fkey FOREIGN KEY (donor_animal_id) REFERENCES haras_animals(id) ON DELETE SET NULL;
ALTER TABLE public.animal_sales ADD CONSTRAINT animal_sales_recipient_animal_id_fkey FOREIGN KEY (recipient_animal_id) REFERENCES haras_animals(id) ON DELETE SET NULL;
ALTER TABLE public.animal_sales ADD CONSTRAINT animal_sales_sire_animal_id_fkey FOREIGN KEY (sire_animal_id) REFERENCES haras_animals(id) ON DELETE SET NULL;
ALTER TABLE public.auction_lot_animals ADD CONSTRAINT auction_lot_animals_auction_lot_id_fkey FOREIGN KEY (auction_lot_id) REFERENCES auction_lots(id) ON DELETE CASCADE;
ALTER TABLE public.auction_lot_animals ADD CONSTRAINT auction_lot_animals_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES animal_sales(id) ON DELETE SET NULL;
ALTER TABLE public.bank_account_units ADD CONSTRAINT bank_account_units_bank_account_id_fkey FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id) ON DELETE CASCADE;
ALTER TABLE public.bank_account_units ADD CONSTRAINT bank_account_units_business_unit_id_fkey FOREIGN KEY (business_unit_id) REFERENCES business_units(id) ON DELETE CASCADE;
ALTER TABLE public.bank_accounts ADD CONSTRAINT bank_accounts_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.bank_contracts ADD CONSTRAINT bank_contracts_bank_account_id_fkey FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id) ON DELETE SET NULL;
ALTER TABLE public.bank_contracts ADD CONSTRAINT bank_contracts_business_unit_id_fkey FOREIGN KEY (business_unit_id) REFERENCES business_units(id) ON DELETE RESTRICT;
ALTER TABLE public.bank_contracts ADD CONSTRAINT bank_contracts_expense_category_id_fkey FOREIGN KEY (expense_category_id) REFERENCES categories(id) ON DELETE RESTRICT;
ALTER TABLE public.bank_contracts ADD CONSTRAINT bank_contracts_principal_credit_transaction_id_fkey FOREIGN KEY (principal_credit_transaction_id) REFERENCES transactions(id) ON DELETE SET NULL;
ALTER TABLE public.bank_contracts ADD CONSTRAINT bank_contracts_renegotiated_from_id_fkey FOREIGN KEY (renegotiated_from_id) REFERENCES bank_contracts(id) ON DELETE SET NULL;
ALTER TABLE public.categories ADD CONSTRAINT categories_business_unit_id_fkey FOREIGN KEY (business_unit_id) REFERENCES business_units(id) ON DELETE RESTRICT;
ALTER TABLE public.categories ADD CONSTRAINT categories_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.clients ADD CONSTRAINT clients_business_unit_id_fkey FOREIGN KEY (business_unit_id) REFERENCES business_units(id) ON DELETE RESTRICT;
ALTER TABLE public.clients ADD CONSTRAINT clients_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.employees ADD CONSTRAINT employees_business_unit_id_fkey FOREIGN KEY (business_unit_id) REFERENCES business_units(id) ON DELETE RESTRICT;
ALTER TABLE public.employees ADD CONSTRAINT employees_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE public.haras_animal_movements ADD CONSTRAINT haras_animal_movements_animal_id_fkey FOREIGN KEY (animal_id) REFERENCES haras_animals(id) ON DELETE CASCADE;
ALTER TABLE public.haras_animal_partners ADD CONSTRAINT haras_animal_partners_animal_id_fkey FOREIGN KEY (animal_id) REFERENCES haras_animals(id) ON DELETE CASCADE;
ALTER TABLE public.haras_animal_partners ADD CONSTRAINT haras_animal_partners_client_id_fkey FOREIGN KEY (client_id) REFERENCES haras_clients(id) ON DELETE RESTRICT;
ALTER TABLE public.haras_animal_transaction_shares ADD CONSTRAINT haras_animal_transaction_shares_client_id_fkey FOREIGN KEY (client_id) REFERENCES haras_clients(id) ON DELETE RESTRICT;
ALTER TABLE public.haras_animal_transaction_shares ADD CONSTRAINT haras_animal_transaction_shares_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES haras_animal_transactions(id) ON DELETE CASCADE;
ALTER TABLE public.haras_animal_weight_history ADD CONSTRAINT haras_animal_weight_history_animal_id_fkey FOREIGN KEY (animal_id) REFERENCES haras_animals(id) ON DELETE CASCADE;
ALTER TABLE public.haras_breeding_sessions ADD CONSTRAINT haras_breeding_sessions_business_unit_id_fkey FOREIGN KEY (business_unit_id) REFERENCES business_units(id) ON DELETE RESTRICT;
ALTER TABLE public.haras_breeding_sessions ADD CONSTRAINT haras_breeding_sessions_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE public.haras_breeding_sessions ADD CONSTRAINT haras_breeding_sessions_embryo_id_fkey FOREIGN KEY (embryo_id) REFERENCES haras_embryos(id) ON DELETE RESTRICT;
ALTER TABLE public.haras_breeding_sessions ADD CONSTRAINT haras_breeding_sessions_embryo_transfer_id_fkey FOREIGN KEY (embryo_transfer_id) REFERENCES haras_embryo_transfers(id) ON DELETE RESTRICT;
ALTER TABLE public.haras_breeding_sessions ADD CONSTRAINT haras_breeding_sessions_mare_id_fkey FOREIGN KEY (mare_id) REFERENCES haras_animals(id) ON DELETE RESTRICT;
ALTER TABLE public.haras_breeding_sessions ADD CONSTRAINT haras_breeding_sessions_semen_batch_id_fkey FOREIGN KEY (semen_batch_id) REFERENCES haras_semen_batches(id) ON DELETE RESTRICT;
ALTER TABLE public.haras_breeding_sessions ADD CONSTRAINT haras_breeding_sessions_semen_movement_id_fkey FOREIGN KEY (semen_movement_id) REFERENCES haras_semen_movements(id) ON DELETE RESTRICT;
ALTER TABLE public.haras_breeding_sessions ADD CONSTRAINT haras_breeding_sessions_stallion_id_fkey FOREIGN KEY (stallion_id) REFERENCES haras_animals(id) ON DELETE RESTRICT;
ALTER TABLE public.haras_embryo_transfers ADD CONSTRAINT haras_embryo_transfers_business_unit_id_fkey FOREIGN KEY (business_unit_id) REFERENCES business_units(id) ON DELETE RESTRICT;
ALTER TABLE public.haras_embryo_transfers ADD CONSTRAINT haras_embryo_transfers_embryo_id_fkey FOREIGN KEY (embryo_id) REFERENCES haras_embryos(id) ON DELETE RESTRICT;
ALTER TABLE public.haras_embryo_transfers ADD CONSTRAINT haras_embryo_transfers_recipient_mare_id_fkey FOREIGN KEY (recipient_mare_id) REFERENCES haras_animals(id) ON DELETE RESTRICT;
ALTER TABLE public.haras_embryos ADD CONSTRAINT haras_embryos_business_unit_id_fkey FOREIGN KEY (business_unit_id) REFERENCES business_units(id) ON DELETE RESTRICT;
ALTER TABLE public.haras_embryos ADD CONSTRAINT haras_embryos_donor_mare_id_fkey FOREIGN KEY (donor_mare_id) REFERENCES haras_animals(id) ON DELETE RESTRICT;
ALTER TABLE public.haras_embryos ADD CONSTRAINT haras_embryos_fiv_batch_id_fkey FOREIGN KEY (fiv_batch_id) REFERENCES haras_fiv_batches(id) ON DELETE SET NULL;
ALTER TABLE public.haras_embryos ADD CONSTRAINT haras_embryos_sire_stallion_id_fkey FOREIGN KEY (sire_stallion_id) REFERENCES haras_animals(id) ON DELETE RESTRICT;
ALTER TABLE public.haras_fiv_batches ADD CONSTRAINT haras_fiv_batches_business_unit_id_fkey FOREIGN KEY (business_unit_id) REFERENCES business_units(id) ON DELETE CASCADE;
ALTER TABLE public.haras_fiv_batches ADD CONSTRAINT haras_fiv_batches_opu_session_id_fkey FOREIGN KEY (opu_session_id) REFERENCES haras_opu_sessions(id) ON DELETE CASCADE;
ALTER TABLE public.haras_fiv_batches ADD CONSTRAINT haras_fiv_batches_semen_batch_id_fkey FOREIGN KEY (semen_batch_id) REFERENCES haras_semen_batches(id) ON DELETE SET NULL;
ALTER TABLE public.haras_fiv_batches ADD CONSTRAINT haras_fiv_batches_stallion_id_fkey FOREIGN KEY (stallion_id) REFERENCES haras_animals(id) ON DELETE RESTRICT;
ALTER TABLE public.haras_follicle_exams ADD CONSTRAINT haras_follicle_exams_business_unit_id_fkey FOREIGN KEY (business_unit_id) REFERENCES business_units(id) ON DELETE CASCADE;
ALTER TABLE public.haras_follicle_exams ADD CONSTRAINT haras_follicle_exams_mare_id_fkey FOREIGN KEY (mare_id) REFERENCES haras_animals(id) ON DELETE RESTRICT;
ALTER TABLE public.haras_follicle_readings ADD CONSTRAINT haras_follicle_readings_business_unit_id_fkey FOREIGN KEY (business_unit_id) REFERENCES business_units(id) ON DELETE CASCADE;
ALTER TABLE public.haras_follicle_readings ADD CONSTRAINT haras_follicle_readings_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES haras_follicle_exams(id) ON DELETE CASCADE;
ALTER TABLE public.haras_opu_sessions ADD CONSTRAINT haras_opu_sessions_business_unit_id_fkey FOREIGN KEY (business_unit_id) REFERENCES business_units(id) ON DELETE CASCADE;
ALTER TABLE public.haras_opu_sessions ADD CONSTRAINT haras_opu_sessions_donor_mare_id_fkey FOREIGN KEY (donor_mare_id) REFERENCES haras_animals(id) ON DELETE RESTRICT;
ALTER TABLE public.haras_opu_sessions ADD CONSTRAINT haras_opu_sessions_location_id_fkey FOREIGN KEY (location_id) REFERENCES haras_partner_locations(id) ON DELETE SET NULL;
ALTER TABLE public.haras_partner_locations ADD CONSTRAINT haras_partner_locations_client_id_fkey FOREIGN KEY (client_id) REFERENCES haras_clients(id) ON DELETE CASCADE;
ALTER TABLE public.haras_pregnancies ADD CONSTRAINT haras_pregnancies_breeding_session_id_fkey FOREIGN KEY (breeding_session_id) REFERENCES haras_breeding_sessions(id) ON DELETE RESTRICT;
ALTER TABLE public.haras_pregnancies ADD CONSTRAINT haras_pregnancies_business_unit_id_fkey FOREIGN KEY (business_unit_id) REFERENCES business_units(id) ON DELETE RESTRICT;
ALTER TABLE public.haras_pregnancies ADD CONSTRAINT haras_pregnancies_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE public.haras_pregnancies ADD CONSTRAINT haras_pregnancies_donor_mare_id_fkey FOREIGN KEY (donor_mare_id) REFERENCES haras_animals(id) ON DELETE RESTRICT;
ALTER TABLE public.haras_pregnancies ADD CONSTRAINT haras_pregnancies_mare_id_fkey FOREIGN KEY (mare_id) REFERENCES haras_animals(id) ON DELETE RESTRICT;
ALTER TABLE public.haras_pregnancies ADD CONSTRAINT haras_pregnancies_offspring_animal_id_fkey FOREIGN KEY (offspring_animal_id) REFERENCES haras_animals(id) ON DELETE SET NULL;
ALTER TABLE public.haras_pregnancies ADD CONSTRAINT haras_pregnancies_stallion_id_fkey FOREIGN KEY (stallion_id) REFERENCES haras_animals(id) ON DELETE RESTRICT;
ALTER TABLE public.haras_pregnancy_diagnostics ADD CONSTRAINT haras_pregnancy_diagnostics_business_unit_id_fkey FOREIGN KEY (business_unit_id) REFERENCES business_units(id) ON DELETE RESTRICT;
ALTER TABLE public.haras_pregnancy_diagnostics ADD CONSTRAINT haras_pregnancy_diagnostics_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE public.haras_pregnancy_diagnostics ADD CONSTRAINT haras_pregnancy_diagnostics_pregnancy_id_fkey FOREIGN KEY (pregnancy_id) REFERENCES haras_pregnancies(id) ON DELETE CASCADE;
ALTER TABLE public.haras_purchase_commission_installments ADD CONSTRAINT haras_purchase_commission_installments_business_unit_id_fkey FOREIGN KEY (business_unit_id) REFERENCES business_units(id) ON DELETE RESTRICT;
ALTER TABLE public.haras_purchase_commission_installments ADD CONSTRAINT haras_purchase_commission_installments_commission_id_fkey FOREIGN KEY (commission_id) REFERENCES haras_purchase_commissions(id) ON DELETE CASCADE;
ALTER TABLE public.haras_purchase_commission_installments ADD CONSTRAINT haras_purchase_commission_installments_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.haras_purchase_commission_installments ADD CONSTRAINT haras_purchase_commission_installments_payable_id_fkey FOREIGN KEY (payable_id) REFERENCES payables(id) ON DELETE SET NULL;
ALTER TABLE public.haras_purchase_commission_installments ADD CONSTRAINT haras_purchase_commission_installments_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL;
ALTER TABLE public.haras_purchase_commissions ADD CONSTRAINT haras_purchase_commissions_business_unit_id_fkey FOREIGN KEY (business_unit_id) REFERENCES business_units(id) ON DELETE RESTRICT;
ALTER TABLE public.haras_purchase_commissions ADD CONSTRAINT haras_purchase_commissions_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.haras_purchase_commissions ADD CONSTRAINT haras_purchase_commissions_expense_category_id_fkey FOREIGN KEY (expense_category_id) REFERENCES categories(id) ON DELETE RESTRICT;
ALTER TABLE public.haras_purchase_commissions ADD CONSTRAINT haras_purchase_commissions_purchase_id_fkey FOREIGN KEY (purchase_id) REFERENCES haras_purchases(id) ON DELETE CASCADE;
ALTER TABLE public.haras_purchase_installments ADD CONSTRAINT haras_purchase_installments_business_unit_id_fkey FOREIGN KEY (business_unit_id) REFERENCES business_units(id) ON DELETE RESTRICT;
ALTER TABLE public.haras_purchase_installments ADD CONSTRAINT haras_purchase_installments_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.haras_purchase_installments ADD CONSTRAINT haras_purchase_installments_payable_id_fkey FOREIGN KEY (payable_id) REFERENCES payables(id) ON DELETE SET NULL;
ALTER TABLE public.haras_purchase_installments ADD CONSTRAINT haras_purchase_installments_purchase_id_fkey FOREIGN KEY (purchase_id) REFERENCES haras_purchases(id) ON DELETE CASCADE;
ALTER TABLE public.haras_purchase_installments ADD CONSTRAINT haras_purchase_installments_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL;
ALTER TABLE public.haras_purchases ADD CONSTRAINT haras_purchases_animal_id_fkey FOREIGN KEY (animal_id) REFERENCES haras_animals(id) ON DELETE SET NULL;
ALTER TABLE public.haras_purchases ADD CONSTRAINT haras_purchases_business_unit_id_fkey FOREIGN KEY (business_unit_id) REFERENCES business_units(id) ON DELETE RESTRICT;
ALTER TABLE public.haras_purchases ADD CONSTRAINT haras_purchases_cancelled_by_fkey FOREIGN KEY (cancelled_by) REFERENCES auth.users(id);
ALTER TABLE public.haras_purchases ADD CONSTRAINT haras_purchases_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.haras_purchases ADD CONSTRAINT haras_purchases_expense_category_id_fkey FOREIGN KEY (expense_category_id) REFERENCES categories(id) ON DELETE RESTRICT;
ALTER TABLE public.haras_purchases ADD CONSTRAINT haras_purchases_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES haras_clients(id) ON DELETE SET NULL;
ALTER TABLE public.haras_recurring_invoice_items ADD CONSTRAINT haras_recurring_invoice_items_invoice_id_fkey FOREIGN KEY (recurring_invoice_id) REFERENCES haras_recurring_invoices(id) ON DELETE CASCADE;
ALTER TABLE public.haras_recurring_invoice_items ADD CONSTRAINT haras_recurring_invoice_items_service_id_fkey FOREIGN KEY (service_id) REFERENCES haras_services(id) ON DELETE SET NULL;
ALTER TABLE public.haras_recurring_invoices ADD CONSTRAINT haras_recurring_invoices_client_id_fkey FOREIGN KEY (client_id) REFERENCES haras_clients(id) ON DELETE RESTRICT;
ALTER TABLE public.haras_recurring_runs ADD CONSTRAINT haras_recurring_runs_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES haras_recurring_invoices(id) ON DELETE CASCADE;
ALTER TABLE public.haras_reproduction_settings ADD CONSTRAINT haras_reproduction_settings_business_unit_id_fkey FOREIGN KEY (business_unit_id) REFERENCES business_units(id) ON DELETE CASCADE;
ALTER TABLE public.haras_semen_batches ADD CONSTRAINT haras_semen_batches_business_unit_id_fkey FOREIGN KEY (business_unit_id) REFERENCES business_units(id) ON DELETE RESTRICT;
ALTER TABLE public.haras_semen_batches ADD CONSTRAINT haras_semen_batches_collection_id_fkey FOREIGN KEY (collection_id) REFERENCES haras_semen_collections(id) ON DELETE RESTRICT;
ALTER TABLE public.haras_semen_batches ADD CONSTRAINT haras_semen_batches_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE public.haras_semen_batches ADD CONSTRAINT haras_semen_batches_stallion_id_fkey FOREIGN KEY (stallion_id) REFERENCES haras_animals(id) ON DELETE RESTRICT;
ALTER TABLE public.haras_semen_collections ADD CONSTRAINT haras_semen_collections_business_unit_id_fkey FOREIGN KEY (business_unit_id) REFERENCES business_units(id) ON DELETE RESTRICT;
ALTER TABLE public.haras_semen_collections ADD CONSTRAINT haras_semen_collections_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE public.haras_semen_collections ADD CONSTRAINT haras_semen_collections_stallion_id_fkey FOREIGN KEY (stallion_id) REFERENCES haras_animals(id) ON DELETE RESTRICT;
ALTER TABLE public.haras_semen_movements ADD CONSTRAINT haras_semen_movements_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES haras_semen_batches(id) ON DELETE RESTRICT;
ALTER TABLE public.haras_semen_movements ADD CONSTRAINT haras_semen_movements_business_unit_id_fkey FOREIGN KEY (business_unit_id) REFERENCES business_units(id) ON DELETE RESTRICT;
ALTER TABLE public.haras_semen_movements ADD CONSTRAINT haras_semen_movements_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE public.haras_semen_movements ADD CONSTRAINT haras_semen_movements_fiv_batch_id_fkey FOREIGN KEY (fiv_batch_id) REFERENCES haras_fiv_batches(id) ON DELETE SET NULL;
ALTER TABLE public.haras_semen_movements ADD CONSTRAINT haras_semen_movements_reversed_by_fkey FOREIGN KEY (reversed_by) REFERENCES haras_semen_movements(id) ON DELETE SET NULL;
ALTER TABLE public.loan_installments ADD CONSTRAINT loan_installments_loan_id_fkey FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE;
ALTER TABLE public.loans ADD CONSTRAINT loans_business_unit_id_fkey FOREIGN KEY (business_unit_id) REFERENCES business_units(id) ON DELETE RESTRICT;
ALTER TABLE public.loans ADD CONSTRAINT loans_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT;
ALTER TABLE public.loans ADD CONSTRAINT loans_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.payables ADD CONSTRAINT payables_bank_contract_id_fkey FOREIGN KEY (bank_contract_id) REFERENCES bank_contracts(id) ON DELETE RESTRICT;
ALTER TABLE public.payables ADD CONSTRAINT payables_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL;
ALTER TABLE public.payables ADD CONSTRAINT payables_preferred_bank_account_id_fkey FOREIGN KEY (preferred_bank_account_id) REFERENCES bank_accounts(id) ON DELETE SET NULL;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.receivables ADD CONSTRAINT receivables_business_unit_id_fkey FOREIGN KEY (business_unit_id) REFERENCES business_units(id) ON DELETE RESTRICT;
ALTER TABLE public.receivables ADD CONSTRAINT receivables_category_id_fkey FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
ALTER TABLE public.receivables ADD CONSTRAINT receivables_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;
ALTER TABLE public.receivables ADD CONSTRAINT receivables_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.receivables ADD CONSTRAINT receivables_haras_client_id_fkey FOREIGN KEY (haras_client_id) REFERENCES haras_clients(id) ON DELETE SET NULL;
ALTER TABLE public.receivables ADD CONSTRAINT receivables_paid_account_category_id_fkey FOREIGN KEY (paid_account_category_id) REFERENCES categories(id);
ALTER TABLE public.receivables ADD CONSTRAINT receivables_preferred_bank_account_id_fkey FOREIGN KEY (preferred_bank_account_id) REFERENCES bank_accounts(id) ON DELETE SET NULL;
ALTER TABLE public.receivables ADD CONSTRAINT receivables_recurring_invoice_id_fkey FOREIGN KEY (recurring_invoice_id) REFERENCES haras_recurring_invoices(id) ON DELETE SET NULL;
ALTER TABLE public.receivables ADD CONSTRAINT receivables_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE SET NULL;
ALTER TABLE public.sale_installment_notifications ADD CONSTRAINT sale_installment_notifications_installment_id_fkey FOREIGN KEY (installment_id) REFERENCES sale_installments(id) ON DELETE CASCADE;
ALTER TABLE public.sale_installments ADD CONSTRAINT sale_installments_parent_installment_id_fkey FOREIGN KEY (parent_installment_id) REFERENCES sale_installments(id) ON DELETE SET NULL;
ALTER TABLE public.sale_installments ADD CONSTRAINT sale_installments_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES animal_sales(id) ON DELETE CASCADE;
ALTER TABLE public.transactions ADD CONSTRAINT transactions_bank_account_id_fkey FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id) ON DELETE SET NULL;
ALTER TABLE public.transactions ADD CONSTRAINT transactions_business_unit_id_fkey FOREIGN KEY (business_unit_id) REFERENCES business_units(id) ON DELETE RESTRICT;
ALTER TABLE public.transactions ADD CONSTRAINT transactions_category_id_fkey FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
ALTER TABLE public.transactions ADD CONSTRAINT transactions_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;
ALTER TABLE public.transactions ADD CONSTRAINT transactions_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.transactions ADD CONSTRAINT transactions_reconciled_by_fkey FOREIGN KEY (reconciled_by) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.transactions ADD CONSTRAINT transactions_transfer_counterpart_account_id_fkey FOREIGN KEY (transfer_counterpart_account_id) REFERENCES bank_accounts(id);
ALTER TABLE public.user_module_permissions ADD CONSTRAINT user_module_permissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.user_unit_access ADD CONSTRAINT user_unit_access_business_unit_id_fkey FOREIGN KEY (business_unit_id) REFERENCES business_units(id) ON DELETE CASCADE;
ALTER TABLE public.user_unit_access ADD CONSTRAINT user_unit_access_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ---------- INDICES ----------
CREATE INDEX idx_as_animal ON public.animal_sales USING btree (animal_id);
CREATE INDEX idx_as_bu ON public.animal_sales USING btree (business_unit_id);
CREATE INDEX idx_as_buyer ON public.animal_sales USING btree (buyer_client_id);
CREATE INDEX idx_as_comm_payable ON public.animal_sales USING btree (commission_payable_id) WHERE (commission_payable_id IS NOT NULL);
CREATE INDEX idx_as_comm_receivable ON public.animal_sales USING btree (commission_receivable_id) WHERE (commission_receivable_id IS NOT NULL);
CREATE INDEX idx_ala_animal ON public.auction_lot_animals USING btree (animal_id);
CREATE INDEX idx_ala_lot ON public.auction_lot_animals USING btree (auction_lot_id);
CREATE INDEX idx_audit_log_action ON public.audit_log USING btree (action, created_at DESC);
CREATE INDEX idx_audit_log_bu ON public.audit_log USING btree (business_unit_id, created_at DESC);
CREATE INDEX idx_audit_log_entity_created ON public.audit_log USING btree (entity, created_at DESC);
CREATE INDEX idx_audit_log_user_created ON public.audit_log USING btree (user_id, created_at DESC);
CREATE INDEX idx_bank_account_units_bu ON public.bank_account_units USING btree (business_unit_id);
CREATE INDEX idx_bank_contracts_bu ON public.bank_contracts USING btree (business_unit_id);
CREATE INDEX idx_bank_contracts_credit_tx ON public.bank_contracts USING btree (principal_credit_transaction_id);
CREATE INDEX idx_bank_contracts_status ON public.bank_contracts USING btree (status);
CREATE UNIQUE INDEX categories_bu_type_name_key ON public.categories USING btree (business_unit_id, type, name);
CREATE INDEX idx_categories_bu ON public.categories USING btree (business_unit_id);
CREATE INDEX idx_clients_bu ON public.clients USING btree (business_unit_id);
CREATE INDEX employees_business_unit_id_idx ON public.employees USING btree (business_unit_id);
CREATE INDEX employees_is_active_idx ON public.employees USING btree (is_active);
CREATE INDEX idx_haras_animal_partners_animal ON public.haras_animal_partners USING btree (animal_id);
CREATE INDEX idx_haras_animal_partners_client ON public.haras_animal_partners USING btree (client_id);
CREATE INDEX idx_hats_client_status ON public.haras_animal_transaction_shares USING btree (client_id, status);
CREATE INDEX idx_hats_tx ON public.haras_animal_transaction_shares USING btree (transaction_id);
CREATE INDEX idx_hat_animal_date ON public.haras_animal_transactions USING btree (animal_id, date DESC);
CREATE INDEX idx_hat_category ON public.haras_animal_transactions USING btree (category_id);
CREATE INDEX idx_hat_unit_date ON public.haras_animal_transactions USING btree (business_unit_id, date DESC);
CREATE INDEX idx_haras_animals_bu ON public.haras_animals USING btree (business_unit_id);
CREATE INDEX idx_haras_animals_primary_client ON public.haras_animals USING btree (primary_client_id);
CREATE INDEX idx_haras_animals_status ON public.haras_animals USING btree (status);
CREATE INDEX idx_breeding_sessions_batch ON public.haras_breeding_sessions USING btree (semen_batch_id);
CREATE INDEX idx_breeding_sessions_bu_scheduled ON public.haras_breeding_sessions USING btree (business_unit_id, scheduled_at DESC);
CREATE INDEX idx_breeding_sessions_embryo ON public.haras_breeding_sessions USING btree (embryo_id);
CREATE INDEX idx_breeding_sessions_mare ON public.haras_breeding_sessions USING btree (mare_id);
CREATE INDEX idx_breeding_sessions_stallion ON public.haras_breeding_sessions USING btree (stallion_id);
CREATE INDEX idx_haras_clients_bu ON public.haras_clients USING btree (business_unit_id);
CREATE UNIQUE INDEX haras_embryo_transfers_active_uq ON public.haras_embryo_transfers USING btree (embryo_id) WHERE (cancelled_at IS NULL);
CREATE INDEX haras_embryo_transfers_bu_idx ON public.haras_embryo_transfers USING btree (business_unit_id);
CREATE INDEX haras_embryo_transfers_recipient_idx ON public.haras_embryo_transfers USING btree (recipient_mare_id);
CREATE INDEX haras_embryos_bu_status_idx ON public.haras_embryos USING btree (business_unit_id, status);
CREATE INDEX haras_embryos_donor_idx ON public.haras_embryos USING btree (donor_mare_id);
CREATE INDEX haras_embryos_sire_idx ON public.haras_embryos USING btree (sire_stallion_id);
CREATE INDEX idx_embryos_fiv_batch ON public.haras_embryos USING btree (fiv_batch_id) WHERE (fiv_batch_id IS NOT NULL);
CREATE INDEX idx_fiv_bu_fert ON public.haras_fiv_batches USING btree (business_unit_id, fertilized_at DESC);
CREATE INDEX idx_fiv_semen_batch ON public.haras_fiv_batches USING btree (semen_batch_id) WHERE (semen_batch_id IS NOT NULL);
CREATE INDEX idx_fiv_session ON public.haras_fiv_batches USING btree (opu_session_id);
CREATE INDEX idx_fiv_stallion ON public.haras_fiv_batches USING btree (stallion_id);
CREATE INDEX idx_follicle_exams_bu_date ON public.haras_follicle_exams USING btree (business_unit_id, examined_at DESC);
CREATE INDEX idx_follicle_exams_mare_date ON public.haras_follicle_exams USING btree (mare_id, examined_at DESC);
CREATE INDEX idx_follicle_readings_exam ON public.haras_follicle_readings USING btree (exam_id);
CREATE INDEX idx_opu_bu_perf ON public.haras_opu_sessions USING btree (business_unit_id, performed_at DESC);
CREATE INDEX idx_opu_mare_perf ON public.haras_opu_sessions USING btree (donor_mare_id, performed_at DESC);
CREATE INDEX idx_pregnancies_bu_status ON public.haras_pregnancies USING btree (business_unit_id, status);
CREATE INDEX idx_pregnancies_mare_status ON public.haras_pregnancies USING btree (mare_id, status);
CREATE INDEX idx_pregnancies_session ON public.haras_pregnancies USING btree (breeding_session_id);
CREATE UNIQUE INDEX uq_pregnancies_active_mare ON public.haras_pregnancies USING btree (mare_id) WHERE (status = ANY (ARRAY['em_andamento'::repro_pregnancy_status, 'confirmada'::repro_pregnancy_status]));
CREATE UNIQUE INDEX uq_pregnancies_offspring ON public.haras_pregnancies USING btree (offspring_animal_id) WHERE (offspring_animal_id IS NOT NULL);
CREATE UNIQUE INDEX uq_pregnancies_session ON public.haras_pregnancies USING btree (breeding_session_id) WHERE (breeding_session_id IS NOT NULL);
CREATE INDEX idx_pregnancy_diagnostics_preg_date ON public.haras_pregnancy_diagnostics USING btree (pregnancy_id, diagnosed_at DESC);
CREATE INDEX idx_hpci_bu_status_open ON public.haras_purchase_commission_installments USING btree (business_unit_id, status) WHERE (status <> 'paid'::payment_status);
CREATE INDEX idx_hpci_commission ON public.haras_purchase_commission_installments USING btree (commission_id);
CREATE INDEX idx_hpci_commission_id ON public.haras_purchase_commission_installments USING btree (commission_id);
CREATE INDEX idx_hpci_payable ON public.haras_purchase_commission_installments USING btree (payable_id) WHERE (payable_id IS NOT NULL);
CREATE INDEX idx_hpci_payable_id ON public.haras_purchase_commission_installments USING btree (payable_id) WHERE (payable_id IS NOT NULL);
CREATE INDEX idx_hpc_bu ON public.haras_purchase_commissions USING btree (business_unit_id);
CREATE INDEX idx_hpc_expcat ON public.haras_purchase_commissions USING btree (expense_category_id);
CREATE INDEX idx_hpc_purchase_id ON public.haras_purchase_commissions USING btree (purchase_id);
CREATE INDEX idx_hpi_bu_status_open ON public.haras_purchase_installments USING btree (business_unit_id, status) WHERE (status <> 'paid'::payment_status);
CREATE INDEX idx_hpi_payable ON public.haras_purchase_installments USING btree (payable_id) WHERE (payable_id IS NOT NULL);
CREATE INDEX idx_hpi_payable_id ON public.haras_purchase_installments USING btree (payable_id) WHERE (payable_id IS NOT NULL);
CREATE INDEX idx_hpi_purchase ON public.haras_purchase_installments USING btree (purchase_id);
CREATE INDEX idx_hpi_purchase_id ON public.haras_purchase_installments USING btree (purchase_id);
CREATE INDEX idx_haras_purchases_animal ON public.haras_purchases USING btree (animal_id) WHERE (animal_id IS NOT NULL);
CREATE INDEX idx_haras_purchases_bu ON public.haras_purchases USING btree (business_unit_id);
CREATE INDEX idx_haras_purchases_date ON public.haras_purchases USING btree (business_unit_id, purchase_date DESC);
CREATE INDEX idx_haras_purchases_expcat ON public.haras_purchases USING btree (expense_category_id);
CREATE INDEX idx_haras_purchases_status ON public.haras_purchases USING btree (business_unit_id, purchase_status);
CREATE INDEX idx_haras_purchases_type ON public.haras_purchases USING btree (business_unit_id, purchase_type);
CREATE UNIQUE INDEX uq_haras_purchases_client_req ON public.haras_purchases USING btree (business_unit_id, client_request_id) WHERE (client_request_id IS NOT NULL);
CREATE INDEX idx_semen_batches_bu_stallion_available ON public.haras_semen_batches USING btree (business_unit_id, stallion_id) WHERE (doses_available > 0);
CREATE INDEX idx_semen_collections_bu_stallion_date ON public.haras_semen_collections USING btree (business_unit_id, stallion_id, collected_at DESC);
CREATE UNIQUE INDEX idx_semen_mov_fiv_batch ON public.haras_semen_movements USING btree (fiv_batch_id) WHERE (fiv_batch_id IS NOT NULL);
CREATE INDEX idx_semen_movements_batch_created ON public.haras_semen_movements USING btree (batch_id, created_at DESC);
CREATE UNIQUE INDEX uq_semen_movements_idempotency ON public.haras_semen_movements USING btree (batch_id, idempotency_key) WHERE (idempotency_key IS NOT NULL);
CREATE UNIQUE INDEX uq_semen_movements_initial_coleta ON public.haras_semen_movements USING btree (batch_id) WHERE (reason = 'coleta'::repro_movement_reason);
CREATE INDEX idx_hsl_diverged ON public.haras_shadow_log USING btree (diverged) WHERE (diverged = true);
CREATE INDEX idx_hsl_feature_ran ON public.haras_shadow_log USING btree (feature, ran_at DESC);
CREATE INDEX idx_installments_loan ON public.loan_installments USING btree (loan_id);
CREATE INDEX idx_loans_bu ON public.loans USING btree (business_unit_id);
CREATE UNIQUE INDEX notifications_dedupe_unread_idx ON public.notifications USING btree (user_id, type, entity_table, entity_id) WHERE (read_at IS NULL);
CREATE INDEX notifications_entity_idx ON public.notifications USING btree (entity_table, entity_id);
CREATE INDEX notifications_user_created_idx ON public.notifications USING btree (user_id, read_at, created_at DESC);
CREATE INDEX idx_payables_bank_contract ON public.payables USING btree (bank_contract_id, contract_installment_number) WHERE (bank_contract_id IS NOT NULL);
CREATE INDEX idx_payables_bu ON public.payables USING btree (business_unit_id);
CREATE INDEX idx_payables_employee_id ON public.payables USING btree (employee_id) WHERE (employee_id IS NOT NULL);
CREATE UNIQUE INDEX idx_payables_recurring_due ON public.payables USING btree (recurring_payable_id, due_date) WHERE (recurring_payable_id IS NOT NULL);
CREATE INDEX idx_payables_status_due ON public.payables USING btree (status, due_date);
CREATE UNIQUE INDEX payables_employee_period_uidx ON public.payables USING btree (employee_id, payroll_period) WHERE ((payroll_period IS NOT NULL) AND (employee_id IS NOT NULL));
CREATE INDEX payables_payroll_batch_idx ON public.payables USING btree (payroll_batch_id) WHERE (payroll_batch_id IS NOT NULL);
CREATE INDEX idx_receivables_bu_due ON public.receivables USING btree (business_unit_id, due_date);
CREATE INDEX idx_receivables_category ON public.receivables USING btree (category_id) WHERE (category_id IS NOT NULL);
CREATE INDEX idx_receivables_closed_at ON public.receivables USING btree (closed_at) WHERE (closed_at IS NOT NULL);
CREATE INDEX idx_receivables_haras_client ON public.receivables USING btree (haras_client_id) WHERE (haras_client_id IS NOT NULL);
CREATE INDEX idx_receivables_recurring_invoice ON public.receivables USING btree (recurring_invoice_id) WHERE (recurring_invoice_id IS NOT NULL);
CREATE INDEX idx_reservations_unit_dates ON public.reservations USING btree (business_unit_id, start_date, end_date);
CREATE INDEX idx_sale_installments_due_status ON public.sale_installments USING btree (due_date, status);
CREATE INDEX idx_sale_installments_parent ON public.sale_installments USING btree (parent_installment_id) WHERE (parent_installment_id IS NOT NULL);
CREATE INDEX idx_sale_installments_sale_id ON public.sale_installments USING btree (sale_id);
CREATE INDEX idx_si_recv ON public.sale_installments USING btree (receivable_id);
CREATE INDEX idx_si_sale ON public.sale_installments USING btree (sale_id);
CREATE INDEX idx_transactions_bank_account ON public.transactions USING btree (bank_account_id) WHERE (bank_account_id IS NOT NULL);
CREATE INDEX idx_transactions_bu_date ON public.transactions USING btree (business_unit_id, date DESC);
CREATE INDEX idx_transactions_closed_at ON public.transactions USING btree (closed_at) WHERE (closed_at IS NOT NULL);
CREATE INDEX idx_transactions_transfer_group ON public.transactions USING btree (transfer_group_id) WHERE (transfer_group_id IS NOT NULL);

-- ---------- VIEWS ----------
CREATE OR REPLACE VIEW public.bank_account_balances WITH (security_invoker=true) AS
 SELECT ba.id AS bank_account_id,
    ba.initial_balance + COALESCE(sum(
        CASE
            WHEN t.status = 'paid'::payment_status AND t.type = 'income'::transaction_type THEN t.amount
            WHEN t.status = 'paid'::payment_status AND t.type = 'expense'::transaction_type THEN - t.amount
            ELSE 0::numeric
        END), 0::numeric) AS realized_balance,
    COALESCE(sum(
        CASE
            WHEN t.status = 'paid'::payment_status AND t.type = 'income'::transaction_type THEN t.amount
            ELSE 0::numeric
        END), 0::numeric) AS total_income,
    COALESCE(sum(
        CASE
            WHEN t.status = 'paid'::payment_status AND t.type = 'expense'::transaction_type THEN t.amount
            ELSE 0::numeric
        END), 0::numeric) AS total_expense,
    max(t.date) AS last_movement_date,
    count(t.id) FILTER (WHERE t.status = 'paid'::payment_status) AS movements_count
   FROM bank_accounts ba
     LEFT JOIN transactions t ON t.bank_account_id = ba.id
  GROUP BY ba.id, ba.initial_balance;

CREATE OR REPLACE VIEW public.bank_contract_progress WITH (security_invoker=true) AS
 SELECT c.id AS contract_id,
    c.business_unit_id,
    c.installments_count,
    COALESCE(sum(
        CASE
            WHEN p.status = 'paid'::payment_status THEN 1
            ELSE 0
        END), 0::bigint)::integer AS paid_count,
    COALESCE(sum(
        CASE
            WHEN p.status = 'pending'::payment_status THEN 1
            ELSE 0
        END), 0::bigint)::integer AS pending_count,
    COALESCE(sum(
        CASE
            WHEN p.status = 'pending'::payment_status AND p.due_date < CURRENT_DATE THEN 1
            ELSE 0
        END), 0::bigint)::integer AS overdue_count,
    COALESCE(sum(
        CASE
            WHEN p.status = 'paid'::payment_status THEN p.amount
            ELSE 0::numeric
        END), 0::numeric) AS paid_amount,
    COALESCE(sum(
        CASE
            WHEN p.status = 'pending'::payment_status THEN p.amount
            ELSE 0::numeric
        END), 0::numeric) AS pending_amount,
    min(
        CASE
            WHEN p.status = 'pending'::payment_status THEN p.due_date
            ELSE NULL::date
        END) AS next_due_date,
    max(
        CASE
            WHEN p.status = 'paid'::payment_status THEN p.paid_at
            ELSE NULL::date
        END) AS last_paid_date,
        CASE
            WHEN c.installments_count IS NULL OR c.installments_count = 0 THEN NULL::numeric
            ELSE round(COALESCE(sum(
            CASE
                WHEN p.status = 'paid'::payment_status THEN 1
                ELSE 0
            END), 0::bigint)::numeric / c.installments_count::numeric * 100::numeric, 2)
        END AS progress_pct
   FROM bank_contracts c
     LEFT JOIN payables p ON p.bank_contract_id = c.id
  GROUP BY c.id, c.business_unit_id, c.installments_count;

CREATE OR REPLACE VIEW public.v_haras_reproduction_alerts WITH (security_invoker=true) AS
 WITH tz AS (
         SELECT (now() AT TIME ZONE 'America/Sao_Paulo'::text)::date AS today
        )
 SELECT s.business_unit_id,
    'breeding_today'::text AS alert_type,
    'info'::text AS severity,
    s.id AS reference_id,
    'session'::text AS reference_type,
    m.name AS mare_name,
    st.name AS stallion_name,
    s.scheduled_at::date AS due_date,
    0 AS days_delta
   FROM haras_breeding_sessions s
     JOIN haras_animals m ON m.id = s.mare_id
     LEFT JOIN haras_animals st ON st.id = s.stallion_id
     CROSS JOIN tz
  WHERE s.status = 'agendado'::repro_breeding_status AND s.scheduled_at::date = tz.today
UNION ALL
 SELECT s.business_unit_id,
    'breeding_upcoming'::text AS alert_type,
    'info'::text AS severity,
    s.id AS reference_id,
    'session'::text AS reference_type,
    m.name AS mare_name,
    st.name AS stallion_name,
    s.scheduled_at::date AS due_date,
    s.scheduled_at::date - tz.today AS days_delta
   FROM haras_breeding_sessions s
     JOIN haras_animals m ON m.id = s.mare_id
     LEFT JOIN haras_animals st ON st.id = s.stallion_id
     LEFT JOIN haras_reproduction_settings cfg ON cfg.business_unit_id = s.business_unit_id
     CROSS JOIN tz
  WHERE s.status = 'agendado'::repro_breeding_status AND s.scheduled_at::date > tz.today AND s.scheduled_at::date <= (tz.today + COALESCE(cfg.breeding_upcoming_days, 7))
UNION ALL
 SELECT s.business_unit_id,
    'breeding_overdue'::text AS alert_type,
    'critical'::text AS severity,
    s.id AS reference_id,
    'session'::text AS reference_type,
    m.name AS mare_name,
    st.name AS stallion_name,
    s.scheduled_at::date AS due_date,
    s.scheduled_at::date - tz.today AS days_delta
   FROM haras_breeding_sessions s
     JOIN haras_animals m ON m.id = s.mare_id
     LEFT JOIN haras_animals st ON st.id = s.stallion_id
     CROSS JOIN tz
  WHERE s.status = 'agendado'::repro_breeding_status AND s.scheduled_at::date < tz.today AND NOT (EXISTS ( SELECT 1
           FROM haras_pregnancies p
          WHERE p.breeding_session_id = s.id AND (p.status = ANY (ARRAY['em_andamento'::repro_pregnancy_status, 'confirmada'::repro_pregnancy_status]))))
UNION ALL
 SELECT p.business_unit_id,
    'diagnostic_due'::text AS alert_type,
    'warn'::text AS severity,
    p.id AS reference_id,
    'pregnancy'::text AS reference_type,
    m.name AS mare_name,
    st.name AS stallion_name,
    p.conception_date + LEAST(p.gestation_days, COALESCE(cfg.diagnostic_due_max_days, 200)) AS due_date,
    tz.today - p.conception_date AS days_delta
   FROM haras_pregnancies p
     JOIN haras_animals m ON m.id = p.mare_id
     LEFT JOIN haras_animals st ON st.id = p.stallion_id
     LEFT JOIN haras_reproduction_settings cfg ON cfg.business_unit_id = p.business_unit_id
     CROSS JOIN tz
     LEFT JOIN LATERAL ( SELECT max(d.diagnosed_at)::date AS last_diag
           FROM haras_pregnancy_diagnostics d
          WHERE d.pregnancy_id = p.id) ld ON true
  WHERE (p.status = ANY (ARRAY['em_andamento'::repro_pregnancy_status, 'confirmada'::repro_pregnancy_status])) AND (tz.today - p.conception_date) >= COALESCE(cfg.diagnostic_due_min_days, 15) AND (tz.today - p.conception_date) <= COALESCE(cfg.diagnostic_due_max_days, 200) AND (p.status = 'em_andamento'::repro_pregnancy_status AND ld.last_diag IS NULL OR p.status = 'confirmada'::repro_pregnancy_status AND (ld.last_diag IS NULL OR (tz.today - ld.last_diag) > COALESCE(cfg.diagnostic_recheck_days, 30)))
UNION ALL
 SELECT p.business_unit_id,
    'dpp_soon'::text AS alert_type,
    'warn'::text AS severity,
    p.id AS reference_id,
    'pregnancy'::text AS reference_type,
    m.name AS mare_name,
    st.name AS stallion_name,
    p.conception_date + p.gestation_days AS due_date,
    p.conception_date + p.gestation_days - tz.today AS days_delta
   FROM haras_pregnancies p
     JOIN haras_animals m ON m.id = p.mare_id
     LEFT JOIN haras_animals st ON st.id = p.stallion_id
     LEFT JOIN haras_reproduction_settings cfg ON cfg.business_unit_id = p.business_unit_id
     CROSS JOIN tz
  WHERE p.status = 'confirmada'::repro_pregnancy_status AND (p.conception_date + p.gestation_days) >= tz.today AND (p.conception_date + p.gestation_days) <= (tz.today + COALESCE(cfg.dpp_soon_days, 14))
UNION ALL
 SELECT p.business_unit_id,
    'dpp_overdue'::text AS alert_type,
    'critical'::text AS severity,
    p.id AS reference_id,
    'pregnancy'::text AS reference_type,
    m.name AS mare_name,
    st.name AS stallion_name,
    p.conception_date + p.gestation_days AS due_date,
    p.conception_date + p.gestation_days - tz.today AS days_delta
   FROM haras_pregnancies p
     JOIN haras_animals m ON m.id = p.mare_id
     LEFT JOIN haras_animals st ON st.id = p.stallion_id
     LEFT JOIN haras_reproduction_settings cfg ON cfg.business_unit_id = p.business_unit_id
     CROSS JOIN tz
  WHERE p.status = 'confirmada'::repro_pregnancy_status AND (tz.today - (p.conception_date + p.gestation_days)) > COALESCE(cfg.dpp_overdue_days, 7);

CREATE OR REPLACE VIEW public.v_sale_delinquency_by_buyer WITH (security_invoker=true) AS
 SELECT s.business_unit_id,
    s.buyer_client_id,
    c.name AS buyer_name,
    sum(si.amount) AS overdue_amount,
    count(*) AS overdue_installments,
    max(CURRENT_DATE - si.due_date) AS max_days_overdue,
    min(si.due_date) AS oldest_due_date
   FROM sale_installments si
     JOIN animal_sales s ON s.id = si.sale_id
     LEFT JOIN haras_clients c ON c.id = s.buyer_client_id
  WHERE si.status = 'pending'::payment_status AND si.due_date < CURRENT_DATE AND s.status <> 'cancelled'::sale_status
  GROUP BY s.business_unit_id, s.buyer_client_id, c.name;

CREATE OR REPLACE VIEW public.v_sale_health_checks WITH (security_invoker=true) AS
 SELECT 'sum_installments_mismatch'::text AS check_kind,
    s.id AS sale_id,
    s.business_unit_id,
    jsonb_build_object('net_amount', round(s.total_amount - s.down_payment, 2), 'sum_installments', round(COALESCE(x.sum_amount, 0::numeric), 2), 'diff', round(s.total_amount - s.down_payment - COALESCE(x.sum_amount, 0::numeric), 2)) AS details
   FROM animal_sales s
     LEFT JOIN LATERAL ( SELECT sum(sale_installments.amount) FILTER (WHERE sale_installments.status <> 'renegotiated'::payment_status) AS sum_amount
           FROM sale_installments
          WHERE sale_installments.sale_id = s.id) x ON true
  WHERE s.status <> 'cancelled'::sale_status AND abs(s.total_amount - s.down_payment - COALESCE(x.sum_amount, 0::numeric)) >= 0.01
UNION ALL
 SELECT 'renegotiated_without_children'::text AS check_kind,
    si.sale_id,
    s.business_unit_id,
    jsonb_build_object('installment_id', si.id, 'installment_number', si.installment_number) AS details
   FROM sale_installments si
     JOIN animal_sales s ON s.id = si.sale_id
  WHERE si.status = 'renegotiated'::payment_status AND NOT (EXISTS ( SELECT 1
           FROM sale_installments c
          WHERE c.parent_installment_id = si.id))
UNION ALL
 SELECT 'lot_animal_stale_sale'::text AS check_kind,
    ala.sale_id,
    al.business_unit_id,
    jsonb_build_object('lot_animal_id', ala.id, 'auction_lot_id', ala.auction_lot_id) AS details
   FROM auction_lot_animals ala
     JOIN auction_lots al ON al.id = ala.auction_lot_id
  WHERE ala.sale_id IS NOT NULL AND NOT (EXISTS ( SELECT 1
           FROM animal_sales s
          WHERE s.id = ala.sale_id))
UNION ALL
 SELECT 'open_installment_on_cancelled_sale'::text AS check_kind,
    si.sale_id,
    s.business_unit_id,
    jsonb_build_object('installment_id', si.id, 'status', si.status::text) AS details
   FROM sale_installments si
     JOIN animal_sales s ON s.id = si.sale_id
  WHERE s.status = 'cancelled'::sale_status AND (si.status = ANY (ARRAY['pending'::payment_status, 'overdue'::payment_status]));

CREATE OR REPLACE VIEW public.v_sale_reconciliation WITH (security_invoker=true) AS
 SELECT s.id AS sale_id,
    s.business_unit_id,
    s.sale_date,
    s.total_amount,
    s.down_payment,
    s.status AS sale_status,
    COALESCE(si.sum_amount, 0::numeric) AS sum_installments,
    COALESCE(si.paid_count, 0::bigint) AS paid_installments,
    COALESCE(si.total_count, 0::bigint) AS total_installments,
    round(s.total_amount - s.down_payment - COALESCE(si.sum_amount, 0::numeric), 2) AS diff_installments,
        CASE
            WHEN abs(s.total_amount - s.down_payment - COALESCE(si.sum_amount, 0::numeric)) < 0.01 THEN 'ok'::text
            WHEN abs(s.total_amount - s.down_payment - COALESCE(si.sum_amount, 0::numeric)) < 1.00 THEN 'warn'::text
            ELSE 'mismatch'::text
        END AS reconciliation_status,
    a.name AS animal_name,
    c.name AS buyer_name
   FROM animal_sales s
     LEFT JOIN LATERAL ( SELECT sum(sale_installments.amount) FILTER (WHERE sale_installments.status <> ALL (ARRAY['renegotiated'::payment_status, 'cancelled'::payment_status])) AS sum_amount,
            count(*) FILTER (WHERE sale_installments.status = 'paid'::payment_status) AS paid_count,
            count(*) FILTER (WHERE sale_installments.status <> ALL (ARRAY['renegotiated'::payment_status, 'cancelled'::payment_status])) AS total_count
           FROM sale_installments
          WHERE sale_installments.sale_id = s.id) si ON true
     LEFT JOIN haras_animals a ON a.id = s.animal_id
     LEFT JOIN haras_clients c ON c.id = s.buyer_client_id
  WHERE s.status <> 'cancelled'::sale_status;

-- ---------- TRIGGERS ----------
CREATE TRIGGER audit_animal_sales AFTER INSERT OR DELETE OR UPDATE ON public.animal_sales FOR EACH ROW EXECUTE FUNCTION tg_audit_log();
CREATE TRIGGER tg_animal_sales_cleanup_commission_payable BEFORE DELETE ON public.animal_sales FOR EACH ROW EXECUTE FUNCTION cleanup_sale_commission_payable();
CREATE TRIGGER tg_animal_sales_cleanup_commission_receivable BEFORE DELETE ON public.animal_sales FOR EACH ROW EXECUTE FUNCTION cleanup_sale_commission_receivable();
CREATE TRIGGER trg_as_upd BEFORE UPDATE ON public.animal_sales FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER audit_auction_lots AFTER INSERT OR DELETE OR UPDATE ON public.auction_lots FOR EACH ROW EXECUTE FUNCTION tg_audit_log();
CREATE TRIGGER trg_al_upd BEFORE UPDATE ON public.auction_lots FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER audit_bank_account_units AFTER INSERT OR DELETE OR UPDATE ON public.bank_account_units FOR EACH ROW EXECUTE FUNCTION tg_write_audit();
CREATE TRIGGER audit_bank_accounts AFTER INSERT OR DELETE OR UPDATE ON public.bank_accounts FOR EACH ROW EXECUTE FUNCTION tg_write_audit();
CREATE TRIGGER trg_bank_accounts_updated_at BEFORE UPDATE ON public.bank_accounts FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER audit_bank_contracts AFTER INSERT OR DELETE OR UPDATE ON public.bank_contracts FOR EACH ROW EXECUTE FUNCTION tg_audit_log();
CREATE TRIGGER bank_contract_set_updated_at BEFORE UPDATE ON public.bank_contracts FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER bank_contract_validate BEFORE INSERT OR UPDATE ON public.bank_contracts FOR EACH ROW EXECUTE FUNCTION tg_bank_contract_validate();
CREATE TRIGGER tg_bank_contract_before_delete BEFORE DELETE ON public.bank_contracts FOR EACH ROW EXECUTE FUNCTION tg_bank_contract_delete_credit_tx();
CREATE TRIGGER trg_seed_payroll_category AFTER INSERT ON public.business_units FOR EACH ROW EXECUTE FUNCTION seed_default_payroll_category();
CREATE TRIGGER trg_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER audit_clients AFTER INSERT OR DELETE OR UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION tg_audit_log();
CREATE TRIGGER trg_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER employees_audit AFTER INSERT OR DELETE OR UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION tg_write_audit();
CREATE TRIGGER employees_set_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tg_hac_updated BEFORE UPDATE ON public.haras_animal_categories FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tg_haras_categories_block_delete BEFORE DELETE ON public.haras_animal_categories FOR EACH ROW EXECUTE FUNCTION tg_haras_categories_block_delete();
CREATE CONSTRAINT TRIGGER tg_check_partners_100 AFTER INSERT OR DELETE OR UPDATE ON public.haras_animal_partners DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION tg_validate_partners_100_for_animal();
CREATE TRIGGER tg_haras_tx_generate_shares_ins AFTER INSERT ON public.haras_animal_transactions FOR EACH ROW EXECUTE FUNCTION tg_haras_tx_generate_shares();
CREATE TRIGGER tg_haras_tx_generate_shares_upd AFTER UPDATE ON public.haras_animal_transactions FOR EACH ROW WHEN (((old.amount IS DISTINCT FROM new.amount) OR (old.animal_id IS DISTINCT FROM new.animal_id))) EXECUTE FUNCTION tg_haras_tx_generate_shares();
CREATE TRIGGER tg_haras_tx_validate BEFORE INSERT OR UPDATE ON public.haras_animal_transactions FOR EACH ROW EXECUTE FUNCTION tg_haras_tx_validate();
CREATE TRIGGER tg_hat_updated BEFORE UPDATE ON public.haras_animal_transactions FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER audit_haras_animals AFTER INSERT OR DELETE OR UPDATE ON public.haras_animals FOR EACH ROW EXECUTE FUNCTION tg_audit_log();
CREATE TRIGGER tg_haras_animals_updated_at BEFORE UPDATE ON public.haras_animals FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tg_validate_primary_client_same_unit BEFORE INSERT OR UPDATE OF primary_client_id, business_unit_id ON public.haras_animals FOR EACH ROW EXECUTE FUNCTION tg_validate_primary_client_same_unit();
CREATE TRIGGER a_haras_breeding_validate BEFORE INSERT OR UPDATE ON public.haras_breeding_sessions FOR EACH ROW EXECUTE FUNCTION tg_haras_breeding_validate();
CREATE TRIGGER b_haras_breeding_guard BEFORE INSERT OR UPDATE ON public.haras_breeding_sessions FOR EACH ROW EXECUTE FUNCTION tg_haras_breeding_guard();
CREATE TRIGGER c_haras_breeding_pregnancy_guard BEFORE UPDATE ON public.haras_breeding_sessions FOR EACH ROW EXECUTE FUNCTION tg_haras_breeding_pregnancy_guard();
CREATE TRIGGER z_haras_breeding_set_updated_at BEFORE UPDATE ON public.haras_breeding_sessions FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER audit_haras_clients AFTER INSERT OR DELETE OR UPDATE ON public.haras_clients FOR EACH ROW EXECUTE FUNCTION tg_audit_log();
CREATE TRIGGER tg_haras_clients_block_delete BEFORE DELETE ON public.haras_clients FOR EACH ROW EXECUTE FUNCTION tg_haras_clients_block_delete_if_referenced();
CREATE TRIGGER tg_haras_clients_updated_at BEFORE UPDATE ON public.haras_clients FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER haras_embryo_transfers_set_updated_at BEFORE UPDATE ON public.haras_embryo_transfers FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER haras_embryo_transfers_validate_trg BEFORE INSERT OR UPDATE ON public.haras_embryo_transfers FOR EACH ROW EXECUTE FUNCTION haras_embryo_transfers_validate();
CREATE TRIGGER haras_embryos_set_updated_at BEFORE UPDATE ON public.haras_embryos FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER haras_embryos_validate_trg BEFORE INSERT OR UPDATE ON public.haras_embryos FOR EACH ROW EXECUTE FUNCTION haras_embryos_validate();
CREATE TRIGGER tg_hff_updated BEFORE UPDATE ON public.haras_feature_flags FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER a_haras_fiv_validate BEFORE INSERT OR UPDATE ON public.haras_fiv_batches FOR EACH ROW EXECUTE FUNCTION a_haras_fiv_validate();
CREATE TRIGGER tg_audit_haras_fiv_batches AFTER INSERT OR DELETE OR UPDATE ON public.haras_fiv_batches FOR EACH ROW EXECUTE FUNCTION tg_audit_log();
CREATE TRIGGER z_haras_fiv_batches_updated_at BEFORE UPDATE ON public.haras_fiv_batches FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER a_haras_follicle_exam_validate BEFORE INSERT OR UPDATE ON public.haras_follicle_exams FOR EACH ROW EXECUTE FUNCTION tg_haras_follicle_exam_validate();
CREATE TRIGGER tg_audit_follicle_exams AFTER INSERT OR DELETE OR UPDATE ON public.haras_follicle_exams FOR EACH ROW EXECUTE FUNCTION tg_audit_log();
CREATE TRIGGER z_haras_follicle_exam_updated_at BEFORE UPDATE ON public.haras_follicle_exams FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER a_haras_follicle_reading_validate BEFORE INSERT OR UPDATE ON public.haras_follicle_readings FOR EACH ROW EXECUTE FUNCTION tg_haras_follicle_reading_validate();
CREATE TRIGGER tg_audit_follicle_readings AFTER INSERT OR DELETE OR UPDATE ON public.haras_follicle_readings FOR EACH ROW EXECUTE FUNCTION tg_audit_log();
CREATE TRIGGER z_haras_follicle_reading_updated_at BEFORE UPDATE ON public.haras_follicle_readings FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER a_haras_opu_validate BEFORE INSERT OR UPDATE ON public.haras_opu_sessions FOR EACH ROW EXECUTE FUNCTION a_haras_opu_validate();
CREATE TRIGGER tg_audit_haras_opu_sessions AFTER INSERT OR DELETE OR UPDATE ON public.haras_opu_sessions FOR EACH ROW EXECUTE FUNCTION tg_audit_log();
CREATE TRIGGER z_haras_opu_sessions_updated_at BEFORE UPDATE ON public.haras_opu_sessions FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tg_hpl_updated BEFORE UPDATE ON public.haras_partner_locations FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER a_haras_pregnancy_validate BEFORE INSERT OR UPDATE ON public.haras_pregnancies FOR EACH ROW EXECUTE FUNCTION tg_haras_pregnancy_validate();
CREATE TRIGGER b_haras_pregnancy_guard BEFORE INSERT OR UPDATE ON public.haras_pregnancies FOR EACH ROW EXECUTE FUNCTION tg_haras_pregnancy_guard();
CREATE TRIGGER z_haras_pregnancy_set_updated_at BEFORE UPDATE ON public.haras_pregnancies FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER a_haras_pregnancy_diagnostic_validate BEFORE INSERT OR UPDATE ON public.haras_pregnancy_diagnostics FOR EACH ROW EXECUTE FUNCTION tg_haras_pregnancy_diagnostic_validate();
CREATE TRIGGER z_haras_pregnancy_diagnostic_set_updated_at BEFORE UPDATE ON public.haras_pregnancy_diagnostics FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER audit_haras_purchase_commission_installments AFTER INSERT OR DELETE OR UPDATE ON public.haras_purchase_commission_installments FOR EACH ROW EXECUTE FUNCTION tg_audit_log();
CREATE TRIGGER trg_hpci_bu_chk BEFORE INSERT OR UPDATE ON public.haras_purchase_commission_installments FOR EACH ROW EXECUTE FUNCTION tg_haras_purchase_bu_consistency();
CREATE TRIGGER trg_hpci_recompute AFTER INSERT OR DELETE OR UPDATE OF status ON public.haras_purchase_commission_installments FOR EACH ROW EXECUTE FUNCTION tg_haras_recompute_from_installment();
CREATE TRIGGER trg_hpci_updated BEFORE UPDATE ON public.haras_purchase_commission_installments FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER audit_haras_purchase_commissions AFTER INSERT OR DELETE OR UPDATE ON public.haras_purchase_commissions FOR EACH ROW EXECUTE FUNCTION tg_audit_log();
CREATE TRIGGER trg_hpc_bu_chk BEFORE INSERT OR UPDATE ON public.haras_purchase_commissions FOR EACH ROW EXECUTE FUNCTION tg_haras_purchase_bu_consistency();
CREATE TRIGGER trg_hpc_updated BEFORE UPDATE ON public.haras_purchase_commissions FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER audit_haras_purchase_installments AFTER INSERT OR DELETE OR UPDATE ON public.haras_purchase_installments FOR EACH ROW EXECUTE FUNCTION tg_audit_log();
CREATE TRIGGER trg_hpi_bu_chk BEFORE INSERT OR UPDATE ON public.haras_purchase_installments FOR EACH ROW EXECUTE FUNCTION tg_haras_purchase_bu_consistency();
CREATE TRIGGER trg_hpi_recompute AFTER INSERT OR DELETE OR UPDATE OF status ON public.haras_purchase_installments FOR EACH ROW EXECUTE FUNCTION tg_haras_recompute_from_installment();
CREATE TRIGGER trg_hpi_updated BEFORE UPDATE ON public.haras_purchase_installments FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER audit_haras_purchases AFTER INSERT OR DELETE OR UPDATE ON public.haras_purchases FOR EACH ROW EXECUTE FUNCTION tg_audit_log();
CREATE TRIGGER trg_hp_bu_chk BEFORE INSERT OR UPDATE ON public.haras_purchases FOR EACH ROW EXECUTE FUNCTION tg_haras_purchase_bu_consistency();
CREATE TRIGGER trg_hp_updated BEFORE UPDATE ON public.haras_purchases FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tg_hrii_recalc AFTER INSERT OR DELETE OR UPDATE ON public.haras_recurring_invoice_items FOR EACH ROW EXECUTE FUNCTION tg_hri_recalc_total();
CREATE TRIGGER audit_haras_recurring_invoices AFTER INSERT OR DELETE OR UPDATE ON public.haras_recurring_invoices FOR EACH ROW EXECUTE FUNCTION tg_audit_log();
CREATE TRIGGER tg_hri_updated BEFORE UPDATE ON public.haras_recurring_invoices FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_haras_reproduction_settings_updated_at BEFORE UPDATE ON public.haras_reproduction_settings FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER audit_haras_semen_batches AFTER INSERT OR DELETE OR UPDATE ON public.haras_semen_batches FOR EACH ROW EXECUTE FUNCTION tg_audit_log();
CREATE TRIGGER set_semen_batches_updated_at BEFORE UPDATE ON public.haras_semen_batches FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_semen_batch_after_insert AFTER INSERT ON public.haras_semen_batches FOR EACH ROW EXECUTE FUNCTION tg_semen_batch_after_insert();
CREATE TRIGGER trg_semen_batch_before_ins_upd BEFORE INSERT OR UPDATE ON public.haras_semen_batches FOR EACH ROW EXECUTE FUNCTION tg_semen_batch_before_ins_upd();
CREATE TRIGGER audit_haras_semen_collections AFTER INSERT OR DELETE OR UPDATE ON public.haras_semen_collections FOR EACH ROW EXECUTE FUNCTION tg_audit_log();
CREATE TRIGGER set_semen_collections_updated_at BEFORE UPDATE ON public.haras_semen_collections FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER audit_haras_semen_movements AFTER INSERT OR DELETE OR UPDATE ON public.haras_semen_movements FOR EACH ROW EXECUTE FUNCTION tg_audit_log();
CREATE TRIGGER set_semen_movements_updated_at BEFORE UPDATE ON public.haras_semen_movements FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_semen_movement_recalc AFTER INSERT OR DELETE OR UPDATE ON public.haras_semen_movements FOR EACH ROW EXECUTE FUNCTION tg_semen_movement_recalc();
CREATE TRIGGER trg_semen_movement_sign BEFORE INSERT OR UPDATE ON public.haras_semen_movements FOR EACH ROW EXECUTE FUNCTION tg_semen_movement_sign();
CREATE TRIGGER tg_hs_updated BEFORE UPDATE ON public.haras_services FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER audit_loan_installments AFTER INSERT OR DELETE OR UPDATE ON public.loan_installments FOR EACH ROW EXECUTE FUNCTION tg_audit_log();
CREATE TRIGGER tg_notify_overdue AFTER UPDATE OF status ON public.loan_installments FOR EACH ROW EXECUTE FUNCTION tg_notify_became_overdue();
CREATE TRIGGER audit_loans AFTER INSERT OR DELETE OR UPDATE ON public.loans FOR EACH ROW EXECUTE FUNCTION tg_audit_log();
CREATE TRIGGER trg_generate_installments AFTER INSERT ON public.loans FOR EACH ROW EXECUTE FUNCTION generate_loan_installments();
CREATE TRIGGER trg_loans_updated_at BEFORE UPDATE ON public.loans FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER audit_payables AFTER INSERT OR DELETE OR UPDATE ON public.payables FOR EACH ROW EXECUTE FUNCTION tg_audit_log();
CREATE TRIGGER bank_contract_sync_status AFTER INSERT OR DELETE OR UPDATE OF status, bank_contract_id ON public.payables FOR EACH ROW EXECUTE FUNCTION tg_bank_contract_sync_status();
CREATE TRIGGER payables_enforce_close BEFORE DELETE OR UPDATE ON public.payables FOR EACH ROW EXECUTE FUNCTION enforce_period_close();
CREATE TRIGGER payables_set_updated_at BEFORE UPDATE ON public.payables FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tg_notify_overdue AFTER UPDATE OF status ON public.payables FOR EACH ROW EXECUTE FUNCTION tg_notify_became_overdue();
CREATE TRIGGER trg_payables_sync_haras AFTER UPDATE OF status ON public.payables FOR EACH ROW WHEN (((new.status = 'paid'::payment_status) AND (old.status IS DISTINCT FROM 'paid'::payment_status))) EXECUTE FUNCTION tg_sync_payable_to_haras_installment();
CREATE TRIGGER trg_validate_payable_employee BEFORE INSERT OR UPDATE OF employee_id, business_unit_id, category_id ON public.payables FOR EACH ROW EXECUTE FUNCTION validate_payable_employee();
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER audit_receivables AFTER INSERT OR DELETE OR UPDATE ON public.receivables FOR EACH ROW EXECUTE FUNCTION tg_audit_log();
CREATE TRIGGER receivables_enforce_close BEFORE DELETE OR UPDATE ON public.receivables FOR EACH ROW EXECUTE FUNCTION enforce_period_close();
CREATE TRIGGER tg_notify_overdue AFTER UPDATE OF status ON public.receivables FOR EACH ROW EXECUTE FUNCTION tg_notify_became_overdue();
CREATE TRIGGER trg_receivables_updated_at BEFORE UPDATE ON public.receivables FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_si_sync AFTER UPDATE OF status, paid_at ON public.receivables FOR EACH ROW WHEN (((old.status IS DISTINCT FROM new.status) OR (old.paid_at IS DISTINCT FROM new.paid_at))) EXECUTE FUNCTION tg_sale_inst_sync_from_receivable();
CREATE TRIGGER audit_recurring_payables AFTER INSERT OR DELETE OR UPDATE ON public.recurring_payables FOR EACH ROW EXECUTE FUNCTION tg_audit_log();
CREATE TRIGGER trg_rp_updated BEFORE UPDATE ON public.recurring_payables FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER audit_reservations AFTER INSERT OR DELETE OR UPDATE ON public.reservations FOR EACH ROW EXECUTE FUNCTION tg_audit_log();
CREATE TRIGGER reservations_set_updated_at BEFORE UPDATE ON public.reservations FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER reservations_status_change BEFORE INSERT OR UPDATE OF status ON public.reservations FOR EACH ROW EXECUTE FUNCTION on_reservation_status_change();
CREATE TRIGGER trg_fanout_sale_installment_notification AFTER INSERT ON public.sale_installment_notifications FOR EACH ROW EXECUTE FUNCTION fanout_sale_installment_notification();
CREATE TRIGGER audit_sale_installments AFTER INSERT OR DELETE OR UPDATE ON public.sale_installments FOR EACH ROW EXECUTE FUNCTION tg_audit_log();
CREATE TRIGGER tg_notify_sale_paid AFTER UPDATE OF status ON public.sale_installments FOR EACH ROW EXECUTE FUNCTION tg_notify_sale_installment_paid();
CREATE TRIGGER trg_si_upd BEFORE UPDATE ON public.sale_installments FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER audit_transactions AFTER INSERT OR DELETE OR UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION tg_audit_log();
CREATE TRIGGER transactions_enforce_close BEFORE DELETE OR UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION enforce_period_close();
CREATE TRIGGER trg_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------- ROW LEVEL SECURITY ----------
ALTER TABLE public.animal_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_lot_animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_account_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.haras_animal_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.haras_animal_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.haras_animal_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.haras_animal_transaction_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.haras_animal_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.haras_animal_weight_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.haras_animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.haras_breeding_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.haras_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.haras_embryo_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.haras_embryos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.haras_feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.haras_fiv_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.haras_follicle_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.haras_follicle_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.haras_opu_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.haras_partner_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.haras_pregnancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.haras_pregnancy_diagnostics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.haras_purchase_commission_installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.haras_purchase_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.haras_purchase_installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.haras_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.haras_recurring_invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.haras_recurring_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.haras_recurring_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.haras_reproduction_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.haras_semen_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.haras_semen_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.haras_semen_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.haras_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.haras_shadow_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receivables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_payables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_installment_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_module_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_unit_access ENABLE ROW LEVEL SECURITY;

-- ---------- POLICIES (public) ----------
CREATE POLICY "as del" ON public.animal_sales AS PERMISSIVE FOR DELETE TO authenticated USING ((has_permission(auth.uid(), 'sales'::app_module, 'delete'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "as ins" ON public.animal_sales AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((has_permission(auth.uid(), 'sales'::app_module, 'create'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "as sel" ON public.animal_sales AS PERMISSIVE FOR SELECT TO authenticated USING ((has_permission(auth.uid(), 'sales'::app_module, 'view'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "as upd" ON public.animal_sales AS PERMISSIVE FOR UPDATE TO authenticated USING ((has_permission(auth.uid(), 'sales'::app_module, 'edit'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "ala del" ON public.auction_lot_animals AS PERMISSIVE FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM auction_lots l
  WHERE ((l.id = auction_lot_animals.auction_lot_id) AND has_permission(auth.uid(), 'sales'::app_module, 'delete'::permission_action) AND can_access_unit(auth.uid(), l.business_unit_id)))));
CREATE POLICY "ala ins" ON public.auction_lot_animals AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM auction_lots l
  WHERE ((l.id = auction_lot_animals.auction_lot_id) AND has_permission(auth.uid(), 'sales'::app_module, 'create'::permission_action) AND can_access_unit(auth.uid(), l.business_unit_id)))));
CREATE POLICY "ala sel" ON public.auction_lot_animals AS PERMISSIVE FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM auction_lots l
  WHERE ((l.id = auction_lot_animals.auction_lot_id) AND has_permission(auth.uid(), 'sales'::app_module, 'view'::permission_action) AND can_access_unit(auth.uid(), l.business_unit_id)))));
CREATE POLICY "ala upd" ON public.auction_lot_animals AS PERMISSIVE FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM auction_lots l
  WHERE ((l.id = auction_lot_animals.auction_lot_id) AND has_permission(auth.uid(), 'sales'::app_module, 'edit'::permission_action) AND can_access_unit(auth.uid(), l.business_unit_id)))));
CREATE POLICY "al del" ON public.auction_lots AS PERMISSIVE FOR DELETE TO authenticated USING ((has_permission(auth.uid(), 'sales'::app_module, 'delete'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "al ins" ON public.auction_lots AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((has_permission(auth.uid(), 'sales'::app_module, 'create'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "al sel" ON public.auction_lots AS PERMISSIVE FOR SELECT TO authenticated USING ((has_permission(auth.uid(), 'sales'::app_module, 'view'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "al upd" ON public.auction_lots AS PERMISSIVE FOR UPDATE TO authenticated USING ((has_permission(auth.uid(), 'sales'::app_module, 'edit'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "audit select admin" ON public.audit_log AS PERMISSIVE FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "audit_log insert authenticated" ON public.audit_log AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((auth.uid() IS NOT NULL));
CREATE POLICY bank_account_units_delete ON public.bank_account_units AS PERMISSIVE FOR DELETE TO authenticated USING (has_permission(auth.uid(), 'bank_accounts'::app_module, 'edit'::permission_action));
CREATE POLICY bank_account_units_insert ON public.bank_account_units AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (has_permission(auth.uid(), 'bank_accounts'::app_module, 'edit'::permission_action));
CREATE POLICY bank_account_units_select ON public.bank_account_units AS PERMISSIVE FOR SELECT TO authenticated USING (can_view_bank_account(auth.uid(), bank_account_id));
CREATE POLICY bank_accounts_delete ON public.bank_accounts AS PERMISSIVE FOR DELETE TO authenticated USING (has_permission(auth.uid(), 'bank_accounts'::app_module, 'delete'::permission_action));
CREATE POLICY bank_accounts_insert ON public.bank_accounts AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (has_permission(auth.uid(), 'bank_accounts'::app_module, 'create'::permission_action));
CREATE POLICY bank_accounts_select ON public.bank_accounts AS PERMISSIVE FOR SELECT TO authenticated USING (can_view_bank_account(auth.uid(), id));
CREATE POLICY bank_accounts_update ON public.bank_accounts AS PERMISSIVE FOR UPDATE TO authenticated USING (has_permission(auth.uid(), 'bank_accounts'::app_module, 'edit'::permission_action)) WITH CHECK (has_permission(auth.uid(), 'bank_accounts'::app_module, 'edit'::permission_action));
CREATE POLICY "bc delete" ON public.bank_contracts AS PERMISSIVE FOR DELETE TO authenticated USING ((has_permission(auth.uid(), 'bank_contracts'::app_module, 'delete'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "bc insert" ON public.bank_contracts AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((has_permission(auth.uid(), 'bank_contracts'::app_module, 'create'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "bc select" ON public.bank_contracts AS PERMISSIVE FOR SELECT TO authenticated USING ((has_permission(auth.uid(), 'bank_contracts'::app_module, 'view'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "bc update" ON public.bank_contracts AS PERMISSIVE FOR UPDATE TO authenticated USING ((has_permission(auth.uid(), 'bank_contracts'::app_module, 'edit'::permission_action) AND can_access_unit(auth.uid(), business_unit_id))) WITH CHECK ((has_permission(auth.uid(), 'bank_contracts'::app_module, 'edit'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "admin delete units" ON public.business_units AS PERMISSIVE FOR DELETE TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "admin insert units" ON public.business_units AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "admin update units" ON public.business_units AS PERMISSIVE FOR UPDATE TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "auth view units" ON public.business_units AS PERMISSIVE FOR SELECT TO authenticated USING (true);
CREATE POLICY "cat delete" ON public.categories AS PERMISSIVE FOR DELETE TO authenticated USING ((has_permission(auth.uid(), 'categories'::app_module, 'delete'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "cat insert" ON public.categories AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((has_permission(auth.uid(), 'categories'::app_module, 'create'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "cat select" ON public.categories AS PERMISSIVE FOR SELECT TO authenticated USING ((has_permission(auth.uid(), 'categories'::app_module, 'view'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "cat update" ON public.categories AS PERMISSIVE FOR UPDATE TO authenticated USING ((has_permission(auth.uid(), 'categories'::app_module, 'edit'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "cli delete" ON public.clients AS PERMISSIVE FOR DELETE TO authenticated USING ((has_permission(auth.uid(), 'clients'::app_module, 'delete'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "cli insert" ON public.clients AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((has_permission(auth.uid(), 'clients'::app_module, 'create'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "cli select" ON public.clients AS PERMISSIVE FOR SELECT TO authenticated USING ((has_permission(auth.uid(), 'clients'::app_module, 'view'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "cli update" ON public.clients AS PERMISSIVE FOR UPDATE TO authenticated USING ((has_permission(auth.uid(), 'clients'::app_module, 'edit'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY employees_delete ON public.employees AS PERMISSIVE FOR DELETE TO authenticated USING ((has_permission(auth.uid(), 'employees'::app_module, 'delete'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY employees_insert ON public.employees AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((has_permission(auth.uid(), 'employees'::app_module, 'create'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY employees_select ON public.employees AS PERMISSIVE FOR SELECT TO authenticated USING (can_access_unit(auth.uid(), business_unit_id));
CREATE POLICY employees_update ON public.employees AS PERMISSIVE FOR UPDATE TO authenticated USING ((has_permission(auth.uid(), 'employees'::app_module, 'edit'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "hac delete" ON public.haras_animal_categories AS PERMISSIVE FOR DELETE TO authenticated USING (can_access_unit(auth.uid(), business_unit_id));
CREATE POLICY "hac insert" ON public.haras_animal_categories AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (can_access_unit(auth.uid(), business_unit_id));
CREATE POLICY "hac select" ON public.haras_animal_categories AS PERMISSIVE FOR SELECT TO authenticated USING (can_access_unit(auth.uid(), business_unit_id));
CREATE POLICY "hac update" ON public.haras_animal_categories AS PERMISSIVE FOR UPDATE TO authenticated USING (can_access_unit(auth.uid(), business_unit_id));
CREATE POLICY "ham delete" ON public.haras_animal_movements AS PERMISSIVE FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM haras_animals a
  WHERE ((a.id = haras_animal_movements.animal_id) AND can_access_unit(auth.uid(), a.business_unit_id)))));
CREATE POLICY "ham insert" ON public.haras_animal_movements AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM haras_animals a
  WHERE ((a.id = haras_animal_movements.animal_id) AND can_access_unit(auth.uid(), a.business_unit_id)))));
CREATE POLICY "ham select" ON public.haras_animal_movements AS PERMISSIVE FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM haras_animals a
  WHERE ((a.id = haras_animal_movements.animal_id) AND can_access_unit(auth.uid(), a.business_unit_id)))));
CREATE POLICY "hap delete" ON public.haras_animal_partners AS PERMISSIVE FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM haras_animals a
  WHERE ((a.id = haras_animal_partners.animal_id) AND can_access_unit(auth.uid(), a.business_unit_id)))));
CREATE POLICY "hap insert" ON public.haras_animal_partners AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM haras_animals a
  WHERE ((a.id = haras_animal_partners.animal_id) AND can_access_unit(auth.uid(), a.business_unit_id)))));
CREATE POLICY "hap select" ON public.haras_animal_partners AS PERMISSIVE FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM haras_animals a
  WHERE ((a.id = haras_animal_partners.animal_id) AND can_access_unit(auth.uid(), a.business_unit_id)))));
CREATE POLICY "hap update" ON public.haras_animal_partners AS PERMISSIVE FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM haras_animals a
  WHERE ((a.id = haras_animal_partners.animal_id) AND can_access_unit(auth.uid(), a.business_unit_id)))));
CREATE POLICY "hats delete" ON public.haras_animal_transaction_shares AS PERMISSIVE FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM haras_animal_transactions t
  WHERE ((t.id = haras_animal_transaction_shares.transaction_id) AND can_access_unit(auth.uid(), t.business_unit_id)))));
CREATE POLICY "hats insert" ON public.haras_animal_transaction_shares AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM haras_animal_transactions t
  WHERE ((t.id = haras_animal_transaction_shares.transaction_id) AND can_access_unit(auth.uid(), t.business_unit_id)))));
CREATE POLICY "hats select" ON public.haras_animal_transaction_shares AS PERMISSIVE FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM haras_animal_transactions t
  WHERE ((t.id = haras_animal_transaction_shares.transaction_id) AND can_access_unit(auth.uid(), t.business_unit_id)))));
CREATE POLICY "hats update" ON public.haras_animal_transaction_shares AS PERMISSIVE FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM haras_animal_transactions t
  WHERE ((t.id = haras_animal_transaction_shares.transaction_id) AND can_access_unit(auth.uid(), t.business_unit_id)))));
CREATE POLICY "hat delete" ON public.haras_animal_transactions AS PERMISSIVE FOR DELETE TO authenticated USING (can_access_unit(auth.uid(), business_unit_id));
CREATE POLICY "hat insert" ON public.haras_animal_transactions AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (can_access_unit(auth.uid(), business_unit_id));
CREATE POLICY "hat select" ON public.haras_animal_transactions AS PERMISSIVE FOR SELECT TO authenticated USING (can_access_unit(auth.uid(), business_unit_id));
CREATE POLICY "hat update" ON public.haras_animal_transactions AS PERMISSIVE FOR UPDATE TO authenticated USING (can_access_unit(auth.uid(), business_unit_id));
CREATE POLICY "hwh delete" ON public.haras_animal_weight_history AS PERMISSIVE FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM haras_animals a
  WHERE ((a.id = haras_animal_weight_history.animal_id) AND can_access_unit(auth.uid(), a.business_unit_id)))));
CREATE POLICY "hwh insert" ON public.haras_animal_weight_history AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM haras_animals a
  WHERE ((a.id = haras_animal_weight_history.animal_id) AND can_access_unit(auth.uid(), a.business_unit_id)))));
CREATE POLICY "hwh select" ON public.haras_animal_weight_history AS PERMISSIVE FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM haras_animals a
  WHERE ((a.id = haras_animal_weight_history.animal_id) AND can_access_unit(auth.uid(), a.business_unit_id)))));
CREATE POLICY "haras_animals delete" ON public.haras_animals AS PERMISSIVE FOR DELETE TO authenticated USING (can_access_unit(auth.uid(), business_unit_id));
CREATE POLICY "haras_animals insert" ON public.haras_animals AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (can_access_unit(auth.uid(), business_unit_id));
CREATE POLICY "haras_animals select" ON public.haras_animals AS PERMISSIVE FOR SELECT TO authenticated USING (can_access_unit(auth.uid(), business_unit_id));
CREATE POLICY "haras_animals update" ON public.haras_animals AS PERMISSIVE FOR UPDATE TO authenticated USING (can_access_unit(auth.uid(), business_unit_id));
CREATE POLICY breeding_sessions_delete ON public.haras_breeding_sessions AS PERMISSIVE FOR DELETE TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY breeding_sessions_insert ON public.haras_breeding_sessions AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY breeding_sessions_select ON public.haras_breeding_sessions AS PERMISSIVE FOR SELECT TO authenticated USING ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY breeding_sessions_update ON public.haras_breeding_sessions AS PERMISSIVE FOR UPDATE TO authenticated USING ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id))) WITH CHECK ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "haras_clients delete" ON public.haras_clients AS PERMISSIVE FOR DELETE TO authenticated USING (can_access_unit(auth.uid(), business_unit_id));
CREATE POLICY "haras_clients insert" ON public.haras_clients AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (can_access_unit(auth.uid(), business_unit_id));
CREATE POLICY "haras_clients select" ON public.haras_clients AS PERMISSIVE FOR SELECT TO authenticated USING (can_access_unit(auth.uid(), business_unit_id));
CREATE POLICY "haras_clients update" ON public.haras_clients AS PERMISSIVE FOR UPDATE TO authenticated USING (can_access_unit(auth.uid(), business_unit_id));
CREATE POLICY haras_embryo_transfers_delete ON public.haras_embryo_transfers AS PERMISSIVE FOR DELETE TO authenticated USING ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY haras_embryo_transfers_insert ON public.haras_embryo_transfers AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY haras_embryo_transfers_select ON public.haras_embryo_transfers AS PERMISSIVE FOR SELECT TO authenticated USING ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY haras_embryo_transfers_update ON public.haras_embryo_transfers AS PERMISSIVE FOR UPDATE TO authenticated USING ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id))) WITH CHECK ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY haras_embryos_delete ON public.haras_embryos AS PERMISSIVE FOR DELETE TO authenticated USING ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY haras_embryos_insert ON public.haras_embryos AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY haras_embryos_select ON public.haras_embryos AS PERMISSIVE FOR SELECT TO authenticated USING ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY haras_embryos_update ON public.haras_embryos AS PERMISSIVE FOR UPDATE TO authenticated USING ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id))) WITH CHECK ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "feature_flags admin delete" ON public.haras_feature_flags AS PERMISSIVE FOR DELETE TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "feature_flags admin insert" ON public.haras_feature_flags AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "feature_flags admin update" ON public.haras_feature_flags AS PERMISSIVE FOR UPDATE TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "feature_flags select" ON public.haras_feature_flags AS PERMISSIVE FOR SELECT TO authenticated USING (true);
CREATE POLICY fiv_delete ON public.haras_fiv_batches AS PERMISSIVE FOR DELETE TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY fiv_insert ON public.haras_fiv_batches AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY fiv_select ON public.haras_fiv_batches AS PERMISSIVE FOR SELECT TO authenticated USING ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY fiv_update ON public.haras_fiv_batches AS PERMISSIVE FOR UPDATE TO authenticated USING ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id))) WITH CHECK ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY follicle_exams_delete_admin ON public.haras_follicle_exams AS PERMISSIVE FOR DELETE TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY follicle_exams_insert ON public.haras_follicle_exams AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY follicle_exams_select ON public.haras_follicle_exams AS PERMISSIVE FOR SELECT TO authenticated USING ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY follicle_exams_update ON public.haras_follicle_exams AS PERMISSIVE FOR UPDATE TO authenticated USING ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id))) WITH CHECK ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY follicle_readings_delete_admin ON public.haras_follicle_readings AS PERMISSIVE FOR DELETE TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY follicle_readings_insert ON public.haras_follicle_readings AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY follicle_readings_select ON public.haras_follicle_readings AS PERMISSIVE FOR SELECT TO authenticated USING ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY follicle_readings_update ON public.haras_follicle_readings AS PERMISSIVE FOR UPDATE TO authenticated USING ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id))) WITH CHECK ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY opu_delete ON public.haras_opu_sessions AS PERMISSIVE FOR DELETE TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY opu_insert ON public.haras_opu_sessions AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY opu_select ON public.haras_opu_sessions AS PERMISSIVE FOR SELECT TO authenticated USING ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY opu_update ON public.haras_opu_sessions AS PERMISSIVE FOR UPDATE TO authenticated USING ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id))) WITH CHECK ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "hpl delete" ON public.haras_partner_locations AS PERMISSIVE FOR DELETE TO authenticated USING (can_access_unit(auth.uid(), business_unit_id));
CREATE POLICY "hpl insert" ON public.haras_partner_locations AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (can_access_unit(auth.uid(), business_unit_id));
CREATE POLICY "hpl select" ON public.haras_partner_locations AS PERMISSIVE FOR SELECT TO authenticated USING (can_access_unit(auth.uid(), business_unit_id));
CREATE POLICY "hpl update" ON public.haras_partner_locations AS PERMISSIVE FOR UPDATE TO authenticated USING (can_access_unit(auth.uid(), business_unit_id));
CREATE POLICY pregnancies_delete ON public.haras_pregnancies AS PERMISSIVE FOR DELETE TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY pregnancies_insert ON public.haras_pregnancies AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY pregnancies_select ON public.haras_pregnancies AS PERMISSIVE FOR SELECT TO authenticated USING ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY pregnancies_update ON public.haras_pregnancies AS PERMISSIVE FOR UPDATE TO authenticated USING ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id))) WITH CHECK ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY diagnostics_delete ON public.haras_pregnancy_diagnostics AS PERMISSIVE FOR DELETE TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY diagnostics_insert ON public.haras_pregnancy_diagnostics AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY diagnostics_select ON public.haras_pregnancy_diagnostics AS PERMISSIVE FOR SELECT TO authenticated USING ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY diagnostics_update ON public.haras_pregnancy_diagnostics AS PERMISSIVE FOR UPDATE TO authenticated USING ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id))) WITH CHECK ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "haras_purchase_commission_installments delete" ON public.haras_purchase_commission_installments AS PERMISSIVE FOR DELETE TO public USING ((has_permission(auth.uid(), 'haras_purchases'::app_module, 'delete'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "haras_purchase_commission_installments insert" ON public.haras_purchase_commission_installments AS PERMISSIVE FOR INSERT TO public WITH CHECK ((has_permission(auth.uid(), 'haras_purchases'::app_module, 'create'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "haras_purchase_commission_installments select" ON public.haras_purchase_commission_installments AS PERMISSIVE FOR SELECT TO public USING ((has_permission(auth.uid(), 'haras_purchases'::app_module, 'view'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "haras_purchase_commission_installments update" ON public.haras_purchase_commission_installments AS PERMISSIVE FOR UPDATE TO public USING ((has_permission(auth.uid(), 'haras_purchases'::app_module, 'edit'::permission_action) AND can_access_unit(auth.uid(), business_unit_id))) WITH CHECK ((has_permission(auth.uid(), 'haras_purchases'::app_module, 'edit'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "haras_purchase_commissions delete" ON public.haras_purchase_commissions AS PERMISSIVE FOR DELETE TO public USING ((has_permission(auth.uid(), 'haras_purchases'::app_module, 'delete'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "haras_purchase_commissions insert" ON public.haras_purchase_commissions AS PERMISSIVE FOR INSERT TO public WITH CHECK ((has_permission(auth.uid(), 'haras_purchases'::app_module, 'create'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "haras_purchase_commissions select" ON public.haras_purchase_commissions AS PERMISSIVE FOR SELECT TO public USING ((has_permission(auth.uid(), 'haras_purchases'::app_module, 'view'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "haras_purchase_commissions update" ON public.haras_purchase_commissions AS PERMISSIVE FOR UPDATE TO public USING ((has_permission(auth.uid(), 'haras_purchases'::app_module, 'edit'::permission_action) AND can_access_unit(auth.uid(), business_unit_id))) WITH CHECK ((has_permission(auth.uid(), 'haras_purchases'::app_module, 'edit'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "haras_purchase_installments delete" ON public.haras_purchase_installments AS PERMISSIVE FOR DELETE TO public USING ((has_permission(auth.uid(), 'haras_purchases'::app_module, 'delete'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "haras_purchase_installments insert" ON public.haras_purchase_installments AS PERMISSIVE FOR INSERT TO public WITH CHECK ((has_permission(auth.uid(), 'haras_purchases'::app_module, 'create'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "haras_purchase_installments select" ON public.haras_purchase_installments AS PERMISSIVE FOR SELECT TO public USING ((has_permission(auth.uid(), 'haras_purchases'::app_module, 'view'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "haras_purchase_installments update" ON public.haras_purchase_installments AS PERMISSIVE FOR UPDATE TO public USING ((has_permission(auth.uid(), 'haras_purchases'::app_module, 'edit'::permission_action) AND can_access_unit(auth.uid(), business_unit_id))) WITH CHECK ((has_permission(auth.uid(), 'haras_purchases'::app_module, 'edit'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "haras_purchases delete" ON public.haras_purchases AS PERMISSIVE FOR DELETE TO public USING ((has_permission(auth.uid(), 'haras_purchases'::app_module, 'delete'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "haras_purchases insert" ON public.haras_purchases AS PERMISSIVE FOR INSERT TO public WITH CHECK ((has_permission(auth.uid(), 'haras_purchases'::app_module, 'create'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "haras_purchases select" ON public.haras_purchases AS PERMISSIVE FOR SELECT TO public USING ((has_permission(auth.uid(), 'haras_purchases'::app_module, 'view'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "haras_purchases update" ON public.haras_purchases AS PERMISSIVE FOR UPDATE TO public USING ((has_permission(auth.uid(), 'haras_purchases'::app_module, 'edit'::permission_action) AND can_access_unit(auth.uid(), business_unit_id))) WITH CHECK ((has_permission(auth.uid(), 'haras_purchases'::app_module, 'edit'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "hrii delete" ON public.haras_recurring_invoice_items AS PERMISSIVE FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM haras_recurring_invoices i
  WHERE ((i.id = haras_recurring_invoice_items.recurring_invoice_id) AND can_access_unit(auth.uid(), i.business_unit_id)))));
CREATE POLICY "hrii insert" ON public.haras_recurring_invoice_items AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM haras_recurring_invoices i
  WHERE ((i.id = haras_recurring_invoice_items.recurring_invoice_id) AND can_access_unit(auth.uid(), i.business_unit_id)))));
CREATE POLICY "hrii select" ON public.haras_recurring_invoice_items AS PERMISSIVE FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM haras_recurring_invoices i
  WHERE ((i.id = haras_recurring_invoice_items.recurring_invoice_id) AND can_access_unit(auth.uid(), i.business_unit_id)))));
CREATE POLICY "hrii update" ON public.haras_recurring_invoice_items AS PERMISSIVE FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM haras_recurring_invoices i
  WHERE ((i.id = haras_recurring_invoice_items.recurring_invoice_id) AND can_access_unit(auth.uid(), i.business_unit_id)))));
CREATE POLICY "hri delete" ON public.haras_recurring_invoices AS PERMISSIVE FOR DELETE TO authenticated USING (can_access_unit(auth.uid(), business_unit_id));
CREATE POLICY "hri insert" ON public.haras_recurring_invoices AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (can_access_unit(auth.uid(), business_unit_id));
CREATE POLICY "hri select" ON public.haras_recurring_invoices AS PERMISSIVE FOR SELECT TO authenticated USING (can_access_unit(auth.uid(), business_unit_id));
CREATE POLICY "hri update" ON public.haras_recurring_invoices AS PERMISSIVE FOR UPDATE TO authenticated USING (can_access_unit(auth.uid(), business_unit_id));
CREATE POLICY "hrr select" ON public.haras_recurring_runs AS PERMISSIVE FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM haras_recurring_invoices i
  WHERE ((i.id = haras_recurring_runs.invoice_id) AND can_access_unit(auth.uid(), i.business_unit_id)))));
CREATE POLICY "repro_settings delete" ON public.haras_reproduction_settings AS PERMISSIVE FOR DELETE TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "repro_settings insert" ON public.haras_reproduction_settings AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "repro_settings select" ON public.haras_reproduction_settings AS PERMISSIVE FOR SELECT TO authenticated USING ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "repro_settings update" ON public.haras_reproduction_settings AS PERMISSIVE FOR UPDATE TO authenticated USING ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id))) WITH CHECK ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY semen_batches_delete ON public.haras_semen_batches AS PERMISSIVE FOR DELETE TO authenticated USING ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY semen_batches_insert ON public.haras_semen_batches AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY semen_batches_select ON public.haras_semen_batches AS PERMISSIVE FOR SELECT TO authenticated USING ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY semen_batches_update ON public.haras_semen_batches AS PERMISSIVE FOR UPDATE TO authenticated USING ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id))) WITH CHECK ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY semen_collections_delete ON public.haras_semen_collections AS PERMISSIVE FOR DELETE TO authenticated USING ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY semen_collections_insert ON public.haras_semen_collections AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY semen_collections_select ON public.haras_semen_collections AS PERMISSIVE FOR SELECT TO authenticated USING ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY semen_collections_update ON public.haras_semen_collections AS PERMISSIVE FOR UPDATE TO authenticated USING ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id))) WITH CHECK ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY semen_movements_admin_delete ON public.haras_semen_movements AS PERMISSIVE FOR DELETE TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY semen_movements_admin_insert ON public.haras_semen_movements AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));
CREATE POLICY semen_movements_admin_update ON public.haras_semen_movements AS PERMISSIVE FOR UPDATE TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY semen_movements_select ON public.haras_semen_movements AS PERMISSIVE FOR SELECT TO authenticated USING ((is_admin(auth.uid()) OR can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "hs delete" ON public.haras_services AS PERMISSIVE FOR DELETE TO authenticated USING (can_access_unit(auth.uid(), business_unit_id));
CREATE POLICY "hs insert" ON public.haras_services AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (can_access_unit(auth.uid(), business_unit_id));
CREATE POLICY "hs select" ON public.haras_services AS PERMISSIVE FOR SELECT TO authenticated USING (can_access_unit(auth.uid(), business_unit_id));
CREATE POLICY "hs update" ON public.haras_services AS PERMISSIVE FOR UPDATE TO authenticated USING (can_access_unit(auth.uid(), business_unit_id));
CREATE POLICY "shadow_log admin select" ON public.haras_shadow_log AS PERMISSIVE FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "inst delete" ON public.loan_installments AS PERMISSIVE FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM loans l
  WHERE ((l.id = loan_installments.loan_id) AND has_permission(auth.uid(), 'loans'::app_module, 'delete'::permission_action) AND can_access_unit(auth.uid(), l.business_unit_id)))));
CREATE POLICY "inst insert" ON public.loan_installments AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM loans l
  WHERE ((l.id = loan_installments.loan_id) AND has_permission(auth.uid(), 'loans'::app_module, 'create'::permission_action) AND can_access_unit(auth.uid(), l.business_unit_id)))));
CREATE POLICY "inst select" ON public.loan_installments AS PERMISSIVE FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM loans l
  WHERE ((l.id = loan_installments.loan_id) AND has_permission(auth.uid(), 'loans'::app_module, 'view'::permission_action) AND can_access_unit(auth.uid(), l.business_unit_id)))));
CREATE POLICY "inst update" ON public.loan_installments AS PERMISSIVE FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM loans l
  WHERE ((l.id = loan_installments.loan_id) AND has_permission(auth.uid(), 'loans'::app_module, 'edit'::permission_action) AND can_access_unit(auth.uid(), l.business_unit_id)))));
CREATE POLICY "loan delete" ON public.loans AS PERMISSIVE FOR DELETE TO authenticated USING ((has_permission(auth.uid(), 'loans'::app_module, 'delete'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "loan insert" ON public.loans AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((has_permission(auth.uid(), 'loans'::app_module, 'create'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "loan select" ON public.loans AS PERMISSIVE FOR SELECT TO authenticated USING ((has_permission(auth.uid(), 'loans'::app_module, 'view'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "loan update" ON public.loans AS PERMISSIVE FOR UPDATE TO authenticated USING ((has_permission(auth.uid(), 'loans'::app_module, 'edit'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY own_delete ON public.notifications AS PERMISSIVE FOR DELETE TO public USING ((user_id = auth.uid()));
CREATE POLICY own_read ON public.notifications AS PERMISSIVE FOR SELECT TO public USING ((user_id = auth.uid()));
CREATE POLICY own_update ON public.notifications AS PERMISSIVE FOR UPDATE TO public USING ((user_id = auth.uid()));
CREATE POLICY "pay delete" ON public.payables AS PERMISSIVE FOR DELETE TO authenticated USING ((has_permission(auth.uid(), 'payables'::app_module, 'delete'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "pay insert" ON public.payables AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((has_permission(auth.uid(), 'payables'::app_module, 'create'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "pay select" ON public.payables AS PERMISSIVE FOR SELECT TO authenticated USING ((has_permission(auth.uid(), 'payables'::app_module, 'view'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "pay update" ON public.payables AS PERMISSIVE FOR UPDATE TO authenticated USING ((has_permission(auth.uid(), 'payables'::app_module, 'edit'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "admin delete profiles" ON public.profiles AS PERMISSIVE FOR DELETE TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "users update own profile" ON public.profiles AS PERMISSIVE FOR UPDATE TO authenticated USING (((auth.uid() = id) OR is_admin(auth.uid())));
CREATE POLICY "users view own profile" ON public.profiles AS PERMISSIVE FOR SELECT TO authenticated USING (((auth.uid() = id) OR is_admin(auth.uid())));
CREATE POLICY "rec delete" ON public.receivables AS PERMISSIVE FOR DELETE TO authenticated USING ((has_permission(auth.uid(), 'receivables'::app_module, 'delete'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "rec insert" ON public.receivables AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((has_permission(auth.uid(), 'receivables'::app_module, 'create'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "rec select" ON public.receivables AS PERMISSIVE FOR SELECT TO authenticated USING ((has_permission(auth.uid(), 'receivables'::app_module, 'view'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "rec update" ON public.receivables AS PERMISSIVE FOR UPDATE TO authenticated USING ((has_permission(auth.uid(), 'receivables'::app_module, 'edit'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "rp delete" ON public.recurring_payables AS PERMISSIVE FOR DELETE TO authenticated USING ((has_permission(auth.uid(), 'payables'::app_module, 'delete'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "rp insert" ON public.recurring_payables AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((has_permission(auth.uid(), 'payables'::app_module, 'create'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "rp select" ON public.recurring_payables AS PERMISSIVE FOR SELECT TO authenticated USING ((has_permission(auth.uid(), 'payables'::app_module, 'view'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "rp update" ON public.recurring_payables AS PERMISSIVE FOR UPDATE TO authenticated USING ((has_permission(auth.uid(), 'payables'::app_module, 'edit'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "res delete" ON public.reservations AS PERMISSIVE FOR DELETE TO authenticated USING ((has_permission(auth.uid(), 'reservations'::app_module, 'delete'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "res insert" ON public.reservations AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((has_permission(auth.uid(), 'reservations'::app_module, 'create'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "res select" ON public.reservations AS PERMISSIVE FOR SELECT TO authenticated USING ((has_permission(auth.uid(), 'reservations'::app_module, 'view'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "res update" ON public.reservations AS PERMISSIVE FOR UPDATE TO authenticated USING ((has_permission(auth.uid(), 'reservations'::app_module, 'edit'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "read own bu sale installment notifications" ON public.sale_installment_notifications AS PERMISSIVE FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM (sale_installments si
     JOIN animal_sales s ON ((s.id = si.sale_id)))
  WHERE ((si.id = sale_installment_notifications.installment_id) AND (is_admin(auth.uid()) OR can_access_unit(auth.uid(), s.business_unit_id))))));
CREATE POLICY "si del" ON public.sale_installments AS PERMISSIVE FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM animal_sales s
  WHERE ((s.id = sale_installments.sale_id) AND has_permission(auth.uid(), 'sales'::app_module, 'delete'::permission_action) AND can_access_unit(auth.uid(), s.business_unit_id)))));
CREATE POLICY "si ins" ON public.sale_installments AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM animal_sales s
  WHERE ((s.id = sale_installments.sale_id) AND has_permission(auth.uid(), 'sales'::app_module, 'create'::permission_action) AND can_access_unit(auth.uid(), s.business_unit_id)))));
CREATE POLICY "si sel" ON public.sale_installments AS PERMISSIVE FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM animal_sales s
  WHERE ((s.id = sale_installments.sale_id) AND has_permission(auth.uid(), 'sales'::app_module, 'view'::permission_action) AND can_access_unit(auth.uid(), s.business_unit_id)))));
CREATE POLICY "si upd" ON public.sale_installments AS PERMISSIVE FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM animal_sales s
  WHERE ((s.id = sale_installments.sale_id) AND has_permission(auth.uid(), 'sales'::app_module, 'edit'::permission_action) AND can_access_unit(auth.uid(), s.business_unit_id)))));
CREATE POLICY "tx delete" ON public.transactions AS PERMISSIVE FOR DELETE TO authenticated USING ((has_permission(auth.uid(), 'cash_flow'::app_module, 'delete'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "tx insert" ON public.transactions AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((has_permission(auth.uid(), 'cash_flow'::app_module, 'create'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "tx select" ON public.transactions AS PERMISSIVE FOR SELECT TO authenticated USING ((has_permission(auth.uid(), 'cash_flow'::app_module, 'view'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "tx update" ON public.transactions AS PERMISSIVE FOR UPDATE TO authenticated USING ((has_permission(auth.uid(), 'cash_flow'::app_module, 'edit'::permission_action) AND can_access_unit(auth.uid(), business_unit_id)));
CREATE POLICY "admin manage perms delete" ON public.user_module_permissions AS PERMISSIVE FOR DELETE TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "admin manage perms insert" ON public.user_module_permissions AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "admin manage perms update" ON public.user_module_permissions AS PERMISSIVE FOR UPDATE TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "view own permissions" ON public.user_module_permissions AS PERMISSIVE FOR SELECT TO authenticated USING (((user_id = auth.uid()) OR is_admin(auth.uid())));
CREATE POLICY "admin manage roles delete" ON public.user_roles AS PERMISSIVE FOR DELETE TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "admin manage roles insert" ON public.user_roles AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "admin manage roles update" ON public.user_roles AS PERMISSIVE FOR UPDATE TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "view own role" ON public.user_roles AS PERMISSIVE FOR SELECT TO authenticated USING (((user_id = auth.uid()) OR is_admin(auth.uid())));
CREATE POLICY "admin manage unit access delete" ON public.user_unit_access AS PERMISSIVE FOR DELETE TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "admin manage unit access insert" ON public.user_unit_access AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "view own unit access" ON public.user_unit_access AS PERMISSIVE FOR SELECT TO authenticated USING (((user_id = auth.uid()) OR is_admin(auth.uid())));

-- ---------- STORAGE - BUCKETS ----------
INSERT INTO storage.buckets (id, name, public) VALUES ('attachments', 'attachments', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('animal-photos', 'animal-photos', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('client-docs', 'client-docs', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('haras-purchase-contracts', 'haras-purchase-contracts', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('sale-contracts', 'sale-contracts', false) ON CONFLICT (id) DO NOTHING;

-- ---------- STORAGE - POLICIES ----------
CREATE POLICY "animal-photos_delete_own" ON storage.objects AS PERMISSIVE FOR DELETE TO authenticated USING (((bucket_id = 'animal-photos'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));
CREATE POLICY "animal-photos_insert_own" ON storage.objects AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (((bucket_id = 'animal-photos'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));
CREATE POLICY "animal-photos_select_own" ON storage.objects AS PERMISSIVE FOR SELECT TO authenticated USING (((bucket_id = 'animal-photos'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));
CREATE POLICY "animal-photos_update_own" ON storage.objects AS PERMISSIVE FOR UPDATE TO authenticated USING (((bucket_id = 'animal-photos'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));
CREATE POLICY avatars_delete_own ON storage.objects AS PERMISSIVE FOR DELETE TO authenticated USING (((bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));
CREATE POLICY avatars_insert_own ON storage.objects AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (((bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));
CREATE POLICY avatars_select_own ON storage.objects AS PERMISSIVE FOR SELECT TO authenticated USING (((bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));
CREATE POLICY avatars_update_own ON storage.objects AS PERMISSIVE FOR UPDATE TO authenticated USING (((bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));
CREATE POLICY "client-docs_delete_own" ON storage.objects AS PERMISSIVE FOR DELETE TO authenticated USING (((bucket_id = 'client-docs'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));
CREATE POLICY "client-docs_insert_own" ON storage.objects AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (((bucket_id = 'client-docs'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));
CREATE POLICY "client-docs_select_own" ON storage.objects AS PERMISSIVE FOR SELECT TO authenticated USING (((bucket_id = 'client-docs'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));
CREATE POLICY "client-docs_update_own" ON storage.objects AS PERMISSIVE FOR UPDATE TO authenticated USING (((bucket_id = 'client-docs'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));
CREATE POLICY "haras-purchase-contracts_delete" ON storage.objects AS PERMISSIVE FOR DELETE TO authenticated USING (((bucket_id = 'haras-purchase-contracts'::text) AND can_access_unit(auth.uid(), ((storage.foldername(name))[1])::uuid) AND has_permission(auth.uid(), 'haras_purchases'::app_module, 'delete'::permission_action)));
CREATE POLICY "haras-purchase-contracts_insert" ON storage.objects AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (((bucket_id = 'haras-purchase-contracts'::text) AND can_access_unit(auth.uid(), ((storage.foldername(name))[1])::uuid) AND has_permission(auth.uid(), 'haras_purchases'::app_module, 'create'::permission_action)));
CREATE POLICY "haras-purchase-contracts_select" ON storage.objects AS PERMISSIVE FOR SELECT TO authenticated USING (((bucket_id = 'haras-purchase-contracts'::text) AND can_access_unit(auth.uid(), ((storage.foldername(name))[1])::uuid) AND has_permission(auth.uid(), 'haras_purchases'::app_module, 'view'::permission_action)));
CREATE POLICY "haras-purchase-contracts_update" ON storage.objects AS PERMISSIVE FOR UPDATE TO authenticated USING (((bucket_id = 'haras-purchase-contracts'::text) AND can_access_unit(auth.uid(), ((storage.foldername(name))[1])::uuid) AND has_permission(auth.uid(), 'haras_purchases'::app_module, 'edit'::permission_action))) WITH CHECK (((bucket_id = 'haras-purchase-contracts'::text) AND can_access_unit(auth.uid(), ((storage.foldername(name))[1])::uuid) AND has_permission(auth.uid(), 'haras_purchases'::app_module, 'edit'::permission_action)));
CREATE POLICY "sale-contracts_delete_own" ON storage.objects AS PERMISSIVE FOR DELETE TO authenticated USING (((bucket_id = 'sale-contracts'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));
CREATE POLICY "sale-contracts_insert_own" ON storage.objects AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (((bucket_id = 'sale-contracts'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));
CREATE POLICY "sale-contracts_select_own" ON storage.objects AS PERMISSIVE FOR SELECT TO authenticated USING (((bucket_id = 'sale-contracts'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));
CREATE POLICY "sale-contracts_update_own" ON storage.objects AS PERMISSIVE FOR UPDATE TO authenticated USING (((bucket_id = 'sale-contracts'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));

-- ---------- TRIGGERS EM OUTROS SCHEMAS (auth, storage) ----------
-- Cria profile + role no primeiro login. O PRIMEIRO usuario do projeto vira admin automaticamente.
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
CREATE TRIGGER trg_enforce_haras_contract_upload BEFORE INSERT OR UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION public.enforce_haras_contract_upload();

-- ---------- JOBS PG_CRON ----------
SELECT cron.schedule('rios_mark_overdue', '0 6 * * *', 'SELECT public.mark_overdue();');
SELECT cron.schedule('rios_gen_recurring_payables', '5 6 * * *', 'SELECT public.generate_recurring_payables(NULL,''cron'');');
SELECT cron.schedule('rios_gen_recurring_receivables', '10 6 * * *', 'SELECT public.generate_recurring_receivables(NULL,''cron'');');

-- ---------- SEED MINIMO (unidades, categorias de folha, feature flags) ----------
INSERT INTO public.business_units SELECT * FROM json_populate_record(NULL::public.business_units, '{"id":"bb9bc8c4-742a-4b3a-a67d-a93f73391569","name":"Escritório","type":"office","icon":"briefcase","color":"#1E3A5F","created_at":"2026-09-29T16:42:16.381272+00:00"}') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.business_units SELECT * FROM json_populate_record(NULL::public.business_units, '{"id":"697ca883-c8ee-462d-91ae-7a2c11419059","name":"Eventos","type":"events","icon":"party-popper","color":"#7C3AED","created_at":"2026-09-29T16:42:16.381272+00:00"}') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.business_units SELECT * FROM json_populate_record(NULL::public.business_units, '{"id":"2ee0b57d-fca1-4fe6-9c9c-b6905c477a3e","name":"Locação","type":"rental","icon":"home","color":"#059669","created_at":"2026-09-29T16:42:16.381272+00:00"}') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.business_units SELECT * FROM json_populate_record(NULL::public.business_units, '{"id":"c31ac384-3cf6-4535-a6b6-c54463772ee2","name":"Empréstimos","type":"loans","icon":"banknote","color":"#DC2626","created_at":"2026-09-29T16:42:16.381272+00:00"}') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories SELECT * FROM json_populate_record(NULL::public.categories, '{"id":"bb180868-980e-4d7f-b3ed-de30dc27af5c","business_unit_id":"c31ac384-3cf6-4535-a6b6-c54463772ee2","name":"Folha de Pagamento","type":"expense","created_by":null,"created_at":"2026-09-29T16:42:18.686982+00:00","updated_at":"2026-09-29T16:42:18.686982+00:00","is_payroll":true}') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories SELECT * FROM json_populate_record(NULL::public.categories, '{"id":"b8bfcc55-224f-4e35-8c19-f99df572f433","business_unit_id":"2ee0b57d-fca1-4fe6-9c9c-b6905c477a3e","name":"Folha de Pagamento","type":"expense","created_by":null,"created_at":"2026-09-29T16:42:18.686982+00:00","updated_at":"2026-09-29T16:42:18.686982+00:00","is_payroll":true}') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories SELECT * FROM json_populate_record(NULL::public.categories, '{"id":"c8a2579f-de86-4157-8243-a64e96797837","business_unit_id":"697ca883-c8ee-462d-91ae-7a2c11419059","name":"Folha de Pagamento","type":"expense","created_by":null,"created_at":"2026-09-29T16:42:18.686982+00:00","updated_at":"2026-09-29T16:42:18.686982+00:00","is_payroll":true}') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.categories SELECT * FROM json_populate_record(NULL::public.categories, '{"id":"d3f9ac0f-e981-49b4-bdb7-4278cb2f87e2","business_unit_id":"bb9bc8c4-742a-4b3a-a67d-a93f73391569","name":"Folha de Pagamento","type":"expense","created_by":null,"created_at":"2026-09-29T16:42:18.686982+00:00","updated_at":"2026-09-29T16:42:18.686982+00:00","is_payroll":true}') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.haras_feature_flags SELECT * FROM json_populate_record(NULL::public.haras_feature_flags, '{"id":"8357fb34-680e-415e-9302-8061f881ce3d","business_unit_id":"bb9bc8c4-742a-4b3a-a67d-a93f73391569","flag_name":"closing_lock_enabled","enabled":false,"notes":"PR-B2: bloqueia edição/exclusão de períodos fechados","created_at":"2026-09-29T16:42:16.704534+00:00","updated_at":"2026-09-29T16:42:16.704534+00:00"}') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.haras_feature_flags SELECT * FROM json_populate_record(NULL::public.haras_feature_flags, '{"id":"5f749374-300d-4f64-818b-78a9a255e782","business_unit_id":"697ca883-c8ee-462d-91ae-7a2c11419059","flag_name":"closing_lock_enabled","enabled":false,"notes":"PR-B2: bloqueia edição/exclusão de períodos fechados","created_at":"2026-09-29T16:42:16.704534+00:00","updated_at":"2026-09-29T16:42:16.704534+00:00"}') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.haras_feature_flags SELECT * FROM json_populate_record(NULL::public.haras_feature_flags, '{"id":"a2709ca0-141e-4204-948e-40ede3447e4f","business_unit_id":"2ee0b57d-fca1-4fe6-9c9c-b6905c477a3e","flag_name":"closing_lock_enabled","enabled":false,"notes":"PR-B2: bloqueia edição/exclusão de períodos fechados","created_at":"2026-09-29T16:42:16.704534+00:00","updated_at":"2026-09-29T16:42:16.704534+00:00"}') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.haras_feature_flags SELECT * FROM json_populate_record(NULL::public.haras_feature_flags, '{"id":"d19ddcc3-8edb-43e9-9fc3-bdde6f18538a","business_unit_id":"c31ac384-3cf6-4535-a6b6-c54463772ee2","flag_name":"closing_lock_enabled","enabled":false,"notes":"PR-B2: bloqueia edição/exclusão de períodos fechados","created_at":"2026-09-29T16:42:16.704534+00:00","updated_at":"2026-09-29T16:42:16.704534+00:00"}') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.haras_feature_flags SELECT * FROM json_populate_record(NULL::public.haras_feature_flags, '{"id":"0e38c190-5893-494b-b857-335113997475","business_unit_id":"bb9bc8c4-742a-4b3a-a67d-a93f73391569","flag_name":"auto_cashflow_on_paid","enabled":false,"notes":"PR-B3b: gera transação de receita automaticamente ao marcar recebível como pago","created_at":"2026-09-29T16:42:16.704534+00:00","updated_at":"2026-09-29T16:42:16.704534+00:00"}') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.haras_feature_flags SELECT * FROM json_populate_record(NULL::public.haras_feature_flags, '{"id":"d25aeb2f-3dff-4635-ad57-c86147d85d6e","business_unit_id":"697ca883-c8ee-462d-91ae-7a2c11419059","flag_name":"auto_cashflow_on_paid","enabled":false,"notes":"PR-B3b: gera transação de receita automaticamente ao marcar recebível como pago","created_at":"2026-09-29T16:42:16.704534+00:00","updated_at":"2026-09-29T16:42:16.704534+00:00"}') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.haras_feature_flags SELECT * FROM json_populate_record(NULL::public.haras_feature_flags, '{"id":"81ebd795-b1d4-4a55-b92f-56d2a323a9d6","business_unit_id":"2ee0b57d-fca1-4fe6-9c9c-b6905c477a3e","flag_name":"auto_cashflow_on_paid","enabled":false,"notes":"PR-B3b: gera transação de receita automaticamente ao marcar recebível como pago","created_at":"2026-09-29T16:42:16.704534+00:00","updated_at":"2026-09-29T16:42:16.704534+00:00"}') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.haras_feature_flags SELECT * FROM json_populate_record(NULL::public.haras_feature_flags, '{"id":"466b150d-87a3-4297-9720-8801ec2f9c93","business_unit_id":"c31ac384-3cf6-4535-a6b6-c54463772ee2","flag_name":"auto_cashflow_on_paid","enabled":false,"notes":"PR-B3b: gera transação de receita automaticamente ao marcar recebível como pago","created_at":"2026-09-29T16:42:16.704534+00:00","updated_at":"2026-09-29T16:42:16.704534+00:00"}') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.haras_feature_flags SELECT * FROM json_populate_record(NULL::public.haras_feature_flags, '{"id":"062784e2-b4f7-4893-a218-ff739fc59d94","business_unit_id":null,"flag_name":"sales_enabled","enabled":false,"notes":"Módulo de Vendas de Animais (global default)","created_at":"2026-09-29T16:42:17.174357+00:00","updated_at":"2026-09-29T16:42:17.174357+00:00"}') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.haras_feature_flags SELECT * FROM json_populate_record(NULL::public.haras_feature_flags, '{"id":"628fa834-181f-4500-940c-3cdde458e37e","business_unit_id":null,"flag_name":"notifications_enabled","enabled":false,"notes":null,"created_at":"2026-09-29T16:42:17.82483+00:00","updated_at":"2026-09-29T16:42:17.82483+00:00"}') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.haras_feature_flags SELECT * FROM json_populate_record(NULL::public.haras_feature_flags, '{"id":"75ee5c36-4bb3-4ee2-86c6-0386f7a72698","business_unit_id":null,"flag_name":"haras_reproducao_enabled","enabled":false,"notes":"Módulo de Reprodução do Haras (Fase 0 — fundações)","created_at":"2026-09-29T16:42:20.137348+00:00","updated_at":"2026-09-29T16:42:20.137348+00:00"}') ON CONFLICT (id) DO NOTHING;

