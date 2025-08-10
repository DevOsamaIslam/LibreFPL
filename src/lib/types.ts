import type { elementTypeToPosition } from "../app/settings"

export type Position = "GK" | "DEF" | "MID" | "FWD"

export type TeamCount = Record<number, number>

export type PositionCount = Record<Position, number>

export interface ISnapshot {
  chips: Chip[]
  events: Event[]
  game_settings: GameSettings
  game_config: GameConfig
  phases: Phase[]
  teams: Team[]
  total_players: number
  element_stats: ElementStat[]
  element_types: ElementType[]
  elements: Player[]
}

export interface Chip {
  id: number
  name: string
  number: number
  start_event: number
  stop_event: number
  chip_type: string
  overrides: ChipOverrides
}

export interface ChipOverrides {
  rules: Rules
  scoring: unknown
  pick_multiplier: null
}

export interface Rules {
  squad_squadsize?: number
}

export interface ElementStat {
  label: string
  name: string
}

export interface ElementType {
  id: number
  plural_name: string
  plural_name_short: string
  singular_name: string
  singular_name_short: string
  squad_select: number
  squad_min_select: null
  squad_max_select: null
  squad_min_play: number
  squad_max_play: number
  ui_shirt_specific: boolean
  sub_positions_locked: number[]
  element_count: number
}

export interface Player {
  can_transact: boolean
  can_select: boolean
  chance_of_playing_next_round: number | null
  chance_of_playing_this_round: null
  code: number
  cost_change_event: number
  cost_change_event_fall: number
  cost_change_start: number
  cost_change_start_fall: number
  dreamteam_count: number
  element_type: keyof typeof elementTypeToPosition
  ep_next: string
  ep_this: string | null
  event_points: number
  first_name: string
  form: string
  id: number
  in_dreamteam: boolean
  news: string
  news_added: Date | null
  now_cost: number
  photo: string
  points_per_game: string
  removed: boolean
  second_name: string
  selected_by_percent: string
  special: boolean
  squad_number: null
  status: (typeof Status)[keyof typeof Status]
  team: number
  team_code: number
  total_points: number
  transfers_in: number
  transfers_in_event: number
  transfers_out: number
  transfers_out_event: number
  value_form: string
  value_season: string
  web_name: string
  region: number | null
  team_join_date: Date | null
  birth_date: Date | null
  has_temporary_code: boolean
  opta_code: string
  minutes: number
  goals_scored: number
  assists: number
  clean_sheets: number
  goals_conceded: number
  own_goals: number
  penalties_saved: number
  penalties_missed: number
  yellow_cards: number
  red_cards: number
  saves: number
  bonus: number
  bps: number
  influence: string
  creativity: string
  threat: string
  ict_index: string
  defensive_contribution: number
  starts: number
  expected_goals: string
  expected_assists: string
  expected_goal_involvements: string
  expected_goals_conceded: string
  influence_rank: number
  influence_rank_type: number
  creativity_rank: number
  creativity_rank_type: number
  threat_rank: number
  threat_rank_type: number
  ict_index_rank: number
  ict_index_rank_type: number
  corners_and_indirect_freekicks_order: number | null
  corners_and_indirect_freekicks_text: string
  direct_freekicks_order: number | null
  direct_freekicks_text: string
  penalties_order: number | null
  penalties_text: string
  expected_goals_per_90: number
  saves_per_90: number
  expected_assists_per_90: number
  expected_goal_involvements_per_90: number
  expected_goals_conceded_per_90: number
  goals_conceded_per_90: number
  now_cost_rank: number
  now_cost_rank_type: number
  form_rank: number
  form_rank_type: number
  points_per_game_rank: number
  points_per_game_rank_type: number
  selected_rank: number
  selected_rank_type: number
  starts_per_90: number
  clean_sheets_per_90: number
}

export const Status = {
  A: "a",
  D: "d",
  I: "i",
  S: "s",
  U: "u",
} as const

export interface Event {
  id: number
  name: string
  deadline_time: string
  release_time: null
  average_entry_score: number
  finished: boolean
  data_checked: boolean
  highest_scoring_entry: null
  deadline_time_epoch: number
  deadline_time_game_offset: number
  highest_score: null
  is_previous: boolean
  is_current: boolean
  is_next: boolean
  cup_leagues_created: boolean
  h2h_ko_matches_created: boolean
  can_enter: boolean
  can_manage: boolean
  released: boolean
  ranked_count: number
  overrides: EventOverrides
  most_selected: null
  most_transferred_in: null
  top_element: null
  top_element_info: null
  transfers_made: number
  most_captained: null
  most_vice_captained: null
}

export interface EventOverrides {
  rules: unknown
  scoring: unknown
  pick_multiplier: null
}

export interface GameConfig {
  settings: Settings
  rules: GameSettings
  scoring: GameConfigScoring
}

export interface GameSettings {
  league_join_private_max: number
  league_join_public_max: number
  league_max_size_public_classic: number
  league_max_size_public_h2h: number
  league_max_size_private_h2h: number
  league_max_ko_rounds_private_h2h: number
  league_prefix_public: string
  league_points_h2h_win: number
  league_points_h2h_lose: number
  league_points_h2h_draw: number
  league_ko_first_instead_of_random: boolean
  cup_start_event_id: null
  cup_stop_event_id: null
  cup_qualifying_method: null
  cup_type: null
  element_sell_at_purchase_price: boolean
  percentile_ranks: number[]
  underdog_differential: number
  squad_squadplay: number
  squad_squadsize: number
  squad_special_min: null
  squad_special_max: null
  squad_team_limit: number
  squad_total_spend: number
  ui_currency_multiplier: number
  ui_use_special_shirts: boolean
  stats_form_days: number
  sys_vice_captain_enabled: boolean
  transfers_cap: number
  transfers_sell_on_fee: number
  max_extra_free_transfers: number
  league_h2h_tiebreak_stats: string[]
  timezone?: string
}

export interface GameConfigScoring {
  long_play: number
  short_play: number
  goals_conceded: { [key: string]: number }
  saves: number
  goals_scored: { [key: string]: number }
  assists: number
  clean_sheets: { [key: string]: number }
  penalties_saved: number
  penalties_missed: number
  yellow_cards: number
  red_cards: number
  own_goals: number
  bonus: number
  bps: number
  influence: number
  creativity: number
  threat: number
  ict_index: number
  special_multiplier: number
  mng_goals_scored: { [key: string]: number }
  mng_clean_sheets: { [key: string]: number }
  mng_win: { [key: string]: number }
  mng_draw: { [key: string]: number }
  mng_loss: number
  mng_underdog_win: { [key: string]: number }
  mng_underdog_draw: { [key: string]: number }
  starts: number
  expected_assists: number
  expected_goal_involvements: number
  expected_goals_conceded: number
  expected_goals: number
}

export interface Settings {
  entry_per_event: boolean
  timezone: string
  club_badge_creation_enabled: boolean
}

export interface Phase {
  id: number
  name: string
  start_event: number
  stop_event: number
  highest_score: null
}

export interface Team {
  code: number
  draw: number
  form: null
  id: number
  loss: number
  name: string
  played: number
  points: number
  position: number
  short_name: string
  strength: number
  team_division: null
  unavailable: boolean
  win: number
  strength_overall_home: number
  strength_overall_away: number
  strength_attack_home: number
  strength_attack_away: number
  strength_defence_home: number
  strength_defence_away: number
  pulse_id: number
}

export interface IOptimalTeamPlayer {
  element: Player
  score: number
  position: string
  teamId: number
  teamName: string
}

export interface IMyTeam {
  picks: Pick[]
  picks_last_updated: Date
  chips: Chip[]
  transfers: Transfers
}

export interface Chip {
  id: number
  status_for_entry: string
  played_by_entry: any[]
  name: string
  number: number
  start_event: number
  stop_event: number
  chip_type: string
  is_pending: boolean
}

export interface Pick {
  element: number
  position: number
  multiplier: number
  is_captain: boolean
  is_vice_captain: boolean
  element_type: number
  selling_price: number
  purchase_price: number
}

export interface Transfers {
  cost: number
  status: string
  limit: null
  made: number
  bank: number
  value: number
}
export const ARMBAND = {
  CAPTAIN: "C",
  VICE: "VC",
} as const

export type Armband = (typeof ARMBAND)[keyof typeof ARMBAND]

export interface IFixture {
  code: number
  event: number
  finished: boolean
  finished_provisional: boolean
  id: number
  kickoff_time: Date
  minutes: number
  provisional_start_time: boolean
  started: boolean
  team_a: number
  team_a_score: null
  team_h: number
  team_h_score: null
  stats: any[]
  team_h_difficulty: number
  team_a_difficulty: number
  pulse_id: number
}
