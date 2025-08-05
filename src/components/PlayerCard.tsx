import type { IOptimalTeamPlayer } from "../lib/types"
import {
  ELEMENT_TYPE,
  label,
  numberFmt,
  pctFmt,
  priceFmt,
  teamAttackStrength,
  teamDefenseStrength,
} from "../modules/PlayersCompare/PlayersCompare.logic"
import type { Team } from "../modules/PlayersCompare/PlayersCompare.logic"

export default function PlayerCard({
  element,
  team,
  onRemove,
}: {
  element: IOptimalTeamPlayer
  team?: Team
  onRemove?: () => void
}) {
  const { element: player, score } = element
  const ownership =
    (player.selected_by_percent as unknown as number) ?? undefined
  const xg = (player as any).expected_goals as number | undefined
  const xa = (player as any).expected_assists as number | undefined

  const pos = ELEMENT_TYPE[player.element_type]

  const att = teamAttackStrength(team)
  const def = teamDefenseStrength(team)

  return (
    <div className="pc-card">
      <div className="pc-card-header">
        <div className="pc-player-name">{player.web_name}</div>
        {onRemove ? (
          <button className="pc-remove" onClick={onRemove} title="Remove">
            ×
          </button>
        ) : null}
      </div>

      <div className="pc-section">
        <div className="pc-section-title">{label.basic}</div>
        <div className="pc-row">
          <span>{label.teamLbl}</span>
          <span>{team?.short_name ?? team?.name ?? "-"}</span>
        </div>
        <div className="pc-row">
          <span>{label.pos}</span>
          <span>{pos}</span>
        </div>
        <div className="pc-row">
          <span>{label.price}</span>
          <span>{priceFmt(player.now_cost)}</span>
        </div>
        <div className="pc-row">
          <span>{label.sel}</span>
          <span>
            {typeof ownership === "number"
              ? pctFmt(ownership)
              : player.selected_by_percent ?? "-"}
          </span>
        </div>
      </div>

      <div className="pc-section">
        <div className="pc-section-title">{label.perf}</div>
        <div className="pc-row">
          <span>{"Score"}</span>
          <span>{numberFmt(score, 0)}</span>
        </div>
        <div className="pc-row">
          <span>{label.pts}</span>
          <span>{numberFmt(player.total_points, 0)}</span>
        </div>
        <div className="pc-row">
          <span>{label.mins}</span>
          <span>{numberFmt(player.minutes, 0)}</span>
        </div>
        <div className="pc-row">
          <span>{"Minutes per 90"}</span>
          <span>{numberFmt(player.minutes, 0)}</span>
        </div>
        <div className="pc-row">
          <span>{label.g}</span>
          <span>{numberFmt(player.goals_scored, 0)}</span>
        </div>
        <div className="pc-row">
          <span>{label.a}</span>
          <span>{numberFmt(player.assists, 0)}</span>
        </div>
        <div className="pc-row">
          <span>{label.cs}</span>
          <span>{numberFmt(player.clean_sheets, 0)}</span>
        </div>
        <div className="pc-row">
          <span>{label.xg}</span>
          <span>{xg !== undefined ? numberFmt(xg, 2) : "-"}</span>
        </div>
        <div className="pc-row">
          <span>{label.xa}</span>
          <span>{xa !== undefined ? numberFmt(xa, 2) : "-"}</span>
        </div>
      </div>

      <div className="pc-section">
        <div className="pc-section-title">{label.discipline}</div>
        <div className="pc-row">
          <span>{label.yc}</span>
          <span>{numberFmt(player.yellow_cards, 0)}</span>
        </div>
        <div className="pc-row">
          <span>{label.rc}</span>
          <span>{numberFmt(player.red_cards, 0)}</span>
        </div>
      </div>

      <div className="pc-section">
        <div className="pc-section-title">{label.ict}</div>
        <div className="pc-row">
          <span>{label.form}</span>
          <span>{player.form ?? "-"}</span>
        </div>
        <div className="pc-row">
          <span>{label.inf}</span>
          <span>{player.influence ?? "-"}</span>
        </div>
        <div className="pc-row">
          <span>{label.cre}</span>
          <span>{player.creativity ?? "-"}</span>
        </div>
        <div className="pc-row">
          <span>{label.thr}</span>
          <span>{player.threat ?? "-"}</span>
        </div>
        <div className="pc-row">
          <span>{label.ictIdx}</span>
          <span>{player.ict_index ?? "-"}</span>
        </div>
      </div>

      <div className="pc-section">
        <div className="pc-section-title">{label.team}</div>
        <div className="pc-row">
          <span>{label.att}</span>
          <span>{att !== undefined ? numberFmt(att, 0) : "-"}</span>
        </div>
        <div className="pc-row">
          <span>{label.def}</span>
          <span>{def !== undefined ? numberFmt(def, 0) : "-"}</span>
        </div>
      </div>
    </div>
  )
}
