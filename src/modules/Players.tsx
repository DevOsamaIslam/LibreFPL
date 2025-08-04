import { DataGrid, type GridColDef } from "@mui/x-data-grid"
import Container from "@mui/material/Container"
import { Box } from "@mui/material"
import PlayerFilterPanel from "../components/PlayerFilterPanel"
import Typography from "@mui/material/Typography"
import { useSettingsStore } from "../app/settings"
import type { Player } from "../lib/types"
import { usePlayerFilterStore } from "../store/playerFilter.store"

interface PlayerData {
  id: number
  name: string
  team: string
  position: string
  chance_of_playing_next_round: number | null
  total_points: number
  now_cost: number
  form: string
  points_per_game: string
  selected_by_percent: string
  transfers_in_event: number
  transfers_out_event: number
  value_form: string
  value_season: string
  minutes: number
  goals_scored: number
  assists: number
  clean_sheets: number
  goals_conceded: number
}

function Players() {
  const players = useSettingsStore((s) => s.sortedPlayers)
  const teams = useSettingsStore((s) => s.snapshot?.teams)

  // Select only the pure function reference (stable), do NOT subscribe to changing state here
  const getFilteredRows = usePlayerFilterStore((s) => s.getFilteredRows)

  // Compute rows purely from external inputs (players, teams) to avoid subscription-driven render loops
  const rows: PlayerData[] = getFilteredRows({ players: players || [], teams })

  const columns: GridColDef[] = [
    { field: "name", headerName: "Name", width: 150 },
    { field: "team", headerName: "Team", width: 150 },
    { field: "position", headerName: "Position", width: 100 },
    {
      field: "chance_of_playing_next_round",
      headerName: "Chance of Playing Next Round",
      width: 200,
    },
    { field: "total_points", headerName: "Total Points", width: 150 },
    { field: "now_cost", headerName: "Cost", width: 100 },
    { field: "form", headerName: "Form", width: 100 },
    { field: "points_per_game", headerName: "Points per Game", width: 150 },
    { field: "selected_by_percent", headerName: "Selected By (%)", width: 150 },
    {
      field: "transfers_in_event",
      headerName: "Transfers In (Event)",
      width: 200,
    },
    {
      field: "transfers_out_event",
      headerName: "Transfers Out (Event)",
      width: 200,
    },
    { field: "value_form", headerName: "Value Form", width: 150 },
    { field: "value_season", headerName: "Value Season", width: 150 },
    { field: "minutes", headerName: "Minutes Played", width: 150 },
    { field: "goals_scored", headerName: "Goals Scored", width: 150 },
    { field: "assists", headerName: "Assists", width: 100 },
    { field: "clean_sheets", headerName: "Clean Sheets", width: 150 },
    { field: "goals_conceded", headerName: "Goals Conceded", width: 150 },
  ]

  return (
    <Box sx={{ overflow: "hidden" }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Players
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "340px 1fr" },
          alignItems: "stretch",
          gap: 8,
          minWidth: 0,
        }}>
        <PlayerFilterPanel teams={teams || []} />
        <Box
          sx={{
            height: 800,
            width: "100%",
            minWidth: 0,
            overflow: "hidden",
            "& .MuiDataGrid-root": {
              minWidth: 0,
            },
          }}>
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(row) => row.id}
            sx={{
              minWidth: 0,
              "& .MuiDataGrid-virtualScroller": {
                overflowX: "auto",
              },
            }}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 100,
                },
              },
            }}
            pageSizeOptions={[5, 10, 25, 50, 100, 1000]}
          />
        </Box>
      </Box>
    </Box>
  )
}

export default Players
