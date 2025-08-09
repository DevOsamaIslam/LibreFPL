import { Stack, Box, Typography } from "@mui/material"
import { interpolateColor } from "../../app/fdrAlgo"

const Legend: React.FC = () => {
  // Create gradient stops for continuous gradient
  const gradientStops: { stop: string; color: string }[] = []
  for (let i = 1; i <= 5; i += 0.5) {
    gradientStops.push({
      stop: i.toFixed(1),
      color: interpolateColor(i),
    })
  }

  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      {/* Start label */}
      <Typography variant="caption">1</Typography>

      {/* Continuous gradient bar */}
      <Box
        sx={{
          width: 200,
          height: 12,
          background: `linear-gradient(to right, ${gradientStops
            .map((stop) => stop.color)
            .join(", ")})`,
          borderRadius: 0.75,
          border: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      />

      {/* End label */}
      <Typography variant="caption">5</Typography>
    </Stack>
  )
}

export default Legend
