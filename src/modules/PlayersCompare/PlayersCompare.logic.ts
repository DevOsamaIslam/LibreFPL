import { useMemo, useState } from "react"
import { NUMBER_OF_MATCHES, useSettingsStore } from "../../app/settings"
import snapshot from "../../data/snapshot.json"
import type { IOptimalTeamPlayer } from "../../lib/types"

// Constants and labels (no hard-coded strings)
export const MAX_SELECTED = 4 as const

export type Snapshot = typeof snapshot
export type Team = Snapshot["teams"][number]

export type Position = "GK" | "DEF" | "MID" | "FWD"
export type PositionMap = Record<number, Position>

export const ELEMENT_TYPE: PositionMap = {
  1: "GK",
  2: "DEF",
  3: "MID",
  4: "FWD",
} as const

export const label = {
  title: "Players Compare",
  searchPlaceholder: "Search player or team...",
  selectedTitle: "Selected",
  addHint: `Select up to ${MAX_SELECTED} players`,
  basic: "Basic",
  perf: "Performance",
  discipline: "Discipline",
  ict: "ICT",
  team: "Team Strength",
  price: "Price",
  pos: "Pos",
  teamLbl: "Team",
  sel: "Sel%",
  pts: "Pts",
  mins: "Mins",
  g: "G",
  a: "A",
  cs: "CS",
  xg: "xG",
  xa: "xA",
  yc: "YC",
  rc: "RC",
  form: "Form",
  inf: "Influence",
  cre: "Creativity",
  thr: "Threat",
  ictIdx: "ICT Index",
  att: "ATT",
  def: "DEF",
} as const

export function useCompareData() {
  const { sortedPlayers: players } = useSettingsStore()
  const teamsById = useMemo(() => {
    const map = new Map<number, Team>()
    snapshot.teams.forEach((t) => map.set(t.id, t))
    return map
  }, [])
  return { players, teamsById }
}

export function useSearch(list: IOptimalTeamPlayer[]) {
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

// formatters and helpers
export function numberFmt(n: number | undefined, digits = 1) {
  if (n === undefined || n === null || !n) return "-"
  return (+n).toFixed(digits)
}

export function pctFmt(n: number | undefined, digits = 1) {
  if (n === undefined || n === null) return "-"
  return `${n.toFixed(digits)}%`
}

export function priceFmt(n: number | undefined) {
  if (n === undefined || n === null) return "-"
  return (n / 10).toFixed(1)
}

export function safeMean(a?: number, b?: number) {
  const vals = [a, b].filter((v): v is number => typeof v === "number")
  if (!vals.length) return undefined
  return vals.reduce((s, v) => s + v, 0) / vals.length
}

export function teamAttackStrength(team?: Team) {
  if (!team) return undefined
  const att = safeMean(team.strength_attack_home, team.strength_attack_away)
  return att
}

export function teamDefenseStrength(team?: Team) {
  if (!team) return undefined
  const def = safeMean(team.strength_defence_home, team.strength_defence_away)
  return def
}

export function usePlayersCompareState(players: IOptimalTeamPlayer[]) {
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const selectedPlayers = useMemo(
    () =>
      selectedIds
        .map((id) => players.find((p) => p.element.id === id))
        .filter(Boolean) as IOptimalTeamPlayer[],
    [selectedIds, players]
  )

  const canAddMore = selectedIds.length < MAX_SELECTED

  function togglePlayer(id: number) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= MAX_SELECTED) return prev
      return [...prev, id]
    })
  }

  function removePlayer(id: number) {
    setSelectedIds((ids) => ids.filter((x) => x !== id))
  }

  return {
    selectedIds,
    setSelectedIds,
    selectedPlayers,
    canAddMore,
    togglePlayer,
    removePlayer,
  }
}

// Derived view helpers
export function minutesPer90(totalMinutes?: number) {
  if (!totalMinutes && totalMinutes !== 0) return undefined
  return totalMinutes / NUMBER_OF_MATCHES
}
