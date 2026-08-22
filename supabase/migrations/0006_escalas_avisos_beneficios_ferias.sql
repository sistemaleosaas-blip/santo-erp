-- =====================================================================
-- 0006_escalas_avisos_beneficios_ferias.sql
-- =====================================================================

create table public.escalas (
  id uuid primary key default gen_random_uuid(),
  funcionario_id uuid not null references public.funcionarios(id) on delete cascade,
  posto_id uuid not null references public.postos_servico(id) on delete cascade,
  data date not null,
  turno_inicio time not null,
  turno_fim time not null,
  tipo public.escala_tipo not null,
  observacoes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  unique (funcionario_id, data, turno_inicio)
);

create index idx_escalas_funcionario_data on public.escalas(funcionario_id, data);
create index idx_escalas_posto_data on public.escalas(posto_id, data);

create table public.avisos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  conteudo text not null,
  alvo public.aviso_publico_alvo not null default 'todos',
  cliente_id uuid references public.clientes(id), -- quando alvo = por_cliente
  cargo_alvo text,                                 -- quando alvo = por_cargo
  publicado boolean not null default true,
  publicado_em timestamptz not null default now(),
  expira_em timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index idx_avisos_alvo on public.avisos(alvo);
create index idx_avisos_publicado on public.avisos(publicado, publicado_em desc);

-- Confirmação de leitura por funcionário (para auditoria de comunicados obrigatórios).
create table public.avisos_leituras (
  id uuid primary key default gen_random_uuid(),
  aviso_id uuid not null references public.avisos(id) on delete cascade,
  funcionario_id uuid not null references public.funcionarios(id) on delete cascade,
  lido_em timestamptz not null default now(),
  unique (aviso_id, funcionario_id)
);

create table public.beneficios (
  id uuid primary key default gen_random_uuid(),
  nome text not null,       -- ex: Vale Transporte, Vale Refeição, Plano de Saúde
  descricao text,
  is_active boolean not null default true
);

create table public.funcionario_beneficios (
  id uuid primary key default gen_random_uuid(),
  funcionario_id uuid not null references public.funcionarios(id) on delete cascade,
  beneficio_id uuid not null references public.beneficios(id) on delete cascade,
  valor numeric(10,2),
  data_inicio date not null default current_date,
  data_fim date,
  unique (funcionario_id, beneficio_id, data_inicio)
);

create index idx_func_beneficios_funcionario on public.funcionario_beneficios(funcionario_id);

create table public.solicitacoes_ferias (
  id uuid primary key default gen_random_uuid(),
  funcionario_id uuid not null references public.funcionarios(id) on delete cascade,
  periodo_aquisitivo_inicio date not null,
  periodo_aquisitivo_fim date not null,
  data_inicio date not null,
  data_fim date not null,
  dias integer generated always as ((data_fim - data_inicio) + 1) stored,
  status public.ferias_status not null default 'solicitada',
  observacoes_funcionario text,
  observacoes_rh text,
  aprovado_por uuid references public.profiles(id),
  aprovado_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_ferias_datas check (data_fim >= data_inicio)
);

create index idx_ferias_funcionario on public.solicitacoes_ferias(funcionario_id);
create index idx_ferias_status on public.solicitacoes_ferias(status);

-- Solicitações de atualização cadastral (funcionário sugere; RH aprova e aplica).
create table public.solicitacoes_atualizacao_cadastral (
  id uuid primary key default gen_random_uuid(),
  funcionario_id uuid not null references public.funcionarios(id) on delete cascade,
  campo text not null,      -- ex: 'endereco', 'telefone', 'pix_key', 'contato_emergencia'
  valor_atual jsonb,
  valor_proposto jsonb not null,
  status text not null default 'pendente' check (status in ('pendente','aprovada','rejeitada')),
  analisado_por uuid references public.profiles(id),
  analisado_em timestamptz,
  created_at timestamptz not null default now()
);

create index idx_solic_cadastro_funcionario on public.solicitacoes_atualizacao_cadastral(funcionario_id);

create trigger trg_ferias_updated_at before update on public.solicitacoes_ferias
  for each row execute function public.set_updated_at();

alter table public.escalas enable row level security;
alter table public.avisos enable row level security;
alter table public.avisos_leituras enable row level security;
alter table public.beneficios enable row level security;
alter table public.funcionario_beneficios enable row level security;
alter table public.solicitacoes_ferias enable row level security;
alter table public.solicitacoes_atualizacao_cadastral enable row level security;

create policy "escalas_select" on public.escalas for select
  using (
    public.is_staff()
    or funcionario_id in (select id from public.funcionarios where user_id = auth.uid())
  );

create policy "escalas_write_staff" on public.escalas for all
  using (public.has_any_role(array['master','administrador','rh','supervisor']::public.app_role[]))
  with check (public.has_any_role(array['master','administrador','rh','supervisor']::public.app_role[]));

create policy "avisos_select" on public.avisos for select
  using (
    publicado and (
      alvo = 'todos'
      or public.is_staff()
      or (alvo = 'por_cliente' and cliente_id in (select cliente_id from public.cliente_usuarios where user_id = auth.uid()))
      or (alvo = 'por_funcionario')
      or (alvo = 'por_cargo' and cargo_alvo in (select cargo from public.funcionarios where user_id = auth.uid()))
    )
  );

create policy "avisos_write_staff" on public.avisos for all
  using (public.has_any_role(array['master','administrador','rh','supervisor']::public.app_role[]))
  with check (public.has_any_role(array['master','administrador','rh','supervisor']::public.app_role[]));

create policy "avisos_leituras_select" on public.avisos_leituras for select
  using (public.is_staff() or funcionario_id in (select id from public.funcionarios where user_id = auth.uid()));

create policy "avisos_leituras_insert_proprio" on public.avisos_leituras for insert
  with check (funcionario_id in (select id from public.funcionarios where user_id = auth.uid()));

create policy "beneficios_select_all_authenticated" on public.beneficios for select
  using (auth.uid() is not null);

create policy "beneficios_write_staff" on public.beneficios for all
  using (public.has_any_role(array['master','administrador','rh']::public.app_role[]))
  with check (public.has_any_role(array['master','administrador','rh']::public.app_role[]));

create policy "func_beneficios_select" on public.funcionario_beneficios for select
  using (public.is_staff() or funcionario_id in (select id from public.funcionarios where user_id = auth.uid()));

create policy "func_beneficios_write_staff" on public.funcionario_beneficios for all
  using (public.has_any_role(array['master','administrador','rh']::public.app_role[]))
  with check (public.has_any_role(array['master','administrador','rh']::public.app_role[]));

create policy "ferias_select" on public.solicitacoes_ferias for select
  using (public.is_staff() or funcionario_id in (select id from public.funcionarios where user_id = auth.uid()));

create policy "ferias_funcionario_solicita" on public.solicitacoes_ferias for insert
  with check (funcionario_id in (select id from public.funcionarios where user_id = auth.uid()));

-- Funcionário pode cancelar a própria solicitação enquanto ainda não aprovada.
create policy "ferias_funcionario_cancela" on public.solicitacoes_ferias for update
  using (
    funcionario_id in (select id from public.funcionarios where user_id = auth.uid())
    and status = 'solicitada'
  )
  with check (status in ('cancelada'));

create policy "ferias_rh_gerencia" on public.solicitacoes_ferias for all
  using (public.has_any_role(array['master','administrador','rh']::public.app_role[]))
  with check (public.has_any_role(array['master','administrador','rh']::public.app_role[]));

create policy "cadastro_select" on public.solicitacoes_atualizacao_cadastral for select
  using (public.is_staff() or funcionario_id in (select id from public.funcionarios where user_id = auth.uid()));

create policy "cadastro_funcionario_solicita" on public.solicitacoes_atualizacao_cadastral for insert
  with check (funcionario_id in (select id from public.funcionarios where user_id = auth.uid()));

create policy "cadastro_rh_analisa" on public.solicitacoes_atualizacao_cadastral for update
  using (public.has_any_role(array['master','administrador','rh']::public.app_role[]))
  with check (public.has_any_role(array['master','administrador','rh']::public.app_role[]));
