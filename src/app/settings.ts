import { create } from "zustand"
import snapshot from "../data/snapshot.json"
import type { Event, IOptimalTeamPlayer, ISnapshot } from "../lib/types"
import type { Team } from "../modules/PlayersCompare/control"

export const APP_NAME = "LibreFPL"
export const SUPPORT_ADDRESSES = {
  BTC: "bc1p5n9ya2k63trk6k7xrh2jp0lzgyhn0xadj4utgqcpu855q9my9rtq0q5n8e",
  XMR: "45nCrEa8LpJd9DFmh9nmfL3hpUhAdDyik3emMyNhNozk9VSDK9WEwNLZPAHL3MCFW2L84tXRKCbaQ3GkjaPuj51wAGs36Ai",
} as const

export const MAX_TUNES = 20

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
export const WEIGHTS = {
  expectedPoints: 5,
  form: 3,
  teamAdvantage: 3,
  xGI: 5,
  xGC: -1.5,
  BPS: 1,
  lastSeasonPoints: 1.5,
  startRatio: 5,
  minutesPerMatch: 5,
  available: 5,
  notAvailable: -5,
  cleanSheets: 3,
  savesPerMatch: 2,
  conceded: -2,
  defcon: 1,
  discipline: -2,
  cost: 1,
} as const

export const BENCH_GK_COST_LIMIT = 40
export const BENCH_DEF_COST_LIMIT = 40
export const BENCH_MID_COST_LIMIT = 45
export const BENCH_FWD_COST_LIMIT = 45
export const BUDGET_FOR_XI = 820
export const NUMBER_OF_MATCHES = 38

export const teamMap = new Map<number, Team>()

export const CURRENT_GW = snapshot.events.find((e) => !e.finished) as Event

// export const teamMap = snapshot.teams.reduce(
//   (m, t) => m.set(t.id, t),
//   new Map<number, Team>()
// )

// export const FDR_BEGINNING = computeFDR({
//   spanGWs: NUMBER_OF_MATCHES,
//   startingFrom: CURRENT_GW.id,
// })

// export const FDR = FDR_BEGINNING.slice(CURRENT_GW.id - 1)

// export const FDR_PER_TEAM = Object.groupBy(FDR, (f) => f.team.id)

export const CHEAPEST = {
  GK: 40,
  DEF: 40,
  MID: 45,
  FWD: 45,
}

export const colorByPos = {
  GK: "#8B4513", // brown
  DEF: "#F59E0B", // yellow
  MID: "#10B981", // green
  FWD: "#EF4444", // red
  "1": "#8B4513",
  "2": "#F59E0B",
  "3": "#10B981",
  "4": "#EF4444",
} as Record<string, string>
// Map of team short code to primary color
export const TEAM_COLOR = {
  Arsenal: "#EF0107", // Arsenal
  "Aston Villa": "#670E36", // Aston Villa
  Bournemouth: "#D00027", // Bournemouth
  Brentford: "#E30613", // Brentford
  Brighton: "#0057B8", // Brighton
  Burnley: "#410202ff", // Burnley
  Chelsea: "#034694", // Chelsea
  "Crystal Palace": "#1B458F", // Crystal Palace
  Everton: "#003399", // Everton
  Fulham: "#000000", // Fulham
  Leeds: "#cdc8bdff", // Leeds
  Liverpool: "#C8102E", // Liverpool
  "Man City": "#6CABDD", // Man City
  "Man Utd": "#DA291C", // Man United
  Newcastle: "#241F20", // Newcastle
  "Nott'm Forest": "#DD0000", // Nottingham Forest
  Southampton: "#D71920", // Southampton
  Spurs: "#132257", // Tottenham
  Sunderland: "#E50914", // Sunderland
  "West Ham": "#7A263A", // West Ham
  Wolves: "#FDB913", // Wolves
} as const

export type TeamName = keyof typeof TEAM_COLOR

export const DEFAULT_TEAM_COLOR = "#888888"
export const getTeamColor = (team: string | TeamName): string =>
  (TEAM_COLOR as Record<string, string>)[team] ?? DEFAULT_TEAM_COLOR

export type WeightKey = keyof typeof WEIGHTS

interface SettingsState {
  desiredFormation: string
  benchBoostEnabled: boolean
  tripleCaptainEnabled: boolean
  numberEnablers: number
  snapshot: ISnapshot | null
  sortedPlayers: IOptimalTeamPlayer[]
  weights: typeof WEIGHTS
  setDesiredFormation: (formation: string) => void
  setBenchBoostEnabled: (enabled: boolean) => void
  setTripleCaptainEnabled: (enabled: boolean) => void
  setNumberEnablers: (number: number) => void
  setSnapshot: (snapshot: ISnapshot) => void
  setSortedPlayers: (players: IOptimalTeamPlayer[]) => void
  setWeights: (weights: typeof WEIGHTS) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  desiredFormation: "4-4-2",
  benchBoostEnabled: false,
  tripleCaptainEnabled: false,
  numberEnablers: 4,
  snapshot: snapshot as unknown as ISnapshot,
  sortedPlayers: [],
  weights: WEIGHTS,
  setSortedPlayers: (players) => set({ sortedPlayers: players }),
  setDesiredFormation: (formation) => set({ desiredFormation: formation }),
  setBenchBoostEnabled: (enabled) => set({ benchBoostEnabled: enabled }),
  setTripleCaptainEnabled: (enabled) => set({ tripleCaptainEnabled: enabled }),
  setNumberEnablers: (number) => set({ numberEnablers: number }),
  setSnapshot: (snapshot) => set({ snapshot: snapshot }),
  setWeights: (weights) => set({ weights }),
}))
