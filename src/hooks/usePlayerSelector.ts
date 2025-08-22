import { useMemo, useState, useCallback } from "react"
import type { IOptimalTeamPlayer, ISnapshot } from "../lib/types"
import snapshot from "../data/snapshot.json"

export const PLAYER_SELECTOR_CONST = {
  maxSelected: 15,
  searchPlaceholder: "Search player or team...",
  selectedLabel: "Selected",
  addHintPrefix: "Select up to",
} as const

type Team = ISnapshot["teams"][number]

const ELEMENT_TYPE: Record<number, "GK" | "DEF" | "MID" | "FWD"> = {
  1: "GK",
  2: "DEF",
  3: "MID",
  4: "FWD",
} as const

export function useSearchBase(list: IOptimalTeamPlayer[]) {
  const [q, setQ] = useState("")
  const normalized = q.trim().toLowerCase()
  const result = useMemo(() => {
    if (!normalized) return list
    return list.filter((p) => {
      const team = snapshot.teams.find((t) => t.id === p.element.team)
      const hay = [
        p.element.web_name,
        p.element.first_name,
        p.element.second_name,
        team?.name ?? "",
        ELEMENT_TYPE[p.element.element_type],
      ]
        .join(" ")
        .toLowerCase()
      return hay.includes(normalized)
    })
  }, [list, normalized])
  return { q, setQ, result }
}

export interface UsePlayerSelectorArgs {
  players: IOptimalTeamPlayer[]
  maxSelected?: number
}

/**
 * Headless, reusable selection logic:
 * - manages selected ids
 * - exposes toggle/remove
 * - supports max cap
 * - provides teamsById and search hook for convenience
 */
export function usePlayerSelector({
  players,
  maxSelected,
}: UsePlayerSelectorArgs) {
  const max = maxSelected ?? PLAYER_SELECTOR_CONST.maxSelected

  const teamsById = useMemo(() => {
    const map = new Map<number, Team>()
    snapshot.teams.forEach((t) => map.set(t.id, t))
    return map
  }, [])

  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const selectedPlayers = useMemo(
    () =>
      selectedIds
        .map((id) => players.find((p) => p.element.id === id))
        .filter(Boolean) as IOptimalTeamPlayer[],
    [selectedIds, players]
  )

  const canAddMore = selectedIds.length < max

  const togglePlayer = useCallback(
    (id: number) => {
      setSelectedIds((prev) => {
        if (prev.includes(id)) return prev.filter((x) => x !== id)
        if (prev.length >= max) return prev
        return [...prev, id]
      })
    },
    [max]
  )

  const replacePlayers = useCallback((ids: number[]) => {
    setSelectedIds(ids)
  }, [])

  const removePlayer = useCallback((id: number) => {
    setSelectedIds((ids) => ids.filter((x) => x !== id))
  }, [])

  return {
    teamsById,
    selectedIds,
    setSelectedIds,
    selectedPlayers,
    canAddMore,
    togglePlayer,
    removePlayer,
    max,
    replacePlayers,
  }
}
