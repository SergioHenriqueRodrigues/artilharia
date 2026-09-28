# Artilharia

Ranking de gols e assistências e sorteio de times da pelada de quarta-feira.

- **Tela pública** (sem login): ranking por rodada, mês, ano ou geral, e os times sorteados da semana.
- **Área do admin** (`/admin`): cadastro de jogadores, presença, sorteio e lançamento de gols.

## Stack

Nuxt 4 (SPA) · TypeScript · Tailwind v4 · shadcn-vue · Iconify (`@nuxt/icon`, coleção lucide) · Supabase (Postgres, Auth, RLS) · Cloudflare Pages.

Não há backend próprio: o front fala direto com o Supabase, e quem garante as permissões é o banco (RLS).

## Arquitetura

```
app/
├── pages/            Telas. Só montam a interface e chamam composables.
│   ├── index.vue         Ranking (público)
│   ├── times.vue         Times da semana (público)
│   └── admin/            Login, rodadas, jogadores e rodadas/[id]
├── components/
│   ├── ui/               shadcn-vue (gerado pela CLI, não editar à mão)
│   ├── ranking/          Filtro de período e tabela do ranking
│   ├── admin/            Formulários e painéis do admin (presença, sorteio, gols)
│   └── *.vue             Peças compartilhadas (header, TimeCard, estados vazios)
├── composables/      Acesso a dados: um por domínio. Única camada que chama o Supabase.
├── middleware/       admin.global.ts: /admin exige conta na tabela `admins`
├── utils/            Lógica pura e testável (sorteio, datas, validação, erros)
├── types/            database.types.ts (gerado) e tipos de domínio
└── layouts/          default (público) e admin
supabase/
├── migrations/       Schema, RLS e funções. Toda mudança no banco vira migration.
└── config.toml       Config do Supabase local
tests/                Testes (Vitest) da lógica em app/utils
```

**Fluxo de dados:** página → composable (`useRanking`, `useRodada`…) → Supabase. As regras importantes ficam no banco:

- Leitura pública em tudo, menos `niveis` (nível dos jogadores) e `admins`.
- Escrita só para contas na tabela `admins` (função `is_admin()`), não para qualquer usuário logado.
- Só quem está presente na rodada pode fazer gol, dar assistência ou ser sorteado.
- `ranking(inicio, fim)` calcula gols e assistências no período.
- `salvar_sorteio(rodada, times)` troca o sorteio da rodada de uma vez (atômico).

**Sorteio:** feito no navegador do admin (`app/utils/sorteio.ts`), equilibrando pelo nível; o admin vê uma prévia e só então salva. A tela pública apenas lê o sorteio salvo.

## Desenvolvimento

Requisitos: Node 22+ e pnpm.

```bash
pnpm install
cp .env.example .env   # preencha com a URL e a chave publishable do Supabase
pnpm dev               # http://localhost:3000
```

| Comando | O que faz |
| --- | --- |
| `pnpm dev` | Servidor de desenvolvimento |
| `pnpm build` | Gera o site estático em `.output/public` |
| `pnpm test` | Testes da lógica (sorteio, datas) |
| `pnpm lint` / `pnpm typecheck` | Qualidade do código |
| `pnpm db:push` | Aplica as migrations no Supabase linkado |
| `pnpm db:types` | Regenera `app/types/database.types.ts` a partir do banco |

### Mudando o banco

1. `pnpm exec supabase migration new <nome>` e escreva o SQL.
2. `pnpm db:push` para aplicar.
3. `pnpm db:types` para atualizar os tipos do front.

## Deploy (Cloudflare Pages)

- Build command: `pnpm build`
- Output directory: `.output/public`
- Variáveis: `SUPABASE_URL`, `SUPABASE_KEY` (chave publishable) e `NODE_VERSION=22`

`public/_redirects` faz as rotas dinâmicas (`/admin/rodadas/:id`) abrirem o app em vez de 404.

## Branches

- `main`: produção
- `dev`: desenvolvimento (as mudanças entram aqui e depois vão para `main`)
