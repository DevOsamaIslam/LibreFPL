import { elementTypeToPosition, positionToElementType } from "../app/settings"
import PlayerBox from "./PlayerBox"
import type { IOptimalTeamPlayer } from "../lib/types"

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

  return (
    <div>
      <h3>Starting XI</h3>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}>
        {/* Formation: 4-4-2 */}
        <div style={{ display: "flex" }}>
          {formation.att.map((player) => (
            <PlayerBox
              key={player.element.id}
              player={player}
              position={elementTypeToPosition[player.element.element_type]}
              team="Unknown"
            />
          ))}
        </div>
        <div style={{ display: "flex" }}>
          {formation.mid.map((player) => (
            <PlayerBox
              key={player.element.id}
              player={player}
              position={elementTypeToPosition[player.element.element_type]}
              team="Unknown"
            />
          ))}
        </div>
        <div style={{ display: "flex" }}>
          {formation.def.map((player) => (
            <PlayerBox
              key={player.element.id}
              player={player}
              position={elementTypeToPosition[player.element.element_type]}
              team="Unknown"
            />
          ))}
        </div>
        {formation.gk && (
          <PlayerBox player={formation.gk} position="GK" team="Unknown" />
        )}
      </div>

      <h3>Substitutes</h3>
      <div style={{ display: "flex" }}>
        {bench.map((player, index: number) => (
          <PlayerBox
            key={index}
            player={player}
            position={elementTypeToPosition[player.element.element_type]}
            team="Unknown"
          />
        ))}
      </div>
    </div>
  )
}

export default LineupDisplay
