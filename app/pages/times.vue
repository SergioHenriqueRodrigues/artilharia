<script setup lang="ts">
useHead({ title: 'Times · Artilharia' })

const { data: sorteio, pending, error } = useTimesDaSemana()
</script>

<template>
  <div class="space-y-5">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">
        Times da semana
      </h1>
      <p v-if="sorteio" class="text-sm text-muted-foreground">
        Rodada de {{ formatarData(sorteio.data, "EEEE, d 'de' MMMM") }}
      </p>
    </div>

    <div v-if="pending && !sorteio" class="grid gap-4 sm:grid-cols-2">
      <Skeleton v-for="i in 2" :key="i" class="h-56 rounded-xl" />
    </div>

    <p v-else-if="error" class="text-sm text-destructive">
      Não foi possível carregar os times. Tente recarregar a página.
    </p>

    <EstadoVazio
      v-else-if="!sorteio"
      icone="lucide:shuffle"
      titulo="Nenhum sorteio ainda"
      descricao="Os times aparecem aqui assim que forem sorteados."
    />

    <div v-else class="grid gap-4 sm:grid-cols-2">
      <TimeCard v-for="t in sorteio.times" :key="t.time" :time="t.time" :jogadores="t.jogadores" />
    </div>
  </div>
</template>
