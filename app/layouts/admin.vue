<script setup lang="ts">
const { sair } = useAdmin()

const links = [
  { to: '/admin', rotulo: 'Rodadas', icone: 'lucide:calendar' },
  { to: '/admin/jogadores', rotulo: 'Jogadores', icone: 'lucide:users' },
]
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <AppHeader :links="links" inicio="/admin">
      <template #acoes>
        <Button variant="ghost" size="icon" as-child aria-label="Ver site público">
          <NuxtLink to="/"><Icon name="lucide:globe" class="size-4" /></NuxtLink>
        </Button>
        <Button variant="ghost" size="icon" aria-label="Sair" @click="sair">
          <Icon name="lucide:log-out" class="size-4" />
        </Button>
      </template>
    </AppHeader>
    <main class="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
      <slot />
    </main>
  </div>
</template>
