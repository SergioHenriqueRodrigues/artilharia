<script setup lang="ts">
import { toast } from 'vue-sonner'
import type { DadosJogador } from '~/composables/useJogadores'
import type { JogadorComNivel } from '~/types/dominio'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Jogadores · Admin' })

const { data: jogadores, pending, salvar, definirAtivo } = useJogadores()

const busca = ref('')
const filtrados = computed(() => {
  const termo = busca.value.trim().toLocaleLowerCase('pt-BR')
  if (!termo) return jogadores.value
  return jogadores.value.filter(j => `${j.nome} ${j.apelido ?? ''}`.toLocaleLowerCase('pt-BR').includes(termo))
})

const dialogAberto = ref(false)
const editando = ref<JogadorComNivel | null>(null)

function abrir(jogador: JogadorComNivel | null) {
  editando.value = jogador
  dialogAberto.value = true
}

async function aoSalvar(dados: DadosJogador) {
  try {
    await salvar(dados, editando.value?.id)
    dialogAberto.value = false
    toast.success(editando.value ? 'Jogador atualizado.' : 'Jogador cadastrado.')
  }
  catch (e) {
    toast.error(mensagemDeErro(e))
  }
}

async function alternarAtivo(jogador: JogadorComNivel, ativo: boolean) {
  try {
    await definirAtivo(jogador.id, ativo)
  }
  catch (e) {
    toast.error(mensagemDeErro(e))
  }
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between gap-2">
      <h1 class="text-2xl font-bold tracking-tight">
        Jogadores
      </h1>
      <Button @click="abrir(null)">
        <Icon name="lucide:user-plus" class="size-4" />
        Novo
      </Button>
    </div>

    <Input v-if="jogadores.length" v-model="busca" type="search" placeholder="Buscar por nome ou apelido" aria-label="Buscar jogador" />

    <div v-if="pending && !jogadores.length" class="space-y-2">
      <Skeleton v-for="i in 4" :key="i" class="h-12 rounded-lg" />
    </div>

    <EstadoVazio
      v-else-if="!jogadores.length"
      icone="lucide:users"
      titulo="Nenhum jogador cadastrado"
      descricao="Cadastre a galera da pelada para marcar presença e lançar gols."
    />

    <div v-else class="overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Jogador</TableHead>
            <TableHead class="w-16 text-center">
              Nível
            </TableHead>
            <TableHead class="w-16 text-center">
              Ativo
            </TableHead>
            <TableHead class="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableEmpty v-if="!filtrados.length" :colspan="4">
            Ninguém encontrado.
          </TableEmpty>
          <TableRow v-for="jogador in filtrados" :key="jogador.id" :class="{ 'opacity-60': !jogador.ativo }">
            <TableCell>
              <div class="font-medium">
                {{ nomeExibicao(jogador) }}
              </div>
              <div v-if="jogador.apelido" class="text-xs text-muted-foreground">
                {{ jogador.nome }}
              </div>
            </TableCell>
            <TableCell class="text-center tabular-nums">
              {{ jogador.nivel ?? '–' }}
            </TableCell>
            <TableCell class="text-center">
              <Switch
                :model-value="jogador.ativo"
                :aria-label="`${nomeExibicao(jogador)} ativo`"
                @update:model-value="valor => alternarAtivo(jogador, valor)"
              />
            </TableCell>
            <TableCell>
              <Button variant="ghost" size="icon-sm" :aria-label="`Editar ${nomeExibicao(jogador)}`" @click="abrir(jogador)">
                <Icon name="lucide:pencil" class="size-4" />
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <AdminJogadorDialog v-model:open="dialogAberto" :jogador="editando" @salvar="aoSalvar" />
  </div>
</template>
