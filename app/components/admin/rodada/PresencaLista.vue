<script setup lang="ts">
import type { DetalheRodada } from '~/composables/useRodada'

const props = defineProps<{ detalhe: DetalheRodada }>()
const emit = defineEmits<{ alternar: [jogadorId: number, presente: boolean] }>()

const busca = ref('')

// Ativos, mais inativos que já estão marcados (pra dar pra desmarcar).
const lista = computed(() => {
  const termo = busca.value.trim().toLocaleLowerCase('pt-BR')
  return props.detalhe.jogadores
    .filter(j => j.ativo || props.detalhe.presentes.has(j.id))
    .filter(j => !termo || `${j.nome} ${j.apelido ?? ''}`.toLocaleLowerCase('pt-BR').includes(termo))
})

// Quem tem gol ou assistência não pode sair da lista (o banco também bloqueia).
const comGol = computed(() => new Set(
  props.detalhe.gols.flatMap(g => (g.assistente_id ? [g.autor_id, g.assistente_id] : [g.autor_id])),
))
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center gap-2">
      <Input v-model="busca" type="search" placeholder="Buscar jogador" aria-label="Buscar jogador" class="flex-1" />
      <Badge variant="secondary" class="h-8 px-3">
        {{ detalhe.presentes.size }} presentes
      </Badge>
    </div>

    <EstadoVazio
      v-if="!detalhe.jogadores.length"
      icone="lucide:users"
      titulo="Nenhum jogador cadastrado"
    >
      <Button variant="outline" size="sm" as-child>
        <NuxtLink to="/admin/jogadores">Cadastrar jogadores</NuxtLink>
      </Button>
    </EstadoVazio>

    <ul v-else class="divide-y overflow-hidden rounded-xl border">
      <li v-for="jogador in lista" :key="jogador.id">
        <Label
          class="flex cursor-pointer items-center gap-3 px-4 py-3 font-normal hover:bg-muted/50"
          :class="{ 'cursor-not-allowed opacity-70': comGol.has(jogador.id) }"
        >
          <Checkbox
            :model-value="detalhe.presentes.has(jogador.id)"
            :disabled="comGol.has(jogador.id)"
            @update:model-value="valor => emit('alternar', jogador.id, valor === true)"
          />
          <span class="flex-1">{{ nomeExibicao(jogador) }}</span>
          <span v-if="comGol.has(jogador.id)" class="text-xs text-muted-foreground">tem gol lançado</span>
          <span v-else-if="detalhe.sorteio.has(jogador.id)" class="text-xs text-muted-foreground">
            time {{ detalhe.sorteio.get(jogador.id) }}
          </span>
        </Label>
      </li>
    </ul>
  </div>
</template>
