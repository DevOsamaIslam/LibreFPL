import { Grid, Paper, Typography } from "@mui/material"
import React from "react"
import PlayerBox from "../../../components/PlayerBox"
import {
  ARMBAND,
  type Captaincy,
  type IOptimalTeamPlayer,
} from "../../../lib/types"

interface BenchProps {
  benchIds: number[]
  players: IOptimalTeamPlayer[]
  captaincy: Captaincy
  selectedIndex: number | null
  tileStyle: (isSelected: boolean) => React.CSSProperties
  onTileClick: (index: number) => void
}

const Bench: React.FC<BenchProps> = ({
  benchIds,
  players,
  captaincy,
  selectedIndex,
  tileStyle,
  onTileClick,
}) => {
  return (
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
  )
}

export default Bench
