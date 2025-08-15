import type { IOptimalTeamPlayer, Position } from "../lib/types"
import { TEAM_LIMIT } from "./settings"

export interface TransferSuggestion {
  out: IOptimalTeamPlayer
  in: IOptimalTeamPlayer
  deltaScore: number
  deltaCost: number
}

export interface SuggestTransfersArgs {
  squad: IOptimalTeamPlayer[]
  candidates: IOptimalTeamPlayer[]
  bankNowCost: number
  freeTransfers: number
}

export interface SuggestTransfersResult {
  suggestions: TransferSuggestion[]
  newSquad: IOptimalTeamPlayer[]
  usedBank: number
  hits: number
  totalDeltaScore: number
  initialScore: number
  finalScore: number
}

export const calculateTeamScore = (players: IOptimalTeamPlayer[]) =>
  players.reduce((acc, player, idx) => {
    if (!player) return acc
    return acc + player.score * (idx < 11 ? 1 : 0.1)
  }, 0)

function buildTeamCountMap(
  players: IOptimalTeamPlayer[]
): Record<number, number> {
  const map: Record<number, number> = {}
  for (const p of players) map[p.teamId] = (map[p.teamId] ?? 0) + 1
  return map
}

function withinTeamLimit(
  teamCount: Record<number, number>,
  teamId: number
): boolean {
  return (teamCount[teamId] ?? 0) <= TEAM_LIMIT
}

export function suggestTransfers(
  args: SuggestTransfersArgs
): SuggestTransfersResult {
  const { squad, candidates, bankNowCost, freeTransfers } = args

  const initialScore = calculateTeamScore(squad)
  const idsInSquad = new Set(squad.map((p) => p.element.id))
  let availableCandidates = candidates.filter(
    (p) => !idsInSquad.has(p.element.id)
  )

  let bank = bankNowCost
  let currentSquad = [...squad]
  let teamCount = buildTeamCountMap(currentSquad)

  const suggestions: TransferSuggestion[] = []

  const maxTransfers = Math.max(0, Math.min(2, Math.floor(freeTransfers)))

  for (let t = 0; t < maxTransfers; t++) {
    let best: TransferSuggestion | null = null

    for (const out of currentSquad) {
      const pos = out.position as Position

      for (const incoming of availableCandidates) {
        if ((incoming.position as Position) !== pos) continue

        // Avoid duplicates
        if (currentSquad.some((p) => p.element.id === incoming.element.id))
          continue

        // Same-position swap preserves position counts; no extra check needed

        // Team limit after swap
        const nextTeamCount = { ...teamCount }
        nextTeamCount[out.teamId] = (nextTeamCount[out.teamId] ?? 0) - 1
        nextTeamCount[incoming.teamId] =
          (nextTeamCount[incoming.teamId] ?? 0) + 1
        if (!withinTeamLimit(nextTeamCount, incoming.teamId)) continue

        const deltaCost =
          (incoming.element.now_cost ?? 0) - (out.element.now_cost ?? 0)
        if (deltaCost > bank) continue

        const deltaScore = incoming.score - out.score

        if (
          !best ||
          deltaScore > best.deltaScore ||
          (deltaScore === best.deltaScore && deltaCost < best.deltaCost)
        ) {
          best = { out, in: incoming, deltaScore, deltaCost }
        }
      }
    }

    if (!best || best.deltaScore <= 0) break

    // Apply best transfer
    currentSquad = currentSquad.map((p) =>
      p.element.id === best!.out.element.id ? best!.in : p
    )
    bank -= best.deltaCost
    teamCount[best.out.teamId] = (teamCount[best.out.teamId] ?? 0) - 1
    teamCount[best.in.teamId] = (teamCount[best.in.teamId] ?? 0) + 1
    // positionCount unchanged (same-position swap)

    suggestions.push(best)
    availableCandidates = availableCandidates.filter(
      (p) => p.element.id !== best!.in.element.id
    )
  }

  const finalScore = calculateTeamScore(currentSquad)
  const totalDeltaScore = finalScore - initialScore

  return {
    suggestions,
    newSquad: currentSquad,
    usedBank: bankNowCost - bank,
    hits: Math.max(
      0,
      suggestions.length - Math.max(0, Math.floor(freeTransfers))
    ),
    totalDeltaScore,
    initialScore,
    finalScore,
  }
}
