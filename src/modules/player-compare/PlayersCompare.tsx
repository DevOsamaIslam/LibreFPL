import {
  Box,
  Chip,
  Divider,
  Grid,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { colorByPos, TEAM_COLOR } from "../../app/settings"
import PageTitle from "../../components/PageTitle"
import PlayerCard from "../../components/PlayerCard"
import SpaceBetween from "../../components/SpaceBetween"
import {
  label,
  MAX_SELECTED,
  useCompareData,
  usePlayersCompareState,
  useSearch,
} from "./control"

export default function PlayersCompare() {
  const { players, teamsById } = useCompareData()
  const { term, setTerm, result } = useSearch(players)
  const {
    selectedIds,
    selectedPlayers,
    canAddMore,
    togglePlayer,
    removePlayer,
  } = usePlayersCompareState(players)

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2 }}>
      <PageTitle>Player Comparison</PageTitle>
      <Typography variant="h4" fontWeight={700}>
        {label.title}
      </Typography>

      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        useFlexGap
        flexWrap="wrap">
        <TextField
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder={label.searchPlaceholder}
          variant="outlined"
          size="small"
          fullWidth
          sx={{ minWidth: 260, flex: 1 }}
        />
        <Chip
          color={canAddMore ? "primary" : "default"}
          label={`${label.selectedTitle} (${selectedIds.length}/${MAX_SELECTED})`}
          sx={{ fontWeight: 600 }}
        />
      </Stack>

      <Grid container spacing={2}>
        <Grid
          size={{
            xs: 12,
            lg: 4,
            md: 5,
          }}>
          <Stack spacing={1.5}>
            {!canAddMore && (
              <Typography variant="caption" color="text.secondary">
                {label.addHint}
              </Typography>
            )}

            <Paper
              variant="outlined"
              sx={{ maxHeight: "60vh", overflow: "auto" }}>
              <List disablePadding>
                {result.map((player, idx) => {
                  const team = teamsById.get(player.element.team)
                  const chosen = selectedIds.includes(player.element.id)
                  return (
                    <Box key={player.element.id}>
                      <ListItemButton
                        onClick={() => {
                          togglePlayer(player.element.id)
                          setTerm("")
                        }}
                        disabled={!chosen && !canAddMore}
                        selected={chosen}
                        sx={{
                          "&.Mui-selected": (theme) => ({
                            borderLeft: `3px solid ${theme.palette.primary.main}`,
                            backgroundColor: theme.palette.action
                              .selected as any,
                          }),
                        }}>
                        <ListItemText
                          primary={
                            <SpaceBetween>
                              <Typography fontWeight={600}>
                                {player.element.web_name}
                              </Typography>
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center">
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
        </Grid>

        <Grid
          size={{
            xs: 12,
            md: 7,
            lg: 8,
          }}>
          {selectedPlayers.length === 0 ? (
            <Paper
              variant="outlined"
              sx={{
                color: "text.secondary",
                borderStyle: "dashed",
                p: 2,
                borderRadius: 2,
              }}>
              {label.addHint}
            </Paper>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 2,
              }}>
              {selectedPlayers.map((p) => (
                <PlayerCard
                  key={p.element.id}
                  element={p}
                  team={teamsById.get(p.element.team)!}
                  onRemove={() => removePlayer(p.element.id)}
                />
              ))}
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  )
}
