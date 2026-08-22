-- =====================================================================
-- 0007_chamados_contato_auditoria.sql
-- Chamados (portal do cliente), leads do site institucional e auditoria.
-- =====================================================================

create table public.chamados (
  id uuid primary key default gen_random_uuid(),
  numero serial unique,
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  contrato_id uuid references public.contratos(id),
  aberto_por uuid not null references public.profiles(id),
  assunto text not null,
  descricao text not null,
  prioridade public.chamado_prioridade not null default 'media',
  status public.chamado_status not null default 'aberto',
  responsavel_id uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolvido_em timestamptz
);

create index idx_chamados_cliente on public.chamados(cliente_id);
create index idx_chamados_status on public.chamados(status);

create table public.chamados_mensagens (
  id uuid primary key default gen_random_uuid(),
  chamado_id uuid not null references public.chamados(id) on delete cascade,
  autor_id uuid not null references public.profiles(id),
  mensagem text not null,
  anexo_url text,
  created_at timestamptz not null default now()
);

create index idx_chamados_mensagens_chamado on public.chamados_mensagens(chamado_id, created_at);

create trigger trg_chamados_updated_at before update on public.chamados
  for each row execute function public.set_updated_at();

-- Leads do formulário "Contato" e "Trabalhe Conosco" do site institucional (públicos, sem auth).
create table public.contatos_site (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('contato_comercial', 'trabalhe_conosco')),
  nome text not null,
  email text not null,
  telefone text,
  empresa text,               -- quando tipo = contato_comercial
  cargo_pretendido text,      -- quando tipo = trabalhe_conosco
  mensagem text,
  curriculo_url text,         -- quando tipo = trabalhe_conosco
  ip_origem inet,
  status text not null default 'novo' check (status in ('novo','em_analise','respondido','arquivado')),
  created_at timestamptz not null default now()
);

create index idx_contatos_site_tipo on public.contatos_site(tipo, created_at desc);

-- Log de auditoria genérico (quem fez o quê, em qual registro, quando).
create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  acao text not null,        -- ex: 'holerite.upload', 'funcionario.update', 'assinatura.aprovar'
  tabela text not null,
  registro_id uuid,
  dados_antes jsonb,
  dados_depois jsonb,
  ip_origem inet,
  created_at timestamptz not null default now()
);

create index idx_audit_log_tabela_registro on public.audit_log(tabela, registro_id);
create index idx_audit_log_user on public.audit_log(user_id, created_at desc);

alter table public.chamados enable row level security;
alter table public.chamados_mensagens enable row level security;
alter table public.contatos_site enable row level security;
alter table public.audit_log enable row level security;

create policy "chamados_select" on public.chamados for select
  using (
    public.is_staff()
    or cliente_id in (select cliente_id from public.cliente_usuarios where user_id = auth.uid())
  );

create policy "chamados_cliente_abre" on public.chamados for insert
  with check (
    cliente_id in (select cliente_id from public.cliente_usuarios where user_id = auth.uid())
    and aberto_por = auth.uid()
  );

create policy "chamados_update" on public.chamados for update
  using (
    public.has_any_role(array['master','administrador','supervisor']::public.app_role[])
    or cliente_id in (select cliente_id from public.cliente_usuarios where user_id = auth.uid())
  );

create policy "chamados_mensagens_select" on public.chamados_mensagens for select
  using (
    chamado_id in (
      select id from public.chamados
      where public.is_staff()
         or cliente_id in (select cliente_id from public.cliente_usuarios where user_id = auth.uid())
    )
  );

create policy "chamados_mensagens_insert" on public.chamados_mensagens for insert
  with check (
    autor_id = auth.uid() and chamado_id in (
      select id from public.chamados
      where public.is_staff()
         or cliente_id in (select cliente_id from public.cliente_usuarios where user_id = auth.uid())
    )
  );

-- Formulários públicos do site: qualquer visitante (anon) pode inserir; leitura só staff.
create policy "contatos_site_insert_public" on public.contatos_site for insert
  to anon, authenticated
  with check (true);

create policy "contatos_site_select_staff" on public.contatos_site for select
  using (public.is_staff());

create policy "audit_log_select_master_admin" on public.audit_log for select
  using (public.has_any_role(array['master','administrador']::public.app_role[]));

-- audit_log só é gravado via SECURITY DEFINER triggers/RPC — sem policy de insert direto.
