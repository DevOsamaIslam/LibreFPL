import React, { useEffect } from "react"
import PageTitle from "../components/PageTitle"
import ScoreVsCost from "./charts/ScoreVsCost"
import { useSavedSquads } from "../hooks/useSavedSquads"
import { useSearchParams } from "react-router"

const sectionStyle: React.CSSProperties = {
  padding: "1rem",
  borderRadius: 8,
  border: "1px solid #e5e7eb",
  background: "#fff",
}

export default function Charts(): React.ReactElement {
  const [query, setQuery] = useSearchParams()
  const { SavedSquadSelector, activeSquad } = useSavedSquads()

  useEffect(() => {
    query.set("players", (activeSquad?.playerIds ?? []).join(","))
    if (activeSquad) setQuery(query)
    else setQuery({})
  }, [activeSquad])

  return (
    <div style={{ padding: "1rem", maxWidth: 1200, margin: "0 auto" }}>
      <PageTitle>Charts</PageTitle>
      <SavedSquadSelector />
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
        <section style={sectionStyle}>
          <h2 style={{ margin: "0 0 0.75rem" }}>Player Score vs Cost</h2>
          <p style={{ marginTop: 0, color: "#6b7280" }}>
            Scatter plot showing player total points relative to their price to
            help spot value picks.
          </p>
          <ScoreVsCost />
        </section>

        <section style={sectionStyle}>
          <h2 style={{ margin: "0 0 0.75rem" }}>More charts coming soon</h2>
          <p style={{ marginTop: 0, color: "#6b7280" }}>
            This page will host additional visualizations as they are built.
          </p>
        </section>
      </div>
    </div>
  )
}
