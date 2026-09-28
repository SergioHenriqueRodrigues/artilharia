<script setup lang="ts">
const links = [
  { to: '/', rotulo: 'Ranking', icone: 'lucide:medal' },
  { to: '/times', rotulo: 'Times', icone: 'lucide:shirt' },
]
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <AppHeader :links="links" inicio="/" />
    <main class="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
      <slot />
    </main>
    <footer class="mx-auto w-full max-w-3xl px-4 py-6 text-center text-xs text-muted-foreground">
      Pelada de quarta-feira ·
      <NuxtLink to="/admin" class="underline-offset-4 hover:underline">admin</NuxtLink>
    </footer>
  </div>
</template>
