-- =====================================================================
-- 0004_funcionarios.sql
-- Funcionários terceirizados, alocação em postos e cadeia de supervisão.
-- =====================================================================

create table public.funcionarios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.profiles(id) on delete set null, -- null até o 1º login
  cpf text not null unique,
  rg text,
  matricula text not null unique, -- ex: SANTO-00042
  nome_completo text not null,
  data_nascimento date,
  data_admissao date not null,
  data_desligamento date,
  cargo text not null,
  categoria public.servico_categoria not null,
  status public.funcionario_status not null default 'ativo',
  salario_base numeric(12,2),
  pix_key text,
  endereco jsonb,
  contato_emergencia jsonb, -- {nome, telefone, parentesco}
  foto_url text,
  supervisor_id uuid references public.funcionarios(id), -- auto-referência (cadeia de supervisão)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_funcionarios_cpf on public.funcionarios(cpf);
create index idx_funcionarios_status on public.funcionarios(status);
create index idx_funcionarios_supervisor on public.funcionarios(supervisor_id);
create index idx_funcionarios_nome_trgm on public.funcionarios using gin (nome_completo gin_trgm_ops);

-- Alocação do funcionário a um posto de serviço (histórico: permite trocas).
create table public.alocacoes (
  id uuid primary key default gen_random_uuid(),
  funcionario_id uuid not null references public.funcionarios(id) on delete cascade,
  posto_id uuid not null references public.postos_servico(id) on delete cascade,
  data_inicio date not null default current_date,
  data_fim date,
  is_atual boolean not null default true,
  created_at timestamptz not null default now(),
  constraint chk_alocacao_datas check (data_fim is null or data_fim >= data_inicio)
);

create index idx_alocacoes_funcionario on public.alocacoes(funcionario_id);
create index idx_alocacoes_posto on public.alocacoes(posto_id);
-- Garante no máximo uma alocação "atual" ativa por funcionário.
create unique index uq_alocacao_atual_por_funcionario
  on public.alocacoes(funcionario_id) where (is_atual);

create trigger trg_funcionarios_updated_at before update on public.funcionarios
  for each row execute function public.set_updated_at();

-- Ao inserir nova alocação "atual", encerra a anterior automaticamente.
create or replace function public.fechar_alocacao_anterior()
returns trigger
language plpgsql
as $$
begin
  if new.is_atual then
    update public.alocacoes
    set is_atual = false, data_fim = coalesce(data_fim, new.data_inicio - 1)
    where funcionario_id = new.funcionario_id
      and id <> new.id
      and is_atual = true;
  end if;
  return new;
end;
$$;

create trigger trg_alocacoes_fecha_anterior
  before insert on public.alocacoes
  for each row execute function public.fechar_alocacao_anterior();

alter table public.funcionarios enable row level security;
alter table public.alocacoes enable row level security;

-- Funcionário vê o próprio registro. Cliente vê funcionários alocados em seus contratos.
-- Supervisor vê sua equipe. Staff de RH/admin/master vê tudo.
create policy "funcionarios_select" on public.funcionarios for select
  using (
    public.has_any_role(array['master','administrador','rh']::public.app_role[])
    or user_id = auth.uid()
    or supervisor_id in (select id from public.funcionarios where user_id = auth.uid())
    or id in (
      select a.funcionario_id from public.alocacoes a
      join public.postos_servico p on p.id = a.posto_id
      join public.contratos c on c.id = p.contrato_id
      join public.cliente_usuarios cu on cu.cliente_id = c.cliente_id
      where cu.user_id = auth.uid() and a.is_atual
    )
  );

create policy "funcionarios_write_rh_admin" on public.funcionarios for all
  using (public.has_any_role(array['master','administrador','rh']::public.app_role[]))
  with check (public.has_any_role(array['master','administrador','rh']::public.app_role[]));

-- Funcionário pode atualizar apenas campos de contato/endereço do próprio registro.
create policy "funcionarios_self_update_contato" on public.funcionarios for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "alocacoes_select" on public.alocacoes for select
  using (
    public.is_staff()
    or funcionario_id in (select id from public.funcionarios where user_id = auth.uid())
    or posto_id in (
      select p.id from public.postos_servico p
      join public.contratos c on c.id = p.contrato_id
      join public.cliente_usuarios cu on cu.cliente_id = c.cliente_id
      where cu.user_id = auth.uid()
    )
  );

create policy "alocacoes_write_staff" on public.alocacoes for all
  using (public.has_any_role(array['master','administrador','rh','supervisor']::public.app_role[]))
  with check (public.has_any_role(array['master','administrador','rh','supervisor']::public.app_role[]));

comment on column public.funcionarios.supervisor_id is
  'Auto-referência: define a cadeia de supervisão usada nas policies de RLS do papel supervisor.';
