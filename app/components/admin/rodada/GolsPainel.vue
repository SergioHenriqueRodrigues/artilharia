<script setup lang="ts">
import type { DetalheRodada } from '~/composables/useRodada'

const props = defineProps<{ detalhe: DetalheRodada, salvando: boolean }>()
const emit = defineEmits<{
  adicionar: [autorId: number, assistenteId: number | null]
  remover: [golId: number]
}>()

const SEM = 'sem'
const autor = ref<string>('')
const assistente = ref<string>(SEM)

const presentes = computed(() => props.detalhe.jogadores.filter(j => props.detalhe.presentes.has(j.id)))
const porId = computed(() => new Map(props.detalhe.jogadores.map(j => [j.id, j])))
const nome = (id: number) => {
  const jogador = porId.value.get(id)
  return jogador ? nomeExibicao(jogador) : '?'
}

// Se o autor escolhido for o assistente, limpa a assistência.
watch(autor, (novo) => {
  if (novo === assistente.value) assistente.value = SEM
})

// Placar pelo time de quem fez o gol (só quando há sorteio salvo).
const placar = computed(() => {
  if (!props.detalhe.sorteio.size) return []
  const gols = new Map<number, number>()
  for (const time of new Set(props.detalhe.sorteio.values())) gols.set(time, 0)
  for (const gol of props.detalhe.gols) {
    const time = props.detalhe.sorteio.get(gol.autor_id)
    if (time !== undefined) gols.set(time, (gols.get(time) ?? 0) + 1)
  }
  return [...gols.entries()].sort(([a], [b]) => a - b)
})

function lancar() {
  if (!autor.value) return
  emit('adicionar', Number(autor.value), assistente.value === SEM ? null : Number(assistente.value))
  autor.value = ''
  assistente.value = SEM
}
</script>

<template>
  <div class="space-y-4">
    <EstadoVazio
      v-if="!presentes.length"
      icone="lucide:user-check"
      titulo="Marque a presença primeiro"
      descricao="Só quem estava na rodada pode fazer gol ou dar assistência."
    />

    <template v-else>
      <form class="grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end" @submit.prevent="lancar">
        <div class="space-y-1.5">
          <Label for="autor">Gol de</Label>
          <Select v-model="autor">
            <SelectTrigger id="autor" class="w-full">
              <SelectValue placeholder="Quem fez" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="j in presentes" :key="j.id" :value="String(j.id)">
                {{ nomeExibicao(j) }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-1.5">
          <Label for="assistente">Assistência</Label>
          <Select v-model="assistente">
            <SelectTrigger id="assistente" class="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem :value="SEM">
                Sem assistência
              </SelectItem>
              <SelectItem v-for="j in presentes.filter(p => String(p.id) !== autor)" :key="j.id" :value="String(j.id)">
                {{ nomeExibicao(j) }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" :disabled="!autor || salvando">
          <Icon name="lucide:plus" class="size-4" />
          Lançar gol
        </Button>
      </form>

      <div v-if="placar.length" class="flex flex-wrap gap-2">
        <Badge v-for="[time, gols] in placar" :key="time" variant="outline" class="h-7 px-3 text-sm">
          Time {{ time }}: <strong class="tabular-nums">{{ gols }}</strong>
        </Badge>
      </div>

      <p v-if="!detalhe.gols.length" class="text-sm text-muted-foreground">
        Nenhum gol lançado nesta rodada.
      </p>
      <ul v-else class="divide-y overflow-hidden rounded-xl border">
        <li v-for="gol in detalhe.gols" :key="gol.id" class="flex items-center gap-3 px-4 py-2.5">
          <Icon name="lucide:goal" class="size-4 text-primary" />
          <div class="flex-1 text-sm">
            <span class="font-medium">{{ nome(gol.autor_id) }}</span>
            <span v-if="gol.assistente_id" class="text-muted-foreground"> · assist. {{ nome(gol.assistente_id) }}</span>
          </div>
          <Button variant="ghost" size="icon-sm" aria-label="Remover gol" :disabled="salvando" @click="emit('remover', gol.id)">
            <Icon name="lucide:trash-2" class="size-4" />
          </Button>
        </li>
      </ul>
    </template>
  </div>
</template>
