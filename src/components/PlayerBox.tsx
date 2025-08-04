import { Box, Card, CardContent, Stack, Typography } from "@mui/material"
import type { IOptimalTeamPlayer } from "../lib/types"

interface PlayerBoxProps {
  player: IOptimalTeamPlayer
  position?: string
  team?: string
}

function PlayerBox({ player, position }: PlayerBoxProps) {
  return (
    <Card
      sx={{
        minWidth: 200,
        margin: "10px",
        background: (theme) => theme.palette.primary.light,
        border: "black",
        color: "white",
      }}>
      <CardContent>
        <Stack>
          <Typography variant="h6" component="div">
            {player.element.web_name} - {position}
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2">
              Price: £{player.element.now_cost / 10}m
            </Typography>
            <Typography variant="body2">
              Score: {player.score.toFixed(0)}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2">
              Starts: {(player.element.starts / 0.38).toFixed(0)}%
            </Typography>
            <Typography variant="body2">
              Minutes: {(player.element.minutes / 38).toFixed(0)}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default PlayerBox
