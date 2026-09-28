<script setup lang="ts">
defineProps<{ titulo: string, descricao: string, acao: string }>()
const emit = defineEmits<{ confirmar: [] }>()
</script>

<template>
  <AlertDialog>
    <AlertDialogTrigger as-child>
      <slot />
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ titulo }}</AlertDialogTitle>
        <AlertDialogDescription>{{ descricao }}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancelar</AlertDialogCancel>
        <AlertDialogAction variant="destructive" @click="emit('confirmar')">
          {{ acao }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
