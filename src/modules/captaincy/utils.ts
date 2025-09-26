import { type Position, type Team, type IFixture } from "../../lib/types"
import { type CaptaincyPlayer, type CaptaincyStats } from "./types"

/**
 * Find next fixture for a team
 */
export function findNextFixture(teamId: number, fixtures: IFixture[]): IFixture | null {
  const now = new Date()
  const upcomingFixtures = fixtures
    .filter(fixture => !fixture.finished && new Date(fixture.kickoff_time) > now)
    .sort((a, b) => new Date(a.kickoff_time).getTime() - new Date(b.kickoff_time).getTime())

  const teamFixture = upcomingFixtures.find(
    fixture => fixture.team_h === teamId || fixture.team_a === teamId
  )

  return teamFixture || null
}

/**
 * Determine if team is playing at home
 */
export function isHomeTeam(teamId: number, fixture: IFixture): boolean {
  return fixture.team_h === teamId
}

/**
 * Get opponent team from fixture
 */
export function getOpponentTeam(teamId: number, fixture: IFixture, teams: Team[]): Team | null {
  const opponentId = fixture.team_h === teamId ? fixture.team_a : fixture.team_h
  return teams.find(team => team.id === opponentId) || null
}

/**
 * Calculate captaincy statistics
 */
export function calculateCaptaincyStats(players: CaptaincyPlayer[]): CaptaincyStats {
  if (players.length === 0) {
    return {
      averagePrice: 0,
      averagePoints: 0,
      bestValue: null,
      highestPoints: null,
      easiestFixtures: [],
      toughestFixtures: [],
    }
  }

  const prices = players.map(p => p.element.now_cost / 10)
  const points = players.map(p => p.xPoints)

  const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length
  const averagePoints = points.reduce((sum, point) => sum + point, 0) / points.length

  const bestValue = players.reduce((best, current) => {
    const valueRatio = current.xPoints / (current.element.now_cost / 10)
    const bestValueRatio = best.xPoints / (best.element.now_cost / 10)
    return valueRatio > bestValueRatio ? current : best
  }, players[0])

  const highestPoints = players.reduce((highest, current) =>
    current.xPoints > highest.xPoints ? current : highest
  , players[0])

  const sortedByDifficulty = [...players].sort((a, b) => a.fixtureDifficulty - b.fixtureDifficulty)
  const easiestFixtures = sortedByDifficulty.slice(0, 5)
  const toughestFixtures = sortedByDifficulty.slice(-5).reverse()

  return {
    averagePrice: Math.round(averagePrice * 10) / 10,
    averagePoints: Math.round(averagePoints * 10) / 10,
    bestValue,
    highestPoints,
    easiestFixtures,
    toughestFixtures,
  }
}

/**
 * Sort players based on criteria
 */
export function sortPlayers(
  players: CaptaincyPlayer[],
  sortBy: "xPoints" | "price" | "fixtureDifficulty" | "teamAttackStrength",
  sortOrder: "asc" | "desc"
): CaptaincyPlayer[] {
  const sorted = [...players].sort((a, b) => {
    let valueA: number, valueB: number

    switch (sortBy) {
      case "xPoints":
        valueA = a.xPoints
        valueB = b.xPoints
        break
      case "price":
        valueA = a.element.now_cost / 10
        valueB = b.element.now_cost / 10
        break
      case "fixtureDifficulty":
        valueA = a.fixtureDifficulty
        valueB = b.fixtureDifficulty
        break
      case "teamAttackStrength":
        valueA = a.teamAttackStrength
        valueB = b.teamAttackStrength
        break
      default:
        valueA = a.xPoints
        valueB = b.xPoints
    }

    if (sortOrder === "asc") {
      return valueA - valueB
    } else {
      return valueB - valueA
    }
  })

  return sorted
}

/**
 * Filter players based on criteria
 */
export function filterPlayers(
  players: CaptaincyPlayer[],
  filters: {
    position?: Position
    team?: number
    minPrice?: number
    maxPrice?: number
    minxPoints?: number
  }
): CaptaincyPlayer[] {
  return players.filter(player => {
    if (filters.position && player.position !== filters.position) {
      return false
    }

    if (filters.team && player.team.id !== filters.team) {
      return false
    }

    const playerPrice = player.element.now_cost / 10
    if (filters.minPrice && playerPrice < filters.minPrice) {
      return false
    }

    if (filters.maxPrice && playerPrice > filters.maxPrice) {
      return false
    }

    if (filters.minxPoints && player.xPoints < filters.minxPoints) {
      return false
    }

    return true
  })
}