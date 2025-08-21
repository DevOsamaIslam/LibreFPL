import { create } from "zustand"
import type { IOptimalTeamPlayer, Player, Team } from "../lib/types"

const FilterOp = {
  eq: "eq",
  gt: "gt",
  lt: "lt",
  contains: "contains",
} as const

export const NUMBER_FILTER_OPS = [
  FilterOp.eq,
  FilterOp.gt,
  FilterOp.lt,
] as const

export const STRING_FILTER_OPS = [FilterOp.eq, FilterOp.contains] as const

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
export type FilterField = Player & Omit<IOptimalTeamPlayer, "element">

export type FilterTuple = readonly [
  field: keyof FilterField,
  op: FilterOp,
  value: string | number | null
]

export interface PlayerFilterState {
  filters: FilterTuple[]
}

type SetManyArg = Partial<PlayerFilterState>
export interface IPlayerColumn extends Player {
  score: number
  position: Position
  teamName: string
}

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
  }) => Array<IPlayerColumn>
}

const initialState: PlayerFilterState = {
  filters: [],
}

function applyFilter(row: any, [field, op, value]: FilterTuple): boolean {
  const cell = row[field]
  const isNumeric = !isNaN(+cell)

  if (value === null || value === "" || value === undefined) return true

  if (op === FilterOp.contains) {
    return String(cell ?? "")
      .toLowerCase()
      .includes(String(value).toLowerCase())
  }

  // numeric comparisons where possible
  const a = isNumeric ? Number(cell) : cell
  const b = isNumeric ? Number(value) : value

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
        position: p.position as Position,
        teamName: p.teamName,
        score: p.score,
      })) ?? []

    const filters = s.filters || []

    if (!filters.length) return rows

    return rows.filter((row) => filters.every((f) => applyFilter(row, f)))
  },
}))
