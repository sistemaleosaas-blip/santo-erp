-- =====================================================================
-- 0005_holerites_ponto_assinaturas.sql
-- Holerites, folha de ponto e assinatura digital em PDF.
-- =====================================================================

create table public.holerites (
  id uuid primary key default gen_random_uuid(),
  funcionario_id uuid not null references public.funcionarios(id) on delete cascade,
  competencia date not null, -- primeiro dia do mês de referência, ex: 2026-08-01
  proventos numeric(12,2) not null default 0,
  descontos numeric(12,2) not null default 0,
  inss numeric(12,2) not null default 0,
  irrf numeric(12,2) not null default 0,
  liquido numeric(12,2) not null,
  detalhamento jsonb not null default '[]', -- linhas: [{descricao, tipo, valor}]
  arquivo_pdf_url text, -- Supabase Storage: bucket 'holerites'
  status public.holerite_status not null default 'gerado',
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (funcionario_id, competencia)
);

create index idx_holerites_funcionario on public.holerites(funcionario_id);
create index idx_holerites_competencia on public.holerites(competencia);
create index idx_holerites_status on public.holerites(status);

create table public.assinaturas_digitais (
  id uuid primary key default gen_random_uuid(),
  holerite_id uuid not null references public.holerites(id) on delete cascade,
  funcionario_id uuid not null references public.funcionarios(id) on delete cascade,
  status public.assinatura_status not null default 'pendente',
  assinatura_svg text, -- traço vetorial capturado (signature_pad)
  arquivo_pdf_assinado_url text, -- PDF final com assinatura embutida
  ip_origem inet,
  user_agent text,
  hash_documento text, -- SHA-256 do PDF assinado, para integridade/auditoria
  assinado_em timestamptz,
  aprovado_por uuid references public.profiles(id), -- RH/admin que valida a assinatura
  aprovado_em timestamptz,
  created_at timestamptz not null default now(),
  unique (holerite_id)
);

create index idx_assinaturas_funcionario on public.assinaturas_digitais(funcionario_id);
create index idx_assinaturas_status on public.assinaturas_digitais(status);

create table public.registros_ponto (
  id uuid primary key default gen_random_uuid(),
  funcionario_id uuid not null references public.funcionarios(id) on delete cascade,
  posto_id uuid references public.postos_servico(id),
  tipo public.ponto_tipo not null,
  registrado_em timestamptz not null default now(),
  latitude numeric(9,6),
  longitude numeric(9,6),
  foto_url text, -- selfie de comprovação (opcional, batida por app)
  justificativa text, -- obrigatório quando tipo = 'ajuste_manual'
  ajustado_por uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index idx_ponto_funcionario_data on public.registros_ponto(funcionario_id, registrado_em desc);
create index idx_ponto_posto on public.registros_ponto(posto_id);

-- Consolidado mensal de ponto (gerado a partir de registros_ponto, upload em lote ou fechamento).
create table public.folhas_ponto (
  id uuid primary key default gen_random_uuid(),
  funcionario_id uuid not null references public.funcionarios(id) on delete cascade,
  competencia date not null,
  horas_trabalhadas interval,
  horas_extras interval,
  faltas integer not null default 0,
  atrasos_minutos integer not null default 0,
  arquivo_pdf_url text,
  fechado boolean not null default false,
  fechado_por uuid references public.profiles(id),
  fechado_em timestamptz,
  created_at timestamptz not null default now(),
  unique (funcionario_id, competencia)
);

create index idx_folhas_ponto_funcionario on public.folhas_ponto(funcionario_id);

create trigger trg_holerites_updated_at before update on public.holerites
  for each row execute function public.set_updated_at();

-- Ao aprovar uma assinatura, sincroniza o status do holerite.
create or replace function public.sync_holerite_status_on_assinatura()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'assinado' then
    update public.holerites set status = 'assinado' where id = new.holerite_id;
  end if;
  return new;
end;
$$;

create trigger trg_assinatura_sync_holerite
  after update of status on public.assinaturas_digitais
  for each row execute function public.sync_holerite_status_on_assinatura();

alter table public.holerites enable row level security;
alter table public.assinaturas_digitais enable row level security;
alter table public.registros_ponto enable row level security;
alter table public.folhas_ponto enable row level security;

-- Holerites: funcionário só vê os próprios; RH/master/admin veem tudo.
create policy "holerites_select" on public.holerites for select
  using (
    public.has_any_role(array['master','administrador','rh']::public.app_role[])
    or funcionario_id in (select id from public.funcionarios where user_id = auth.uid())
  );

create policy "holerites_write_rh" on public.holerites for all
  using (public.has_any_role(array['master','administrador','rh']::public.app_role[]))
  with check (public.has_any_role(array['master','administrador','rh']::public.app_role[]));

create policy "assinaturas_select" on public.assinaturas_digitais for select
  using (
    public.has_any_role(array['master','administrador','rh']::public.app_role[])
    or funcionario_id in (select id from public.funcionarios where user_id = auth.uid())
  );

-- Funcionário só pode criar/atualizar a PRÓPRIA assinatura, e apenas enquanto pendente.
create policy "assinaturas_funcionario_assina" on public.assinaturas_digitais for update
  using (
    funcionario_id in (select id from public.funcionarios where user_id = auth.uid())
    and status = 'pendente'
  )
  with check (
    funcionario_id in (select id from public.funcionarios where user_id = auth.uid())
  );

create policy "assinaturas_rh_aprova" on public.assinaturas_digitais for all
  using (public.has_any_role(array['master','administrador','rh']::public.app_role[]))
  with check (public.has_any_role(array['master','administrador','rh']::public.app_role[]));

create policy "ponto_select" on public.registros_ponto for select
  using (
    public.is_staff()
    or funcionario_id in (select id from public.funcionarios where user_id = auth.uid())
  );

-- Funcionário registra o próprio ponto (bate-ponto pelo app); ajustes manuais só por staff.
create policy "ponto_funcionario_insere" on public.registros_ponto for insert
  with check (
    (funcionario_id in (select id from public.funcionarios where user_id = auth.uid()) and tipo <> 'ajuste_manual')
    or public.has_any_role(array['master','administrador','rh','supervisor']::public.app_role[])
  );

create policy "ponto_staff_gerencia" on public.registros_ponto for update
  using (public.has_any_role(array['master','administrador','rh','supervisor']::public.app_role[]))
  with check (public.has_any_role(array['master','administrador','rh','supervisor']::public.app_role[]));

create policy "folhas_ponto_select" on public.folhas_ponto for select
  using (
    public.is_staff()
    or funcionario_id in (select id from public.funcionarios where user_id = auth.uid())
  );

create policy "folhas_ponto_write_staff" on public.folhas_ponto for all
  using (public.has_any_role(array['master','administrador','rh','supervisor']::public.app_role[]))
  with check (public.has_any_role(array['master','administrador','rh','supervisor']::public.app_role[]));
