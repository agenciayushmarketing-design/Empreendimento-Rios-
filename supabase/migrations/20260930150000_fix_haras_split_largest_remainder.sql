-- Corrige _haras_split_largest_remainder: a versao herdada era IMMUTABLE e criava uma TEMP TABLE,
-- o que o Postgres proibe ("CREATE TABLE is not allowed in a non-volatile function"). Como o
-- trigger tg_haras_tx_generate_shares chama essa funcao, NENHUM lancamento por animal podia ser
-- gravado. Reescrita sem tabela temporaria (mesmo resultado: rateio em centavos pelo metodo do
-- maior resto, ordem estavel). Seguro rodar mais de uma vez. Aplicar pelo SQL Editor.
CREATE OR REPLACE FUNCTION public._haras_split_largest_remainder(_amount numeric, _parts jsonb)
 RETURNS TABLE(client_id uuid, ownership_percentage numeric, share_amount numeric)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  WITH base AS (
    SELECT row_number() OVER () AS idx,
           (p->>'client_id')::uuid AS client_id,
           (p->>'ownership_percentage')::numeric AS pct,
           round(_amount * 100)::bigint * (p->>'ownership_percentage')::numeric / 100 AS raw_cents
    FROM jsonb_array_elements(COALESCE(_parts, '[]'::jsonb)) p
  ), calc AS (
    SELECT idx, client_id, pct,
           floor(raw_cents)::bigint AS floor_cents,
           raw_cents - floor(raw_cents) AS frac
    FROM base
  ), tot AS (
    SELECT round(_amount * 100)::bigint - COALESCE(sum(floor_cents), 0) AS remainder FROM calc
  ), ranked AS (
    SELECT c.*, row_number() OVER (ORDER BY c.frac DESC, c.idx ASC) AS rk FROM calc c
  )
  SELECT r.client_id,
         r.pct,
         ((r.floor_cents + CASE WHEN r.rk <= (SELECT remainder FROM tot) THEN 1 ELSE 0 END)::numeric / 100) AS share_amount
  FROM ranked r
  ORDER BY r.idx;
$function$;
