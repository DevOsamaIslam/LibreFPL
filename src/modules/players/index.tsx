import { Box, Grid } from "@mui/material"
import Typography from "@mui/material/Typography"
import { DataGrid } from "@mui/x-data-grid"
import { useEffect, useMemo, useRef, useState } from "react"
import { useSettingsStore } from "../../app/settings"
import PageTitle from "../../components/PageTitle"
import PlayerFilterPanel from "./PlayerFilterPanel"
import { usePlayerFilterStore } from "../../store/playerFilter.store"
import { playerColumns } from "./columns"

const DEBOUNCE_MS = 250

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
    }
    timerRef.current = window.setTimeout(() => {
      setDebounced(value)
    }, delay)

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
      }
    }
  }, [value, delay])

  return debounced
}

function Players() {
  const players = useSettingsStore((s) => s.sortedPlayers)
  const teams = useSettingsStore((s) => s.snapshot?.teams)

  // Subscribe to filters so we can debounce their effect without recomputing rows immediately.
  const filters = usePlayerFilterStore((s) => s.filters)

  // Select only the pure function reference (stable), do NOT subscribe to changing state here
  const getFilteredRows = usePlayerFilterStore((s) => s.getFilteredRows)

  // Debounce the filters to avoid recomputation on every keystroke
  const debouncedFilters = useDebounced(filters, DEBOUNCE_MS)

  // Compute rows using memoization keyed by debounced filters and static inputs
  const rows = useMemo(() => {
    // getFilteredRows internally reads from the store's filters.
    // We ensure it re-runs only when debouncedFilters changes by referencing it here.
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    debouncedFilters
    return getFilteredRows({ players: players || [], teams })
  }, [debouncedFilters, getFilteredRows, players, teams])

  const columns = playerColumns

  return (
    <Box sx={{ overflow: "hidden" }}>
      <PageTitle>Players</PageTitle>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        fontWeight={(theme) => theme.typography.fontWeightBold ?? 700}>
        Players
      </Typography>
      <Grid container>
        <Grid size={4} sx={{ pr: 2 }}>
          <PlayerFilterPanel teams={teams || []} />
        </Grid>
        <Grid size={8} sx={{ pl: 2 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            disableColumnFilter
            getRowId={(row) => row.id}
            sx={(theme) => ({
              minWidth: 0,
              "& .MuiDataGrid-virtualScroller": {
                overflowX: "auto",
              },
              maxHeight: "75vh",
              "& .MuiDataGrid-columnHeaders": {
                fontWeight: theme.typography.fontWeightBold ?? 600,
              },
            })}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 100,
                },
              },
            }}
            pageSizeOptions={[5, 10, 25, 50, 100]}
          />
        </Grid>
      </Grid>
    </Box>
  )
}

export default Players
