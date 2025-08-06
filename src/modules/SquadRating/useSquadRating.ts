import { useCallback, useEffect, useMemo, useState } from "react"
import type { IOptimalTeamPlayer, Team } from "../../lib/types"
import { useSearchParams } from "react-router"

// Centralized constants to avoid hard-coded strings
const QUERY_KEYS = {
  players: "players",
} as const

type QueryKey = typeof QUERY_KEYS.players

interface ControllerArgs {
  players: IOptimalTeamPlayer[]
  teams?: Team[]
}

function useSquadRating({ players, teams }: ControllerArgs) {
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
      sp.set(QUERY_KEYS.players, selectedSquad.join(","))
    } else {
      sp.delete(QUERY_KEYS.players)
    }
    setSearchParams(sp, { replace: true })
  }, [selectedSquad, searchParams, setSearchParams])

  const teamMap = useMemo(() => {
    const m = new Map<number, Team>()
    teams?.forEach((t) => m.set(t.id, t))
    return m
  }, [teams])

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
    return (players as Array<(typeof players)[number]>).reduce(
      (acc: Record<number, Array<(typeof players)[number]>>, p) => {
        const pos = p.element.element_type as number
        if (!acc[pos]) acc[pos] = []
        acc[pos].push(p)
        return acc
      },
      {}
    )
  }, [players])

  // Helper: weighted score (bench 10%)
  const recalcScore = useCallback(
    (ids: number[]) =>
      ids.reduce((acc, id, idx) => {
        const p = validIds[id]
        if (!p) return acc
        return acc + p.score * (idx < 11 ? 1 : 0.1)
      }, 0),
    [validIds]
  )

  // Derived ids for sections
  const startersIds = useMemo(() => selectedSquad.slice(0, 11), [selectedSquad])
  const benchIds = useMemo(() => selectedSquad.slice(11, 15), [selectedSquad])

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
      setTeamScore(recalcScore(next))
    },
    [combinedIds, recalcScore]
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
    teamMap,
    startersIds,
    benchIds,
    selectedSquad,
    setSelectedSquad,
    selectedIndex,
    tileStyle,
    onTileClick,
    teamScore,
    setTeamScore,
    openGroups,
    setOpenGroups,
    players,
  }
}

export default useSquadRating
