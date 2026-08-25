-- =====================================================================
-- 0003_profiles_insert_policy.sql
-- Permitir INSERT em public.profiles quando o próprio usuário está criando
-- seu registro de perfil (ex.: durante sign-up).
-- Esta migration verifica se a tabela public.profiles existe antes de
-- criar a policy para evitar erros em bancos onde a migration 0002 não foi
-- aplicada.
-- =====================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'profiles' AND n.nspname = 'public'
  ) THEN

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'profiles_insert_own'
    ) THEN
      EXECUTE $sql$
        CREATE POLICY "profiles_insert_own"
          ON public.profiles FOR INSERT
          USING (auth.uid() IS NOT NULL AND id = auth.uid())
          WITH CHECK (auth.uid() IS NOT NULL AND id = auth.uid());
      $sql$;
    ELSE
      RAISE NOTICE 'Policy profiles_insert_own already exists on public.profiles';
    END IF;

  ELSE
    RAISE NOTICE 'public.profiles does not exist; skipping creation of profiles_insert_own policy';
  END IF;
END$$;

-- Rollback (para remover a policy se necessário)
-- DO $$
-- BEGIN
--   IF EXISTS (
--     SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'profiles_insert_own'
--   ) THEN
--     EXECUTE 'DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles';
--   END IF;
-- END$$;
