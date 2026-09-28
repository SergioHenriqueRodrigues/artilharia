<script setup lang="ts">
import type { DetalheRodada } from '~/composables/useRodada'
import type { JogadorComNivel } from '~/types/dominio'
import type { TimeSorteado } from '~/utils/sorteio'

const props = defineProps<{ detalhe: DetalheRodada, salvando: boolean }>()
const emit = defineEmits<{ salvar: [times: TimeSorteado<JogadorComNivel>[]] }>()

const quantidade = ref('2')
const rascunho = ref<TimeSorteado<JogadorComNivel>[] | null>(null)

const presentes = computed(() => props.detalhe.jogadores.filter(j => props.detalhe.presentes.has(j.id)))
const minimo = computed(() => Number(quantidade.value) * 2)

function forca(jogadores: JogadorComNivel[]) {
  return jogadores.reduce((soma, j) => soma + (j.nivel ?? NIVEL_PADRAO), 0)
}

// Sorteio já salvo, agrupado por time.
const salvo = computed(() => {
  const porTime = new Map<number, JogadorComNivel[]>()
  for (const jogador of props.detalhe.jogadores) {
    const time = props.detalhe.sorteio.get(jogador.id)
    if (time !== undefined) porTime.set(time, [...(porTime.get(time) ?? []), jogador])
  }
  return [...porTime.entries()]
    .sort(([a], [b]) => a - b)
    .map(([time, jogadores]) => ({ time, jogadores, forca: forca(jogadores) }))
})

const foraDoSorteio = computed(() =>
  salvo.value.length ? presentes.value.filter(j => !props.detalhe.sorteio.has(j.id)) : [],
)

function sortear() {
  rascunho.value = sortearTimes(presentes.value, Number(quantidade.value))
}

// Depois de salvar, o rascunho vira o sorteio oficial.
watch(() => props.detalhe.sorteio, () => {
  rascunho.value = null
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-end gap-2">
      <div class="space-y-1.5">
        <Label for="qtd-times">Times</Label>
        <Select v-model="quantidade">
          <SelectTrigger id="qtd-times" class="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="n in ['2', '3', '4']" :key="n" :value="n">
              {{ n }} times
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button :disabled="presentes.length < minimo" @click="sortear">
        <Icon name="lucide:shuffle" class="size-4" />
        {{ rascunho || salvo.length ? 'Sortear de novo' : 'Sortear' }}
      </Button>
    </div>

    <p v-if="presentes.length < minimo" class="text-sm text-muted-foreground">
      Marque pelo menos {{ minimo }} presentes para sortear {{ quantidade }} times ({{ presentes.length }} agora).
    </p>

    <!-- Rascunho: ainda não aparece na tela pública. -->
    <template v-if="rascunho">
      <div class="flex flex-wrap items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm">
        <Icon name="lucide:eye-off" class="size-4 text-amber-600" />
        <span class="flex-1">Prévia: só aparece no site depois de salvar.</span>
        <Button variant="ghost" size="sm" @click="rascunho = null">
          Descartar
        </Button>
        <Button size="sm" :disabled="salvando" @click="emit('salvar', rascunho)">
          <Icon name="lucide:save" class="size-4" />
          Salvar sorteio
        </Button>
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        <TimeCard v-for="t in rascunho" :key="t.time" :time="t.time" :jogadores="t.jogadores" :forca="t.forca" />
      </div>
    </template>

    <template v-else-if="salvo.length">
      <p v-if="foraDoSorteio.length" class="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm">
        Fora do sorteio: {{ foraDoSorteio.map(nomeExibicao).join(', ') }}. Sorteie de novo para incluir.
      </p>
      <div class="grid gap-4 sm:grid-cols-2">
        <TimeCard v-for="t in salvo" :key="t.time" :time="t.time" :jogadores="t.jogadores" :forca="t.forca" />
      </div>
    </template>

    <EstadoVazio
      v-else-if="presentes.length >= minimo"
      icone="lucide:shuffle"
      titulo="Pronto para sortear"
      descricao="O sorteio equilibra os times pelo nível dos jogadores. Você vê uma prévia antes de salvar."
    />
  </div>
</template>
