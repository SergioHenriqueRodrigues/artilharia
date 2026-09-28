import type { Gol, JogadorComNivel, Rodada } from '~/types/dominio'
import type { TimeSorteado } from '~/utils/sorteio'

export interface DetalheRodada {
  rodada: Rodada
  jogadores: JogadorComNivel[]
  presentes: Set<number>
  gols: Pick<Gol, 'id' | 'autor_id' | 'assistente_id'>[]
  /** jogador_id -> time */
  sorteio: Map<number, number>
}

/** Tudo que o admin edita dentro de uma rodada: presença, gols e sorteio. */
export function useRodada(id: number) {
  const supabase = useSupabaseClient()

  const consulta = useAsyncData(`rodada:${id}`, async (): Promise<DetalheRodada> => {
    const [rodada, jogadores, presencas, gols, sorteios] = await Promise.all([
      supabase.from('rodadas').select('id, data').eq('id', id).single(),
      supabase.from('jogadores').select('id, nome, apelido, ativo, created_at, niveis(nivel)').order('nome'),
      supabase.from('presencas').select('jogador_id').eq('rodada_id', id),
      supabase.from('gols').select('id, autor_id, assistente_id').eq('rodada_id', id).order('created_at', { ascending: false }),
      supabase.from('sorteios').select('jogador_id, time').eq('rodada_id', id),
    ])
    const erro = rodada.error ?? jogadores.error ?? presencas.error ?? gols.error ?? sorteios.error
    if (erro) throw erro

    return {
      rodada: rodada.data!,
      jogadores: jogadores.data!.map(({ niveis, ...j }) => ({ ...j, nivel: niveis?.nivel ?? null })),
      presentes: new Set(presencas.data!.map(p => p.jogador_id)),
      gols: gols.data!,
      sorteio: new Map(sorteios.data!.map(s => [s.jogador_id, s.time])),
    }
  })

  async function marcarPresenca(jogadorId: number, presente: boolean) {
    const { error } = presente
      ? await supabase.from('presencas').insert({ rodada_id: id, jogador_id: jogadorId })
      : await supabase.from('presencas').delete().eq('rodada_id', id).eq('jogador_id', jogadorId)
    if (error) throw error
    await consulta.refresh()
  }

  async function adicionarGol(autorId: number, assistenteId: number | null) {
    const { error } = await supabase
      .from('gols')
      .insert({ rodada_id: id, autor_id: autorId, assistente_id: assistenteId })
    if (error) throw error
    await consulta.refresh()
  }

  async function removerGol(golId: number) {
    const { error } = await supabase.from('gols').delete().eq('id', golId)
    if (error) throw error
    await consulta.refresh()
  }

  async function salvarSorteio(times: TimeSorteado<{ id: number, nivel: number | null }>[]) {
    const linhas = times.flatMap(t => t.jogadores.map(j => ({ jogador_id: j.id, time: t.time })))
    const { error } = await supabase.rpc('salvar_sorteio', { rodada: id, times: linhas })
    if (error) throw error
    await consulta.refresh()
  }

  async function excluir() {
    const { error } = await supabase.from('rodadas').delete().eq('id', id)
    if (error) throw error
    clearNuxtData('rodadas')
  }

  return { ...consulta, marcarPresenca, adicionarGol, removerGol, salvarSorteio, excluir }
}
