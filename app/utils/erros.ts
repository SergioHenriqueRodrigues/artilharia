interface ErroSupabase {
  code?: string
  message?: string
}

/** Traduz erros do Postgres/PostgREST em mensagens pra mostrar ao admin. */
export function mensagemDeErro(erro: unknown, contexto?: string): string {
  const { code, message } = (erro ?? {}) as ErroSupabase

  switch (code) {
    case '23505':
      return contexto ? `${contexto} já existe.` : 'Esse registro já existe.'
    case '23503':
      return 'Não dá pra remover: existem registros ligados a este (gols, presença ou sorteio).'
    case '23514':
      return 'Valor inválido.'
    case '42501':
      return 'Sem permissão. Entre com a conta de admin.'
    case 'invalid_credentials':
      return 'E-mail ou senha incorretos.'
  }
  return message || 'Algo deu errado. Tente de novo.'
}
