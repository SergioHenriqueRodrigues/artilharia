<script setup lang="ts">
import type { LinhaRanking } from '~/types/dominio'

type Metrica = 'gols' | 'assistencias'

const props = defineProps<{
  linhas: LinhaRanking[]
  metrica: Metrica
  carregando?: boolean
}>()

const MEDALHAS = ['text-amber-500', 'text-zinc-400', 'text-orange-700']

/** Ordena pela métrica escolhida; empatados dividem a posição (1, 2, 2, 4). */
const classificacao = computed(() => {
  const m = props.metrica
  const outra: Metrica = m === 'gols' ? 'assistencias' : 'gols'
  const ordenadas = props.linhas
    .filter(l => l[m] > 0)
    .sort((a, b) => b[m] - a[m] || b[outra] - a[outra] || nomeExibicao(a).localeCompare(nomeExibicao(b), 'pt-BR'))

  let posicao = 0
  return ordenadas.map((linha, i) => {
    if (i === 0 || linha[m] !== ordenadas[i - 1]![m]) posicao = i + 1
    return { ...linha, posicao }
  })
})
</script>

<template>
  <div class="overflow-hidden rounded-xl border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead class="w-12 text-center">
            #
          </TableHead>
          <TableHead>Jogador</TableHead>
          <TableHead class="w-16 text-center" :class="{ 'text-foreground': metrica === 'gols' }">
            Gols
          </TableHead>
          <TableHead class="w-16 text-center" :class="{ 'text-foreground': metrica === 'assistencias' }">
            Assist.
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        <template v-if="carregando && !linhas.length">
          <TableRow v-for="i in 5" :key="i">
            <TableCell colspan="4">
              <Skeleton class="h-5 w-full" />
            </TableCell>
          </TableRow>
        </template>

        <TableEmpty v-else-if="!classificacao.length" :colspan="4">
          {{ metrica === 'gols' ? 'Nenhum gol' : 'Nenhuma assistência' }} nesse período.
        </TableEmpty>

        <TableRow v-for="linha in classificacao" v-else :key="linha.jogador_id">
          <TableCell class="text-center font-medium tabular-nums">
            <Icon
              v-if="linha.posicao <= 3"
              name="lucide:medal"
              class="size-4 align-[-2px]"
              :class="MEDALHAS[linha.posicao - 1]"
              :aria-label="`${linha.posicao}º`"
            />
            <span v-else>{{ linha.posicao }}</span>
          </TableCell>
          <TableCell>
            <div class="font-medium">
              {{ nomeExibicao(linha) }}
            </div>
            <div v-if="linha.apelido" class="text-xs text-muted-foreground">
              {{ linha.nome }}
            </div>
          </TableCell>
          <TableCell class="text-center tabular-nums" :class="metrica === 'gols' ? 'text-base font-semibold' : 'text-muted-foreground'">
            {{ linha.gols }}
          </TableCell>
          <TableCell class="text-center tabular-nums" :class="metrica === 'assistencias' ? 'text-base font-semibold' : 'text-muted-foreground'">
            {{ linha.assistencias }}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
