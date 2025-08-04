import React from "react"
import { Box } from "@mui/material"

interface SpaceBetweenProps {
  children: React.ReactNode
  justify?:
    | "flex-start"
    | "center"
    | "flex-end"
    | "space-between"
    | "space-around"
    | "space-evenly"
  align?: "flex-start" | "center" | "flex-end" | "stretch" | "baseline"
  spacing?: number
}

const SpaceBetween: React.FC<SpaceBetweenProps> = ({
  children,
  justify = "space-between",
  align = "center",
  spacing = 0,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: justify,
        alignItems: align,
        gap: (theme) => theme.spacing(spacing),
      }}>
      {children}
    </Box>
  )
}

export default SpaceBetween
