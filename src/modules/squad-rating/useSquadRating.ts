import { useCallback, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router"
import { useSettingsStore } from "../../app/settings"
import { calculateTeamScore } from "../../app/transfers"
import type { Captaincy, IOptimalTeamPlayer, IPick } from "../../lib/types"

// Centralized constants to avoid hard-coded strings
const QUERY_KEYS = {
  players: "players",
} as const

type QueryKey = typeof QUERY_KEYS.players

interface ControllerArgs {
  players: IOptimalTeamPlayer[]
}

function useSquadRating({ players }: ControllerArgs) {
  const { myTeam } = useSettingsStore()
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
    const raw = searchParams.get(QUERY_KEYS.players as QueryKey)
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

  // Scores
  const [teamScore, setTeamScore] = useState(0)
  const [xiScore, setXiScore] = useState(0)
  const [benchScore, setBenchScore] = useState(0)
  const [xPoints, setXPoints] = useState(0)

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
      // set raw team score as simple sum (without bench weighting)
      const raw = urlIds.reduce(
        (acc, id) => acc + (validIds[id]?.score ?? 0),
        0
      )
      setTeamScore(raw)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSelectionFromURL])

  // Keep URL in sync whenever selection changes using react-router's setSearchParams.
  useEffect(() => {
    const sp = new URLSearchParams(searchParams)
    if (selectedSquad.length > 0) {
      sp.set(QUERY_KEYS.players, selectedSquad.join(","))
    } else {
      sp.delete(QUERY_KEYS.players)
    }
    setSearchParams(sp, { replace: true })
  }, [selectedSquad, searchParams, setSearchParams])

  const positionLabel = useMemo(
    () =>
      ({
        1: "Goalkeepers",
        2: "Defenders",
        3: "Midfielders",
        4: "Forwards",
      } as Record<number, string>),
    []
  )

  const groupedPlayers = useMemo(() => {
    return players.reduce(
      (acc: Record<number, Array<(typeof players)[number]>>, p) => {
        const pos = p.element.element_type as number
        if (!acc[pos]) acc[pos] = []
        acc[pos].push(p)
        return acc
      },
      {}
    )
  }, [players])

  const myPlayers = useMemo(
    () =>
      myTeam?.picks.reduce(
        (acc, curr) => ({
          ...acc,
          [curr.element]: curr,
        }),
        {} as Record<number, IPick>
      ) || {},
    [players, myTeam]
  )

  const teamCost = useMemo(() => {
    let xPoints = 0
    const totalCost = selectedSquad.reduce((acc, id) => {
      const myPlayer = myPlayers[id]
      const player = validIds[id]

      if (myPlayer) xPoints += validIds[myPlayer.element].xPoints
      else xPoints += player?.xPoints || 0

      if (myPlayer) return acc + myPlayer.selling_price
      if (player) return acc + player.element.now_cost

      return acc
    }, 0)
    setXPoints(xPoints)
    return totalCost
  }, [selectedSquad])

  // Helper: total of ids (no weighting)
  const sumScore = useCallback(
    (ids: number[]) =>
      ids.reduce((acc, id) => {
        const p = validIds[id]
        if (!p) return acc
        return acc + p.score
      }, 0),
    [validIds]
  )

  // Helper: weighted total for whole team (bench 10%)
  const reCalcWeightedTeamScore = useCallback(calculateTeamScore, [validIds])

  // Derived ids for sections
  const startersIds = useMemo(() => selectedSquad.slice(0, 11), [selectedSquad])
  const benchIds = useMemo(() => selectedSquad.slice(11, 15), [selectedSquad])

  // Captaincy state derived from XI
  const [captaincy, setCaptaincy] = useState<Captaincy>({
    captainId: null,
    viceCaptainId: null,
  })

  // Recalculate section scores and captaincy when selection changes
  useEffect(() => {
    const xi = sumScore(startersIds)
    const bench = sumScore(benchIds)
    const selectedPlayers = [...startersIds, ...benchIds].map(
      (id) => validIds[id]
    )
    setXiScore(xi)
    setBenchScore(bench)
    // Keep teamScore representing the weighted whole team display by default
    setTeamScore(reCalcWeightedTeamScore(selectedPlayers))

    // Determine captain and vice from XI by highest scores
    if (startersIds.length > 0) {
      const sortedByXPoints = startersIds.toSorted(
        (a, b) => validIds[b]?.xPoints - validIds[a]?.xPoints
      )
      const captainId = sortedByXPoints[0] ?? null
      const viceCaptainId = sortedByXPoints[1] ?? null
      setCaptaincy({ captainId, viceCaptainId })
    } else {
      setCaptaincy({ captainId: null, viceCaptainId: null })
    }
  }, [startersIds, benchIds, sumScore, reCalcWeightedTeamScore, validIds])

  // Click-to-swap selection state
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  // Helper to get combined list and perform swap by indices
  const combinedIds = useMemo(
    () => [...startersIds, ...benchIds],
    [startersIds, benchIds]
  )

  const swapByIndex = useCallback(
    (i: number, j: number) => {
      if (i === j) return
      const nextCombined = [...combinedIds]
      ;[nextCombined[i], nextCombined[j]] = [nextCombined[j], nextCombined[i]]
      const next = [...nextCombined.slice(0, 11), ...nextCombined.slice(11, 15)]
      setSelectedSquad(next)
      // scores are recalculated by the selection-change effect
    },
    [combinedIds]
  )

  // Click handler for a tile; index is 0..(combinedIds.length-1)
  const onTileClick = useCallback(
    (index: number) => {
      if (selectedIndex === null) {
        setSelectedIndex(index)
        return
      }
      // If click same tile, clear selection
      if (selectedIndex === index) {
        setSelectedIndex(null)
        return
      }
      // Swap and clear
      swapByIndex(selectedIndex, index)
      setSelectedIndex(null)
    },
    [selectedIndex, swapByIndex]
  )

  const tileStyle = useCallback(
    (isSelected: boolean) =>
      ({
        cursor: "pointer",
        outline: isSelected ? "2px solid #1976d2" : undefined,
        boxShadow: isSelected
          ? "0 0 0 2px rgba(25,118,210,0.2) inset"
          : undefined,
      } as const),
    []
  )

  return {
    QUERY_KEYS,
    positionLabel,
    groupedPlayers,
    startersIds,
    benchIds,
    selectedSquad,
    setSelectedSquad,
    selectedIndex,
    tileStyle,
    onTileClick,
    teamScore,
    setTeamScore,
    xiScore,
    benchScore,
    openGroups,
    setOpenGroups,
    players,
    captaincy,
    teamCost,
    xPoints,
    myPlayers,
  }
}

export default useSquadRating
