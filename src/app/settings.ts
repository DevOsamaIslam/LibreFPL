import { create } from "zustand"
import snapshot from "../data/snapshot.json"
import type { IOptimalTeamPlayer, ISnapshot } from "../lib/types"

export const APP_NAME = "LibreFPL"
export const SUPPORT_ADDRESSES = {
  BTC: "bc1p5n9ya2k63trk6k7xrh2jp0lzgyhn0xadj4utgqcpu855q9my9rtq0q5n8e",
  XMR: "45nCrEa8LpJd9DFmh9nmfL3hpUhAdDyik3emMyNhNozk9VSDK9WEwNLZPAHL3MCFW2L84tXRKCbaQ3GkjaPuj51wAGs36Ai",
} as const
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
export const W6 = 0.5 // BPS

export const BENCH_GK_COST_LIMIT = 40
export const BENCH_DEF_COST_LIMIT = 40
export const BENCH_MID_COST_LIMIT = 45
export const BENCH_FWD_COST_LIMIT = 45
export const BUDGET_FOR_XI = 820
export const NUMBER_OF_MATCHES = 38

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

interface SettingsState {
  desiredFormation: string
  benchBoostEnabled: boolean
  tripleCaptainEnabled: boolean
  numberEnablers: number
  snapshot: ISnapshot | null
  sortedPlayers: IOptimalTeamPlayer[]
  setDesiredFormation: (formation: string) => void
  setBenchBoostEnabled: (enabled: boolean) => void
  setTripleCaptainEnabled: (enabled: boolean) => void
  setNumberEnablers: (number: number) => void
  setSnapshot: (snapshot: ISnapshot) => void
  setSortedPlayers: (players: IOptimalTeamPlayer[]) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  desiredFormation: "4-4-2",
  benchBoostEnabled: false,
  tripleCaptainEnabled: false,
  numberEnablers: 4,
  snapshot: snapshot as unknown as ISnapshot,
  sortedPlayers: [],
  setSortedPlayers: (players) => set({ sortedPlayers: players }),
  setDesiredFormation: (formation) => set({ desiredFormation: formation }),
  setBenchBoostEnabled: (enabled) => set({ benchBoostEnabled: enabled }),
  setTripleCaptainEnabled: (enabled) => set({ tripleCaptainEnabled: enabled }),
  setNumberEnablers: (number) => set({ numberEnablers: number }),
  setSnapshot: (snapshot) => set({ snapshot: snapshot }),
}))
