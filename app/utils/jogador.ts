/** Nome pra exibir: o apelido quando existe. */
export function nomeExibicao(jogador: { nome: string, apelido: string | null }): string {
  return jogador.apelido?.trim() || jogador.nome
}
