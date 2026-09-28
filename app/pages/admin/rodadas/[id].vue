<script setup lang="ts">
import { toast } from 'vue-sonner'
import type { JogadorComNivel } from '~/types/dominio'
import type { TimeSorteado } from '~/utils/sorteio'

definePageMeta({ layout: 'admin' })

const id = Number(useRoute().params.id)
const {
  data: detalhe, pending, error,
  marcarPresenca, adicionarGol, removerGol, salvarSorteio, excluir,
} = useRodada(id)

useHead(() => ({
  title: detalhe.value ? `${formatarData(detalhe.value.rodada.data, 'dd/MM')} · Admin` : 'Rodada · Admin',
}))

const aba = ref('presenca')
const salvando = ref(false)

/** Roda a ação mostrando erro amigável; `sucesso` vira toast. */
async function executar(acao: () => Promise<unknown>, sucesso?: string) {
  salvando.value = true
  try {
    await acao()
    if (sucesso) toast.success(sucesso)
  }
  catch (e) {
    toast.error(mensagemDeErro(e))
  }
  finally {
    salvando.value = false
  }
}

const aoAlternarPresenca = (jogadorId: number, presente: boolean) =>
  executar(() => marcarPresenca(jogadorId, presente))

const aoSalvarSorteio = (times: TimeSorteado<JogadorComNivel>[]) =>
  executar(() => salvarSorteio(times), 'Sorteio salvo. Os times já aparecem no site.')

const aoAdicionarGol = (autorId: number, assistenteId: number | null) =>
  executar(() => adicionarGol(autorId, assistenteId), 'Gol lançado.')

const aoRemoverGol = (golId: number) => executar(() => removerGol(golId))

async function aoExcluir() {
  await executar(async () => {
    await excluir()
    await navigateTo('/admin')
  }, 'Rodada excluída.')
}
</script>

<template>
  <div class="space-y-5">
    <NuxtLink to="/admin" class="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
      <Icon name="lucide:arrow-left" class="size-4" />
      Rodadas
    </NuxtLink>

    <div v-if="pending && !detalhe" class="space-y-3">
      <Skeleton class="h-8 w-64" />
      <Skeleton class="h-64 rounded-xl" />
    </div>

    <EstadoVazio
      v-else-if="error || !detalhe"
      icone="lucide:calendar-x"
      titulo="Rodada não encontrada"
      descricao="Ela pode ter sido excluída."
    />

    <template v-else>
      <div class="flex items-start justify-between gap-2">
        <div>
          <h1 class="text-2xl font-bold tracking-tight capitalize">
            {{ formatarData(detalhe.rodada.data, "EEEE, d 'de' MMMM") }}
          </h1>
          <p class="text-sm text-muted-foreground">
            {{ detalhe.presentes.size }} presentes · {{ detalhe.gols.length }} gols
          </p>
        </div>
        <BotaoConfirmar
          titulo="Excluir rodada?"
          descricao="A presença, o sorteio e os gols desta rodada serão apagados. Não dá pra desfazer."
          acao="Excluir"
          @confirmar="aoExcluir"
        >
          <Button variant="ghost" size="icon" aria-label="Excluir rodada">
            <Icon name="lucide:trash-2" class="size-4" />
          </Button>
        </BotaoConfirmar>
      </div>

      <Tabs v-model="aba">
        <TabsList class="w-full sm:w-auto">
          <TabsTrigger value="presenca">
            <Icon name="lucide:user-check" class="size-4" />
            Presença
          </TabsTrigger>
          <TabsTrigger value="sorteio">
            <Icon name="lucide:shuffle" class="size-4" />
            Sorteio
          </TabsTrigger>
          <TabsTrigger value="gols">
            <Icon name="lucide:goal" class="size-4" />
            Gols
          </TabsTrigger>
        </TabsList>

        <TabsContent value="presenca" class="pt-3">
          <AdminRodadaPresencaLista :detalhe="detalhe" @alternar="aoAlternarPresenca" />
        </TabsContent>
        <TabsContent value="sorteio" class="pt-3">
          <AdminRodadaSorteioPainel :detalhe="detalhe" :salvando="salvando" @salvar="aoSalvarSorteio" />
        </TabsContent>
        <TabsContent value="gols" class="pt-3">
          <AdminRodadaGolsPainel :detalhe="detalhe" :salvando="salvando" @adicionar="aoAdicionarGol" @remover="aoRemoverGol" />
        </TabsContent>
      </Tabs>
    </template>
  </div>
</template>
