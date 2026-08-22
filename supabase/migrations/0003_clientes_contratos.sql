-- =====================================================================
-- 0003_clientes_contratos.sql
-- Empresas clientes, contratos de prestação de serviço e postos.
-- =====================================================================

create table public.clientes (
  id uuid primary key default gen_random_uuid(),
  razao_social text not null,
  nome_fantasia text,
  cnpj text not null unique,
  email_contato text not null,
  telefone text,
  endereco jsonb, -- {logradouro, numero, bairro, cidade, uf, cep}
  logo_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_clientes_cnpj on public.clientes(cnpj);
create index idx_clientes_razao_social_trgm on public.clientes using gin (razao_social gin_trgm_ops);

-- Vincula usuários (papel 'cliente') à empresa que representam.
create table public.cliente_usuarios (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  cargo text,
  is_principal boolean not null default false,
  created_at timestamptz not null default now(),
  unique (cliente_id, user_id)
);

create index idx_cliente_usuarios_cliente on public.cliente_usuarios(cliente_id);
create index idx_cliente_usuarios_user on public.cliente_usuarios(user_id);

create table public.contratos (
  id uuid primary key default gen_random_uuid(),
  numero text not null unique, -- ex: CT-2026-0001
  cliente_id uuid not null references public.clientes(id) on delete restrict,
  servicos public.servico_categoria[] not null,
  status public.contrato_status not null default 'em_negociacao',
  data_inicio date not null,
  data_fim date,
  valor_mensal numeric(12,2),
  postos_contratados integer not null default 1,
  arquivo_url text, -- PDF do contrato assinado (Supabase Storage)
  observacoes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_contrato_datas check (data_fim is null or data_fim >= data_inicio)
);

create index idx_contratos_cliente on public.contratos(cliente_id);
create index idx_contratos_status on public.contratos(status);

-- Postos de trabalho vinculados a um contrato (ex.: "Portaria - Portão 2").
create table public.postos_servico (
  id uuid primary key default gen_random_uuid(),
  contrato_id uuid not null references public.contratos(id) on delete cascade,
  nome text not null,
  categoria public.servico_categoria not null,
  endereco jsonb,
  escala public.escala_tipo not null default '12x36',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_postos_contrato on public.postos_servico(contrato_id);

create trigger trg_clientes_updated_at before update on public.clientes
  for each row execute function public.set_updated_at();
create trigger trg_contratos_updated_at before update on public.contratos
  for each row execute function public.set_updated_at();

alter table public.clientes enable row level security;
alter table public.cliente_usuarios enable row level security;
alter table public.contratos enable row level security;
alter table public.postos_servico enable row level security;

-- Staff vê tudo. Cliente vê apenas a própria empresa.
create policy "clientes_select" on public.clientes for select
  using (
    public.is_staff()
    or id in (select cliente_id from public.cliente_usuarios where user_id = auth.uid())
  );

create policy "clientes_write_staff" on public.clientes for all
  using (public.has_any_role(array['master','administrador']::public.app_role[]))
  with check (public.has_any_role(array['master','administrador']::public.app_role[]));

create policy "cliente_usuarios_select" on public.cliente_usuarios for select
  using (public.is_staff() or user_id = auth.uid());

create policy "cliente_usuarios_write_staff" on public.cliente_usuarios for all
  using (public.has_any_role(array['master','administrador']::public.app_role[]))
  with check (public.has_any_role(array['master','administrador']::public.app_role[]));

create policy "contratos_select" on public.contratos for select
  using (
    public.is_staff()
    or cliente_id in (select cliente_id from public.cliente_usuarios where user_id = auth.uid())
  );

create policy "contratos_write_staff" on public.contratos for all
  using (public.has_any_role(array['master','administrador']::public.app_role[]))
  with check (public.has_any_role(array['master','administrador']::public.app_role[]));

create policy "postos_select" on public.postos_servico for select
  using (
    public.is_staff()
    or contrato_id in (
      select c.id from public.contratos c
      join public.cliente_usuarios cu on cu.cliente_id = c.cliente_id
      where cu.user_id = auth.uid()
    )
  );

create policy "postos_write_staff" on public.postos_servico for all
  using (public.has_any_role(array['master','administrador','supervisor']::public.app_role[]))
  with check (public.has_any_role(array['master','administrador','supervisor']::public.app_role[]));
