export const BUDGET = 1000
export const TEAM_LIMIT = 3
export const POSITION_LIMITS = { GK: 2, DEF: 5, MID: 5, FWD: 3 }
export const elementTypeToPosition = {
  1: "GK",
  2: "DEF",
  3: "MID",
  4: "FWD",
} as const

export const W1 = 4.0 // ep_next
export const W2 = 2.0 // form
export const W3 = 3.0 // team advantage
