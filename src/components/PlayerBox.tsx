import React from "react"
import type { Player } from "../lib/types"

interface PlayerBoxProps {
  player: Player
  position: string
}

function PlayerBox({ player, position }: PlayerBoxProps) {
  return (
    <div
      style={{
        margin: "10px",
        border: "1px solid #ccc",
        padding: "5px",
        borderRadius: "5px",
      }}>
      <div>{player.web_name}</div>
      <div>{position}</div>
      <div>£{player.now_cost / 10}m</div>
    </div>
  )
}

export default PlayerBox
