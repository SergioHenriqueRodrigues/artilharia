<script setup lang="ts">
const colorMode = useColorMode()
const escuro = computed(() => colorMode.value === 'dark')
</script>

<template>
  <Button
    variant="ghost"
    size="icon"
    :aria-label="escuro ? 'Usar tema claro' : 'Usar tema escuro'"
    @click="colorMode.preference = escuro ? 'light' : 'dark'"
  >
    <Icon :name="escuro ? 'lucide:sun' : 'lucide:moon'" class="size-4" />
  </Button>
</template>
