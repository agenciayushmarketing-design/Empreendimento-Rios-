-- Comprovantes das movimentacoes: bucket privado "attachments".
-- Caminho do arquivo: <business_unit_id>/<transaction_id>-<nome>. A primeira pasta e a unidade,
-- e e por ela que a RLS decide quem ve e quem envia (mesma regra das transacoes).
-- Seguro rodar mais de uma vez. Aplicar pelo SQL Editor.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('attachments', 'attachments', false, 5242880, ARRAY['image/jpeg','image/png','image/webp','application/pdf'])
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','application/pdf'];

DROP POLICY IF EXISTS attachments_select ON storage.objects;
DROP POLICY IF EXISTS attachments_insert ON storage.objects;
DROP POLICY IF EXISTS attachments_update ON storage.objects;
DROP POLICY IF EXISTS attachments_delete ON storage.objects;

CREATE POLICY attachments_select ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'attachments'
    AND public.can_access_unit((select auth.uid()), ((storage.foldername(name))[1])::uuid)
    AND public.has_permission((select auth.uid()), 'cash_flow'::app_module, 'view'::permission_action));

CREATE POLICY attachments_insert ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'attachments'
    AND public.can_access_unit((select auth.uid()), ((storage.foldername(name))[1])::uuid)
    AND (public.has_permission((select auth.uid()), 'cash_flow'::app_module, 'create'::permission_action)
      OR public.has_permission((select auth.uid()), 'cash_flow'::app_module, 'edit'::permission_action)));

CREATE POLICY attachments_update ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'attachments'
    AND public.can_access_unit((select auth.uid()), ((storage.foldername(name))[1])::uuid)
    AND public.has_permission((select auth.uid()), 'cash_flow'::app_module, 'edit'::permission_action));

CREATE POLICY attachments_delete ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'attachments'
    AND public.can_access_unit((select auth.uid()), ((storage.foldername(name))[1])::uuid)
    AND (public.has_permission((select auth.uid()), 'cash_flow'::app_module, 'edit'::permission_action)
      OR public.has_permission((select auth.uid()), 'cash_flow'::app_module, 'delete'::permission_action)));
