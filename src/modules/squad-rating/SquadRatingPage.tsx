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
import Grid from "@mui/material/Grid"
import React, { useCallback, useEffect } from "react"
import { checkEligibility } from "../../app/eligibility"
import { colorByPos, TEAM_COLOR, useSettingsStore } from "../../app/settings"
import PageTitle from "../../components/PageTitle"
import PlayerBox from "../../components/PlayerBox"
import {
  PLAYER_SELECTOR_CONST,
  usePlayerSelector,
  useSearchBase,
} from "../../hooks/usePlayerSelector"
import { useSavedSquads } from "../../hooks/useSavedSquads"
import {
  ARMBAND,
  type IOptimalTeamPlayer,
  type PositionCount,
  type TeamCount,
} from "../../lib/types"
import useSquadRating from "./useSquadRating"
import SpaceBetween from "../../components/SpaceBetween"

const SquadRatingPage: React.FC = ({}) => {
  const { sortedPlayers: players, teams } = useSettingsStore()
  const {
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
    teamCost,
  } = useSquadRating({
    players,
  })

  // Reusable selection and search, like PlayersCompare
  const { selectedIds, setSelectedIds, togglePlayer, max } = usePlayerSelector({
    players,
  })

  const { SavedSquadSelector, activeSquad, setActiveSquad } = useSavedSquads()

  useEffect(() => {
    if (activeSquad) setSelectedSquad(activeSquad.playerIds)
  }, [activeSquad])

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
  useEffect(() => {
    if (selectedIds.join(",") !== selectedSquad.join(",")) {
      setSelectedIds(selectedSquad)
      setActiveSquad({
        title: "",
        description: "",
        playerIds: selectedSquad,
        updatedAt: new Date().toString(),
      })
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
    <Grid container spacing={2} pb={4}>
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
            sx={{ maxHeight: "70vh", overflow: "auto" }}>
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

      {/* Right panel — Selected squad and swap interaction */}
      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <Stack gap={1}>
          <SavedSquadSelector />

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
                    fontWeight: (theme) =>
                      theme.typography.fontWeightBold ?? 700,
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
                    fontWeight: (theme) =>
                      theme.typography.fontWeightBold ?? 700,
                  }}
                />
              </Stack>
            </Stack>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 1.25 }}>
              Tip: Click a player, then click another to swap their positions
              (works across Starting XI and Bench). Click the same player again
              to cancel selection.
            </Typography>
          </Paper>

          {/* Starting XI with position hierarchy */}
          <Typography variant="h6" sx={{ color: "#1a3d0a", fontWeight: 700 }}>
            Starting XI
          </Typography>
          <Paper
            variant="outlined"
            sx={{
              mb: 3,
              p: 2,
              background:
                "repeating-linear-gradient(0deg, #a8e063, #a8e063 100px, #7cb342 100px, #7cb342 200px)",
              border: "2px solid #4a7c2e",
              borderRadius: 2,
            }}>
            {/* Goalkeeper */}
            <Typography
              variant="subtitle2"
              sx={{ mb: 1, color: "#2d5016", fontWeight: 600 }}>
              Goalkeeper
            </Typography>
            <Grid container sx={{ mb: 2, justifyContent: "space-around" }}>
              {startersIds
                .filter((playerId) => {
                  const p = players.find((pp) => pp.element.id === playerId)
                  return p && p.position === "GK"
                })
                .map((playerId) => {
                  const p = players.find((pp) => pp.element.id === playerId)
                  if (!p) return null
                  const combinedIndex = startersIds.indexOf(playerId)
                  const isSelected = selectedIndex === combinedIndex
                  const isCaptain = captaincy?.captainId === playerId
                  const isVice = captaincy?.viceCaptainId === playerId
                  return (
                    <Grid
                      key={p.element.id}
                      data-id={p.element.id}
                      size={{ xs: 12, sm: 2.4, md: 2.4 }}
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

            {/* Defenders */}
            <Typography
              variant="subtitle2"
              sx={{ mb: 1, color: "#2d5016", fontWeight: 600 }}>
              Defenders
            </Typography>
            <Grid container sx={{ mb: 2, justifyContent: "space-around" }}>
              {startersIds
                .filter((playerId) => {
                  const p = players.find((pp) => pp.element.id === playerId)
                  return p && p.position === "DEF"
                })
                .map((playerId) => {
                  const p = players.find((pp) => pp.element.id === playerId)
                  if (!p) return null
                  const combinedIndex = startersIds.indexOf(playerId)
                  const isSelected = selectedIndex === combinedIndex
                  const isCaptain = captaincy?.captainId === playerId
                  const isVice = captaincy?.viceCaptainId === playerId
                  return (
                    <Grid
                      key={p.element.id}
                      data-id={p.element.id}
                      size={{ xs: 12, sm: 2.4, md: 2.4 }}
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

            {/* Midfielders */}
            <Typography
              variant="subtitle2"
              sx={{ mb: 1, color: "#2d5016", fontWeight: 600 }}>
              Midfielders
            </Typography>
            <Grid container sx={{ mb: 2, justifyContent: "space-around" }}>
              {startersIds
                .filter((playerId) => {
                  const p = players.find((pp) => pp.element.id === playerId)
                  return p && p.position === "MID"
                })
                .map((playerId) => {
                  const p = players.find((pp) => pp.element.id === playerId)
                  if (!p) return null
                  const combinedIndex = startersIds.indexOf(playerId)
                  const isSelected = selectedIndex === combinedIndex
                  const isCaptain = captaincy?.captainId === playerId
                  const isVice = captaincy?.viceCaptainId === playerId
                  return (
                    <Grid
                      key={p.element.id}
                      data-id={p.element.id}
                      size={{ xs: 12, sm: 2.4, md: 2.4 }}
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

            {/* Forwards */}
            <Typography
              variant="subtitle2"
              sx={{ mb: 1, color: "#2d5016", fontWeight: 600 }}>
              Forwards
            </Typography>
            <Grid container sx={{ justifyContent: "space-around" }}>
              {startersIds
                .filter((playerId) => {
                  const p = players.find((pp) => pp.element.id === playerId)
                  return p && p.position === "FWD"
                })
                .map((playerId) => {
                  const p = players.find((pp) => pp.element.id === playerId)
                  if (!p) return null
                  const combinedIndex = startersIds.indexOf(playerId)
                  const isSelected = selectedIndex === combinedIndex
                  const isCaptain = captaincy?.captainId === playerId
                  const isVice = captaincy?.viceCaptainId === playerId
                  return (
                    <Grid
                      key={p.element.id}
                      data-id={p.element.id}
                      size={{ xs: 12, sm: 2.4, md: 2.4 }}
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
          </Paper>

          {/* Bench section */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              backgroundColor: "rgba(240, 240, 240, 0.95)",
              border: "2px solid #8b8b8b",
              borderRadius: 2,
            }}>
            <Typography
              variant="h6"
              sx={{ mb: 2, color: "#4a4a4a", fontWeight: 700 }}>
              Bench
            </Typography>
            <Grid container spacing={1} sx={{ justifyContent: "space-around" }}>
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
                    size={{ xs: 12, sm: 2.4, md: 2.4 }}
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
          </Paper>
        </Stack>
      </Grid>
    </Grid>
  )
}

export default SquadRatingPage
