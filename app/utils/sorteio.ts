/** Nível usado para quem ainda não tem nível cadastrado. */
export const NIVEL_PADRAO = 3

export interface Sorteavel {
  id: number
  nivel: number | null
}

export interface TimeSorteado<T extends Sorteavel> {
  time: number
  jogadores: T[]
  forca: number
}

/**
 * Divide os jogadores em `quantidade` times equilibrados.
 *
 * Embaralha, ordena do mais forte pro mais fraco (empates ficam na ordem
 * aleatória) e coloca cada jogador no time com menos gente; entre os
 * empatados em tamanho, no de menor força somada. Assim os times ficam com
 * o mesmo número de jogadores (diferença máxima de 1) e força parecida,
 * mas cada sorteio sai diferente.
 */
export function sortearTimes<T extends Sorteavel>(
  jogadores: T[],
  quantidade: number,
  aleatorio: () => number = Math.random,
): TimeSorteado<T>[] {
  if (!Number.isInteger(quantidade) || quantidade < 2) {
    throw new Error('O sorteio precisa de pelo menos 2 times.')
  }

  const times: TimeSorteado<T>[] = Array.from({ length: quantidade }, (_, i) => ({
    time: i + 1,
    jogadores: [],
    forca: 0,
  }))

  const ordem = embaralhar(jogadores, aleatorio)
    .sort((a, b) => nivel(b) - nivel(a))

  for (const jogador of ordem) {
    const destino = times.reduce((melhor, time) => {
      if (time.jogadores.length !== melhor.jogadores.length) {
        return time.jogadores.length < melhor.jogadores.length ? time : melhor
      }
      return time.forca < melhor.forca ? time : melhor
    })
    destino.jogadores.push(jogador)
    destino.forca += nivel(jogador)
  }

  return times
}

function nivel(jogador: Sorteavel): number {
  return jogador.nivel ?? NIVEL_PADRAO
}

function embaralhar<T>(lista: T[], aleatorio: () => number): T[] {
  const copia = [...lista]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j]!, copia[i]!]
  }
  return copia
}
