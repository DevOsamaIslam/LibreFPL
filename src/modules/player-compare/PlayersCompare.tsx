import PageTitle from "../../components/PageTitle"
import PlayerCard from "../../components/PlayerCard"
import {
  Box,
  Stack,
  Typography,
  TextField,
  Chip,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Grid,
} from "@mui/material"
import {
  ELEMENT_TYPE,
  MAX_SELECTED,
  label,
  useCompareData,
  usePlayersCompareState,
  useSearch,
} from "./control"
import { priceFmt } from "../../lib/helpers"

export default function PlayersCompare() {
  const { players, teamsById } = useCompareData()
  const { q, setQ, result } = useSearch(players)
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
          value={q}
          onChange={(e) => setQ(e.target.value)}
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
                {result.map((p, idx) => {
                  const t = teamsById.get(p.element.team)
                  const chosen = selectedIds.includes(p.element.id)
                  return (
                    <Box key={p.element.id}>
                      <ListItemButton
                        onClick={() => togglePlayer(p.element.id)}
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
                            <Typography fontWeight={600}>
                              {p.element.web_name}
                            </Typography>
                          }
                          secondary={
                            <Typography
                              variant="caption"
                              color="text.secondary">
                              {(t?.short_name ?? t?.name ?? "-") +
                                " • " +
                                ELEMENT_TYPE[p.element.element_type] +
                                " • £" +
                                priceFmt(p.element.now_cost)}
                            </Typography>
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
                  team={teamsById.get(p.element.team)}
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
