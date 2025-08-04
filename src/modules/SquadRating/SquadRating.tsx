import React, { useState, useEffect } from "react"
import type { Player } from "../../lib/types"
import { pickOptimalFPLTeamAdvanced } from "../../app/algo"
import { useSettingsStore } from "../../app/settings"

interface Props {
  players: Player[]
}

const SquadRating: React.FC<Props> = ({ players }) => {
  const [startingXI, setStartingXI] = useState<number[]>([])
  const [bench, setBench] = useState<number[]>([])
  const snapshot = useSettingsStore((state) => state.snapshot)

  useEffect(() => {
    // Initialize startingXI and bench with 0 values
    setStartingXI(Array(11).fill(0))
    setBench(Array(4).fill(0))
  }, [players])

  const handleStartingXIChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const playerId = parseInt(event.target.value)
    setStartingXI((prev) => {
      const newStartingXI = [...prev]
      newStartingXI[parseInt(event.target.name)] = playerId
      return newStartingXI
    })
  }

  const handleBenchChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const playerId = parseInt(event.target.value)
    setBench((prev) => {
      const newBench = [...prev]
      newBench[parseInt(event.target.name)] = playerId
      return newBench
    })
  }

  const calculateScore = () => {
    if (!snapshot) return 0

    const startingXIPlayers = startingXI
      .map((playerId) => players.find((player) => player.id === playerId))
      .filter(Boolean) as Player[]

    const benchPlayers = bench
      .map((playerId) => players.find((player) => player.id === playerId))
      .filter(Boolean) as Player[]

    let totalScore = 0

    startingXIPlayers.forEach((player) => {
      if (player) {
        const scoredPlayers = pickOptimalFPLTeamAdvanced(snapshot).filter(
          (scoredPlayer) => scoredPlayer.element.id === player.id
        )
        if (scoredPlayers.length > 0) {
          totalScore += scoredPlayers[0].score
        }
      }
    })

    benchPlayers.forEach((player) => {
      if (player) {
        const scoredPlayers = pickOptimalFPLTeamAdvanced(snapshot).filter(
          (scoredPlayer) => scoredPlayer.element.id === player.id
        )
        if (scoredPlayers.length > 0) {
          totalScore += scoredPlayers[0].score * 0.1 // Bench players contribute 10% of their score
        }
      }
    })

    return totalScore
  }

  const score = calculateScore()

  return (
    <div>
      <h2>Squad Rating</h2>
      <h3>Starting XI</h3>
      {[...Array(11)].map((_, index) => (
        <select
          key={index}
          name={index.toString()}
          onChange={handleStartingXIChange}
          value={startingXI[index] || 0} // Set the value to the selected player
        >
          <option value={0}>Select Player</option>
          {players.map((player) => (
            <option key={player.id} value={player.id}>
              {player.web_name}
            </option>
          ))}
        </select>
      ))}
      <h3>Bench</h3>
      {[...Array(4)].map((_, index) => (
        <select
          key={index}
          name={index.toString()}
          onChange={handleBenchChange}
          value={bench[index] || 0} // Set the value to the selected player
        >
          <option value={0}>Select Player</option>
          {players.map((player) => (
            <option key={player.id} value={player.id}>
              {player.web_name}
            </option>
          ))}
        </select>
      ))}
      <h3>Score: {score}</h3>
    </div>
  )
}

export default SquadRating
