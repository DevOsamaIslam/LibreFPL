import type { GridColDef } from "@mui/x-data-grid"
import type { IPlayerColumn } from "../../store/playerFilter.store"
import { priceFmt } from "../../lib/helpers"
import { Tooltip } from "@mui/material"

export const playerColumns: GridColDef<IPlayerColumn>[] = [
  // { field: "can_transact", headerName: "Can Transact", width: 150 },
  { field: "web_name", headerName: "Name", width: 150 },
  { field: "teamName", headerName: "Team", width: 150 },
  { field: "position", headerName: "Position", width: 100 },
  // {
  //   field: "chance_of_playing_next_round",
  //   headerName: "Chance of Playing Next Round",
  //   width: 200,
  //   renderCell: ({ row }) => row.chance_of_playing_next_round ?? "unknown",
  // },
  { field: "total_points", headerName: "Total Points", width: 150 },
  {
    field: "score",
    headerName: "Score",
    width: 150,
    renderCell: ({ row }) => row.score.toFixed(1),
  },
  {
    field: "now_cost",
    headerName: "Cost",
    width: 100,
    renderCell: ({ row }) => priceFmt(row.now_cost / 10),
  },
  {
    field: "",
    headerName: "Minutes per 90",
    width: 100,
    renderCell: ({ row }) => (+row.minutes / +row.starts).toFixed(0),
  },
  { field: "points_per_game", headerName: "Points per Game", width: 150 },
  { field: "selected_by_percent", headerName: "Selected By (%)", width: 150 },
  {
    field: "ep_this",
    headerName: "Expected points - Next",
    width: 200,
  },
  { field: "minutes", headerName: "Minutes Played", width: 150 },
  { field: "goals_scored", headerName: "Goals Scored", width: 150 },
  { field: "assists", headerName: "Assists", width: 100 },
  { field: "clean_sheets", headerName: "Clean Sheets", width: 150 },
  { field: "goals_conceded", headerName: "Goals Conceded", width: 150 },
  { field: "own_goals", headerName: "Own Goals", width: 100 },
  { field: "penalties_saved", headerName: "Penalties Saved", width: 150 },
  { field: "penalties_missed", headerName: "Penalties Missed", width: 150 },
  { field: "yellow_cards", headerName: "Yellow Cards", width: 100 },
  { field: "red_cards", headerName: "Red Cards", width: 100 },
  { field: "saves", headerName: "Saves", width: 100 },
  { field: "bonus", headerName: "Bonus", width: 100 },
  { field: "bps", headerName: "BPS", width: 100 },
  { field: "expected_goals", headerName: "Expected Goals", width: 150 },
  { field: "expected_assists", headerName: "Expected Assists", width: 150 },
  {
    field: "expected_goal_involvements",
    headerName: "Expected Goal Involvements",
    width: 200,
  },
  {
    field: "expected_goals_conceded",
    headerName: "Expected Goals Conceded",
    width: 200,
  },
  { field: "starts", headerName: "Starts", width: 100 },
  {
    field: "expected_goals_per_90",
    headerName: "Expected Goals per 90",
    width: 180,
  },
  {
    field: "expected_assists_per_90",
    headerName: "Expected Assists per 90",
    width: 180,
  },
  {
    field: "expected_goal_involvements_per_90",
    headerName: "Expected Goal Involvements per 90",
    width: 220,
  },
  {
    field: "expected_goals_conceded_per_90",
    headerName: "Expected Goals Conceded per 90",
    width: 220,
  },
  {
    field: "goals_conceded_per_90",
    headerName: "Goals Conceded per 90",
    width: 180,
  },
  { field: "saves_per_90", headerName: "Saves per 90", width: 120 },
  { field: "starts_per_90", headerName: "Starts per 90", width: 120 },
  {
    field: "clean_sheets_per_90",
    headerName: "Clean Sheets per 90",
    width: 150,
  },
  {
    field: "news",
    headerName: "News",
    width: 200,
    renderCell: ({ row }) => (
      <Tooltip title={row.news} placement="top">
        <span>{row.news || "N/A"}</span>
      </Tooltip>
    ),
  },
  { field: "status", headerName: "Status", width: 100 },
  { field: "form", headerName: "Form", width: 100 },
  { field: "first_name", headerName: "First Name", width: 120 },
  { field: "second_name", headerName: "Second Name", width: 120 },
  { field: "event_points", headerName: "Event Points", width: 120 },
  {
    field: "direct_freekicks_order",
    headerName: "Direct Freekicks Order",
    width: 180,
  },
  { field: "penalties_order", headerName: "Penalties Order", width: 150 },
  {
    field: "corners_and_indirect_freekicks_order",
    headerName: "Corners & Indirect Freekicks Order",
    width: 220,
  },
  {
    field: "defensive_contribution",
    headerName: "Defensive Contribution",
    width: 180,
  },
]
