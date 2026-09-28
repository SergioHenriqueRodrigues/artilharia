-- Ajustes para o front.

-- ---------------------------------------------------------------------------
-- 1. Gols: trocar RESTRICT por NO ACTION nas FKs para presencas.
--    RESTRICT é checado na hora e impedia apagar uma rodada com gols
--    (o cascade apaga as presenças antes dos gols). NO ACTION checa no fim
--    do comando, então apagar a rodada inteira funciona e apagar só a
--    presença de quem fez gol continua bloqueado.
-- ---------------------------------------------------------------------------

alter table public.gols
  drop constraint gols_rodada_id_autor_id_fkey,
  drop constraint gols_rodada_id_assistente_id_fkey;

alter table public.gols
  add constraint gols_autor_presente_fkey foreign key (rodada_id, autor_id)
    references public.presencas (rodada_id, jogador_id),
  add constraint gols_assistente_presente_fkey foreign key (rodada_id, assistente_id)
    references public.presencas (rodada_id, jogador_id);

-- ---------------------------------------------------------------------------
-- 2. FKs diretas para jogadores/rodadas. As FKs compostas para presencas
--    garantem a regra; estas permitem ao PostgREST embutir os dados
--    (ex.: rodadas?select=data,sorteios(time,jogadores(nome))).
-- ---------------------------------------------------------------------------

alter table public.gols
  add constraint gols_autor_fkey foreign key (autor_id) references public.jogadores (id),
  add constraint gols_assistente_fkey foreign key (assistente_id) references public.jogadores (id);

alter table public.sorteios
  add constraint sorteios_rodada_fkey foreign key (rodada_id)
    references public.rodadas (id) on delete cascade,
  add constraint sorteios_jogador_fkey foreign key (jogador_id)
    references public.jogadores (id);

-- ---------------------------------------------------------------------------
-- 3. Salvar sorteio de forma atômica: substitui o sorteio inteiro da rodada.
--    security invoker: as policies de RLS (só admin escreve) continuam valendo.
--    times: [{"jogador_id": 1, "time": 1}, ...]
-- ---------------------------------------------------------------------------

create function public.salvar_sorteio(rodada bigint, times jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'apenas o admin pode salvar o sorteio' using errcode = '42501';
  end if;

  delete from public.sorteios s where s.rodada_id = rodada;

  insert into public.sorteios (rodada_id, jogador_id, time)
  select rodada, t.jogador_id, t.time
  from jsonb_to_recordset(times) as t (jogador_id bigint, time smallint);
end;
$$;

revoke execute on function public.salvar_sorteio(bigint, jsonb) from public, anon;
