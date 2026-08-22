-- =====================================================================
-- 0002_profiles_and_roles.sql
-- Perfis vinculados a auth.users + tabela de papéis (many-to-many,
-- permitindo, ex., um usuário RH que também é Supervisor).
-- =====================================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  phone text,
  avatar_url text,
  cpf text unique,             -- login de funcionário é feito por CPF
  is_active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Extensão de auth.users com dados de perfil do sistema.';

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create index idx_user_roles_user_id on public.user_roles(user_id);
create index idx_user_roles_role on public.user_roles(role);
create index idx_profiles_cpf on public.profiles(cpf);
create index idx_profiles_email_trgm on public.profiles using gin (email gin_trgm_ops);

-- ---------------------------------------------------------------------
-- Função utilitária: retorna true se o usuário autenticado possui o papel.
-- SECURITY DEFINER + search_path fixo evita bypass de RLS e schema hijacking.
-- ---------------------------------------------------------------------
create or replace function public.has_role(_role public.app_role, _user_id uuid default auth.uid())
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

create or replace function public.has_any_role(_roles public.app_role[], _user_id uuid default auth.uid())
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = any(_roles)
  );
$$;

-- Staff = qualquer papel interno da Santo (não cliente/funcionário)
create or replace function public.is_staff(_user_id uuid default auth.uid())
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.has_any_role(array['master','administrador','rh','supervisor']::public.app_role[], _user_id);
$$;

-- ---------------------------------------------------------------------
-- Trigger genérica de updated_at, reutilizada por várias tabelas.
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Cria automaticamente um profile quando um usuário se cadastra no Auth.
-- O papel é atribuído separadamente pelo admin/RH (nunca auto-atribuído).
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), new.email);
  return new;
end;
$$;

create trigger trg_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;

-- Qualquer usuário autenticado pode ler o próprio perfil; staff lê todos.
create policy "profiles_select_own_or_staff"
  on public.profiles for select
  using (id = auth.uid() or public.is_staff());

create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles_staff_manage"
  on public.profiles for all
  using (public.has_any_role(array['master','administrador','rh']::public.app_role[]))
  with check (public.has_any_role(array['master','administrador','rh']::public.app_role[]));

create policy "user_roles_select_own_or_staff"
  on public.user_roles for select
  using (user_id = auth.uid() or public.is_staff());

-- Apenas master/administrador atribuem papéis (RH não pode se auto-promover).
create policy "user_roles_manage_master_admin"
  on public.user_roles for all
  using (public.has_any_role(array['master','administrador']::public.app_role[]))
  with check (public.has_any_role(array['master','administrador']::public.app_role[]));
