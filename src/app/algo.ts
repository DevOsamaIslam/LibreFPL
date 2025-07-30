import { Status, type ISnapshot, type Player, type Team } from "../lib/types"
import {
  elementTypeToPosition,
  W1,
  W2,
  W3,
  POSITION_LIMITS,
  TEAM_LIMIT,
  BUDGET,
} from "./settings"

export const pickOptimalFPLTeamAdvanced = (fpl: ISnapshot): Player[] => {
  const teamMap = new Map<number, Team>()
  fpl.teams.forEach((t) => teamMap.set(t.id, t))

  const players = fpl.elements
    .filter((p) => p.status === Status.A && p.now_cost > 0 && p.minutes > 0)
    .map((p) => {
      const position = elementTypeToPosition[p.element_type]
      const ep = parseFloat(p.ep_next) || 0
      const form = parseFloat(p.form) || 0
      const team = teamMap.get(p.team)
      if (!team) return null

      const opponent = getAverageOpponent(fpl.teams, team.id)

      const teamAttack =
        (team.strength_attack_home + team.strength_attack_away) / 2
      const teamMid = team.strength
      const oppDef =
        (opponent.strength_defence_home + opponent.strength_defence_away) / 2
      const oppMid = opponent.strength

      const teamAdvantageScore = teamAttack + teamMid - (oppDef + oppMid)

      const score = W1 * ep + W2 * form + (W3 * teamAdvantageScore) / 100

      return { element: p, score, position }
    })
    .filter(Boolean)
    .sort((a, b) => b!.score - a!.score)

  const picked: Player[] = []
  const teamCount: Record<number, number> = {}
  const positionCount: Record<string, number> = {
    GK: 0,
    DEF: 0,
    MID: 0,
    FWD: 0,
  }
  let totalCost = 0

  for (const player of players) {
    if (!player) continue // skip nulls
    const { element, position } = player
    if (positionCount[position] >= POSITION_LIMITS[position]) continue
    if ((teamCount[element.team] ?? 0) >= TEAM_LIMIT) continue
    if (totalCost + element.now_cost > BUDGET) continue
    if (picked.length === 10 && totalCost + element.now_cost > 820) continue // make sure we don't exceed 82 mil for XI

    if (picked.length >= 11 && totalCost >= 820) {
      if (position === "GK" && element.now_cost > 40) continue // Limit bench GK cost
      if (position === "DEF" && element.now_cost > 40) continue // Limit bench defender cost
      if (position === "MID" && element.now_cost > 45) continue // Limit bench midfielder cost
      if (position === "FWD" && element.now_cost > 45) continue // Limit bench forward cost
    }
    picked.push(element)
    totalCost += element.now_cost
    positionCount[position] += 1
    teamCount[element.team] = (teamCount[element.team] ?? 0) + 1

    if (picked.length === 15) {
      break
    }
  }

  return picked
}

function getAverageOpponent(teams: Team[], excludeTeamId: number): Team {
  const opponents = teams.filter((t) => t.id !== excludeTeamId)
  const idx = Math.floor(Math.random() * opponents.length)
  return opponents[idx] ?? teams[0] // fallback
}
