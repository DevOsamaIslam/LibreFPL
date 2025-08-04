import React, { useState, useEffect } from "react"
import type { IOptimalTeamPlayer, Player } from "../../lib/types"
import { pickOptimalFPLTeamAdvanced } from "../../app/algo"
import { useSettingsStore } from "../../app/settings"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import Checkbox from "@mui/material/Checkbox"
import Grid from "@mui/material/Grid"
import Typography from "@mui/material/Typography"
import Collapse from "@mui/material/Collapse"
import { ExpandLess, ExpandMore } from "@mui/icons-material"

const SquadRatingPage: React.FC = ({}) => {
  // Single combined selection list (starting + bench together)
  const [selectedSquad, setSelectedSquad] = useState<number[]>([])
  const [teamScore, setTeamScore] = useState(0)
  const [openGroups, setOpenGroups] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
  })
  const snapshot = useSettingsStore((state) => state.snapshot)

  const { sortedPlayers: players } = useSettingsStore()

  const calculateScore = () => {
    if (!snapshot) return 0

    // map player id to player object
    const playerMap = new Map<number, IOptimalTeamPlayer>()
    players.forEach((player) => playerMap.set(player.element.id, player))

    // From the combined selectedSquad, derive first 11 as "starting" and rest as "bench" for scoring
    const startingXIPlayers = selectedSquad
      .map((playerId) => playerMap.get(playerId))
      .filter(Boolean)

    let totalScore = 0

    startingXIPlayers.forEach((player) => {
      if (player) {
        const scoredPlayers = pickOptimalFPLTeamAdvanced(snapshot).filter(
          (scoredPlayer) => scoredPlayer.element.id === player.element.id
        )
        if (scoredPlayers.length > 0) {
          totalScore += scoredPlayers[0].score
        }
      }
    })

    return totalScore
  }

  const score = calculateScore()

  const positionLabel: Record<number, string> = {
    1: "Goalkeepers",
    2: "Defenders",
    3: "Midfielders",
    4: "Forwards",
  }

  const groupedPlayers = (players as Array<(typeof players)[number]>).reduce(
    (acc: Record<number, Array<(typeof players)[number]>>, p) => {
      const pos = p.element.element_type as number
      if (!acc[pos]) acc[pos] = []
      acc[pos].push(p)
      return acc
    },
    {}
  )

  return (
    <Grid container spacing={2}>
      <Grid item xs={4}>
        {Object.entries(groupedPlayers).map(([posKey, group]) => {
          const posNum = Number(posKey)
          const isOpen = openGroups[posNum] ?? true
          return (
            <div key={posKey}>
              <ListItemButton
                onClick={() =>
                  setOpenGroups((prev) => ({ ...prev, [posNum]: !isOpen }))
                }>
                <ListItemText primary={positionLabel[posNum] ?? posKey} />
                {isOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse in={isOpen} timeout="auto" unmountOnExit>
                <List dense>
                  {(group as Array<(typeof players)[number]>).map((p) => (
                    <ListItem key={p.element.id} disablePadding>
                      <label htmlFor={p.element.id.toString()}>
                        <ListItemButton>
                          <ListItemIcon>
                            <Checkbox
                              edge="start"
                              id={p.element.id.toString()}
                              checked={selectedSquad.includes(p.element.id)}
                              tabIndex={-1}
                              disabled={
                                selectedSquad.length >= 15 &&
                                !selectedSquad.includes(p.element.id)
                              }
                              onChange={(e) => {
                                const playerId = p.element.id
                                if (e.target.checked) {
                                  setSelectedSquad((prev) => [
                                    ...prev,
                                    playerId,
                                  ])
                                  setTeamScore(teamScore + p.score)
                                } else {
                                  setSelectedSquad((prev) =>
                                    prev.filter((id) => id !== playerId)
                                  )
                                  setTeamScore(teamScore - p.score)
                                }
                              }}
                            />
                          </ListItemIcon>
                          <ListItemText primary={p.element.web_name} />
                        </ListItemButton>
                      </label>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </div>
          )
        })}
      </Grid>
      <Grid item xs={8}>
        <h2>Squad Rating</h2>
        <h3>Score: {teamScore}</h3>
        <h3>Selected Squad ({selectedSquad.length})</h3>
        <List>
          {selectedSquad
            .filter((playerId) => playerId !== 0)
            .map((playerId) => {
              const p = players.find((pp) => pp.element.id === playerId)
              return p ? (
                <ListItem key={p.element.id}>
                  <ListItemText primary={p.element.web_name} />
                </ListItem>
              ) : null
            })}
        </List>
      </Grid>
    </Grid>
  )
}

export default SquadRatingPage
