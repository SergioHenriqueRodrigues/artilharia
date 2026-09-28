import type { Periodo } from '~/utils/datas'

/** Gols e assistências por jogador no período (já ordenado por gols). */
export function useRanking(periodo: MaybeRefOrGetter<Periodo>) {
  const supabase = useSupabaseClient()
  const intervalo = computed(() => intervaloDoPeriodo(toValue(periodo)))

  return useAsyncData(
    () => `ranking:${intervalo.value.inicio}:${intervalo.value.fim}`,
    async () => {
      const { data, error } = await supabase.rpc('ranking', {
        inicio: intervalo.value.inicio ?? undefined,
        fim: intervalo.value.fim ?? undefined,
      })
      if (error) throw error
      return data
    },
    { default: () => [] },
  )
}
