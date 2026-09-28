<script setup lang="ts">
import { useForm } from 'vee-validate'
import { z } from 'zod'
import type { DadosJogador } from '~/composables/useJogadores'
import type { JogadorComNivel } from '~/types/dominio'

const props = defineProps<{ jogador: JogadorComNivel | null }>()
const aberto = defineModel<boolean>('open', { required: true })
const emit = defineEmits<{ salvar: [dados: DadosJogador] }>()

const NIVEIS = [
  { valor: '1', rotulo: '1 · iniciante' },
  { valor: '2', rotulo: '2' },
  { valor: '3', rotulo: '3 · médio' },
  { valor: '4', rotulo: '4' },
  { valor: '5', rotulo: '5 · craque' },
]

const { handleSubmit, errors, defineField, resetForm, isSubmitting } = useForm({
  validationSchema: schemaZod(z.object({
    nome: z.string().trim().min(1, 'Informe o nome.'),
    apelido: z.string().trim(),
    nivel: z.enum(['sem', '1', '2', '3', '4', '5']),
    ativo: z.boolean(),
  })),
})
const [nome, nomeAttrs] = defineField('nome')
const [apelido, apelidoAttrs] = defineField('apelido')
const [nivel] = defineField('nivel')
const [ativo] = defineField('ativo')

watch(aberto, (abriu) => {
  if (!abriu) return
  resetForm({
    values: {
      nome: props.jogador?.nome ?? '',
      apelido: props.jogador?.apelido ?? '',
      nivel: props.jogador?.nivel ? String(props.jogador.nivel) as '1' : 'sem',
      ativo: props.jogador?.ativo ?? true,
    },
  })
})

const enviar = handleSubmit((valores) => {
  emit('salvar', {
    nome: valores.nome,
    apelido: valores.apelido || null,
    nivel: valores.nivel === 'sem' ? null : Number(valores.nivel),
    ativo: valores.ativo,
  })
})
</script>

<template>
  <Dialog v-model:open="aberto">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ jogador ? 'Editar jogador' : 'Novo jogador' }}</DialogTitle>
        <DialogDescription>O nível só aparece pra você e é usado para equilibrar o sorteio.</DialogDescription>
      </DialogHeader>

      <form id="form-jogador" class="space-y-4" novalidate @submit="enviar">
        <div class="space-y-1.5">
          <Label for="nome">Nome</Label>
          <Input id="nome" v-model="nome" v-bind="nomeAttrs" autocomplete="off" :aria-invalid="!!errors.nome" />
          <p v-if="errors.nome" class="text-xs text-destructive">
            {{ errors.nome }}
          </p>
        </div>

        <div class="space-y-1.5">
          <Label for="apelido">Apelido <span class="font-normal text-muted-foreground">(opcional)</span></Label>
          <Input id="apelido" v-model="apelido" v-bind="apelidoAttrs" autocomplete="off" />
        </div>

        <div class="space-y-1.5">
          <Label for="nivel">Nível</Label>
          <Select v-model="nivel">
            <SelectTrigger id="nivel" class="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sem">
                Sem nível (conta como 3)
              </SelectItem>
              <SelectItem v-for="n in NIVEIS" :key="n.valor" :value="n.valor">
                {{ n.rotulo }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="flex items-center justify-between rounded-lg border px-3 py-2">
          <Label for="ativo" class="flex-col items-start gap-0.5">
            Ativo
            <span class="text-xs font-normal text-muted-foreground">Inativos não aparecem na lista de presença.</span>
          </Label>
          <Switch id="ativo" v-model="ativo" />
        </div>
      </form>

      <DialogFooter>
        <Button variant="outline" @click="aberto = false">
          Cancelar
        </Button>
        <Button type="submit" form="form-jogador" :disabled="isSubmitting">
          Salvar
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
