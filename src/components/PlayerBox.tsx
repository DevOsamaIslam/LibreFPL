import {
  Avatar,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Divider,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material"
import { useMemo } from "react"
import { getTeamFDR } from "../app/fdrAlgo"
import {
  colorByPos,
  DONE_GWS,
  TEAM_COLOR,
  type TeamName,
} from "../app/settings"
import { ARMBAND, type Armband, type IOptimalTeamPlayer } from "../lib/types"
import Cell from "./Cell"
import SpaceBetween from "./SpaceBetween"

interface PlayerBoxProps {
  player: IOptimalTeamPlayer
  armband?: Armband
}

function formatMillion(value: number) {
  return `£${(value / 10).toFixed(1)}m`
}

function PlayerBox({ player, armband }: PlayerBoxProps) {
  const price = player.element.now_cost
  const score = player.score
  const minutesPlayed = player.element.minutes
  const startsPct = (player.element.starts / DONE_GWS.length) * 100 // original calc kept for parity
  const minutesAvg = minutesPlayed / (player.element.starts || 1)

  const pos = player.position
  const name = player.element.web_name

  // visual scales
  const startsClamped = Math.max(0, Math.min(100, Number(startsPct.toFixed(0))))
  const minutesClamped = Math.max(
    0,
    Math.min(90, Number(minutesAvg.toFixed(0)))
  )

  const FDR = useMemo(() => {
    return getTeamFDR(player.teamId, { span: 6 })
  }, [])

  return (
    <Card
      elevation={3}
      sx={(theme) => ({
        minWidth: 260,
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        position: "relative",
      })}>
      {/* Optional captaincy badge */}
      {armband && (
        <Box
          sx={(theme) => ({
            position: "absolute",
            top: theme.spacing(1),
            right: theme.spacing(1),
            bgcolor: armband === ARMBAND.CAPTAIN ? "warning.main" : "info.main",
            color:
              armband === ARMBAND.CAPTAIN
                ? "warning.contrastText"
                : "info.contrastText",
            px: 0.75,
            py: 0.25,
            borderRadius: theme.shape.borderRadius,
            fontSize: theme.typography.pxToRem
              ? theme.typography.pxToRem(12)
              : 12,
            fontWeight: theme.typography.fontWeightBold ?? 700,
            zIndex: theme.zIndex.appBar - 1,
          })}>
          {armband}
        </Box>
      )}
      <CardActionArea disableRipple>
        <CardContent sx={{ p: 2 }}>
          <Stack spacing={1.25}>
            {/* Header */}
            <Stack direction="row" alignItems="center" spacing={1.25}>
              <Avatar
                alt={name}
                sx={(_theme) => ({
                  width: 36,
                  height: 36,
                  bgcolor: TEAM_COLOR[player.teamName as TeamName],
                  color: "white",
                  fontSize: 14,
                  fontWeight: 700,
                })}>
                {player.teamName.slice(0, 3).toUpperCase()}
              </Avatar>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="subtitle1"
                  noWrap
                  sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  {name}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    size="small"
                    label={pos}
                    sx={{
                      height: 22,
                      fontWeight: 600,
                      background: colorByPos[pos],
                      color: "white",
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {formatMillion(price)}
                  </Typography>
                </Stack>
              </Box>

              <Stack
                direction={"row"}
                spacing={0.5}
                aria-label="Score"
                alignItems={"baseline"}
                sx={{
                  textAlign: "right",
                  minWidth: 64,
                  paddingRight: 2,
                }}>
                <Typography variant="caption" color="text.secondary">
                  Score
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800, lineHeight: 1 }}>
                  {score.toFixed(0)}
                </Typography>
              </Stack>
            </Stack>

            <Divider flexItem />

            {/* Stats */}
            <Stack spacing={1}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center">
                <Typography variant="caption" color="text.secondary">
                  Starts
                </Typography>
                <Tooltip title={`${startsClamped}%`} arrow>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      minWidth: 120,
                    }}>
                    <LinearProgress
                      variant="determinate"
                      value={startsClamped}
                      sx={(theme) => ({
                        width: 110,
                        height: 8,
                        borderRadius: 999,
                        bgcolor: theme.palette.action.hover,
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 999,
                        },
                      })}
                    />
                    <Typography
                      variant="caption"
                      sx={{ width: 28, textAlign: "right" }}>
                      {startsClamped}%
                    </Typography>
                  </Box>
                </Tooltip>
              </Stack>

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center">
                <Typography variant="caption" color="text.secondary">
                  Minutes (avg)
                </Typography>
                <Tooltip title={`${minutesClamped} min`} arrow>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      minWidth: 120,
                    }}>
                    <LinearProgress
                      variant="determinate"
                      value={(minutesClamped / 90) * 100}
                      sx={(theme) => ({
                        width: 110,
                        height: 8,
                        borderRadius: 999,
                        bgcolor: theme.palette.action.hover,
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 999,
                        },
                      })}
                    />
                    <Typography
                      variant="caption"
                      sx={{ width: 28, textAlign: "right" }}>
                      {minutesClamped}
                    </Typography>
                  </Box>
                </Tooltip>
              </Stack>
              <SpaceBetween>
                <Chip
                  label={`xPoints: ${player.xPoints.toFixed(0)}`}
                  size="small"
                />
                {FDR.teamFDR.map((score, gw) => (
                  <Cell
                    key={gw}
                    score={score.score}
                    label={`${score.score.toFixed(2)} - ${
                      score.opponent.short_name
                    } (${score.isHome ? "H" : "A"})`}
                  />
                ))}
                <Cell
                  score={FDR.average}
                  label={FDR.average.toFixed(2)}
                  showLabel
                />
              </SpaceBetween>
            </Stack>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

export default PlayerBox
