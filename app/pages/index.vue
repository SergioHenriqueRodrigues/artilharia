<script setup lang="ts">
import type { Periodo } from '~/utils/datas'

useHead({ title: 'Ranking · Artilharia' })

const route = useRoute()
const router = useRouter()

// O período fica na URL (?p=mes&v=2026-09) pra dar pra compartilhar o link.
function periodoDaUrl(): Periodo {
  const p = String(route.query.p ?? 'ano')
  const v = String(route.query.v ?? '')
  if (p === 'geral') return { tipo: 'geral' }
  if (p === 'rodada' || p === 'mes' || p === 'ano') return { tipo: p, valor: v }
  return { tipo: 'ano', valor: '' }
}

const periodo = ref<Periodo>(periodoDaUrl())
watch(periodo, (novo) => {
  router.replace({ query: novo.tipo === 'geral' ? { p: 'geral' } : { p: novo.tipo, v: novo.valor } })
})

const metrica = ref<'gols' | 'assistencias'>('gols')

const { data: rodadas, pending: carregandoRodadas } = useRodadas()
const datas = computed(() => rodadas.value.map(r => r.data))

// Sem valor escolhido ainda (rodadas carregando), não consulta com intervalo inválido.
const periodoValido = computed<Periodo | null>(() =>
  periodo.value.tipo === 'geral' || periodo.value.valor ? periodo.value : null,
)
const { data: linhas, pending: carregandoRanking, error } = useRanking(() => periodoValido.value ?? { tipo: 'geral' })
</script>

<template>
  <div class="space-y-5">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">
        Ranking
      </h1>
      <p class="text-sm text-muted-foreground">
        Gols e assistências da pelada de quarta.
      </p>
    </div>

    <EstadoVazio
      v-if="!carregandoRodadas && !rodadas.length"
      icone="lucide:calendar-x"
      titulo="Nenhuma rodada ainda"
      descricao="O ranking aparece aqui depois da primeira quarta registrada."
    />

    <template v-else>
      <RankingFiltro v-model="periodo" :datas="datas" />

      <Tabs v-model="metrica">
        <TabsList>
          <TabsTrigger value="gols">
            <Icon name="lucide:goal" class="size-4" />
            Artilharia
          </TabsTrigger>
          <TabsTrigger value="assistencias">
            <Icon name="lucide:footprints" class="size-4" />
            Assistências
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <p v-if="error" class="text-sm text-destructive">
        Não foi possível carregar o ranking. Tente recarregar a página.
      </p>
      <RankingTabela v-else :linhas="linhas" :metrica="metrica" :carregando="carregandoRanking || !periodoValido" />
    </template>
  </div>
</template>
