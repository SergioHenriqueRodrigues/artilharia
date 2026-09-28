<script setup lang="ts">
import { useForm } from 'vee-validate'
import { z } from 'zod'

useHead({ title: 'Entrar · Artilharia' })

const { user, isAdmin, verificar, entrar, sair } = useAdmin()
const redirecionamento = useSupabaseCookieRedirect()

const { handleSubmit, errors, defineField, isSubmitting } = useForm({
  validationSchema: schemaZod(z.object({
    email: z.email('Informe um e-mail válido.'),
    senha: z.string().min(1, 'Informe a senha.'),
  })),
})
const [email, emailAttrs] = defineField('email')
const [senha, senhaAttrs] = defineField('senha')

const erro = ref('')

const enviar = handleSubmit(async (valores) => {
  erro.value = ''
  try {
    if (await entrar(valores.email, valores.senha)) {
      await navigateTo(redirecionamento.pluck() || '/admin')
    }
  }
  catch (e) {
    erro.value = mensagemDeErro(e)
  }
})

// Já logado como admin: não precisa ver o formulário.
onMounted(async () => {
  if (user.value && (isAdmin.value ?? await verificar())) await navigateTo('/admin')
})
</script>

<template>
  <div class="mx-auto max-w-sm pt-8">
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Icon name="lucide:lock" class="size-4 text-primary" />
          Área do admin
        </CardTitle>
        <CardDescription>Só quem organiza a pelada lança gols e sorteia os times.</CardDescription>
      </CardHeader>

      <CardContent>
        <!-- Logado com uma conta que não está na tabela admins. -->
        <div v-if="user && isAdmin === false" class="space-y-3 text-sm">
          <p>Essa conta não tem permissão de admin.</p>
          <Button variant="outline" class="w-full" @click="sair">
            Sair
          </Button>
        </div>

        <form v-else class="space-y-4" novalidate @submit="enviar">
          <div class="space-y-1.5">
            <Label for="email">E-mail</Label>
            <Input id="email" v-model="email" v-bind="emailAttrs" type="email" autocomplete="email" :aria-invalid="!!errors.email" />
            <p v-if="errors.email" class="text-xs text-destructive">
              {{ errors.email }}
            </p>
          </div>

          <div class="space-y-1.5">
            <Label for="senha">Senha</Label>
            <Input id="senha" v-model="senha" v-bind="senhaAttrs" type="password" autocomplete="current-password" :aria-invalid="!!errors.senha" />
            <p v-if="errors.senha" class="text-xs text-destructive">
              {{ errors.senha }}
            </p>
          </div>

          <p v-if="erro" class="text-sm text-destructive" role="alert">
            {{ erro }}
          </p>

          <Button type="submit" size="lg" class="w-full" :disabled="isSubmitting">
            <Icon v-if="isSubmitting" name="lucide:loader-circle" class="size-4 animate-spin" />
            Entrar
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
