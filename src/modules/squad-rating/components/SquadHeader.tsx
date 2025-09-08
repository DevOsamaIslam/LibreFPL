import { Chip, Paper, Stack, Typography } from "@mui/material"
import React from "react"

interface SquadHeaderProps {
  teamScore: number
  xiScore: number
  benchScore: number
  xPoints: number | null
}

const SquadHeader: React.FC<SquadHeaderProps> = ({
  teamScore,
  xiScore,
  benchScore,
  xPoints,
}) => {
  return (
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
            color="warning"
            variant="filled"
            label={`xPoints: ${xPoints?.toFixed(0) || 0.0}`}
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
        Tip: Click a player, then click another to swap their positions (works
        across Starting XI and Bench). Click the same player again to cancel
        selection.
      </Typography>
    </Paper>
  )
}

export default SquadHeader
