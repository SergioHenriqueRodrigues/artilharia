import { addDays, endOfMonth, format, getDay, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const QUARTA = 3

/** Datas de rodada chegam do banco como 'yyyy-MM-dd'. */
export function formatarData(data: string, padrao = "EEE, d 'de' MMM 'de' yyyy"): string {
  return format(parseISO(data), padrao, { locale: ptBR })
}

export function formatarMes(anoMes: string): string {
  const texto = format(parseISO(`${anoMes}-01`), "MMMM 'de' yyyy", { locale: ptBR })
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

/** Hoje, se for quarta; senão, a próxima quarta. Em 'yyyy-MM-dd'. */
export function proximaQuarta(hoje = new Date()): string {
  const dias = (QUARTA - getDay(hoje) + 7) % 7
  return format(addDays(hoje, dias), 'yyyy-MM-dd')
}

export type Periodo =
  | { tipo: 'geral' }
  | { tipo: 'ano', valor: string } // 'yyyy'
  | { tipo: 'mes', valor: string } // 'yyyy-MM'
  | { tipo: 'rodada', valor: string } // 'yyyy-MM-dd'

export interface Intervalo {
  inicio: string | null
  fim: string | null
}

/** Converte o período escolhido no filtro no intervalo de datas do ranking. */
export function intervaloDoPeriodo(periodo: Periodo): Intervalo {
  switch (periodo.tipo) {
    case 'geral':
      return { inicio: null, fim: null }
    case 'ano':
      return { inicio: `${periodo.valor}-01-01`, fim: `${periodo.valor}-12-31` }
    case 'mes': {
      const inicio = `${periodo.valor}-01`
      return { inicio, fim: format(endOfMonth(parseISO(inicio)), 'yyyy-MM-dd') }
    }
    case 'rodada':
      return { inicio: periodo.valor, fim: periodo.valor }
  }
}
