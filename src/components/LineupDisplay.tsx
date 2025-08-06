import { useMemo } from "react"
import { positionToElementType } from "../app/settings"
import { ARMBAND, type IOptimalTeamPlayer } from "../lib/types"
import PlayerBox from "./PlayerBox"

interface LineupDisplayProps {
  lineup: IOptimalTeamPlayer[]
}

function LineupDisplay({ lineup }: LineupDisplayProps) {
  const starters = lineup.slice(0, 11)
  const bench = lineup.slice(11, 15)

  const formation = {
    gk: starters.find(
      (player) => player.element.element_type === positionToElementType.GK
    ),
    def: starters.filter((player) => {
      return player.element.element_type === positionToElementType.DEF
    }),
    mid: starters.filter(
      (player) => player.element.element_type === positionToElementType.MID
    ),
    att: starters.filter(
      (player) => player.element.element_type === positionToElementType.FWD
    ),
  }

  const [captain, viseCaptain] = [starters[0], starters[1]]

  return (
    <div>
      <h3>Starting XI</h3>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}>
        {/* Formation: 4-4-2 */}
        <div style={{ display: "flex", gap: "16px" }}>
          {formation.att.map((player) => (
            <PlayerBox
              key={player.element.id}
              player={player}
              armband={
                captain.element.id === player.element.id
                  ? ARMBAND.CAPTAIN
                  : viseCaptain.element.id === player.element.id
                  ? ARMBAND.VICE
                  : undefined
              }
            />
          ))}
        </div>
        <div style={{ display: "flex", gap: "16px" }}>
          {formation.mid.map((player) => (
            <PlayerBox
              key={player.element.id}
              player={player}
              armband={
                captain.element.id === player.element.id
                  ? ARMBAND.CAPTAIN
                  : viseCaptain.element.id === player.element.id
                  ? ARMBAND.VICE
                  : undefined
              }
            />
          ))}
        </div>
        <div style={{ display: "flex", gap: "16px" }}>
          {formation.def.map((player) => (
            <PlayerBox
              key={player.element.id}
              player={player}
              armband={
                captain.element.id === player.element.id
                  ? ARMBAND.CAPTAIN
                  : viseCaptain.element.id === player.element.id
                  ? ARMBAND.VICE
                  : undefined
              }
            />
          ))}
        </div>
        {formation.gk && <PlayerBox player={formation.gk} />}
      </div>

      <h3>Substitutes</h3>
      <div style={{ display: "flex", gap: "16px" }}>
        {bench.map((player, index: number) => (
          <PlayerBox
            key={index}
            player={player}
            armband={
              captain.element.id === player.element.id
                ? ARMBAND.CAPTAIN
                : viseCaptain.element.id === player.element.id
                ? ARMBAND.VICE
                : undefined
            }
          />
        ))}
      </div>
    </div>
  )
}

export default LineupDisplay
