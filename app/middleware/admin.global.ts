// O módulo do Supabase já manda quem não está logado para /admin/login.
// Aqui garantimos que a conta logada é mesmo a do admin.
export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/admin') || to.path === '/admin/login') return

  const { user, isAdmin, verificar } = useAdmin()
  if (!user.value) return navigateTo('/admin/login')
  if (isAdmin.value === null) await verificar()
  if (!isAdmin.value) return navigateTo('/admin/login')
})
