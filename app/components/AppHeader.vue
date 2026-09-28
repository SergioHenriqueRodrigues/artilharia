<script setup lang="ts">
defineProps<{
  links: { to: string, rotulo: string, icone: string }[]
  inicio: string
}>()
</script>

<template>
  <header class="sticky top-0 z-20 border-b bg-background/85 backdrop-blur">
    <div class="mx-auto flex h-14 max-w-3xl items-center gap-2 px-4">
      <NuxtLink :to="inicio" class="mr-2 flex items-center gap-2 font-semibold">
        <Icon name="lucide:trophy" class="size-5 text-primary" />
        <span class="hidden sm:inline">Artilharia</span>
      </NuxtLink>

      <nav class="flex gap-1">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          exact-active-class="bg-muted font-medium text-foreground"
        >
          <Icon :name="link.icone" class="size-4" />
          {{ link.rotulo }}
        </NuxtLink>
      </nav>

      <div class="ml-auto flex items-center gap-1">
        <slot name="acoes" />
        <ColorModeToggle />
      </div>
    </div>
  </header>
</template>
