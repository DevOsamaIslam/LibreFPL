import React, { useMemo, useCallback } from "react"
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
} from "@mui/material"
import Grid from "@mui/material/Grid"
import { useSettingsStore } from "../../app/settings"
import { checkEligibility } from "../../app/eligibility"
import PageTitle from "../../components/PageTitle"
import PlayerBox from "../../components/PlayerBox"
import useSquadRating from "./useSquadRating"
import {
  usePlayerSelector,
  PLAYER_SELECTOR_CONST,
  useSearchBase,
} from "../../hooks/usePlayerSelector"

const SquadRatingPage: React.FC = ({}) => {
  const { sortedPlayers: players } = useSettingsStore()
  const controller = useSquadRating({
    players,
  })
  const {
    teamMap,
    startersIds,
    benchIds,
    selectedSquad,
    selectedIndex,
    tileStyle,
    onTileClick,
    teamScore,
    setSelectedSquad,
    setTeamScore,
    xiScore,
    benchScore,
    captaincy,
  } = controller

  // Reusable selection and search, like PlayersCompare
  const { selectedIds, setSelectedIds, togglePlayer, max } = usePlayerSelector({
    players,
  })
  const { q, setQ, result } = useSearchBase(players)

  // Sync hook with URL-driven state
  useMemo(() => {
    if (selectedIds.join(",") !== selectedSquad.join(",")) {
      setSelectedIds(selectedSquad)
    }
  }, [selectedIds, selectedSquad, setSelectedIds])

  const onToggleCandidate = useCallback(
    (p: (typeof players)[number]) => {
      // preserve eligibility-based disabling
      const { eligible } = checkEligibility({
        selected: selectedSquad,
        candidate: p,
        allPlayers: players,
        budgetUsed: selectedSquad
          .map((id) => players.find((pp) => pp.element.id === id))
          .filter(Boolean)
          .reduce((sum, pp) => sum + (pp as typeof p).element.now_cost, 0),
      })
      if (!eligible) return

      const already = selectedSquad.includes(p.element.id)
      if (already) {
        const next = selectedSquad.filter((id) => id !== p.element.id)
        setSelectedSquad(next)
        setTeamScore(teamScore - p.score)
        togglePlayer(p.element.id)
      } else {
        const next = [...selectedSquad, p.element.id]
        setSelectedSquad(next)
        setTeamScore(teamScore + p.score)
        togglePlayer(p.element.id)
      }
    },
    [
      players,
      selectedSquad,
      teamScore,
      setSelectedSquad,
      setTeamScore,
      togglePlayer,
    ]
  )

  return (
    <Grid container spacing={2}>
      <PageTitle>Squad Rating</PageTitle>

      <Grid size={{ xs: 12, lg: 4, md: 5 }}>
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

          <Paper
            variant="outlined"
            sx={{ maxHeight: "60vh", overflow: "auto" }}>
            <List disablePadding>
              {result.map((p, idx) => {
                const chosen = selectedSquad.includes(p.element.id)
                const { eligible } = checkEligibility({
                  selected: selectedSquad,
                  candidate: p,
                  allPlayers: players,
                  budgetUsed: selectedSquad
                    .map((id) => players.find((pp) => pp.element.id === id))
                    .filter(Boolean)
                    .reduce(
                      (sum, pp) => sum + (pp as typeof p).element.now_cost,
                      0
                    ),
                })
                const canAddMore = !chosen && selectedSquad.length >= max

                return (
                  <Box key={p.element.id}>
                    <ListItemButton
                      onClick={() => onToggleCandidate(p)}
                      disabled={(!chosen && canAddMore) || !eligible}
                      selected={chosen}
                      sx={{
                        "&.Mui-selected": (theme) => ({
                          borderLeft: `3px solid ${theme.palette.primary.main}`,
                          backgroundColor: theme.palette.action.selected as any,
                        }),
                      }}>
                      <ListItemText
                        primary={
                          <Typography
                            fontWeight={(theme) =>
                              theme.typography.fontWeightBold ?? 600
                            }>
                            {p.element.web_name}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {teamMap.get(p.element.team)?.name ?? "-"} •{" "}
                            {
                              ["", "GK", "DEF", "MID", "FWD"][
                                p.element.element_type
                              ]
                            }{" "}
                            • {p.score.toFixed(0)}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                    {idx !== result.length - 1 ? (
                      <Divider component="li" />
                    ) : null}
                  </Box>
                )
              })}
            </List>
          </Paper>
        </Stack>
      </Grid>

      {/* Right panel — Selected squad and swap interaction */}
      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            mb: 2,
            borderRadius: 2,
          }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            useFlexGap
            spacing={1.5}>
            {/* Title + Subtitle */}
            <Stack minWidth={200}>
              <Typography
                variant="h5"
                fontWeight={(theme) => theme.typography.fontWeightBold ?? 700}
                lineHeight={1.2}>
                Squad Rating
              </Typography>
            </Stack>

            {/* Score and quick chips */}
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              useFlexGap>
              <Chip
                color="info"
                variant="filled"
                label={`Team Score: ${teamScore.toFixed(0)}`}
                sx={{
                  fontWeight: (theme) => theme.typography.fontWeightBold ?? 700,
                }}
              />
              <Chip
                color="primary"
                variant="filled"
                label={`XI Score: ${xiScore.toFixed(0)}`}
                sx={(theme) => ({
                  fontWeight: theme.typography.fontWeightBold ?? 700,
                  color: theme.palette.primary.contrastText,
                })}
              />
              <Chip
                color="secondary"
                variant="filled"
                label={`Bench Score: ${benchScore.toFixed(0)}`}
                sx={{
                  fontWeight: (theme) => theme.typography.fontWeightBold ?? 700,
                }}
              />
              {(() => {
                const cap = players.find(
                  (pp) => pp.element.id === captaincy?.captainId
                )
                const vice = players.find(
                  (pp) => pp.element.id === captaincy?.viceCaptainId
                )
                const capName = cap?.element.web_name ?? "-"
                const viceName = vice?.element.web_name ?? "-"
                return (
                  <Chip
                    color="warning"
                    variant="outlined"
                    label={`C: ${capName} • VC: ${viceName}`}
                    sx={{
                      fontWeight: (theme) =>
                        theme.typography.fontWeightBold ?? 700,
                    }}
                  />
                )
              })()}
              <Chip
                color={selectedSquad.length <= max ? "info" : "default"}
                variant="outlined"
                label={`Players: ${selectedSquad.length}/${max}`}
              />
            </Stack>
          </Stack>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 1.25 }}>
            Tip: Click a player, then click another to swap their positions
            (works across Starting XI and Bench). Click the same player again to
            cancel selection.
          </Typography>
        </Paper>

        <Typography variant="h6" sx={{ mb: 1 }}>
          Starting XI
        </Typography>
        <Grid container spacing={2}>
          {startersIds.map((playerId, idx) => {
            const p = players.find((pp) => pp.element.id === playerId)
            if (!p) return null
            const team = teamMap.get(p.element.team)
            const combinedIndex = idx
            const isSelected = selectedIndex === combinedIndex
            const isCaptain = captaincy?.captainId === playerId
            const isVice = captaincy?.viceCaptainId === playerId
            return (
              <Grid
                key={p.element.id}
                data-id={p.element.id}
                size={{ xs: 12, sm: 6, md: 4 }}
                sx={tileStyle(isSelected)}
                onClick={() => onTileClick(combinedIndex)}>
                <Box sx={{ position: "relative" }}>
                  {isCaptain ? (
                    <Box
                      sx={(theme) => ({
                        position: "absolute",
                        top: theme.spacing(1),
                        right: theme.spacing(1),
                        bgcolor: "warning.main",
                        color: "warning.contrastText",
                        px: 0.75,
                        py: 0.25,
                        borderRadius: theme.shape.borderRadius,
                        fontSize: theme.typography.pxToRem
                          ? theme.typography.pxToRem(12)
                          : 12,
                        fontWeight: theme.typography.fontWeightBold ?? 700,
                        zIndex: theme.zIndex.appBar - 1,
                      })}>
                      C
                    </Box>
                  ) : null}
                  {!isCaptain && isVice && (
                    <Box
                      sx={(theme) => ({
                        position: "absolute",
                        top: theme.spacing(1),
                        right: theme.spacing(1),
                        bgcolor: "info.main",
                        color: "info.contrastText",
                        px: 0.75,
                        py: 0.25,
                        borderRadius: theme.shape.borderRadius,
                        fontSize: theme.typography.pxToRem
                          ? theme.typography.pxToRem(12)
                          : 12,
                        fontWeight: theme.typography.fontWeightBold ?? 700,
                        zIndex: theme.zIndex.appBar - 1,
                      })}>
                      VC
                    </Box>
                  )}
                  <PlayerBox player={p} team={team?.name} />
                </Box>
              </Grid>
            )
          })}
        </Grid>

        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          Bench
        </Typography>
        <Grid container spacing={2}>
          {benchIds.map((playerId, bIdx) => {
            const p = players.find((pp) => pp.element.id === playerId)
            if (!p) return null
            const team = teamMap.get(p.element.team)
            const combinedIndex = 11 + bIdx
            const isSelected = selectedIndex === combinedIndex
            return (
              <Grid
                key={p.element.id}
                data-id={p.element.id}
                size={{ xs: 12, sm: 6, md: 4 }}
                sx={tileStyle(isSelected)}
                onClick={() => onTileClick(combinedIndex)}>
                <PlayerBox player={p} team={team?.name} />
              </Grid>
            )
          })}
        </Grid>
      </Grid>
    </Grid>
  )
}

export default SquadRatingPage
