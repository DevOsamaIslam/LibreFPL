import lastSeason from "../data/lastSeason.json"
import { getItem } from "../lib/helpers"
import {
  Status,
  type IOptimalTeamPlayer,
  type ISnapshot,
  type Player,
  type Position,
  type PositionCount,
  type Team,
  type TeamCount,
} from "../lib/types"
import { checkEligibility, RULE_KEYS } from "./eligibility"
import { getTeamFDR } from "./fdrAlgo"
import {
  CHEAPEST,
  elementTypeToPosition,
  NUMBER_OF_MATCHES,
  POSITION_LIMITS,
  positionToElementType,
  teamMap,
  WEIGHTS,
} from "./settings"

export const getXPoints = (params: {
  player: Player
  team: Team
  opponent: Team
  isHome: boolean
}) => {
  const { player, team, opponent, isHome } = params
  const expected = +(player.ep_this || player.ep_next || 0)

  let score = expected
  const chanceOfPlaying =
    player.chance_of_playing_this_round ||
    player.chance_of_playing_next_round ||
    +player.form * 10

  if (chanceOfPlaying < 50) score *= 0.5

  score += parseInt(player.form) - 2

  if (["FWD", "MID"].includes(elementTypeToPosition[player.element_type])) {
    score +=
      (isHome
        ? team.strength_attack_home - opponent.strength_defence_away
        : team.strength_attack_away - opponent.strength_defence_home) / 100
  } else {
    score +=
      (isHome
        ? team.strength_defence_home - opponent.strength_attack_away
        : team.strength_defence_away - opponent.strength_attack_home) / 150
  }

  if (player.status === Status.Damaged || player.status === Status.Injured)
    score /= 2
  if (
    player.status === Status.Suspended ||
    player.status === Status.Unavailable
  )
    score = 0

  return Math.max(score, 0)
}

/**
 * pickOptimalFPLTeamAdvanced
 *
 * This function takes an ISnapshot of FPL data and returns an array of Players representing the optimal FPL team.
 * It filters players based on status, cost, and minutes played, calculates a score for each player based on their EP, form, and team advantage,
 * and then picks the best players to form a team within the given constraints (budget, team limits, position limits).
 *
 */
export const pickOptimalFPLTeam = (fpl: ISnapshot) => {
  const { players } = filterAndScorePlayers(fpl)

  return players as IOptimalTeamPlayer[]
}

/**
 * filterAndScorePlayers
 *
 * This function filters players based on their status, cost, and minutes played, and calculates a score for each player based on their expected points (EP), form, and team advantage.
 */
const filterAndScorePlayers = (fpl: ISnapshot) => {
  const getStoredWeights = (): typeof WEIGHTS => {
    try {
      const stored = getItem<typeof WEIGHTS>("algorithm-weights")
      const storedWeights = Object.keys(stored ?? {}).reduce((acc, key) => {
        return {
          ...acc,
          [key]: stored?.[key] || WEIGHTS[key],
        }
      }, WEIGHTS)
      return storedWeights
    } catch (error) {
      console.error("Error reading stored weights:", error)
      return WEIGHTS
    }
  }

  const weights = getStoredWeights()

  // Create a map of team IDs to Team objects for easy lookup
  fpl.teams.forEach((t) => teamMap.set(t.id, t))
  const lastSeasonPlayersMap = new Map<number, Player>(
    lastSeason.elements.map((player) => [player.id, player as Player])
  )

  const players = fpl.elements
    .map((currentPlayer: Player) => {
      if (!currentPlayer.can_select) return null
      if (currentPlayer.status === Status.Unavailable) return null
      const lastSeasonPPG = +currentPlayer.total_points / NUMBER_OF_MATCHES

      const getPlayerScore = (player: Player) => {
        const team = teamMap.get(player.team)

        if (!team) return null

        const startsRatio = player.starts_per_90 * 100

        const minutesPerMatch = !player.minutes
          ? 0
          : player.minutes * (player.starts_per_90 || 1)

        const expectedGoalInvolvement = player.expected_goal_involvements // has better expected goal involvement
        const isAvailable = player.status === Status.Available // has status of 'a'
        const cleanSheets = player.clean_sheets // For GK and Def the clean sheets should be high
        const goalsConceded = player.goals_conceded // and the goals conceded should be low
        let score = 0

        score += +player.points_per_game * weights.pointsPerMatch

        if (player.element_type !== positionToElementType.GK)
          score += player.now_cost * weights.cost

        score += startsRatio * weights.startRatio
        score += (minutesPerMatch / 2) * weights.minutesPerMatch
        score += parseFloat(expectedGoalInvolvement ?? 0) * weights.xGI
        score += (4 - (player.penalties_order || 4)) * weights.onPenalties
        score += (4 - (player.direct_freekicks_order || 4)) * weights.onFK
        score +=
          (4 - (player.corners_and_indirect_freekicks_order || 4)) *
          weights.onCorners

        if (isAvailable) score += 10 * weights.available
        else score /= 2

        score += parseFloat(player.form) * weights.form * 2

        const discipline = player.starts
          ? ((player.red_cards ?? 0) + (player.yellow_cards ?? 0)) /
            player.starts
          : 0

        score += discipline * weights.discipline

        const FDR = getTeamFDR(team.id, { span: 1 })

        const teamAdvantageScore = FDR.average - 2.5
        const teamNextMatchDifficulty = (FDR.teamFDR[0]?.score ?? 2.5) - 2.5

        score += teamAdvantageScore * weights.teamAdvantage
        score += teamNextMatchDifficulty * 10 * weights.nextDifficulty

        const expectedPoints = getXPoints({
          player,
          team,
          isHome: FDR.teamFDR[0].isHome,
          opponent: FDR.teamFDR[0].opponent,
        })

        score += (expectedPoints - 2) * weights.expectedPoints

        const position = elementTypeToPosition[player.element_type]
        if (position === "GK" || position === "DEF") {
          score += cleanSheets * weights.cleanSheets
          score += player.saves_per_90 * weights.savesPerMatch
          score += player.defensive_contribution * weights.defcon
          score += goalsConceded * weights.conceded
        }

        score = score / (Object.keys(weights).length * 2)

        return {
          element: player,
          score,
          position,
          teamId: team.id,
          teamName: team.name,
          xPoints: expectedPoints,
        } as IOptimalTeamPlayer
      }

      const playerScore = getPlayerScore(currentPlayer)
      if (playerScore) {
        playerScore.score += lastSeasonPPG * weights.lastSeasonPoints
      }

      const lastSeasonPlayer = lastSeasonPlayersMap.get(currentPlayer.id)

      const lastSeasonScore = lastSeasonPlayer
        ? getPlayerScore(lastSeasonPlayer)
        : null

      const remainingWeight = 1 - weights.lastSeasonStats

      const score =
        (lastSeasonScore?.score ?? 0) * weights.lastSeasonStats +
        (playerScore?.score ?? 0) * remainingWeight

      return {
        ...playerScore,
        score,
      }
    })
    .filter(Boolean) // Filter out players that returned null in the previous step
    .sort((a, b) => b!.score - a!.score) as IOptimalTeamPlayer[] // Sort players by score in descending order (highest score first)

  return { players, teamMap }
}

export const selectTeam = async (params: {
  players: IOptimalTeamPlayer[]
  desiredFormation?: string // "3-4-3" etc.
  budget?: number // default to BUDGET
  benchBoostEnabled?: boolean
  numberEnablers?: number // ≥ 0 – minimal number of high‑price players to keep squad “priced”
}) => {
  const {
    players: PLAYERS,
    desiredFormation = "3-4-3",
    benchBoostEnabled = false,
    numberEnablers = 0,
  } = params

  let { players } = params

  const [defenseXICount, midfieldXICount, forwardXICount] = desiredFormation
    .split("-")
    .map(Number)

  let groupedByPosition = Object.groupBy(players, (p) => p.position)

  const starting: IOptimalTeamPlayer[] = [groupedByPosition.GK![0]]
  const bench: IOptimalTeamPlayer[] = []
  let totalCost = groupedByPosition.GK![0].element.now_cost
  const teamCount: TeamCount = {
    [groupedByPosition.GK![0].teamId]: 1,
  }
  const positionCount: PositionCount = { GK: 1, DEF: 0, MID: 0, FWD: 0 }

  players = players.filter(
    (p) => p.element.id !== groupedByPosition.GK![0].element.id
  )
  groupedByPosition.GK = groupedByPosition.GK?.filter(
    (p) => p.element.id !== groupedByPosition.GK![0].element.id
  )

  // bench positions
  let defenseBenchCount = POSITION_LIMITS.DEF - defenseXICount
  let midfieldBenchCount = POSITION_LIMITS.MID - midfieldXICount
  let forwardBenchCount = POSITION_LIMITS.FWD - forwardXICount

  if (!benchBoostEnabled)
    for (let i = 0; i < numberEnablers; i++) {
      if (i === 0) {
        const cheapestGK = groupedByPosition.GK?.find(
          (player) => player.element.now_cost === CHEAPEST.GK
        )
        bench.push(cheapestGK!)
        players = players.filter((p) => p.element.id !== cheapestGK!.element.id)
        groupedByPosition.GK = groupedByPosition.GK?.filter(
          (p) => p.element.id !== cheapestGK!.element.id
        )
        totalCost += cheapestGK!.element.now_cost!
        teamCount[cheapestGK!.teamId] = (teamCount[cheapestGK!.teamId] ?? 0) + 1
        positionCount.GK += 1
        continue
      }

      if (defenseBenchCount) {
        const cheapestDef = groupedByPosition.DEF?.find(
          (player) => player.element.now_cost === CHEAPEST.DEF
        )
        bench.push(cheapestDef!)
        players = players.filter(
          (p) => p.element.id !== cheapestDef!.element.id
        )
        groupedByPosition.DEF = groupedByPosition.DEF?.filter(
          (p) => p.element.id !== cheapestDef!.element.id
        )
        defenseBenchCount--
        totalCost += cheapestDef!.element.now_cost!
        teamCount[cheapestDef!.teamId] =
          (teamCount[cheapestDef!.teamId] ?? 0) + 1
        positionCount.DEF += 1
        continue
      }

      if (midfieldBenchCount) {
        const cheapestMid = groupedByPosition.MID?.find(
          (player) => player.element.now_cost === CHEAPEST.MID
        )
        bench.push(cheapestMid!)
        players = players.filter(
          (p) => p.element.id !== cheapestMid!.element.id
        )
        groupedByPosition.MID = groupedByPosition.MID?.filter(
          (p) => p.element.id !== cheapestMid!.element.id
        )
        midfieldBenchCount--
        totalCost += cheapestMid!.element.now_cost!
        teamCount[cheapestMid!.teamId] =
          (teamCount[cheapestMid!.teamId] ?? 0) + 1
        positionCount.MID += 1
        continue
      }

      if (forwardBenchCount) {
        const cheapestFwd = groupedByPosition.FWD?.find(
          (player) => player.element.now_cost === CHEAPEST.FWD
        )
        bench.push(cheapestFwd!)
        players = players.filter(
          (p) => p.element.id !== cheapestFwd!.element.id
        )
        groupedByPosition.FWD = groupedByPosition.FWD?.filter(
          (p) => p.element.id !== cheapestFwd!.element.id
        )
        forwardBenchCount--
        totalCost += cheapestFwd!.element.now_cost!
        teamCount[cheapestFwd!.teamId] =
          (teamCount[cheapestFwd!.teamId] ?? 0) + 1
        positionCount.FWD += 1
        continue
      }
    }

  for (let i = 0; i < players.length; i++) {
    const player = players[i]
    if (
      [...starting, ...bench].some((p) => p.element.id === player.element.id)
    ) {
      players.splice(i, 1)
      i--
      continue
    }

    const { eligible, reasons } = checkEligibility({
      budgetUsed: totalCost,
      candidate: player,
      selected: [
        ...starting.map((p) => p.element.id),
        ...bench.map((p) => p.element.id),
      ],
      teamCount,
      positionCount,
    })

    if (eligible) {
      players.splice(i, 1)
      if (starting.length < 11) starting.push(player)
      else bench.push(player)
      totalCost += player.element.now_cost!
      teamCount[player.teamId] = (teamCount[player.teamId] ?? 0) + 1
      positionCount[player.position as Position] += 1
      i--
      if (!players.length) players = [...PLAYERS]
      continue
    }

    if (reasons.includes(RULE_KEYS.maxPerTeam)) {
      players = players.filter((p) => p.teamId !== player.teamId)
      i--
      continue
    }

    if (reasons.includes(RULE_KEYS.positionLimit)) {
      players = players.filter((p) => p.position !== player.position)
      i--
      continue
    }

    if (reasons.includes(RULE_KEYS.budget)) {
      let removed: IOptimalTeamPlayer | undefined
      if (benchBoostEnabled && bench.length) {
        removed = bench.pop()
      } else {
        removed = starting.splice(
          Math.floor(Math.random()) * starting.length - 1,
          1
        )[0]
      }
      totalCost -= removed!.element.now_cost!
      positionCount[removed!.position as Position] -= 1
      players = players.filter(
        (p) =>
          p.element.now_cost >= player.element.now_cost &&
          p.element.id !== removed!.element.id
      )
      i--
      continue
    }

    if (reasons.includes(RULE_KEYS.maxPlayers)) {
      break
    }

    if (players.length === 0) {
      i--
      players = [...PLAYERS]
      continue
    }

    if (i === players.length - 1) {
      i--
      continue
    }

    if (starting.length === 11 && bench.length === 4) {
      break
    }
  }

  return {
    starting,
    bench,
  }
}
