import type { IFixture, ISnapshot, Team } from "../lib/types"
import _fixtures from "../data/fixtures.json"
import _snapshot from "../data/snapshot.json"
import { CURRENT_GW, NUMBER_OF_MATCHES } from "./settings"

const fixtures = _fixtures as unknown as IFixture[]
const snapshot = _snapshot as unknown as ISnapshot

export type GameEvent = {
  id: number
  name: string
  is_next: boolean
  is_current: boolean
  is_previous: boolean
}

export type FixtureLite = {
  event: number
  homeTeamId: number
  awayTeamId: number
}

export type Matchup = {
  event: number
  teamId: number
  opponentId: number
  isHome: boolean
  ratio: number
}

export type FDRScore = number

export type TeamFDRByGw = {
  team: Team
  byEvent: { event: number; opponent: Team; isHome: boolean; score: FDRScore }[]
}

const HSL_RANGE = {
  minScore: 1,
  maxScore: 5,
  // Tough (low score) -> maroon-ish
  h1: 0, // hue in degrees (0 = red)
  s1: 80, // saturation 0..100
  l1: 25, // lightness 0..100
  // Easy (high score) -> green-ish
  h2: 130, // green
  s2: 85,
  l2: 50,
} as const

export const COLOR_STOPS = [
  { stop: HSL_RANGE.minScore, color: "hsl(0, 80%, 25%)" },
  { stop: HSL_RANGE.maxScore, color: "hsl(130, 85%, 50%)" },
] as const

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

export function interpolateColor(score: FDRScore): string {
  // Continuous HSL interpolation based on score
  const s = clamp(score, HSL_RANGE.minScore, HSL_RANGE.maxScore)
  const t = (s - HSL_RANGE.minScore) / (HSL_RANGE.maxScore - HSL_RANGE.minScore)

  const h = HSL_RANGE.h1 + (HSL_RANGE.h2 - HSL_RANGE.h1) * t
  const sat = HSL_RANGE.s1 + (HSL_RANGE.s2 - HSL_RANGE.s1) * t
  const l = HSL_RANGE.l1 + (HSL_RANGE.l2 - HSL_RANGE.l1) * t

  // Return CSS hsl string
  return `hsl(${h.toFixed(0)}, ${sat.toFixed(0)}%, ${l.toFixed(0)}%)`
}

export function computeFDR({
  spanGWs = 6,
  startingFrom = CURRENT_GW.id - 1,
}: {
  spanGWs: number
  startingFrom: number
}): TeamFDRByGw[] {
  const teamMap = snapshot.teams.reduce(
    (m, t) => m.set(t.id, t),
    new Map<number, Team>()
  )
  const matchesByTeam = fixtures.reduce((acc, curr) => {
    if (acc[curr.team_a]) acc[curr.team_a].push(curr)
    else acc[curr.team_a] = [curr]

    if (acc[curr.team_h]) acc[curr.team_h].push(curr)
    else acc[curr.team_h] = [curr]

    return acc
  }, {} as Record<number, IFixture[]>)

  return snapshot.teams.map((team) => {
    return {
      team: teamMap.get(team.id)!,
      byEvent: new Array(spanGWs).fill(null).map((_, index) => {
        const gwIndex = Math.min(
          startingFrom - 1 + index,
          NUMBER_OF_MATCHES - 1
        )
        const teamFixture = matchesByTeam[team.id][gwIndex]
        const opponent =
          teamFixture.team_h === team.id
            ? teamMap.get(teamFixture.team_a)!
            : teamMap.get(teamFixture.team_h)!
        return {
          event: startingFrom + index,
          opponent: opponent,
          isHome: teamFixture.team_h === team.id,
          score: getTeamScore({ teamFixture, opponent, teamMap }),
        }
      }),
    }
  })
}
function getTeamScore({
  teamFixture,
  opponent,
  teamMap,
}: {
  teamFixture: IFixture
  opponent: Team
  teamMap: Map<number, Team>
}): number {
  // Change the return type to number for normalized score
  const currentTeamId =
    teamFixture.team_h === opponent.id ? teamFixture.team_a : teamFixture.team_h
  const currentTeam = teamMap.get(currentTeamId)!
  const isHome = teamFixture.team_h === currentTeamId

  let rawScore: number
  if (isHome) {
    rawScore =
      currentTeam.strength_attack_home -
      opponent.strength_defence_home +
      (currentTeam.strength_defence_home - opponent.strength_attack_home)
  } else {
    rawScore =
      currentTeam.strength_attack_away -
      opponent.strength_defence_away +
      (currentTeam.strength_defence_away - opponent.strength_attack_away)
  }

  // Normalize the score to be between 0.00 and 5.00
  const minScore = -700 // Example minimum score based on possible strength values
  const maxScore = 700 // Example maximum score based on possible strength values

  if (rawScore <= minScore) return 0.0
  if (rawScore >= maxScore) return 5.0

  // Linear interpolation formula to normalize the score
  const normalizedScore = ((rawScore - minScore) / (maxScore - minScore)) * 5.0

  return Math.max(0.0, Math.min(normalizedScore, 5.0))
}

export const ALL_FDR = computeFDR({ spanGWs: 38, startingFrom: 1 })

export const FDR_PER_TEAM = ALL_FDR.reduce((acc, curr) => {
  return {
    ...acc,
    [curr.team.id]: curr.byEvent,
  }
}, {} as Record<number, TeamFDRByGw["byEvent"]>)

export const getTeamFDR = (
  teamId: number,
  options?: { span?: number; startingGW?: number }
) => {
  const startingFrom = options?.startingGW || CURRENT_GW.id
  const teamFDR = FDR_PER_TEAM[teamId]?.slice(startingFrom - 1, options?.span)!
  const average =
    teamFDR.reduce((acc, curr) => acc + curr.score, 0) / teamFDR.length

  return {
    teamFDR,
    average,
  }
}
