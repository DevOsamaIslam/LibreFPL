import {
  Stack,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  Button,
  Divider,
  Paper,
} from "@mui/material"
import React from "react"
import HeatmapTable from "./HeatmapTable"
import { useFDRData } from "./useFDRData"
import Legend from "./Legend"

export const FDRPage: React.FC = () => {
  const [span, setSpan] = React.useState(6)
  const data = useFDRData(span)
  const events = React.useMemo(() => {
    const first = data[0]?.byEvent ?? []
    return first.map((c) => c.event)
  }, [data])

  const [selected, setSelected] = React.useState<Set<number>>(new Set())
  const toggleTeam = (teamId: number) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(teamId)) next.delete(teamId)
      else next.add(teamId)
      return next
    })
  }
  const clearSelection = () => setSelected(new Set())
  const selectedRows = React.useMemo(
    () => data.filter((row) => selected.has(row.team.id)),
    [data, selected]
  )

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          Fixture Difficulty Rating (FDR)
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl size="small">
            <InputLabel id="span-label">Span (GWs)</InputLabel>
            <Select
              labelId="span-label"
              id="span"
              value={span}
              label="Span (GWs)"
              sx={{ minWidth: 100 }}
              onChange={(e) => setSpan(Number(e.target.value))}>
              {[4, 6, 8, 10, 15, 20, 25, 30, 38].map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Legend />
        </Stack>
      </Stack>

      <HeatmapTable
        data={data}
        events={events}
        withCheckbox
        selected={selected}
        onToggle={toggleTeam}
      />

      <Card
        variant="outlined"
        sx={{
          mt: 2,
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
        <Typography variant="caption" color="text.secondary">
          Scores computed from home/away attack vs opponent home/away defence
          using league-wide quantiles, mapped to 1 (maroon, toughest) to 5
          (bright green, easiest).
        </Typography>
        <Button size="small" onClick={clearSelection}>
          Clear selection
        </Button>
      </Card>

      <Divider sx={{ my: 3 }} />

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 1 }}>
        <Typography variant="h6" fontWeight={700}>
          Selected Teams
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {selected.size} selected
        </Typography>
      </Stack>

      {selectedRows.length > 0 ? (
        <HeatmapTable data={selectedRows} events={events} />
      ) : (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Select teams using the checkboxes to view a focused FDR table here.
          </Typography>
        </Paper>
      )}
    </>
  )
}

export default FDRPage
