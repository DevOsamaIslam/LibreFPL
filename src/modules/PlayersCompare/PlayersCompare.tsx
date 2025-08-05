import PageTitle from "../../components/PageTitle"
import PlayerCard from "../../components/PlayerCard"
import SpaceBetween from "../../components/SpaceBetween"
import {
  ELEMENT_TYPE,
  MAX_SELECTED,
  label,
  priceFmt,
  useCompareData,
  usePlayersCompareState,
  useSearch,
} from "./PlayersCompare.logic"
import "./players-compare.css"

export default function PlayersCompare() {
  const { players, teamsById } = useCompareData()
  const { q, setQ, result } = useSearch(players)
  const {
    selectedIds,
    selectedPlayers,
    canAddMore,
    togglePlayer,
    removePlayer,
  } = usePlayersCompareState(players)

  return (
    <div className="pc-root">
      <PageTitle>Player Comparison</PageTitle>
      <h1>{label.title}</h1>

      <div className="pc-controls">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={label.searchPlaceholder}
          className="pc-search"
        />
        <div className="pc-selected-title">
          {label.selectedTitle} ({selectedIds.length}/{MAX_SELECTED})
        </div>
      </div>

      <SpaceBetween spacing={2}>
        <div className="pc-list">
          {!canAddMore ? <div className="pc-hint">{label.addHint}</div> : null}
          <div className="pc-list-scroll">
            {result.map((p) => {
              const t = teamsById.get(p.element.team)
              const chosen = selectedIds.includes(p.element.id)
              return (
                <button
                  key={p.element.id}
                  className={`pc-item ${chosen ? "pc-item--active" : ""}`}
                  onClick={() => togglePlayer(p.element.id)}
                  disabled={!chosen && !canAddMore}
                  title={chosen ? "Remove" : "Add"}>
                  <span className="pc-item-name">{p.element.web_name}</span>
                  <span className="pc-item-meta">
                    {t?.short_name ?? t?.name ?? "-"} •{" "}
                    {ELEMENT_TYPE[p.element.element_type]} • £
                    {priceFmt(p.element.now_cost)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="pc-compare-grid">
          {selectedPlayers.length === 0 ? (
            <div className="pc-empty">{label.addHint}</div>
          ) : (
            <div className="pc-grid">
              {selectedPlayers.map((p) => (
                <PlayerCard
                  key={p.element.id}
                  element={p}
                  team={teamsById.get(p.element.team)}
                  onRemove={() => removePlayer(p.element.id)}
                />
              ))}
            </div>
          )}
        </div>
      </SpaceBetween>
    </div>
  )
}
