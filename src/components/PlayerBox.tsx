import { Box, Card, CardContent, Typography } from "@mui/material"
import type { Player } from "../lib/types"

interface PlayerBoxProps {
  player: Player
  position: string
  team: string
}

function PlayerBox({ player, position, team }: PlayerBoxProps) {
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
        <Typography variant="h6" component="div">
          {player.web_name}
        </Typography>
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          {team} - {position}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="body2">
            Price: £{player.now_cost / 10}m
          </Typography>
          <Typography variant="body2">Score: {player.event_points}</Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default PlayerBox
