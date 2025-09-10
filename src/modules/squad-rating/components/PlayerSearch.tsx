import {
  Box,
  Chip,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import React from "react"
import { checkEligibility } from "../../../app/eligibility"
import { TEAM_COLOR, useSettingsStore } from "../../../app/settings"
import SpaceBetween from "../../../components/SpaceBetween"
import {
  PLAYER_SELECTOR_CONST,
  useSearchBase,
} from "../../../hooks/usePlayerSelector"
import {
  type IOptimalTeamPlayer,
  type PositionCount,
  type TeamCount,
} from "../../../lib/types"
import { colorByPos } from "../../../app/settings"

interface PlayerSearchProps {
  players: IOptimalTeamPlayer[]
  selectedSquad: number[]
  max: number
  onToggleCandidate: (player: IOptimalTeamPlayer) => void
  positionCount: PositionCount
  teamCount: TeamCount
  teamCost: number
}

const PlayerSearch: React.FC<PlayerSearchProps> = ({
  players,
  selectedSquad,
  max,
  onToggleCandidate,
  positionCount,
  teamCount,
  teamCost,
}) => {
  const { q, setQ, result } = useSearchBase(players)
  const { teams } = useSettingsStore()

  return (
    <Stack spacing={1.5}>
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        useFlexGap
        flexWrap="wrap">
        <TextField
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={PLAYER_SELECTOR_CONST.searchPlaceholder}
          variant="outlined"
          size="small"
          fullWidth
          sx={{ minWidth: 260, flex: 1 }}
        />
        <Chip
          color={selectedSquad.length <= max ? "primary" : "default"}
          label={`${PLAYER_SELECTOR_CONST.selectedLabel} (${selectedSquad.length}/${max})`}
          sx={{
            fontWeight: (theme) => theme.typography.fontWeightBold ?? 600,
          }}
        />
      </Stack>

      {selectedSquad.length >= max && (
        <Typography variant="caption" color="text.secondary">
          {`${PLAYER_SELECTOR_CONST.addHintPrefix} ${max} players`}
        </Typography>
      )}

      <Paper variant="outlined" sx={{ maxHeight: "70vh", overflow: "auto" }}>
        <List disablePadding>
          {result.map((player, idx) => {
            const chosen = selectedSquad.includes(player.element.id)
            const team = teams.get(player.teamId)
            const { eligible } = checkEligibility({
              selected: selectedSquad,
              candidate: player,
              positionCount,
              teamCount,
              budgetUsed: teamCost,
            })
            const canAddMore = !chosen && selectedSquad.length >= max

            return (
              <Box key={player.element.id}>
                <ListItemButton
                  onClick={() => onToggleCandidate(player)}
                  disabled={(!chosen && canAddMore) || (!chosen && !eligible)}
                  selected={chosen}
                  sx={{
                    "&.Mui-selected": (theme) => ({
                      borderLeft: `3px solid ${theme.palette.primary.main}`,
                      backgroundColor: theme.palette.action.selected as any,
                    }),
                  }}>
                  <ListItemText
                    primary={
                      <SpaceBetween>
                        <Typography fontWeight={600}>
                          {player.element.web_name}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            size="small"
                            label={team?.short_name}
                            sx={{
                              height: 20,
                              "& .MuiChip-label": { px: 0.75 },
                              background: TEAM_COLOR[team?.name || ""],
                              color: "white",
                            }}
                          />
                          <Chip
                            size="small"
                            label={player.position}
                            sx={{
                              height: 20,
                              "& .MuiChip-label": { px: 0.75 },
                              background: colorByPos[player.position],
                              color: "white",
                            }}
                          />
                          <Chip
                            size="small"
                            color="primary"
                            label={`Score: ${player.score.toFixed(0)}`}
                            sx={{
                              height: 20,
                              "& .MuiChip-label": { px: 0.75 },
                              color: "white",
                            }}
                          />
                        </Stack>
                      </SpaceBetween>
                    }
                  />
                </ListItemButton>
                {idx !== result.length - 1 && <Divider component="li" />}
              </Box>
            )
          })}
        </List>
      </Paper>
    </Stack>
  )
}

export default PlayerSearch
