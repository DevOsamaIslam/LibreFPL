import { Box } from "@mui/material"
import type { IOptimalTeamPlayer } from "../../lib/types"
import { SelectedChip } from "./SelectedChip"

interface SelectedSquadProps {
  selectedPlayers: IOptimalTeamPlayer[]
  teamsById: Map<number, any>
  removePlayer: (id: number) => void
}

export function SelectedSquad({
  selectedPlayers,
  teamsById,
  removePlayer,
}: SelectedSquadProps) {
  return (
    <Box>
      {selectedPlayers.map((p) => {
        const t = teamsById.get(p.element.team)
        return (
          <SelectedChip
            key={p.element.id}
            p={p}
            onRemove={() => removePlayer(p.element.id)}
            teamName={t?.name ?? ""}
            teamShort={t?.short_name ?? ""}
          />
        )
      })}
    </Box>
  )
}
