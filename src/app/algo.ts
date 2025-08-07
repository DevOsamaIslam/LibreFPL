import {
  Status,
  type IOptimalTeamPlayer,
  type ISnapshot,
  type Player,
  type PositionCount,
  type Team,
  type TeamCount,
} from "../lib/types"
import {
  BENCH_DEF_COST_LIMIT,
  BENCH_FWD_COST_LIMIT,
  BENCH_GK_COST_LIMIT,
  BENCH_MID_COST_LIMIT,
  BUDGET,
  BUDGET_FOR_XI,
  elementTypeToPosition,
  POSITION_LIMITS,
  positionToElementType,
  TEAM_LIMIT,
  W1,
  W2,
  W3,
  NUMBER_OF_MATCHES,
} from "./settings"

/**
 * pickOptimalFPLTeamAdvanced
 *
 * This function takes an ISnapshot of FPL data and returns an array of Players representing the optimal FPL team.
 * It filters players based on status, cost, and minutes played, calculates a score for each player based on their EP, form, and team advantage,
 * and then picks the best players to form a team within the given constraints (budget, team limits, position limits).
 *
 */
export const pickOptimalFPLTeamAdvanced = (fpl: ISnapshot) => {
  const { players } = filterAndScorePlayers(fpl)

  return players as IOptimalTeamPlayer[]
}

/**
 * filterAndScorePlayers
 *
 * This function filters players based on their status, cost, and minutes played, and calculates a score for each player based on their expected points (EP), form, and team advantage.
 */
const filterAndScorePlayers = (fpl: ISnapshot) => {
  // Create a map of team IDs to Team objects for easy lookup
  const teamMap = new Map<number, Team>()
  fpl.teams.forEach((t) => teamMap.set(t.id, t))

  // Filter and map players to calculate their score
  const players = fpl.elements
    .filter((player) => player.status === Status.A && player.now_cost > 0) // Filter out players who are unavailable, have no cost, or haven't played
    .map((player: Player) => {
      const lastSeasonPPG = +player.total_points / 34 // Score (last season) higher is better
      const startsRatio = !player.starts
        ? 0
        : (player.starts / (player.minutes / 48)) * 100 // ratio of starts to 48 should be above 70%
      const minutesPerMatch = !player.minutes
        ? 0
        : player.minutes / NUMBER_OF_MATCHES // number of minutes per march should be above 60
      const expectedGoalInvolvement = player.expected_goal_involvements // has better expected goal involvement
      const isAvailable = player.status === Status.A // has status of 'a'
      const cleanSheets = player.clean_sheets // For GK and Def the clean sheets should be high
      const goalsConceded = player.goals_conceded // and the goals conceded should be low
      let score = 0

      score += lastSeasonPPG

      if (player.element_type !== positionToElementType.GK)
        score -= player.now_cost

      score += startsRatio * 10
      score += minutesPerMatch * 10
      score += parseFloat(expectedGoalInvolvement) * 10 || 0

      score += 50 * (isAvailable ? 1 : -1)

      const ep = parseFloat(player.ep_next) || 0 // Expected points for the next game
      const form = parseFloat(player.form) || 0 // Player's form
      const team = teamMap.get(player.team) // Get the player's team

      if (!team) return null

      const opponent = getAverageOpponent(fpl.teams, team.id) // Get the average opponent

      const teamAdvantageScore = calculateTeamAdvantageScore(team, opponent)

      const position = elementTypeToPosition[player.element_type] // Get the player's position
      if (position === "GK" || position === "DEF") {
        score += cleanSheets * 2
        score += player.saves_per_90 * 2
        score += player.defensive_contribution * 2
        score -= goalsConceded * 3
      }

      score = score + W1 * ep + W2 * form + W3 * teamAdvantageScore

      score = score / 100

      return {
        element: player,
        score,
        position,
        teamId: team.id,
        teamName: team.name,
      } as IOptimalTeamPlayer
    })
    .filter(Boolean) // Filter out players that returned null in the previous step
    .sort((a, b) => b!.score - a!.score) as IOptimalTeamPlayer[] // Sort players by score in descending order (highest score first)

  return { players, teamMap }
}

/**
 * calculateTeamAdvantageScore
 *
 * This function calculates a score representing the team's advantage based on its attack and midfield strengths compared to the opponent's defence and midfield strengths.
 */
const calculateTeamAdvantageScore = (team: Team, opponent: Team) => {
  const teamAttackStrength =
    (team.strength_attack_home + team.strength_attack_away) / 2
  const teamMidfieldStrength = team.strength
  const opponentDefenceStrength =
    (opponent.strength_defence_home + opponent.strength_defence_away) / 2
  const opponentMidfieldStrength = opponent.strength

  const teamAdvantageScore =
    teamAttackStrength +
    teamMidfieldStrength -
    (opponentDefenceStrength + opponentMidfieldStrength)
  return teamAdvantageScore
}

/**
 * selectTeam
 *
 * This function iterates over the players and picks the best ones to form the team, taking into account the budget, team limits, and position limits.
 */
export const selectTeam = (params: {
  players: IOptimalTeamPlayer[]
  desiredFormation?: string
  budget?: number
  benchBoostEnabled?: boolean
  numberEnablers?: number
}) => {
  const { players, budget, desiredFormation } = params

  // Parse desired formation to required XI counts. Default to 3-4-3 if not provided.
  const formationString = desiredFormation?.trim() || "3-4-3"
  const [reqDEF, reqMID, reqFWD] = formationString
    .split("-")
    .map((n) => Math.max(0, Math.min(5, Number(n) || 0)))
  // Always exactly 1 GK in XI
  const reqXI: PositionCount = {
    GK: 1,
    DEF: reqDEF || 3,
    MID: reqMID || 4,
    FWD: reqFWD || 3,
  }

  // Sanity: enforce XI size of 11
  const totalXI = reqXI.GK + reqXI.DEF + reqXI.MID + reqXI.FWD
  if (totalXI !== 11) {
    // Normalize to 3-4-3 if malformed
    reqXI.GK = 1
    reqXI.DEF = 3
    reqXI.MID = 4
    reqXI.FWD = 3
  }

  // Buckets by position, already globally sorted by score upstream
  const byPos = {
    GK: players.filter((p) => p.position === "GK"),
    DEF: players.filter((p) => p.position === "DEF"),
    MID: players.filter((p) => p.position === "MID"),
    FWD: players.filter((p) => p.position === "FWD"),
  }

  // Helper: try add a player if it respects team limit and budget constraints
  const teamCount: TeamCount = {}
  const positionCount: PositionCount = { GK: 0, DEF: 0, MID: 0, FWD: 0 }
  const picked: IOptimalTeamPlayer[] = []
  let totalCost = 0

  const canPick = (p: IOptimalTeamPlayer, forBench = false) => {
    const tCount = teamCount[p.element.team] ?? 0
    if (tCount >= TEAM_LIMIT) return false
    const nextCost = totalCost + p.element.now_cost
    if (nextCost > (budget ?? BUDGET)) return false
    // For starting XI, also respect BUDGET_FOR_XI threshold when reaching 11
    if (!forBench) {
      // If this pick would complete XI, ensure total <= BUDGET_FOR_XI
      const willXI = picked.length + 1 === 11
      if (willXI && nextCost > BUDGET_FOR_XI) return false
    } else {
      // For bench, apply per-position cost caps if we've already spent XI budget
      if (totalCost >= BUDGET_FOR_XI) {
        const pos = p.position
        if (pos === "GK" && p.element.now_cost > BENCH_GK_COST_LIMIT)
          return false
        if (pos === "DEF" && p.element.now_cost > BENCH_DEF_COST_LIMIT)
          return false
        if (pos === "MID" && p.element.now_cost > BENCH_MID_COST_LIMIT)
          return false
        if (pos === "FWD" && p.element.now_cost > BENCH_FWD_COST_LIMIT)
          return false
      }
    }
    // Respect absolute POSITION_LIMITS
    const pos = p.position as "GK" | "DEF" | "MID" | "FWD"
    if (positionCount[pos] >= POSITION_LIMITS[pos]) return false
    return true
  }

  const addPick = (p: IOptimalTeamPlayer) => {
    picked.push(p)
    totalCost += p.element.now_cost
    positionCount[p.position as "GK" | "DEF" | "MID" | "FWD"] += 1
    teamCount[p.element.team] = (teamCount[p.element.team] ?? 0) + 1
  }

  // 1) Force-pick exactly 1 starting GK as best affordable respecting team and XI budget
  for (const p of byPos.GK) {
    if (canPick(p, false)) {
      addPick(p)
      break
    }
  }
  // If still no GK (unlikely), abort early with empty or best-effort later
  if (positionCount.GK === 0 && byPos.GK.length > 0) {
    // Pick the cheapest GK to proceed
    const cheapestGK = [...byPos.GK].sort(
      (a, b) => a.element.now_cost - b.element.now_cost
    )[0]
    if (canPick(cheapestGK, false)) addPick(cheapestGK)
  }

  // 2) Fill DEF, MID, FWD to meet desired formation for XI strictly
  const fillForXI = (pos: "DEF" | "MID" | "FWD", needed: number) => {
    if (needed <= 0) return
    const pool = byPos[pos]
    for (const p of pool) {
      if (positionCount[pos] >= needed) break
      // Only allow XI phase picks for these positions
      if (picked.length >= 11) break
      if (canPick(p, false)) {
        addPick(p)
      }
    }
  }
  fillForXI("DEF", reqXI.DEF)
  fillForXI("MID", reqXI.MID)
  fillForXI("FWD", reqXI.FWD)

  // Ensure XI is exactly 11. If we are short (budget/team constraints), try to fill best available any outfield pos
  const outfieldOrder: Array<"DEF" | "MID" | "FWD"> = ["MID", "DEF", "FWD"]
  while (picked.length < 11) {
    let added = false
    for (const pos of outfieldOrder) {
      // Do not exceed the required XI counts; keep respecting formation
      if (positionCount[pos] >= (reqXI as any)[pos]) continue
      const pool = byPos[pos]
      for (const p of pool) {
        // skip ones already picked
        if (picked.includes(p)) continue
        if (canPick(p, false)) {
          addPick(p)
          added = true
          break
        }
      }
      if (added) break
    }
    if (!added) break // Cannot complete exact XI due to constraints
  }

  // 3) After XI is met (or best-effort), add bench to reach 15 respecting bench cost caps and global limits
  const MAX_TEAM_SIZE = 15
  const benchOrder: Array<"MID" | "DEF" | "FWD" | "GK"> = [
    "MID",
    "DEF",
    "FWD",
    "GK",
  ]
  for (const pos of benchOrder) {
    if (picked.length >= MAX_TEAM_SIZE) break
    const pool = byPos[pos]
    for (const p of pool) {
      if (picked.length >= MAX_TEAM_SIZE) break
      if (picked.includes(p)) continue
      if (canPick(p, true)) {
        addPick(p)
      }
    }
  }

  return picked
}

/**
 * getAverageOpponent
 *
 * This function takes an array of teams and an ID of a team to exclude, and returns the team with the median strength from the remaining teams.
 * It is used to simulate an average opponent for the given team.
 */
function getAverageOpponent(teams: Team[], excludeTeamId: number): Team {
  const opponents = teams.filter((t) => t.id !== excludeTeamId)
  // Sort opponents by their overall strength in ascending order
  opponents.sort((a, b) => a.strength - b.strength)
  // Select the opponent with the median strength
  const idx = Math.floor(opponents.length / 2)
  return opponents[idx] ?? teams[0] // fallback
}
