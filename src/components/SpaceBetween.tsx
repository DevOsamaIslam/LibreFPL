import React from "react"
import { Box, type SxProps, type Theme } from "@mui/material"

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
  sx?: SxProps<Theme>
}

const SpaceBetween: React.FC<SpaceBetweenProps> = ({
  children,
  justify = "space-between",
  align = "center",
  spacing = 0,
  sx,
}) => {
  return (
    <Box
      sx={{
        ...sx,
        width: "100%",
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
