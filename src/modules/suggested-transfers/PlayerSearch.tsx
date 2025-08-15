import { Stack, TextField, Typography } from "@mui/material"
import { priceFmt } from "../../hooks/usePlayerSelector"

interface PlayerSearchProps {
  q: string
  setQ: (value: string) => void
  selectedIds: number[]
  max: number
  totalSelectedCost: number
  totalSelectedScore: number
}

export function PlayerSearch({
  q,
  setQ,
  selectedIds,
  max,
  totalSelectedCost,
  totalSelectedScore,
}: PlayerSearchProps) {
  return (
    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
      <TextField
        label="Search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        size="small"
      />
      <Typography variant="body2" color="text.secondary">
        {selectedIds.length}/{max} selected
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Cost {priceFmt(totalSelectedCost)} | Score{" "}
        {totalSelectedScore.toFixed(1)}
      </Typography>
    </Stack>
  )
}
