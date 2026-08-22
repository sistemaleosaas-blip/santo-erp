-- =====================================================================
-- 0009_storage_buckets.sql
-- Buckets do Supabase Storage e políticas de acesso.
-- Convenção de path: sempre prefixado por IDs para permitir RLS por path.
--   holerites/{funcionario_id}/{competencia}.pdf
--   assinaturas/{funcionario_id}/{holerite_id}.pdf
--   contratos/{cliente_id}/{contrato_id}.pdf
--   curriculos/{uuid}.pdf
--   avatares/{user_id}.jpg
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('holerites', 'holerites', false, 10485760, array['application/pdf']),
  ('assinaturas', 'assinaturas', false, 10485760, array['application/pdf']),
  ('contratos', 'contratos', false, 20971520, array['application/pdf']),
  ('curriculos', 'curriculos', false, 10485760, array['application/pdf']),
  ('avatares', 'avatares', true, 2097152, array['image/jpeg','image/png','image/webp']),
  ('site-assets', 'site-assets', true, 5242880, array['image/jpeg','image/png','image/webp','image/svg+xml'])
on conflict (id) do nothing;

-- ---- holerites: funcionário lê o próprio arquivo; RH gerencia tudo ----
create policy "holerites_bucket_select"
  on storage.objects for select
  using (
    bucket_id = 'holerites' and (
      public.has_any_role(array['master','administrador','rh']::public.app_role[])
      or (storage.foldername(name))[1] = (
        select id::text from public.funcionarios where user_id = auth.uid() limit 1
      )
    )
  );

create policy "holerites_bucket_write_rh"
  on storage.objects for insert
  with check (
    bucket_id = 'holerites'
    and public.has_any_role(array['master','administrador','rh']::public.app_role[])
  );

-- ---- assinaturas: mesma lógica de holerites ----
create policy "assinaturas_bucket_select"
  on storage.objects for select
  using (
    bucket_id = 'assinaturas' and (
      public.has_any_role(array['master','administrador','rh']::public.app_role[])
      or (storage.foldername(name))[1] = (
        select id::text from public.funcionarios where user_id = auth.uid() limit 1
      )
    )
  );

create policy "assinaturas_bucket_write"
  on storage.objects for insert
  with check (bucket_id = 'assinaturas' and auth.uid() is not null);

-- ---- contratos: staff e o cliente dono do contrato ----
create policy "contratos_bucket_select"
  on storage.objects for select
  using (
    bucket_id = 'contratos' and (
      public.is_staff()
      or (storage.foldername(name))[1] in (
        select cliente_id::text from public.cliente_usuarios where user_id = auth.uid()
      )
    )
  );

create policy "contratos_bucket_write_staff"
  on storage.objects for insert
  with check (
    bucket_id = 'contratos'
    and public.has_any_role(array['master','administrador']::public.app_role[])
  );

-- ---- curriculos: upload público (formulário Trabalhe Conosco), leitura só staff ----
create policy "curriculos_bucket_insert_public"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'curriculos');

create policy "curriculos_bucket_select_staff"
  on storage.objects for select
  using (bucket_id = 'curriculos' and public.is_staff());

-- ---- avatares: público para leitura, cada usuário escreve o próprio ----
create policy "avatares_bucket_select_public"
  on storage.objects for select
  using (bucket_id = 'avatares');

create policy "avatares_bucket_write_own"
  on storage.objects for insert
  with check (
    bucket_id = 'avatares'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---- site-assets: público para leitura, staff gerencia ----
create policy "site_assets_select_public"
  on storage.objects for select
  using (bucket_id = 'site-assets');

create policy "site_assets_write_staff"
  on storage.objects for insert
  with check (bucket_id = 'site-assets' and public.is_staff());
