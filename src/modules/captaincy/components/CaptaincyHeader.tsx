import { Box, Card, CardContent, Grid, Typography } from "@mui/material"
import React from "react"
import { type CaptaincyStats } from "../types"

interface CaptaincyHeaderProps {
  stats: CaptaincyStats
  totalPlayers: number
}

export const CaptaincyHeader: React.FC<CaptaincyHeaderProps> = ({
  stats,
  totalPlayers,
}) => {
  const formatPrice = (price: number) => `£${price.toFixed(1)}`
  const formatPoints = (points: number) => `${points.toFixed(1)} pts`

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Captaincy Analysis
        </Typography>

        <Grid container spacing={2}>
          {/* Overview Stats */}
          <Grid
            size={{
              xs: 12,
              md: 3,
            }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block">
                Total Players
              </Typography>
              <Typography variant="h5" fontWeight={600}>
                {totalPlayers}
              </Typography>
            </Box>
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 3,
            }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block">
                Average Price
              </Typography>
              <Typography variant="h5" fontWeight={600}>
                {formatPrice(stats.averagePrice)}
              </Typography>
            </Box>
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 3,
            }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block">
                Average Expected Points
              </Typography>
              <Typography variant="h5" fontWeight={600}>
                {formatPoints(stats.averagePoints)}
              </Typography>
            </Box>
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 3,
            }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block">
                Best Value
              </Typography>
              <Typography variant="h5" fontWeight={600}>
                {formatPoints(stats.bestValue?.xPoints || 0)}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}
