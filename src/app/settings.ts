export const BUDGET = 1000
export const TEAM_LIMIT = 3
export const POSITION_LIMITS = { GK: 2, DEF: 5, MID: 5, FWD: 3 }
export const elementTypeToPosition = {
  1: "GK",
  2: "DEF",
  3: "MID",
  4: "FWD",
} as const
export const positionToElementType = {
  GK: 1,
  DEF: 2,
  MID: 3,
  FWD: 4,
} as const

export const MIN_POSITIONS_XI = {
  GK: 1,
  DEF: 3,
  MID: 3,
  FWD: 1,
}

export const W1 = 4.0 // ep_next
export const W2 = 2.0 // form
export const W3 = 3.0 // team advantage
export const W4 = 1.5 // xGI
export const W5 = -0.5 // xGC
export const W6 = 0.1 // BPS

export const BENCH_GK_COST_LIMIT = 40
export const BENCH_DEF_COST_LIMIT = 40
export const BENCH_MID_COST_LIMIT = 45
export const BENCH_FWD_COST_LIMIT = 45
export const BUDGET_FOR_XI = 820
