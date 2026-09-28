import { describe, expect, it } from 'vitest'
import { NIVEL_PADRAO, sortearTimes } from '~/utils/sorteio'

function jogadores(niveis: (number | null)[]) {
  return niveis.map((nivel, i) => ({ id: i + 1, nivel }))
}

describe('sortearTimes', () => {
  it('coloca todo mundo em exatamente um time', () => {
    const lista = jogadores([5, 4, 3, 3, 2, 1, 4, 2, 3, 5])
    const times = sortearTimes(lista, 2)
    const ids = times.flatMap(t => t.jogadores.map(j => j.id)).sort((a, b) => a - b)
    expect(ids).toEqual(lista.map(j => j.id))
  })

  it('numera os times a partir de 1', () => {
    expect(sortearTimes(jogadores([3, 3, 3, 3, 3, 3]), 3).map(t => t.time)).toEqual([1, 2, 3])
  })

  it('deixa os times com tamanhos que diferem no máximo em 1', () => {
    for (let n = 4; n <= 23; n++) {
      for (const quantidade of [2, 3, 4]) {
        const tamanhos = sortearTimes(jogadores(Array(n).fill(3)), quantidade).map(t => t.jogadores.length)
        expect(Math.max(...tamanhos) - Math.min(...tamanhos)).toBeLessThanOrEqual(1)
      }
    }
  })

  it('equilibra a força entre os times', () => {
    const lista = jogadores([5, 5, 5, 5, 1, 1, 1, 1, 3, 3])
    for (let i = 0; i < 50; i++) {
      const forcas = sortearTimes(lista, 2).map(t => t.forca)
      expect(Math.abs(forcas[0]! - forcas[1]!)).toBeLessThanOrEqual(2)
    }
  })

  it('põe os dois craques em times diferentes', () => {
    const lista = jogadores([5, 5, 2, 2, 2, 2])
    for (let i = 0; i < 50; i++) {
      const times = sortearTimes(lista, 2)
      expect(times.every(t => t.jogadores.some(j => j.nivel === 5))).toBe(true)
    }
  })

  it('usa o nível padrão para quem não tem nível', () => {
    const [time] = sortearTimes(jogadores([null, null]), 2)
    expect(time!.forca).toBe(NIVEL_PADRAO)
  })

  it('varia o resultado entre sorteios', () => {
    const lista = jogadores(Array(12).fill(3))
    const resultados = new Set(
      Array.from({ length: 20 }, () => sortearTimes(lista, 2)[0]!.jogadores.map(j => j.id).sort().join(',')),
    )
    expect(resultados.size).toBeGreaterThan(1)
  })

  it('recusa menos de 2 times', () => {
    expect(() => sortearTimes(jogadores([3, 3]), 1)).toThrow()
  })
})
