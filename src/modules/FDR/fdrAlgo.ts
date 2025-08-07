import data from "../../data/fixtures.json"
import type { Team } from "../../lib/types"

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

function getEvents(): GameEvent[] {
  const ev = data.events
  return ev.map((x) => ({
    id: x.id,
    name: x.name,
    is_next: x.is_next,
    is_current: x.is_current,
    is_previous: x.is_previous,
  }))
}

/**
 * The upstream bootstrap doesn't include fixture list items.
 * We synthesize a single round-robin placeholder by pairing neighbors as a stub.
 * If you later add an official fixtures array, replace this with real fixtures.
 */
function synthesizeFixturesForSpan(
  gws: number,
  startEvent: number,
  teams: Team[]
): FixtureLite[] {
  const fixtures: FixtureLite[] = []
  for (let gw = 0; gw < gws; gw++) {
    const event = startEvent + gw
    // simple pairing: team i hosts team (i+gw+1) % n
    for (let i = 0; i < teams.length; i++) {
      const homeTeamId = teams[i].id
      const awayTeamId = teams[(i + gw + 1) % teams.length].id
      if (homeTeamId !== awayTeamId) {
        fixtures.push({ event, homeTeamId, awayTeamId })
      }
    }
  }
  return fixtures
}

/**
 * Compute a strength ratio for a team vs. an opponent.
 * The ratio is the strength of the team's attack at home/away
 * divided by the strength of the opponent's defence at away/home.
 * If either team does not have a strength, the ratio is 1.
 * @param team the team computing the ratio
 * @param opponent the opponent team
 * @param isHome true if the team is playing at home
 * @returns a strength ratio, where a higher number indicates an easier match
 */
function ratioFor(team: Team, opponent: Team, isHome: boolean): number {
  const atk = isHome ? team.strength_attack_home : team.strength_attack_away
  const def = isHome
    ? opponent.strength_defence_away
    : opponent.strength_defence_home
  if (!atk || !def) return 1
  return atk / def
}

function computeMatchUps(
  fixtures: FixtureLite[],
  teamById: Map<number, Team>
): Matchup[] {
  const matchups: Matchup[] = []
  for (const f of fixtures) {
    const home = teamById.get(f.homeTeamId)
    const away = teamById.get(f.awayTeamId)
    if (!home || !away) continue

    const ratioHome = ratioFor(home, away, true)
    const ratioAway = ratioFor(away, home, false)

    matchups.push({
      event: f.event,
      teamId: home.id,
      opponentId: away.id,
      isHome: true,
      ratio: ratioHome,
    })
    matchups.push({
      event: f.event,
      teamId: away.id,
      opponentId: home.id,
      isHome: false,
      ratio: ratioAway,
    })
  }
  return matchups
}

function quantileBuckets(values: number[], q: number[]): number[] {
  const sorted = [...values].sort((a, b) => a - b)
  return q.map((p) => {
    const idx = Math.max(
      0,
      Math.min(sorted.length - 1, Math.floor(p * (sorted.length - 1)))
    )
    return sorted[idx]
  })
}

function ratioToScore(ratio: number, cuts: number[]): FDRScore {
  // Convert continuous ratio into a continuous score in [1,5]
  // Using quantile cut points for a smooth mapping via piecewise-linear interpolation.
  // cuts: [q20, q40, q60, q80]
  const q1 = cuts[0]
  const q2 = cuts[1]
  const q3 = cuts[2]
  const q4 = cuts[3]

  if (ratio <= q1) {
    // Map (-inf, q1] -> [1, 2]
    const t =
      (ratio - Number.NEGATIVE_INFINITY) / (q1 - Number.NEGATIVE_INFINITY)
    // t is NaN for -inf; for practical finite values below q1, approximate linear to 1..2
    return 1 + Math.max(0, Math.min(1, (ratio - q1) / Math.max(1e-9, q1))) // fallback gentle slope
  }
  if (ratio <= q2) {
    const t = (ratio - q1) / Math.max(1e-9, q2 - q1)
    return 1 + t * 1 // 1..2
  }
  if (ratio <= q3) {
    const t = (ratio - q2) / Math.max(1e-9, q3 - q2)
    return 2 + t * 1 // 2..3
  }
  if (ratio <= q4) {
    const t = (ratio - q3) / Math.max(1e-9, q4 - q3)
    return 3 + t * 1 // 3..4
  }
  // Map [q4, +inf) -> [4,5], gently approach 5
  const t = (ratio - q4) / Math.max(1e-9, q4) // normalize tail growth
  return 4 + Math.max(0, Math.min(1, t))
}

export function computeFDR(spanGws: number = 6): TeamFDRByGw[] {
  const events = getEvents()
  const nextEvent =
    events.find((e) => e.is_next) ??
    events.find((e) => e.is_current) ??
    events[0]
  const startEvent = nextEvent?.id ?? 1

  const fixtures = synthesizeFixturesForSpan(spanGws, startEvent, data.teams)
  const teamById = new Map(data.teams.map((t) => [t.id, t]))
  const matchUps = computeMatchUps(fixtures, teamById)

  const ratios = matchUps.map((m) => m.ratio)
  const cuts = quantileBuckets(ratios, [0.2, 0.4, 0.6, 0.8])

  const grouped = new Map<number, TeamFDRByGw>()
  for (const t of data.teams) {
    grouped.set(t.id, { team: t, byEvent: [] })
  }

  for (const m of matchUps) {
    const holder = grouped.get(m.teamId)!
    const opponent = teamById.get(m.opponentId)!
    const score = ratioToScore(m.ratio, cuts)
    holder.byEvent.push({ event: m.event, opponent, isHome: m.isHome, score })
  }

  // keep only requested span sorted by event
  for (const v of grouped.values()) {
    v.byEvent.sort((a, b) => a.event - b.event)
    v.byEvent = v.byEvent.filter(
      (x) => x.event >= startEvent && x.event < startEvent + spanGws
    )
  }

  return Array.from(grouped.values()).sort((a, b) =>
    a.team.name.localeCompare(b.team.name)
  )
}
