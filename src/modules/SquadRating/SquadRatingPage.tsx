import React from "react"
import Checkbox from "@mui/material/Checkbox"
import Collapse from "@mui/material/Collapse"
import Grid from "@mui/material/Grid"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import { useSettingsStore } from "../../app/settings"
import { checkEligibility } from "../../app/eligibility"
import { useSearchParams } from "react-router"
import PageTitle from "../../components/PageTitle"
import PlayerBox from "../../components/PlayerBox"
import useSquadRating from "./useSquadRating"

const SquadRatingPage: React.FC = ({}) => {
  const { sortedPlayers: players, snapshot } = useSettingsStore()
  const teams = snapshot?.teams
  const controller = useSquadRating({
    players,
    teams,
    useSearchParams,
  })
  const {
    positionLabel,
    groupedPlayers,
    teamMap,
    startersIds,
    benchIds,
    selectedSquad,
    selectedIndex,
    tileStyle,
    onTileClick,
    teamScore,
    setSelectedSquad,
    setTeamScore,
    openGroups,
    setOpenGroups,
  } = controller

  return (
    <Grid container spacing={2}>
      <PageTitle>Squad Rating</PageTitle>
      <Grid size={4}>
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
              </ListItemButton>
              <Collapse in={isOpen} timeout="auto" unmountOnExit>
                <List dense>
                  {group.map((p) => {
                    const { eligible } = checkEligibility({
                      selected: selectedSquad,
                      candidate: p,
                      allPlayers: players,
                      budgetUsed: selectedSquad
                        .map((id) => players.find((pp) => pp.element.id === id))
                        .filter(Boolean)
                        .reduce(
                          (sum, pp) => sum + (pp as typeof p).element.now_cost,
                          0
                        ),
                    })

                    return (
                      <ListItem key={p.element.id} disablePadding>
                        <label htmlFor={p.element.id.toString()}>
                          <span>
                            <ListItemButton disabled={!eligible}>
                              <ListItemIcon>
                                <Checkbox
                                  edge="start"
                                  id={p.element.id.toString()}
                                  checked={selectedSquad.includes(p.element.id)}
                                  tabIndex={-1}
                                  disabled={!eligible}
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
                              <ListItemText
                                primary={`${
                                  p.element.web_name
                                } (${p.score.toFixed(0)})`}
                              />
                            </ListItemButton>
                          </span>
                        </label>
                      </ListItem>
                    )
                  })}
                </List>
              </Collapse>
            </div>
          )
        })}
      </Grid>
      <Grid
        size={{
          xs: 8,
        }}>
        <h2>Squad Rating</h2>
        <h3>Score: {teamScore.toFixed(0)}</h3>
        <p style={{ marginTop: 8, marginBottom: 16, color: "#555" }}>
          Tip: Click a player, then click another to swap their positions (works
          across Starting XI and Bench). Click the same player again to cancel
          selection.
        </p>
        <h3>Selected Squad ({selectedSquad.length})</h3>

        {/* Starting XI */}
        <h3>Starting XI</h3>
        <Grid container spacing={2}>
          {startersIds.map((playerId, idx) => {
            const p = players.find((pp) => pp.element.id === playerId)
            if (!p) return null
            const team = teamMap.get(p.element.team)
            const combinedIndex = idx // 0..10
            const isSelected = selectedIndex === combinedIndex
            return (
              <Grid
                key={p.element.id}
                data-id={p.element.id}
                size={{ xs: 12, sm: 6, md: 4 }}
                sx={tileStyle(isSelected)}
                onClick={() => onTileClick(combinedIndex)}>
                <PlayerBox player={p} team={team?.name} />
              </Grid>
            )
          })}
        </Grid>

        {/* Bench */}
        <h3>Bench</h3>
        <Grid container spacing={2}>
          {benchIds.map((playerId, bIdx) => {
            const p = players.find((pp) => pp.element.id === playerId)
            if (!p) return null
            const team = teamMap.get(p.element.team)
            const combinedIndex = 11 + bIdx // 11..14
            const isSelected = selectedIndex === combinedIndex
            return (
              <Grid
                key={p.element.id}
                data-id={p.element.id}
                size={{ xs: 12, sm: 6, md: 4 }}
                sx={tileStyle(isSelected)}
                onClick={() => onTileClick(combinedIndex)}>
                <PlayerBox player={p} team={team?.name} />
              </Grid>
            )
          })}
        </Grid>
      </Grid>
    </Grid>
  )
}

export default SquadRatingPage
