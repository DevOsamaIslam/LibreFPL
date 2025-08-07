import { Box } from "@mui/material"
import { Tooltip } from "@mui/material"
import type { ReactNode } from "react"
import { type FDRScore, interpolateColor } from "../modules/FDR/fdrAlgo"

type CellProps = {
  score: FDRScore
  label: ReactNode
  showLabel?: boolean
}

const Cell: React.FC<CellProps> = ({ score, label, showLabel }) => {
  const bg = interpolateColor(score)
  return (
    <Tooltip title={label}>
      <Box
        sx={{
          bgcolor: bg,
          color: "white",
          textShadow: "0 0 5px black",
          fontSize: 12,
          px: 1.25,
          py: 0.75,
          textAlign: "center",
          borderRadius: 1,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          minWidth: 44,
          lineHeight: 1.25,
        }}
        children={showLabel ? label : ""}
      />
    </Tooltip>
  )
}

export default Cell
