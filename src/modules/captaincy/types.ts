import { type Position, type Team, type Player } from "../../lib/types"

export interface CaptaincyPlayer {
  element: Player
  position: Position
  team: Team
  opponent: Team
  isHome: boolean
  xPoints: number
  teamAttackStrength: number
  teamDefenceStrength: number
  opponentAttackStrength: number
  opponentDefenceStrength: number
  fixtureDifficulty: number
}

export interface CaptaincyData {
  players: CaptaincyPlayer[]
  playersByPosition: {
    GK: CaptaincyPlayer[]
    DEF: CaptaincyPlayer[]
    MID: CaptaincyPlayer[]
    FWD: CaptaincyPlayer[]
  }
  totalPlayers: number
  bestCaptaincyOptions: CaptaincyPlayer[]
}

export interface CaptaincyFilters {
  search?: string
  position?: Position
  team?: number
  minPrice?: number
  maxPrice?: number
  minxPoints?: number
  sortBy?: "xPoints" | "price" | "fixtureDifficulty" | "teamAttackStrength"
  sortOrder?: "asc" | "desc"
}

export interface CaptaincyStats {
  averagePrice: number
  averagePoints: number
  bestValue: CaptaincyPlayer | null
  highestPoints: CaptaincyPlayer | null
  easiestFixtures: CaptaincyPlayer[]
  toughestFixtures: CaptaincyPlayer[]
}
