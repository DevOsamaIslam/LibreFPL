import { create } from "zustand"
import type { IOptimalTeamPlayer, Player, Team } from "../lib/types"

export const FilterOp = {
  eq: "eq",
  gt: "gt",
  lt: "lt",
  contains: "contains",
} as const

export type FilterOp = (typeof FilterOp)[keyof typeof FilterOp]

export const Position = {
  GK: "GK",
  DEF: "DEF",
  MID: "MID",
  FWD: "FWD",
} as const

export type Position = (typeof Position)[keyof typeof Position]

/**
 * Field names are constrained to the projected row keys below for safety.
 */
export const FilterField = {
  name: "name",
  team: "team",
  position: "position",
  chance_of_playing_next_round: "chance_of_playing_next_round",
  total_points: "total_points",
  now_cost: "now_cost",
  form: "form",
  points_per_game: "points_per_game",
  selected_by_percent: "selected_by_percent",
  transfers_in_event: "transfers_in_event",
  transfers_out_event: "transfers_out_event",
  value_form: "value_form",
  value_season: "value_season",
  minutes: "minutes",
  goals_scored: "goals_scored",
  assists: "assists",
  clean_sheets: "clean_sheets",
  goals_conceded: "goals_conceded",
} as const
export type FilterField = (typeof FilterField)[keyof typeof FilterField]

export type FilterTuple = readonly [
  field: FilterField,
  op: FilterOp,
  value: string | number | null
]

export interface PlayerFilterState {
  filters: FilterTuple[]
}

type SetManyArg = Partial<PlayerFilterState>

export interface PlayerFilterStore extends PlayerFilterState {
  setMany: (patch: SetManyArg) => void
  reset: () => void
  addFilter: (f: FilterTuple) => void
  updateFilter: (index: number, f: FilterTuple) => void
  removeFilter: (index: number) => void
  setFilters: (next: FilterTuple[]) => void
  getFilteredRows: (args: {
    players: IOptimalTeamPlayer[]
    teams: Team[] | undefined
  }) => Array<Player & { score: number; position: string; teamName: string }>
}

const initialState: PlayerFilterState = {
  filters: [],
}

function applyFilter(row: any, [field, op, value]: FilterTuple): boolean {
  const cell = row[field]
  if (value === null || value === "" || value === undefined) return true

  if (op === FilterOp.contains) {
    return String(cell ?? "")
      .toLowerCase()
      .includes(String(value).toLowerCase())
  }

  // numeric comparisons where possible
  const a = typeof cell === "string" ? Number(cell) : cell
  const b = typeof value === "string" ? Number(value) : value

  if (op === FilterOp.eq) return a === b
  if (op === FilterOp.gt) return Number(a) > Number(b)
  if (op === FilterOp.lt) return Number(a) < Number(b)

  return true
}

export const usePlayerFilterStore = create<PlayerFilterStore>()((set, get) => ({
  ...initialState,
  setMany: (patch) => set((s) => ({ ...s, ...patch })),
  setFilters: (next) => set(() => ({ filters: next })),
  addFilter: (f) => set((s) => ({ filters: [...s.filters, f] })),
  updateFilter: (index, f) =>
    set((s) => ({
      filters: s.filters.map((x, i) => (i === index ? f : x)),
    })),
  removeFilter: (index) =>
    set((s) => ({ filters: s.filters.filter((_, i) => i !== index) })),
  reset: () => set(() => ({ ...initialState })),
  getFilteredRows: ({ players }) => {
    const s = get()

    const rows =
      players?.map((p) => ({
        ...p.element,
        position: p.position,
        teamName: p.teamName,
        score: p.score,
      })) ?? []

    const filters = s.filters || []

    if (!filters.length) return rows

    return rows.filter((row) => filters.every((f) => applyFilter(row, f)))
  },
}))
