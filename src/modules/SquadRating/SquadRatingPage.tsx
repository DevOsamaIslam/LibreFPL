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
import {
  ARMBAND,
  type IOptimalTeamPlayer,
  type PositionCount,
  type TeamCount,
} from "../../lib/types"

const SquadRatingPage: React.FC = ({}) => {
  const { sortedPlayers: players } = useSettingsStore()
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
  } = useSquadRating({
    players,
  })

  // Reusable selection and search, like PlayersCompare
  const { selectedIds, setSelectedIds, togglePlayer, max } = usePlayerSelector({
    players,
  })

  const { q, setQ, result } = useSearchBase(players)

  const positionCount = React.useMemo(() => {
    const counts: PositionCount = { GK: 0, DEF: 0, MID: 0, FWD: 0 }
    // get players from selectedIds
    const selectedPlayers = selectedIds
      .map((id) => players.find((p) => p.element.id === id))
      .filter(Boolean) as IOptimalTeamPlayer[]

    selectedPlayers.forEach((p) => {
      counts[p.position] += 1
    })
    return counts
  }, [selectedIds])

  const teamCount = React.useMemo(() => {
    const counts: TeamCount = {}
    selectedIds.forEach((id) => {
      const player = players.find((p) => p.element.id === id)
      if (!player) return
      counts[player.teamId] = (counts[player.teamId] ?? 0) + 1
    })
    return counts
  }, [selectedIds])

  // Sync hook with URL-driven state
  useMemo(() => {
    if (selectedIds.join(",") !== selectedSquad.join(",")) {
      setSelectedIds(selectedSquad)
    }
  }, [selectedIds, selectedSquad, setSelectedIds])

  const onToggleCandidate = useCallback(
    (p: (typeof players)[number]) => {
      // preserve eligibility-based disabling
      // const { eligible } = checkEligibility({
      //   selected: selectedSquad,
      //   candidate: p,
      //   positionCount,
      //   teamCount,
      //   budgetUsed: selectedSquad
      //     .map((id) => players.find((pp) => pp.element.id === id))
      //     .filter(Boolean)
      //     .reduce((sum, pp) => sum + (pp as typeof p).element.now_cost, 0),
      // })

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
              {result.map((player, idx) => {
                const chosen = selectedSquad.includes(player.element.id)
                const { eligible, reasons } = checkEligibility({
                  selected: selectedSquad,
                  candidate: player,
                  positionCount,
                  teamCount,
                  budgetUsed: selectedSquad
                    .map((id) => players.find((pp) => pp.element.id === id))
                    .filter(Boolean)
                    .reduce(
                      (sum, pp) => sum + (pp as typeof player).element.now_cost,
                      0
                    ),
                })
                const canAddMore = !chosen && selectedSquad.length >= max

                return (
                  <Box key={player.element.id}>
                    <ListItemButton
                      onClick={() => onToggleCandidate(player)}
                      disabled={
                        (!chosen && canAddMore) || (!chosen && !eligible)
                      }
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
                            {player.element.web_name}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {teamMap.get(player.element.team)?.name ?? "-"} •{" "}
                            {
                              ["", "GK", "DEF", "MID", "FWD"][
                                player.element.element_type
                              ]
                            }{" "}
                            • {player.score.toFixed(0)}
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
                color="success"
                variant="filled"
                label={`XI Score: ${xiScore.toFixed(0)}`}
                sx={(theme) => ({
                  fontWeight: theme.typography.fontWeightBold ?? 700,
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
                <PlayerBox
                  player={p}
                  armband={
                    isCaptain
                      ? ARMBAND.CAPTAIN
                      : isVice
                      ? ARMBAND.VICE
                      : undefined
                  }
                />
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
            const combinedIndex = 11 + bIdx
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
                <PlayerBox
                  player={p}
                  armband={
                    isCaptain
                      ? ARMBAND.CAPTAIN
                      : isVice
                      ? ARMBAND.VICE
                      : undefined
                  }
                />
              </Grid>
            )
          })}
        </Grid>
      </Grid>
    </Grid>
  )
}

export default SquadRatingPage
