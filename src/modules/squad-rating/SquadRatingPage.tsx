import Grid from "@mui/material/Grid"
import React, { useCallback, useEffect } from "react"
import { useSettingsStore } from "../../app/settings"
import PageTitle from "../../components/PageTitle"
import { usePlayerSelector } from "../../hooks/usePlayerSelector"
import { useSavedSquads } from "../../hooks/useSavedSquads"
import { type IOptimalTeamPlayer } from "../../lib/types"
import Bench from "./components/Bench"
import PlayerSearch from "./components/PlayerSearch"
import SquadHeader from "./components/SquadHeader"
import StartingXI from "./components/StartingXI"
import useSquadRating from "./useSquadRating"

const SquadRatingPage: React.FC = ({}) => {
  const { sortedPlayers: players } = useSettingsStore()
  const {
    startersIds,
    benchIds,
    selectedSquad,
    selectedIndex,
    tileStyle,
    onTileClick,
    teamScore,
    setSelectedSquad,
    setTeamScore,
    xiScore,
    benchScore,
    captaincy,
    teamCost,
    xPoints,
  } = useSquadRating({
    players,
  })

  // Reusable selection and search, like PlayersCompare
  const { selectedIds, setSelectedIds, togglePlayer, max } = usePlayerSelector({
    players,
  })

  const { activeSquad, setActiveSquad } = useSavedSquads()

  useEffect(() => {
    if (activeSquad) setSelectedSquad(activeSquad.playerIds)
  }, [activeSquad])

  const positionCount = React.useMemo(() => {
    const counts: { GK: number; DEF: number; MID: number; FWD: number } = {
      GK: 0,
      DEF: 0,
      MID: 0,
      FWD: 0,
    }
    // get players from selectedIds
    const selectedPlayers = selectedIds
      .map((id) => players.find((p) => p.element.id === id))
      .filter(Boolean) as IOptimalTeamPlayer[]

    selectedPlayers.forEach((p) => {
      counts[p.position] += 1
    })
    return counts
  }, [selectedIds])

  const teamCount = React.useMemo(() => {
    const counts: { [key: number]: number } = {}
    selectedIds.forEach((id) => {
      const player = players.find((p) => p.element.id === id)
      if (!player) return
      counts[player.teamId] = (counts[player.teamId] ?? 0) + 1
    })
    return counts
  }, [selectedIds])

  // Sync hook with URL-driven state
  useEffect(() => {
    if (selectedIds.join(",") !== selectedSquad.join(",")) {
      setSelectedIds(selectedSquad)
      setActiveSquad({
        title: "",
        description: "",
        playerIds: selectedSquad,
        updatedAt: new Date().toString(),
      })
    }
  }, [selectedIds, selectedSquad, setSelectedIds])

  const onToggleCandidate = useCallback(
    (p: (typeof players)[number]) => {
      const already = selectedSquad.includes(p.element.id)
      if (already) {
        const next = selectedSquad.filter((id) => id !== p.element.id)
        setSelectedSquad(next)
        setTeamScore(teamScore - p.score)
        togglePlayer(p.element.id)
      } else {
        const next = [...selectedSquad, p.element.id]
        setSelectedSquad(next)
        setTeamScore(teamScore + p.score)
        togglePlayer(p.element.id)
      }
    },
    [
      players,
      selectedSquad,
      teamScore,
      setSelectedSquad,
      setTeamScore,
      togglePlayer,
    ]
  )

  return (
    <Grid container spacing={2} pb={4}>
      <PageTitle>Squad Rating</PageTitle>

      <Grid size={{ xs: 12, lg: 4, md: 5 }}>
        <PlayerSearch
          players={players}
          selectedSquad={selectedSquad}
          max={max}
          onToggleCandidate={onToggleCandidate}
          positionCount={positionCount}
          teamCount={teamCount}
          teamCost={teamCost}
        />
      </Grid>

      {/* Right panel — Selected squad and swap interaction */}
      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <SquadHeader
          teamScore={teamScore}
          xiScore={xiScore}
          benchScore={benchScore}
          xPoints={xPoints}
        />

        <StartingXI
          startersIds={startersIds}
          players={players}
          captaincy={captaincy}
          selectedIndex={selectedIndex}
          tileStyle={tileStyle}
          onTileClick={onTileClick}
        />

        <Bench
          benchIds={benchIds}
          players={players}
          captaincy={captaincy}
          selectedIndex={selectedIndex}
          tileStyle={tileStyle}
          onTileClick={onTileClick}
        />
      </Grid>
    </Grid>
  )
}

export default SquadRatingPage
