<script setup lang="ts">
import type { Periodo } from '~/utils/datas'

type Tipo = Periodo['tipo']

const props = defineProps<{
  /** Datas das rodadas ('yyyy-MM-dd'), da mais recente para a mais antiga. */
  datas: string[]
}>()

const periodo = defineModel<Periodo>({ required: true })

const TIPOS: { valor: Tipo, rotulo: string }[] = [
  { valor: 'rodada', rotulo: 'Rodada' },
  { valor: 'mes', rotulo: 'Mês' },
  { valor: 'ano', rotulo: 'Ano' },
  { valor: 'geral', rotulo: 'Geral' },
]

function opcoesPara(tipo: Tipo): { valor: string, rotulo: string }[] {
  switch (tipo) {
    case 'rodada':
      return props.datas.map(d => ({ valor: d, rotulo: formatarData(d, "d 'de' MMM 'de' yyyy") }))
    case 'mes':
      return [...new Set(props.datas.map(d => d.slice(0, 7)))].map(m => ({ valor: m, rotulo: formatarMes(m) }))
    case 'ano':
      return [...new Set(props.datas.map(d => d.slice(0, 4)))].map(a => ({ valor: a, rotulo: a }))
    case 'geral':
      return []
  }
}

const opcoes = computed(() => opcoesPara(periodo.value.tipo))
const valorAtual = computed(() => (periodo.value.tipo === 'geral' ? '' : periodo.value.valor))

function selecionar(tipo: Tipo, valor?: string) {
  if (tipo === 'geral') {
    periodo.value = { tipo }
    return
  }
  periodo.value = { tipo, valor: valor ?? opcoesPara(tipo)[0]?.valor ?? '' }
}

// Valor ausente ou inválido (URL antiga, rodadas ainda carregando): usa a opção mais recente.
watch(opcoes, (lista) => {
  if (periodo.value.tipo !== 'geral' && lista.length && !lista.some(o => o.valor === valorAtual.value)) {
    selecionar(periodo.value.tipo)
  }
}, { immediate: true })
</script>

<template>
  <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
    <Tabs :model-value="periodo.tipo" @update:model-value="tipo => selecionar(tipo as Tipo)">
      <TabsList class="w-full sm:w-auto">
        <TabsTrigger v-for="tipo in TIPOS" :key="tipo.valor" :value="tipo.valor">
          {{ tipo.rotulo }}
        </TabsTrigger>
      </TabsList>
    </Tabs>

    <Select
      v-if="periodo.tipo !== 'geral'"
      :model-value="valorAtual"
      @update:model-value="valor => selecionar(periodo.tipo, String(valor))"
    >
      <SelectTrigger class="w-full sm:w-56" aria-label="Escolher período">
        <SelectValue placeholder="Sem rodadas" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem v-for="opcao in opcoes" :key="opcao.valor" :value="opcao.valor">
          {{ opcao.rotulo }}
        </SelectItem>
      </SelectContent>
    </Select>
  </div>
</template>
