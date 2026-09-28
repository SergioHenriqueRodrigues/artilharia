import type { Database } from './database.types'

type Tabelas = Database['public']['Tables']

export type Jogador = Tabelas['jogadores']['Row']
export type Rodada = Tabelas['rodadas']['Row']
export type Gol = Tabelas['gols']['Row']

export type LinhaRanking = Database['public']['Functions']['ranking']['Returns'][number]

/** Jogador com o nível (só o admin enxerga). */
export type JogadorComNivel = Jogador & { nivel: number | null }
