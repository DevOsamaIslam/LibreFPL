import { Button, Chip, Stack, Typography } from "@mui/material"
import type { IOptimalTeamPlayer } from "../../lib/types"
import { priceFmt } from "../../hooks/usePlayerSelector"

interface PlayerRowProps {
  p: IOptimalTeamPlayer
  onClick: () => void
  selected: boolean
  teamName: string
  teamShort: string
}

export function PlayerRow({
  p,
  onClick,
  selected,
  teamName,
  teamShort,
}: PlayerRowProps) {
  return (
    <Button
      onClick={onClick}
      variant={selected ? "contained" : "text"}
      color={selected ? "primary" : "inherit"}
      sx={{
        justifyContent: "space-between",
        textTransform: "none",
        px: 1.5,
        py: 1,
        borderRadius: 1,
      }}>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ overflow: "hidden" }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {p.element.web_name}
        </Typography>
        <Chip size="small" label={p.position} />
        <Chip size="small" variant="outlined" label={teamShort || teamName} />
        <Typography variant="caption" color="text.secondary">
          {teamName}
        </Typography>
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="caption">Score {p.score.toFixed(1)}</Typography>
        <Chip size="small" label={`${priceFmt(p.element.now_cost)}`} />
      </Stack>
    </Button>
  )
}
