import { Box, Chip, Stack, Typography } from "@mui/material"
import { CURRENCY, useSettingsStore } from "../../app/settings"
import type { SuggestTransfersResult } from "../../app/transfers"
import { priceFmt } from "../../lib/helpers"

interface TransferResultsProps {
  calc: SuggestTransfersResult | null
}

export function TransferResults({ calc }: TransferResultsProps) {
  const { teams } = useSettingsStore()
  if (!calc) {
    return null
  }

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Best Moves ({calc.suggestions.length})
      </Typography>
      {!calc.suggestions.length && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          No beneficial transfer found within your budget and team limits.
        </Typography>
      )}
      <Stack spacing={1}>
        {calc.suggestions.map((s, i) => {
          const outTeam = teams.get(s.out.element.team)
          const inTeam = teams.get(s.in.element.team)
          return (
            <Box
              key={i}
              sx={{
                display: "flex",
                justifyContent: "space-between",
              }}>
              <Typography variant="body2">
                Out {s.out.element.web_name} (
                {outTeam?.short_name ?? outTeam?.name ?? ""}) → In{" "}
                {s.in.element.web_name} (
                {inTeam?.short_name ?? inTeam?.name ?? ""})
              </Typography>
              <Stack direction="row" spacing={1}>
                <Chip
                  size="small"
                  color={s.deltaScore > 0 ? "success" : "default"}
                  label={`+${s.deltaScore.toFixed(2)} pts`}
                />
                <Chip
                  size="small"
                  label={`${CURRENCY}${(s.deltaCost / 10).toFixed(1)}m`}
                  variant="outlined"
                />
              </Stack>
            </Box>
          )
        })}
      </Stack>

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2">
          Total delta score: {calc.totalDeltaScore.toFixed(2)}
        </Typography>
        <Typography variant="body2">
          Used bank: {priceFmt((calc.usedBank || 0) / 10)}m
        </Typography>
        <Typography variant="body2">
          Initial score: {calc.initialScore.toFixed(2)}
        </Typography>
        <Typography variant="body2">
          Final score: {calc.finalScore.toFixed(2)}
        </Typography>
      </Box>
    </Box>
  )
}
