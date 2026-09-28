<script setup lang="ts">
defineProps<{ icone: string, titulo: string, descricao?: string }>()
</script>

<template>
  <div class="flex flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-12 text-center">
    <Icon :name="icone" class="size-8 text-muted-foreground" />
    <p class="font-medium">
      {{ titulo }}
    </p>
    <p v-if="descricao" class="max-w-sm text-sm text-muted-foreground">
      {{ descricao }}
    </p>
    <slot />
  </div>
</template>
