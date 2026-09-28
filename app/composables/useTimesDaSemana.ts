export interface JogadorNoTime {
  id: number
  nome: string
  apelido: string | null
}

export interface TimesDaRodada {
  data: string
  times: { time: number, jogadores: JogadorNoTime[] }[]
}

/** Último sorteio salvo pelo admin. A tela pública só lê, nunca sorteia. */
export function useTimesDaSemana() {
  const supabase = useSupabaseClient()

  return useAsyncData('times-da-semana', async (): Promise<TimesDaRodada | null> => {
    const { data, error } = await supabase
      .from('rodadas')
      .select('data, sorteios!inner(time, jogadores(id, nome, apelido))')
      .order('data', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) throw error
    if (!data) return null

    const porTime = new Map<number, JogadorNoTime[]>()
    for (const { time, jogadores } of data.sorteios) {
      if (!jogadores) continue
      porTime.set(time, [...(porTime.get(time) ?? []), jogadores])
    }

    return {
      data: data.data,
      times: [...porTime.entries()]
        .sort(([a], [b]) => a - b)
        .map(([time, jogadores]) => ({
          time,
          jogadores: jogadores.sort((a, b) => nomeExibicao(a).localeCompare(nomeExibicao(b), 'pt-BR')),
        })),
    }
  })
}
