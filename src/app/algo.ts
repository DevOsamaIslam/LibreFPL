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

  // const picked = selectTeam(
  //   players.filter(Boolean) as {
  //     element: Player
  //     score: number
  //     position: string
  //   }[]
  // )

  // return picked
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
    .map((player) => {
      const position = elementTypeToPosition[player.element_type] // Get the player's position
      const ep = parseFloat(player.ep_next) || 0 // Expected points for the next game
      const form = parseFloat(player.form) || 0 // Player's form
      const team = teamMap.get(player.team) // Get the player's team

      if (!team) return null

      const opponent = getAverageOpponent(fpl.teams, team.id) // Get the average opponent

      const teamAdvantageScore = calculateTeamAdvantageScore(team, opponent)

      const score = W1 * ep + W2 * form + (W3 * teamAdvantageScore) / 100

      return { element: player, score, position }
    })
    .filter(Boolean) // Filter out players that returned null in the previous step
    .sort((a, b) => b!.score - a!.score) // Sort players by score in descending order (highest score first)

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
  tripleCaptainEnabled?: boolean
  numberEnablers?: number
}) => {
  const {
    players,
    benchBoostEnabled,
    budget,
    desiredFormation,
    tripleCaptainEnabled,
    numberEnablers,
  } = params

  const goalkeepers = players.filter((player) => player.position === "GK")
  const firstGK = goalkeepers[0] // Select the first goalkeeper as the main goalkeeper
  // Initialize data structures for team selection
  const picked: IOptimalTeamPlayer[] = [firstGK] // Array to store the picked players
  const teamCount: TeamCount = {
    [firstGK.element.team]: 1,
  } // Object to store the number of players from each team
  const positionCount: PositionCount = {
    // Object to store the number of players in each position
    GK: 1,
    DEF: 0,
    MID: 0,
    FWD: 0,
  }

  let totalCost = firstGK.element.now_cost // Total cost of the picked team

  // Iterate over the players and pick the best ones to form the team
  for (const player of players) {
    if (!player) continue // skip nulls
    const { element, position } = player
    if (
      positionCount[position as "GK" | "DEF" | "MID" | "FWD"] >=
      POSITION_LIMITS[position as "GK" | "DEF" | "MID" | "FWD"]
    )
      continue // Skip if the position limit is reached
    if (
      element.element_type === positionToElementType.GK &&
      picked.find(
        (picked) => picked.element.element_type === positionToElementType.GK
      ) &&
      picked.length < 11
    )
      continue
    if ((teamCount[element.team] ?? 0) >= TEAM_LIMIT) continue // Skip if the team limit is reached
    if (totalCost + element.now_cost > BUDGET) continue // Skip if the budget is exceeded
    if (picked.length === 10 && totalCost + element.now_cost > BUDGET_FOR_XI)
      continue // make sure we don't exceed 82 mil for XI

    if (picked.length >= 11 && totalCost >= BUDGET_FOR_XI) {
      // Once we have 11 players, we start limiting the cost of bench players
      if (position === "GK" && element.now_cost > BENCH_GK_COST_LIMIT) continue // Limit bench GK cost
      if (position === "DEF" && element.now_cost > BENCH_DEF_COST_LIMIT)
        continue // Limit bench defender cost
      if (position === "MID" && element.now_cost > BENCH_MID_COST_LIMIT)
        continue // Limit bench midfielder cost
      if (position === "FWD" && element.now_cost > BENCH_FWD_COST_LIMIT)
        continue // Limit bench forward cost
    }
    picked.push(player) // Add the player to the picked team
    totalCost += element.now_cost // Update the total cost
    positionCount[position as "GK" | "DEF" | "MID" | "FWD"] += 1 // Update the position count
    teamCount[element.team] = (teamCount[element.team] ?? 0) + 1 // Update the team count

    const MAX_TEAM_SIZE = 15
    if (picked.length === MAX_TEAM_SIZE) {
      break
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
