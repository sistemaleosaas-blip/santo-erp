-- =====================================================================
-- seed.sql — dados iniciais para ambiente de desenvolvimento/homologação.
-- Rode com: supabase db reset (aplica migrations + este seed automaticamente)
-- =====================================================================

-- Benefícios padrão oferecidos pela Santo
insert into public.beneficios (nome, descricao) values
  ('Vale Transporte', 'Custeio de deslocamento casa-trabalho conforme legislação'),
  ('Vale Refeição', 'Crédito mensal para alimentação'),
  ('Plano de Saúde', 'Cobertura ambulatorial e hospitalar via convênio parceiro'),
  ('Seguro de Vida', 'Apólice em grupo para todos os funcionários ativos'),
  ('Auxílio Uniforme', 'Fornecimento e reposição de uniformes e EPIs')
on conflict do nothing;

-- Cliente de exemplo (empresa contratante em Limeira/SP)
insert into public.clientes (id, razao_social, nome_fantasia, cnpj, email_contato, telefone, endereco)
values (
  '11111111-1111-1111-1111-111111111111',
  'Condomínio Comercial Jardim Nova Itália LTDA',
  'Business Park Limeira',
  '12.345.678/0001-90',
  'sindico@businessparklimeira.com.br',
  '(19) 3441-0000',
  '{"logradouro":"Av. Major José Rodrigues Filho","numero":"1200","bairro":"Jardim Nova Itália","cidade":"Limeira","uf":"SP","cep":"13485-410"}'
)
on conflict (cnpj) do nothing;

-- Contrato de exemplo
insert into public.contratos (id, numero, cliente_id, servicos, status, data_inicio, valor_mensal, postos_contratados)
values (
  '22222222-2222-2222-2222-222222222222',
  'CT-2026-0001',
  '11111111-1111-1111-1111-111111111111',
  array['portaria','controle_acesso','ronda_interna']::public.servico_categoria[],
  'ativo',
  '2026-01-01',
  38500.00,
  6
)
on conflict (numero) do nothing;

-- Postos de serviço do contrato de exemplo
insert into public.postos_servico (contrato_id, nome, categoria, escala)
values
  ('22222222-2222-2222-2222-222222222222', 'Portaria Principal - Diurno', 'portaria', '12x36'),
  ('22222222-2222-2222-2222-222222222222', 'Portaria Principal - Noturno', 'portaria', '12x36'),
  ('22222222-2222-2222-2222-222222222222', 'Controle de Acesso - Garagem', 'controle_acesso', '12x36'),
  ('22222222-2222-2222-2222-222222222222', 'Ronda Interna', 'ronda_interna', '6x1')
on conflict do nothing;

-- Nota: usuários de auth.users (master/admin/rh/supervisor/cliente/funcionario)
-- devem ser criados via Supabase Auth (dashboard, CLI ou API) e depois vinculados
-- em public.user_roles. Ver docs/CREDENCIAIS_DEMO.md para o passo a passo e
-- supabase/seed/run.ts para um script que automatiza isso com a service_role key.
