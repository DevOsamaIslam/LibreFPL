import { useEffect, useMemo, useState } from "react"
import { getXPoints } from "../../../app/algo"
import { getTeamFDR } from "../../../app/fdrAlgo"
import { useSettingsStore } from "../../../app/settings"
import { type Position, type Team } from "../../../lib/types"
import { type CaptaincyPlayer } from "../types"
import { calculateCaptaincyStats } from "../utils"

export function useCaptaincyData() {
  const { sortedPlayers: allPlayers, teams } = useSettingsStore()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Process captaincy data
  const captaincyData = useMemo(() => {
    if (!allPlayers.length || !teams.size) {
      return {
        players: [],
        totalPlayers: 0,
        bestCaptaincyOptions: [],
      }
    }

    try {
      const playersArray = Array.from(teams.values())
      const captaincyPlayers: CaptaincyPlayer[] = []

      allPlayers.forEach((player) => {
        const team = playersArray.find((t) => t.id === player.element.team)
        if (!team) return

        // Get FDR data for the team
        const teamFDR = getTeamFDR(team.id)
        if (!teamFDR.teamFDR || teamFDR.teamFDR.length === 0) return

        const nextFixture = teamFDR.teamFDR[0]
        const opponent = nextFixture.opponent
        const isHome = nextFixture.isHome

        // Calculate expected points using the existing getXPoints function
        const xPoints = getXPoints({
          player: player.element,
          team,
          opponent,
          isHome,
        })

        // Calculate fixture difficulty based on FDR score
        const fixtureDifficulty = nextFixture.score

        captaincyPlayers.push({
          element: player.element,
          position: player.position as Position,
          team,
          opponent,
          isHome,
          xPoints,
          teamAttackStrength: isHome
            ? team.strength_attack_home
            : team.strength_attack_away,
          teamDefenceStrength: isHome
            ? team.strength_defence_home
            : team.strength_defence_away,
          opponentAttackStrength: isHome
            ? opponent.strength_defence_away
            : opponent.strength_attack_home,
          opponentDefenceStrength: isHome
            ? opponent.strength_attack_away
            : opponent.strength_defence_home,
          fixtureDifficulty,
        })
      })

      // Group players by position and get top 10 for each position
      const playersByPosition = captaincyPlayers.reduce((acc, player) => {
        if (!acc[player.position]) {
          acc[player.position] = []
        }
        acc[player.position].push(player)
        return acc
      }, {} as Record<Position, CaptaincyPlayer[]>)

      // Sort each position group by xPoints (descending) and take top 10
      const topPlayersByPosition: CaptaincyPlayer[] = []
      Object.entries(playersByPosition).forEach(([, players]) => {
        const sortedPlayers = players.sort((a, b) => b.xPoints - a.xPoints)
        topPlayersByPosition.push(...sortedPlayers.slice(0, 10))
      })

      // Get best captaincy options (top 10 by expected points across all positions)
      const bestCaptaincyOptions = topPlayersByPosition
        .sort((a, b) => b.xPoints - a.xPoints)
        .slice(0, 10)

      return {
        players: topPlayersByPosition,
        playersByPosition: {
          FWD: playersByPosition.FWD || [],
          MID: playersByPosition.MID || [],
          DEF: playersByPosition.DEF || [],
          GK: playersByPosition.GK || [],
        },
        totalPlayers: topPlayersByPosition.length,
        bestCaptaincyOptions,
      }
    } catch (err) {
      console.error("Error processing captaincy data:", err)
      setError("Failed to process captaincy data")
      return {
        players: [],
        totalPlayers: 0,
        bestCaptaincyOptions: [],
      }
    }
  }, [allPlayers, teams])

  // Calculate statistics
  const stats = useMemo(() => {
    return calculateCaptaincyStats(captaincyData.players)
  }, [captaincyData.players])

  // Simulate loading
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [captaincyData])

  return {
    // Data
    data: captaincyData,
    stats,
    isLoading,
    error,

    // Derived data
    availablePositions: useMemo(() => {
      const positions = new Set<Position>()
      captaincyData.players.forEach((player) => positions.add(player.position))
      return Array.from(positions)
    }, [captaincyData.players]),

    availableTeams: useMemo(() => {
      const teamIds = new Set<number>()
      captaincyData.players.forEach((player) => teamIds.add(player.team.id))
      return Array.from(teamIds)
        .map((id) => teams.get(id))
        .filter(Boolean) as Team[]
    }, [captaincyData.players, teams]),
  }
}
