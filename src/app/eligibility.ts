import {
  TEAM_LIMIT,
  POSITION_LIMITS,
  elementTypeToPosition,
  BUDGET,
} from "../app/settings"
import type {
  IOptimalTeamPlayer,
  Position,
  TeamCount,
  PositionCount,
} from "../lib/types"

export const RULE_KEYS = {
  maxPerTeam: "maxPerTeam",
  maxPlayers: "maxPlayers",
  budget: "budget",
  positionLimit: "positionLimit",
} as const

export type RuleKey = (typeof RULE_KEYS)[keyof typeof RULE_KEYS]

export const SQUAD_CONSTRAINTS = {
  MAX_PER_TEAM: TEAM_LIMIT,
  MAX_PLAYERS: 15,
  BUDGET: BUDGET,
  POSITION_LIMITS: POSITION_LIMITS,
} as const

export interface EligibilityInput {
  selected: number[]
  candidate: IOptimalTeamPlayer
  allPlayers: IOptimalTeamPlayer[]
  budgetUsed: number
}

export interface EligibilityResult {
  eligible: boolean
  reasons: RuleKey[]
}

const toCounts = (selected: number[], allPlayers: IOptimalTeamPlayer[]) => {
  const teamCount: TeamCount = {}
  const positionCount: PositionCount = { GK: 0, DEF: 0, MID: 0, FWD: 0 }
  let totalCost = 0

  for (const id of selected) {
    const p = allPlayers.find((pp) => pp.element.id === id)
    if (!p) continue
    const t = p.element.team
    teamCount[t] = (teamCount[t] ?? 0) + 1
    const pos = elementTypeToPosition[p.element.element_type]
    positionCount[pos as Position] += 1
    totalCost += p.element.now_cost
  }

  return { teamCount, positionCount, totalCost }
}

export function checkEligibility(input: EligibilityInput): EligibilityResult {
  const { selected, candidate, allPlayers, budgetUsed } = input
  const reasons: RuleKey[] = []

  const { teamCount, positionCount, totalCost } = toCounts(selected, allPlayers)

  // Max players overall
  if (
    !selected.includes(candidate.element.id) &&
    selected.length >= SQUAD_CONSTRAINTS.MAX_PLAYERS
  ) {
    reasons.push(RULE_KEYS.maxPlayers)
  }

  // Max per team
  const teamId = candidate.element.team
  const teamAlready = teamCount[teamId] ?? 0
  if (
    !selected.includes(candidate.element.id) &&
    teamAlready >= SQUAD_CONSTRAINTS.MAX_PER_TEAM
  ) {
    reasons.push(RULE_KEYS.maxPerTeam)
  }

  // Position limits
  const pos = elementTypeToPosition[candidate.element.element_type]
  const posLimit = SQUAD_CONSTRAINTS.POSITION_LIMITS[pos as Position]
  const posAlready = positionCount[pos as Position]
  if (!selected.includes(candidate.element.id) && posAlready >= posLimit) {
    reasons.push(RULE_KEYS.positionLimit)
  }

  // Budget constraint (now_cost is in tenths of a million)
  const used = budgetUsed || totalCost
  const effectiveFuture = used + candidate.element.now_cost
  if (
    !selected.includes(candidate.element.id) &&
    effectiveFuture > SQUAD_CONSTRAINTS.BUDGET
  ) {
    reasons.push(RULE_KEYS.budget)
  }

  return { eligible: reasons.length === 0, reasons }
}
