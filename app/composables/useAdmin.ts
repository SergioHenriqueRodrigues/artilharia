/**
 * Sessão do admin. Estar logado não basta: a conta precisa estar na tabela
 * `admins` (é o que o RLS checa), então conferimos com a função `is_admin`.
 */
export function useAdmin() {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  // null = ainda não verificado nesta sessão.
  const isAdmin = useState<boolean | null>('is-admin', () => null)

  async function verificar(): Promise<boolean> {
    if (!user.value) {
      isAdmin.value = false
      return false
    }
    const { data, error } = await supabase.rpc('is_admin')
    isAdmin.value = !error && data === true
    return isAdmin.value
  }

  async function entrar(email: string, senha: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) throw error
    isAdmin.value = null
    return verificar()
  }

  async function sair() {
    await supabase.auth.signOut()
    isAdmin.value = null
    await navigateTo('/')
  }

  return { user, isAdmin, verificar, entrar, sair }
}
