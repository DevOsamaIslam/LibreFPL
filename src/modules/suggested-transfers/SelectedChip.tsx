import { Chip } from "@mui/material"
import type { IOptimalTeamPlayer } from "../../lib/types"
import { priceFmt } from "../../hooks/usePlayerSelector"

interface SelectedChipProps {
  p: IOptimalTeamPlayer
  onRemove: () => void
  teamName: string
  teamShort: string
}

export function SelectedChip({
  p,
  onRemove,
  teamName,
  teamShort,
}: SelectedChipProps) {
  return (
    <Chip
      label={`${p.element.web_name} (${p.position}) ${priceFmt(
        p.element.now_cost
      )} – ${teamShort || teamName}`}
      onDelete={onRemove}
      color="primary"
      variant="outlined"
      sx={{ mr: 1, mb: 1 }}
    />
  )
}
