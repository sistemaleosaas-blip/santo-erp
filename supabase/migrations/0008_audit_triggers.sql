-- =====================================================================
-- 0008_audit_triggers.sql
-- Auditoria automática em tabelas sensíveis (holerites, salários, papéis).
-- =====================================================================

create or replace function public.audit_trigger_fn()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_log (user_id, acao, tabela, registro_id, dados_antes, dados_depois)
  values (
    auth.uid(),
    lower(tg_op),
    tg_table_name,
    coalesce(new.id, old.id),
    case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('UPDATE','INSERT') then to_jsonb(new) else null end
  );
  return coalesce(new, old);
end;
$$;

create trigger trg_audit_holerites
  after insert or update or delete on public.holerites
  for each row execute function public.audit_trigger_fn();

create trigger trg_audit_funcionarios
  after update or delete on public.funcionarios
  for each row execute function public.audit_trigger_fn();

create trigger trg_audit_user_roles
  after insert or update or delete on public.user_roles
  for each row execute function public.audit_trigger_fn();

create trigger trg_audit_assinaturas
  after insert or update on public.assinaturas_digitais
  for each row execute function public.audit_trigger_fn();

create trigger trg_audit_contratos
  after insert or update or delete on public.contratos
  for each row execute function public.audit_trigger_fn();
