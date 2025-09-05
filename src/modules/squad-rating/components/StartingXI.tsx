import { Grid, Paper, Typography } from "@mui/material"
import React from "react"
import PlayerBox from "../../../components/PlayerBox"
import {
  ARMBAND,
  type Captaincy,
  type IOptimalTeamPlayer,
} from "../../../lib/types"

interface StartingXIProps {
  startersIds: number[]
  players: IOptimalTeamPlayer[]
  captaincy: Captaincy
  selectedIndex: number | null
  tileStyle: (isSelected: boolean) => React.CSSProperties
  onTileClick: (index: number) => void
}

const StartingXI: React.FC<StartingXIProps> = ({
  startersIds,
  players,
  captaincy,
  selectedIndex,
  tileStyle,
  onTileClick,
}) => {
  const renderPositionGroup = (position: string) => (
    <>
      <Typography
        variant="subtitle2"
        sx={{ mb: 1, color: "#2d5016", fontWeight: 600 }}>
        {position === "GK"
          ? "Goalkeeper"
          : position === "DEF"
          ? "Defenders"
          : position === "MID"
          ? "Midfielders"
          : "Forwards"}
      </Typography>
      <Grid
        container
        sx={{ mb: position === "FWD" ? 0 : 2, justifyContent: "space-around" }}>
        {startersIds
          .filter((playerId) => {
            const p = players.find((pp) => pp.element.id === playerId)
            return p && p.position === position
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
    </>
  )

  return (
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
      <Typography variant="h6" sx={{ color: "#1a3d0a", fontWeight: 700 }}>
        Starting XI
      </Typography>

      {renderPositionGroup("GK")}
      {renderPositionGroup("DEF")}
      {renderPositionGroup("MID")}
      {renderPositionGroup("FWD")}
    </Paper>
  )
}

export default StartingXI
