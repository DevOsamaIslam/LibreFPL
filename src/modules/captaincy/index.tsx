import { Box, Card, CardContent, Chip, Grid, Typography } from "@mui/material"
import { colorByPos } from "../../app/settings"
import PageTitle from "../../components/PageTitle"
import { priceFmt } from "../../lib/helpers"
import { CaptaincyHeader } from "./components/CaptaincyHeader"
import { CaptaincyTable } from "./components/CaptaincyTable"
import { CaptaincyTableSkeleton } from "./components/CaptaincyTableSkeleton"
import { useCaptaincyData } from "./hooks/useCaptaincyData"

function CaptaincyPage() {
  const { data, stats, isLoading, error } = useCaptaincyData()

  if (isLoading) {
    return (
      <Box>
        <PageTitle>Captaincy</PageTitle>
        <CaptaincyTableSkeleton />
      </Box>
    )
  }

  if (error) {
    return (
      <Box>
        <PageTitle>Captaincy</PageTitle>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <PageTitle>Captaincy</PageTitle>
      <Typography variant="h4" component="h1" gutterBottom>
        Captaincy Analysis - Top 10 Players by Position
      </Typography>

      {/* Header with stats */}
      <CaptaincyHeader stats={stats} totalPlayers={data.totalPlayers} />

      {/* Best Captaincy Options by Position */}
      {data.playersByPosition && (
        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Top Captaincy Options by Position
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(data.playersByPosition).map(
                ([position, players]) => {
                  if (players.length === 0) return null
                  const bestPlayer = players[0] // Best player from this position
                  return (
                    <Grid
                      size={{
                        xs: 12,
                        sm: 6,
                        md: 4,
                        lg: 3,
                      }}
                      key={position}>
                      <Card
                        variant="outlined"
                        sx={{ p: 1, textAlign: "center" }}>
                        <Typography variant="subtitle2" noWrap>
                          {bestPlayer.element.web_name}
                        </Typography>
                        <Chip
                          label={position}
                          size="small"
                          sx={{
                            mt: 0.5,
                            background: colorByPos[position],
                            color: "white",
                          }}
                        />
                        <Typography variant="body2" fontWeight={600}>
                          {bestPlayer.xPoints.toFixed(1)} pts
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {priceFmt(bestPlayer.element.now_cost)}
                        </Typography>
                      </Card>
                    </Grid>
                  )
                }
              )}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Main Tables */}
      {Object.entries(data.playersByPosition || {}).map(
        ([position, players]) =>
          players.length > 0 && (
            <Card variant="outlined" sx={{ mb: 2 }} key={position}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top 10 {position} Players ({players.length} total)
                </Typography>

                <CaptaincyTable
                  players={players.slice(0, 10)}
                  isLoading={isLoading}
                  error={error}
                  totalPlayers={players.length}
                />
              </CardContent>
            </Card>
          )
      )}
    </Box>
  )
}

export { CaptaincyPage }
