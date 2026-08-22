-- =====================================================================
-- 0001_extensions_and_enums.sql
-- Extensões e tipos enumerados usados em todo o esquema.
-- =====================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm"; -- busca fuzzy por nome/CPF/CNPJ

-- Papéis do sistema (RBAC)
create type public.app_role as enum (
  'master',        -- acesso irrestrito, gestão da própria Santo
  'administrador', -- gestão operacional completa
  'rh',            -- folha, holerites, férias, cadastro de funcionários
  'supervisor',    -- gestão de escalas e pontos de equipes sob sua responsabilidade
  'cliente',       -- portal do cliente contratante
  'funcionario'    -- portal do funcionário terceirizado
);

create type public.contrato_status as enum ('ativo', 'suspenso', 'encerrado', 'em_negociacao');
create type public.funcionario_status as enum ('ativo', 'ferias', 'afastado', 'desligado');
create type public.escala_tipo as enum ('12x36', '6x1', '5x2', '44h_semanais', 'plantao');
create type public.ponto_tipo as enum ('entrada', 'saida_almoco', 'volta_almoco', 'saida', 'ajuste_manual');
create type public.holerite_status as enum ('gerado', 'disponivel', 'assinado', 'contestado');
create type public.assinatura_status as enum ('pendente', 'assinado', 'rejeitado', 'expirado');
create type public.ferias_status as enum ('solicitada', 'aprovada', 'rejeitada', 'em_andamento', 'concluida', 'cancelada');
create type public.chamado_status as enum ('aberto', 'em_andamento', 'aguardando_cliente', 'resolvido', 'fechado');
create type public.chamado_prioridade as enum ('baixa', 'media', 'alta', 'urgente');
create type public.aviso_publico_alvo as enum ('todos', 'por_cliente', 'por_funcionario', 'por_cargo');
create type public.servico_categoria as enum (
  'portaria', 'controle_acesso', 'limpeza', 'zeladoria',
  'jardinagem', 'ronda_interna', 'seguranca_patrimonial', 'facilities'
);

comment on type public.app_role is 'Papéis de acesso ao sistema Santo ERP (RBAC).';
