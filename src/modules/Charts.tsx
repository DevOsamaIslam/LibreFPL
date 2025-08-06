import React from "react"
import PageTitle from "../components/PageTitle"
import SpaceBetween from "../components/SpaceBetween"
import ScoreVsCost from "./Charts/ScoreVsCost"

const sectionStyle: React.CSSProperties = {
  padding: "1rem",
  borderRadius: 8,
  border: "1px solid #e5e7eb",
  background: "#fff",
}

export default function Charts(): React.ReactElement {
  return (
    <div style={{ padding: "1rem", maxWidth: 1200, margin: "0 auto" }}>
      <PageTitle>Charts</PageTitle>
      <SpaceBetween justify="space-between" align="center">
        <div />
        <div />
      </SpaceBetween>
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
