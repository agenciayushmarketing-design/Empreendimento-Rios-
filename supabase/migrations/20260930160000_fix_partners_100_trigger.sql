-- Corrige tg_validate_partners_100_for_animal: a versao herdada exigia soma 100 mesmo sem
-- nenhum socio, entao (1) nao dava para remover todos os socios de um animal e (2) excluir um
-- animal com socios falhava, porque o cascade apagava os socios e a checagem via soma 0.
-- Agora: sem socios = 100% do proprietario (valido); animal ja excluido = nada a checar.
-- Seguro rodar mais de uma vez. Aplicar pelo SQL Editor.
CREATE OR REPLACE FUNCTION public.tg_validate_partners_100_for_animal()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE total numeric(7,2); n int; aid uuid;
BEGIN
  aid := COALESCE(NEW.animal_id, OLD.animal_id);
  IF NOT EXISTS (SELECT 1 FROM public.haras_animals WHERE id = aid) THEN RETURN NULL; END IF;
  SELECT COALESCE(SUM(ownership_percentage), 0), count(*) INTO total, n
    FROM public.haras_animal_partners WHERE animal_id = aid;
  IF n > 0 AND total <> 100 THEN
    RAISE EXCEPTION 'Soma das participações dos sócios do animal % deve ser 100 (atual %)', aid, total;
  END IF;
  RETURN NULL;
END; $function$;
