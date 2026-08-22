# Santo ERP — Santo Serviços Terceirizados

Site institucional + ERP interno (Portal do Funcionário, Portal do Cliente e
Área Administrativa) para a Santo Serviços Terceirizados, empresa de
segurança patrimonial e facilities em Limeira/SP.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · Shadcn/UI ·
Supabase (Auth, Postgres, Storage) · Zod · React Hook Form · TanStack Query ·
Lucide Icons.

## Estrutura de pastas

```
src/
  app/
    (site)/          → páginas públicas: home, empresa, serviços, clientes, contato...
    (auth)/           → seletor de login + login por CPF/e-mail
    (funcionario)/     → Portal do Funcionário
    (cliente)/         → Portal do Cliente
    (admin)/           → Área Administrativa
    api/                → Route Handlers (relatórios, webhooks)
  components/
    ui/         → primitivos shadcn/ui (Button, Card, Input...)
    layout/      → header, footer, sidebar, topbar
    site/         → formulários e blocos do site institucional
  lib/
    supabase/  → clients (browser, server, middleware)
    validations/  → schemas Zod
    services/      → funções de acesso a dados (session, etc.)
supabase/
  migrations/    → schema SQL completo (0001 a 0009)
  seed/           → dados iniciais + script de usuários demo
```

## 1. Pré-requisitos

- Node.js 20+
- Conta no [Supabase](https://supabase.com)
- Conta na [Vercel](https://vercel.com) (para deploy)
- Supabase CLI: `npm install -g supabase`

## 2. Configurar o Supabase

```bash
# Login e link do projeto (crie o projeto antes no dashboard do Supabase)
supabase login
supabase link --project-ref SEU_PROJECT_REF

# Aplica todas as migrations (schema completo com RLS) + seed.sql
supabase db push
# ou, em ambiente local com Docker:
supabase start
supabase db reset
```

Depois, crie os usuários de demonstração (um por papel) rodando o script de
seed em TypeScript, que usa a service_role key para criar contas no Auth:

```bash
SUPABASE_URL=https://SEU_PROJETO.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key \
npm run seed
```

Isso cria 6 usuários (senha padrão `Demo@12345`):

| Papel | E-mail / CPF |
|---|---|
| Master | master@santoservicos.com.br |
| Administrador | admin@santoservicos.com.br |
| RH | rh@santoservicos.com.br |
| Supervisor | supervisor@santoservicos.com.br |
| Cliente | cliente@businessparklimeira.com.br |
| Funcionário | CPF 123.456.789-00 |

## 3. Rodar localmente

```bash
npm install
cp .env.example .env.local
# preencha NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# SUPABASE_SERVICE_ROLE_KEY com os valores do seu projeto Supabase

npm run supabase:gen-types   # gera src/types/database.types.ts a partir do schema real
npm run dev                  # http://localhost:3000
```

## 4. Deploy na Vercel

1. Importe o repositório no dashboard da Vercel.
2. Configure as variáveis de ambiente (mesmas do `.env.local`) em
   Project Settings → Environment Variables.
3. Cada push em `main` dispara o workflow `.github/workflows/ci-cd.yml`
   (lint, typecheck, testes, build e deploy). Configure os secrets no GitHub:
   `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`,
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## 5. Papéis e controle de acesso (RBAC)

O acesso é controlado em duas camadas:

1. **Middleware** (`src/middleware.ts`): bloqueia rotas `/admin`, `/cliente`
   e `/funcionario` para quem não tem o papel adequado, redirecionando para
   o login correto.
2. **RLS no Postgres** (todas as migrations em `supabase/migrations/`): a
   proteção real dos dados, independente da camada de aplicação. Mesmo que
   alguém chame a API do Supabase diretamente, as políticas impedem acesso
   indevido.

Papéis: `master`, `administrador`, `rh`, `supervisor`, `cliente`, `funcionario`.

## 6. Cobertura do projeto

Todas as 32 rotas do App Router têm implementação funcional (nenhuma tela
"em construção"):

**Site institucional:** Home, Empresa, Serviços, Clientes, Trabalhe
Conosco (com upload de currículo) e Contato — todos com formulários reais
gravando em `contatos_site`.

**Autenticação:** seletor de portais, login por CPF (funcionário) e por
e-mail (cliente/admin), middleware com RBAC completo.

**Área Administrativa:** dashboard com KPIs reais, CRUD de funcionários
(com geração automática de matrícula), CRUD de clientes, CRUD de
contratos (com seleção múltipla de serviços), upload individual de
holerite com cálculo automático do líquido, upload em lote de ponto via
CSV, aprovação/rejeição de assinaturas digitais, gestão de usuários e
papéis (RBAC), exportação de relatórios em Excel e PDF.

**Portal do Funcionário:** dashboard, holerites com **assinatura digital
completa** (captura em canvas → geração de PDF com `pdf-lib` → hash
SHA-256 → upload no Storage), folha de ponto, escalas, avisos (com
confirmação de leitura), benefícios, solicitação e cancelamento de
férias, e solicitação de atualização cadastral (com aprovação do RH).

**Portal do Cliente:** dashboard com indicadores, funcionários alocados
nos seus contratos, listagem de contratos, abertura de chamados com
thread de mensagens, relatórios com taxa de resolução.

## 7. O que fica para uma fase futura (não bloqueia o uso do sistema)

- Geração de holerite em lote a partir de planilha de folha de pagamento
  (hoje é individual, um por vez).
- Vínculo automático de posto ↔ funcionário via drag-and-drop (hoje é via
  tabela `alocacoes`, gerenciável por SQL/API).
- Relatórios adicionais (performance por posto, histórico de rondas).
- Notificações por e-mail/push (avisos, aprovações, vencimento de
  contrato) — a Edge Function `enviar-notificacao` está no schema como
  stub de pasta, mas a lógica ainda não foi implementada.

## Licença

Uso interno — Santo Serviços Terceirizados.
