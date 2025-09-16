import { create } from "zustand"
import snapshot from "../data/snapshot.json"
import type {
  Event,
  IMyTeam,
  IOptimalTeamPlayer,
  ISnapshot,
  Team,
} from "../lib/types"

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
  lastSeasonStats: 0.3,
  expectedPoints: 3,
  form: 5,
  teamAdvantage: 3,
  nextDifficulty: 3,
  xGI: 5,
  xGC: -1.5,
  BPS: 1,
  lastSeasonPoints: 0.5,
  startRatio: 5,
  minutesPerMatch: 5,
  pointsPerMatch: 5,
  available: 5,
  notAvailable: -5,
  cleanSheets: 3,
  savesPerMatch: 2,
  conceded: -2,
  defcon: 1,
  discipline: -2,
  cost: 1,
  onPenalties: 1,
  onFK: 0.5,
  onCorners: 0.5,
} as const

export const CURRENCY = "£"

export const BENCH_GK_COST_LIMIT = 40
export const BENCH_DEF_COST_LIMIT = 40
export const BENCH_MID_COST_LIMIT = 45
export const BENCH_FWD_COST_LIMIT = 45
export const BUDGET_FOR_XI = 820
export const NUMBER_OF_MATCHES = 38

export const teamMap = new Map<number, Team>()
export const stat2label = snapshot.element_stats.reduce((acc, curr) => {
  return {
    ...acc,
    [curr.name]: curr.label,
  }
}, {} as Record<string, string>)

export const CURRENT_GW = snapshot.events.find((e) => e.is_next) as Event

export const DONE_GWS = snapshot.events.filter(
  (e) => e.finished || e.is_current
) as Event[]

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
  playersMap: Map<number, IOptimalTeamPlayer>
  weights: typeof WEIGHTS
  teams: Map<number, Team>
  myTeam: IMyTeam | undefined
  budget: number
  setSortedPlayers: (players: IOptimalTeamPlayer[]) => void
  setPlayersMap: (players: IOptimalTeamPlayer[]) => void
  setDesiredFormation: (formation: string) => void
  setBenchBoostEnabled: (enabled: boolean) => void
  setTripleCaptainEnabled: (enabled: boolean) => void
  setNumberEnablers: (number: number) => void
  setSnapshot: (snapshot: ISnapshot) => void
  setWeights: (weights: typeof WEIGHTS) => void
  setMyTeam: (myTeam: IMyTeam) => void
  setBudget: (budget: number) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  desiredFormation: "4-4-2",
  benchBoostEnabled: false,
  tripleCaptainEnabled: false,
  numberEnablers: 4,
  snapshot: snapshot as unknown as ISnapshot,
  sortedPlayers: [],
  playersMap: new Map(),
  weights: WEIGHTS,
  budget: BUDGET,
  teams: new Map(snapshot.teams.map((t) => [t.id, t])),
  myTeam: undefined,
  setSortedPlayers: (players) => set({ sortedPlayers: players }),
  setPlayersMap: (players) =>
    set({
      playersMap: new Map(players.map((player) => [player.element.id, player])),
    }),
  setDesiredFormation: (formation) => set({ desiredFormation: formation }),
  setBenchBoostEnabled: (enabled) => set({ benchBoostEnabled: enabled }),
  setTripleCaptainEnabled: (enabled) => set({ tripleCaptainEnabled: enabled }),
  setNumberEnablers: (number) => set({ numberEnablers: number }),
  setSnapshot: (snapshot) => set({ snapshot }),
  setWeights: (weights) => set({ weights }),
  setMyTeam: (myTeam) =>
    set({ myTeam, budget: myTeam.transfers.bank + myTeam.transfers.value }),
  setBudget: (budget) => set({ budget }),
}))
