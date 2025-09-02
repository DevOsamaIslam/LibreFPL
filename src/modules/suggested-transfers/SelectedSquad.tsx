import { Box } from "@mui/material"
import type { IOptimalTeamPlayer } from "../../lib/types"
import { SelectedChip } from "./SelectedChip"
import { useSettingsStore } from "../../app/settings"

interface SelectedSquadProps {
  selectedPlayers: IOptimalTeamPlayer[]
  removePlayer: (id: number) => void
}

export function SelectedSquad({
  selectedPlayers,
  removePlayer,
}: SelectedSquadProps) {
  const { teams } = useSettingsStore()

  return (
    <Box>
      {selectedPlayers.map((p) => {
        const t = teams.get(p.element.team)
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
