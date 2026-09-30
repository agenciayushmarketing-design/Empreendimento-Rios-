-- Corrige rollback_payroll_batch: a versao herdada comparava status IN ('paid','partial'),
-- mas 'partial' nao existe no enum payment_status, entao a funcao sempre falhava.
-- Seguro rodar mais de uma vez. Aplicar pelo SQL Editor.
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

  SELECT business_unit_id INTO v_bu FROM public.payables WHERE payroll_batch_id = _batch_id LIMIT 1;
  IF v_bu IS NULL THEN RAISE EXCEPTION 'Lote não encontrado'; END IF;

  IF NOT public.can_access_unit(v_uid, v_bu) THEN RAISE EXCEPTION 'Sem permissão' USING ERRCODE='42501'; END IF;
  IF NOT public.has_permission(v_uid, 'payables'::app_module, 'delete'::permission_action) THEN
    RAISE EXCEPTION 'Sem permissão' USING ERRCODE='42501';
  END IF;

  SELECT count(*) INTO v_blocked FROM public.payables WHERE payroll_batch_id = _batch_id AND status = 'paid';
  IF v_blocked > 0 THEN
    RAISE EXCEPTION 'Não é possível desfazer: % lançamento(s) já foram pagos', v_blocked;
  END IF;

  DELETE FROM public.payables WHERE payroll_batch_id = _batch_id AND status = 'pending';
  GET DIAGNOSTICS v_deleted = ROW_COUNT;

  INSERT INTO public.audit_log (user_id, action, entity, entity_id, business_unit_id, payload)
  VALUES (v_uid, 'payroll.batch_rollback', 'payables', _batch_id, v_bu, jsonb_build_object('deleted', v_deleted));

  RETURN jsonb_build_object('deleted', v_deleted);
END;
$function$;
