<script setup lang="ts">
const props = defineProps<{
  time: number
  jogadores: { id: number, nome: string, apelido: string | null }[]
  /** Força somada (só no admin). */
  forca?: number
}>()

const CORES = ['bg-sky-500', 'bg-amber-500', 'bg-rose-500', 'bg-violet-500', 'bg-emerald-500', 'bg-orange-500']
const cor = computed(() => CORES[(props.time - 1) % CORES.length])
</script>

<template>
  <Card class="gap-3 py-4">
    <CardHeader class="px-4">
      <CardTitle class="flex items-center gap-2 text-base">
        <span class="size-3 rounded-full" :class="cor" />
        Time {{ time }}
        <span class="ml-auto text-xs font-normal text-muted-foreground">
          {{ jogadores.length }} jogadores<template v-if="forca !== undefined"> · força {{ forca }}</template>
        </span>
      </CardTitle>
    </CardHeader>
    <CardContent class="px-4">
      <ul class="space-y-1.5 text-sm">
        <li v-for="jogador in jogadores" :key="jogador.id" class="flex items-center gap-2">
          <Icon name="lucide:user" class="size-3.5 text-muted-foreground" />
          {{ nomeExibicao(jogador) }}
          <slot name="extra" :jogador="jogador" />
        </li>
      </ul>
    </CardContent>
  </Card>
</template>
