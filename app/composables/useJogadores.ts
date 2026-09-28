import type { JogadorComNivel } from '~/types/dominio'

export interface DadosJogador {
  nome: string
  apelido: string | null
  ativo: boolean
  nivel: number | null
}

/** Cadastro de jogadores (admin). Inclui o nível, que só o admin lê. */
export function useJogadores() {
  const supabase = useSupabaseClient()

  const consulta = useAsyncData(
    'jogadores',
    async (): Promise<JogadorComNivel[]> => {
      const { data, error } = await supabase
        .from('jogadores')
        .select('id, nome, apelido, ativo, created_at, niveis(nivel)')
        .order('nome')
      if (error) throw error
      return data.map(({ niveis, ...jogador }) => ({ ...jogador, nivel: niveis?.nivel ?? null }))
    },
    { default: () => [] },
  )

  async function salvar(dados: DadosJogador, id?: number) {
    const { nivel, ...jogador } = dados
    const { data, error } = id
      ? await supabase.from('jogadores').update(jogador).eq('id', id).select('id').single()
      : await supabase.from('jogadores').insert(jogador).select('id').single()
    if (error) throw error

    const { error: erroNivel } = nivel === null
      ? await supabase.from('niveis').delete().eq('jogador_id', data.id)
      : await supabase.from('niveis').upsert({ jogador_id: data.id, nivel })
    if (erroNivel) throw erroNivel

    await consulta.refresh()
  }

  async function definirAtivo(id: number, ativo: boolean) {
    const { error } = await supabase.from('jogadores').update({ ativo }).eq('id', id)
    if (error) throw error
    await consulta.refresh()
  }

  return { ...consulta, salvar, definirAtivo }
}
