import { describe, expect, it } from 'vitest'
import { formatarMes, intervaloDoPeriodo, proximaQuarta } from '~/utils/datas'

describe('proximaQuarta', () => {
  it('retorna o próprio dia quando já é quarta', () => {
    expect(proximaQuarta(new Date(2026, 8, 23))).toBe('2026-09-23')
  })

  it('avança até a próxima quarta', () => {
    expect(proximaQuarta(new Date(2026, 8, 24))).toBe('2026-09-30') // quinta
    expect(proximaQuarta(new Date(2026, 8, 27))).toBe('2026-09-30') // domingo
  })

  it('atravessa mês e ano', () => {
    expect(proximaQuarta(new Date(2026, 11, 31))).toBe('2027-01-06')
  })
})

describe('intervaloDoPeriodo', () => {
  it('geral não tem limites', () => {
    expect(intervaloDoPeriodo({ tipo: 'geral' })).toEqual({ inicio: null, fim: null })
  })

  it('ano vai de 1º de janeiro a 31 de dezembro', () => {
    expect(intervaloDoPeriodo({ tipo: 'ano', valor: '2026' })).toEqual({ inicio: '2026-01-01', fim: '2026-12-31' })
  })

  it('mês termina no último dia certo', () => {
    expect(intervaloDoPeriodo({ tipo: 'mes', valor: '2026-02' })).toEqual({ inicio: '2026-02-01', fim: '2026-02-28' })
    expect(intervaloDoPeriodo({ tipo: 'mes', valor: '2028-02' }).fim).toBe('2028-02-29')
    expect(intervaloDoPeriodo({ tipo: 'mes', valor: '2026-09' }).fim).toBe('2026-09-30')
  })

  it('rodada é um único dia', () => {
    expect(intervaloDoPeriodo({ tipo: 'rodada', valor: '2026-09-23' })).toEqual({ inicio: '2026-09-23', fim: '2026-09-23' })
  })
})

describe('formatarMes', () => {
  it('escreve o mês em português com inicial maiúscula', () => {
    expect(formatarMes('2026-09')).toBe('Setembro de 2026')
  })
})
