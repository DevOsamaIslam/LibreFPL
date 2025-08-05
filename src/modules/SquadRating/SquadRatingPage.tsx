import Checkbox from "@mui/material/Checkbox"
import Collapse from "@mui/material/Collapse"
import Grid from "@mui/material/Grid"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import React, { useEffect, useMemo, useState } from "react"
import { useSettingsStore } from "../../app/settings"
import { checkEligibility } from "./eligibility"
import type { IOptimalTeamPlayer, Team } from "../../lib/types"
import { Stack } from "@mui/material"
import { useSearchParams } from "react-router"
import PageTitle from "../../components/PageTitle"

const SquadRatingPage: React.FC = ({}) => {
  // URL param name kept in a single constant to avoid hard-coded strings.
  const PLAYERS_PARAM = "players"

  // Access snapshot, teams and players from settings store (source of truth).
  const teams = useSettingsStore((state) => state.snapshot?.teams)
  const { sortedPlayers: players } = useSettingsStore()

  // Build a quick lookup set of valid element ids to validate URL input.
  const validIds = useMemo(
    () =>
      players.reduce(
        (acc, curr) => ({
          ...acc,
          [curr.element.id]: curr,
        }),
        {} as Record<number, IOptimalTeamPlayer>
      ),
    [players]
  )

  // react-router search params
  const [searchParams, setSearchParams] = useSearchParams()

  // Hydrate initial selection from URL ?players=1,2,3... using react-router search params
  const initialSelectionFromURL = useMemo(() => {
    const raw = searchParams.get(PLAYERS_PARAM)
    if (!raw) return [] as number[]
    return raw
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n) && validIds[n])
  }, [searchParams, validIds])

  // Single combined selection list (starting + bench together)
  const [selectedSquad, setSelectedSquad] = useState<number[]>(
    initialSelectionFromURL
  )
  const [teamScore, setTeamScore] = useState(0)
  const [openGroups, setOpenGroups] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
  })

  // Reflect URL -> state when users navigate with back/forward and the query changes
  useEffect(() => {
    const urlIds = initialSelectionFromURL
    const current = selectedSquad.join(",")
    const next = urlIds.join(",")
    if (current !== next) {
      setSelectedSquad(urlIds)
      setTeamScore(urlIds.reduce((acc, id) => acc + validIds[id].score, 0))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSelectionFromURL])

  // Keep URL in sync whenever selection changes using react-router's setSearchParams.
  useEffect(() => {
    const sp = new URLSearchParams(searchParams)
    if (selectedSquad.length > 0) {
      sp.set(PLAYERS_PARAM, selectedSquad.join(","))
    } else {
      sp.delete(PLAYERS_PARAM)
    }
    setSearchParams(sp, { replace: true })
  }, [selectedSquad, searchParams, setSearchParams])

  const teamMap = new Map<number, Team>()
  teams?.forEach((t) => teamMap.set(t.id, t))

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
      <Grid item xs={8} component={"div" as any}>
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
                  <ListItemText
                    primary={
                      <Stack direction={"row"}>
                        {p.element.web_name} [
                        {teamMap.get(p.element.team)?.name}] (
                        {p.score.toFixed(0)})
                      </Stack>
                    }
                  />
                </ListItem>
              ) : null
            })}
        </List>
      </Grid>
    </Grid>
  )
}

export default SquadRatingPage
