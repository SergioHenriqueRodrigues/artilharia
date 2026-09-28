<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Rodadas · Admin' })

const { data: rodadas, pending, criar } = useRodadas()

const novaData = ref(proximaQuarta())
const criando = ref(false)

async function criarRodada() {
  criando.value = true
  try {
    const id = await criar(novaData.value)
    await navigateTo(`/admin/rodadas/${id}`)
  }
  catch (e) {
    toast.error(mensagemDeErro(e, 'Uma rodada nessa data'))
  }
  finally {
    criando.value = false
  }
}
</script>

<template>
  <div class="space-y-5">
    <h1 class="text-2xl font-bold tracking-tight">
      Rodadas
    </h1>

    <Card class="py-4">
      <CardContent class="px-4">
        <form class="flex flex-col gap-2 sm:flex-row sm:items-end" @submit.prevent="criarRodada">
          <div class="flex-1 space-y-1.5">
            <Label for="data">Nova rodada</Label>
            <Input id="data" v-model="novaData" type="date" required />
          </div>
          <Button type="submit" :disabled="criando || !novaData">
            <Icon name="lucide:plus" class="size-4" />
            Criar rodada
          </Button>
        </form>
      </CardContent>
    </Card>

    <div v-if="pending && !rodadas.length" class="space-y-2">
      <Skeleton v-for="i in 3" :key="i" class="h-16 rounded-xl" />
    </div>

    <EstadoVazio
      v-else-if="!rodadas.length"
      icone="lucide:calendar-plus"
      titulo="Nenhuma rodada criada"
      descricao="Crie a rodada da quarta para marcar presença, sortear os times e lançar os gols."
    />

    <ul v-else class="divide-y overflow-hidden rounded-xl border">
      <li v-for="rodada in rodadas" :key="rodada.id">
        <NuxtLink :to="`/admin/rodadas/${rodada.id}`" class="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50">
          <Icon name="lucide:calendar" class="size-4 text-muted-foreground" />
          <div class="flex-1">
            <div class="font-medium capitalize">
              {{ formatarData(rodada.data) }}
            </div>
            <div class="text-xs text-muted-foreground">
              {{ rodada.presentes }} presentes · {{ rodada.gols }} gols
            </div>
          </div>
          <Badge v-if="rodada.sorteada" variant="secondary">
            Sorteada
          </Badge>
          <Icon name="lucide:chevron-right" class="size-4 text-muted-foreground" />
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
