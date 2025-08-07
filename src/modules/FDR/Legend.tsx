import { Stack, Box, Typography } from "@mui/material"
import { COLOR_STOPS } from "./fdrAlgo"

const Legend: React.FC = () => {
  return (
    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
      {COLOR_STOPS.map((s) => (
        <Stack key={s.stop} direction="row" spacing={0.75} alignItems="center">
          <Box
            sx={{
              width: 20,
              height: 12,
              bgcolor: s.color,
              borderRadius: 0.75,
              border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          />
          <Typography variant="caption">{s.stop}</Typography>
        </Stack>
      ))}
    </Stack>
  )
}

export default Legend
