-- Schema inicial da Artilharia.
-- Leitura pública (anon) em tudo, exceto níveis; escrita só para quem está em admins.

-- ---------------------------------------------------------------------------
-- Admin
-- ---------------------------------------------------------------------------

create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

alter table public.admins enable row level security;
-- Sem policies: ninguém lê nem escreve via API. O admin é inserido pelo painel/SQL.

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;

-- ---------------------------------------------------------------------------
-- Tabelas
-- ---------------------------------------------------------------------------

create table public.jogadores (
  id bigint generated always as identity primary key,
  nome text not null check (length(trim(nome)) > 0),
  apelido text,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

-- Separado de jogadores porque o RLS filtra linhas, não colunas:
-- o nível é usado só no sorteio e não pode aparecer na tela pública.
create table public.niveis (
  jogador_id bigint primary key references public.jogadores (id) on delete cascade,
  nivel smallint not null check (nivel between 1 and 5)
);

create table public.rodadas (
  id bigint generated always as identity primary key,
  data date not null unique
);

create table public.presencas (
  rodada_id bigint not null references public.rodadas (id) on delete cascade,
  jogador_id bigint not null references public.jogadores (id) on delete restrict,
  primary key (rodada_id, jogador_id)
);

create index presencas_jogador_idx on public.presencas (jogador_id);

-- Autor e assistente precisam estar presentes na rodada.
create table public.gols (
  id bigint generated always as identity primary key,
  rodada_id bigint not null references public.rodadas (id) on delete cascade,
  autor_id bigint not null,
  assistente_id bigint,
  created_at timestamptz not null default now(),
  foreign key (rodada_id, autor_id)
    references public.presencas (rodada_id, jogador_id) on delete restrict,
  foreign key (rodada_id, assistente_id)
    references public.presencas (rodada_id, jogador_id) on delete restrict,
  check (assistente_id is null or assistente_id <> autor_id)
);

create index gols_rodada_idx on public.gols (rodada_id);
create index gols_autor_idx on public.gols (autor_id);
create index gols_assistente_idx on public.gols (assistente_id);

-- Só quem está presente pode ser sorteado. Remover a presença tira do sorteio.
create table public.sorteios (
  rodada_id bigint not null,
  jogador_id bigint not null,
  time smallint not null check (time >= 1),
  primary key (rodada_id, jogador_id),
  foreign key (rodada_id, jogador_id)
    references public.presencas (rodada_id, jogador_id) on delete cascade
);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.jogadores enable row level security;
alter table public.niveis enable row level security;
alter table public.rodadas enable row level security;
alter table public.presencas enable row level security;
alter table public.gols enable row level security;
alter table public.sorteios enable row level security;

create policy "leitura publica" on public.jogadores for select using (true);
create policy "leitura publica" on public.rodadas for select using (true);
create policy "leitura publica" on public.presencas for select using (true);
create policy "leitura publica" on public.gols for select using (true);
create policy "leitura publica" on public.sorteios for select using (true);

create policy "admin le" on public.niveis for select to authenticated using ((select public.is_admin()));

create policy "admin escreve" on public.jogadores for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin escreve" on public.niveis for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin escreve" on public.rodadas for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin escreve" on public.presencas for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin escreve" on public.gols for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin escreve" on public.sorteios for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Ranking
-- ---------------------------------------------------------------------------

-- Gols e assistências por jogador no intervalo [inicio, fim] (datas das rodadas).
-- Parâmetro nulo = sem limite. Uma rodada: inicio = fim = data da rodada.
create function public.ranking(inicio date default null, fim date default null)
returns table (
  jogador_id bigint,
  nome text,
  apelido text,
  gols bigint,
  assistencias bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
  with eventos as (
    select g.autor_id as jogador_id, 1 as gol, 0 as assistencia
    from public.gols g
    join public.rodadas r on r.id = g.rodada_id
    where (inicio is null or r.data >= inicio) and (fim is null or r.data <= fim)
    union all
    select g.assistente_id, 0, 1
    from public.gols g
    join public.rodadas r on r.id = g.rodada_id
    where g.assistente_id is not null
      and (inicio is null or r.data >= inicio) and (fim is null or r.data <= fim)
  )
  select j.id, j.nome, j.apelido, sum(e.gol)::bigint, sum(e.assistencia)::bigint
  from eventos e
  join public.jogadores j on j.id = e.jogador_id
  group by j.id, j.nome, j.apelido
  order by 4 desc, 5 desc, j.nome;
$$;
