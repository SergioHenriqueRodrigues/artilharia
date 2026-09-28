export interface ResumoRodada {
  id: number
  data: string
  presentes: number
  gols: number
  sorteada: boolean
}

/** Lista de rodadas (mais recente primeiro) e criação de rodada pelo admin. */
export function useRodadas() {
  const supabase = useSupabaseClient()

  const consulta = useAsyncData(
    'rodadas',
    async (): Promise<ResumoRodada[]> => {
      const { data, error } = await supabase
        .from('rodadas')
        .select('id, data, presencas(count), gols(count), sorteios(count)')
        .order('data', { ascending: false })
      if (error) throw error
      return data.map(r => ({
        id: r.id,
        data: r.data,
        presentes: r.presencas[0]?.count ?? 0,
        gols: r.gols[0]?.count ?? 0,
        sorteada: (r.sorteios[0]?.count ?? 0) > 0,
      }))
    },
    { default: () => [] },
  )

  async function criar(data: string): Promise<number> {
    const { data: rodada, error } = await supabase
      .from('rodadas')
      .insert({ data })
      .select('id')
      .single()
    if (error) throw error
    await consulta.refresh()
    return rodada.id
  }

  return { ...consulta, criar }
}
