import Box from "@mui/material/Box"
import Checkbox from "@mui/material/Checkbox"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import React from "react"
import Cell from "../../components/Cell"
import SpaceBetween from "../../components/SpaceBetween"
import type { FDRScore, TeamFDRByGw } from "./fdrAlgo"

function HeatmapTable({
  data,
  events,
  withCheckbox = false,
  selected,
  onToggle,
}: {
  data: TeamFDRByGw[]
  events: number[]
  withCheckbox?: boolean
  selected?: Set<number>
  onToggle?: (teamId: number) => void
}) {
  const averageForRow = (row: TeamFDRByGw) => {
    if (!row.byEvent.length) return 0
    const sum = row.byEvent.reduce((acc, c) => acc + c.score, 0)
    return sum / row.byEvent.length
  }
  const avgToBucket = (avg: number): FDRScore => {
    // Keep continuous average within [1,5]
    return Math.min(5, Math.max(1, avg))
  }

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
      <Box sx={{ display: "flex" }}>
        {/* Scrollable grid area */}
        <Box sx={{ p: 1.5, overflow: "auto", flex: 1 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: `${
                withCheckbox ? "36px " : ""
              }220px repeat(${events.length}, minmax(48px, 1fr))`,
              gap: 1,
            }}>
            {/* Header row */}
            {withCheckbox && <Box />}
            <Box
              sx={{
                fontWeight: 600,
                position: "sticky",
                left: 0,
                bgcolor: "background.paper",
                zIndex: 1,
              }}>
              <SpaceBetween>
                <span>Team</span>
                Average
              </SpaceBetween>
            </Box>
            {events.map((ev) => (
              <Box key={ev} sx={{ textAlign: "center" }}>
                <span style={{ fontSize: "0.7rem" }}>GW {ev}</span>
              </Box>
            ))}

            {/* Rows */}
            {data.map((row) => {
              const checked = selected?.has(row.team.id) ?? false
              const avg = avgToBucket(averageForRow(row)) as FDRScore
              return (
                <React.Fragment key={row.team.id}>
                  {withCheckbox ? (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                      <Checkbox
                        size="small"
                        checked={checked}
                        onChange={() => onToggle && onToggle(row.team.id)}
                      />
                    </Box>
                  ) : null}
                  <Box
                    sx={{
                      position: "sticky",
                      left: 0,
                      bgcolor: "background.paper",
                      pr: 1,
                      zIndex: 1,
                    }}>
                    <Typography variant="body2" fontWeight={600}>
                      <SpaceBetween>
                        <span>
                          {row.team.name} ({row.team.short_name})
                        </span>
                        <Cell
                          label={avg.toFixed(2)}
                          score={avg}
                          key={row.team.id}
                          showLabel
                        />
                      </SpaceBetween>
                    </Typography>
                  </Box>
                  {row.byEvent.map((cell) => {
                    const label = `${cell.isHome ? "(H)" : "(A)"} ${
                      row.team.short_name
                    } vs ${cell.opponent.short_name} => ${cell.score.toFixed(
                      2
                    )}`
                    return (
                      <Cell
                        key={`${row.team.id}-${cell.event}`}
                        score={cell.score}
                        label={label}
                      />
                    )
                  })}
                </React.Fragment>
              )
            })}
          </Box>
        </Box>
      </Box>
    </Paper>
  )
}

export default HeatmapTable
