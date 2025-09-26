import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import React, { useMemo } from "react"
import { interpolateColor } from "../../../app/fdrAlgo"
import { colorByPos, useSettingsStore } from "../../../app/settings"
import { priceFmt } from "../../../lib/helpers"
import type { IOptimalTeamPlayer, Position } from "../../../lib/types"
import { type CaptaincyPlayer } from "../types"

interface CaptaincyTableProps {
  players: CaptaincyPlayer[]
  isLoading?: boolean
  error?: string | null
  totalPlayers: number
}

export const CaptaincyTable: React.FC<CaptaincyTableProps> = ({
  players,
  isLoading = false,
  error = null,
}) => {
  const sortedPlayers = useSettingsStore((state) => state.sortedPlayers)

  const team2Players = useMemo(
    () =>
      sortedPlayers.reduce((acc, player) => {
        const teamId = player.element.team
        const teamPlayers = acc.get(teamId) || []
        teamPlayers.push(player)
        acc.set(teamId, teamPlayers)
        return acc
      }, new Map<number, IOptimalTeamPlayer[]>()),
    [sortedPlayers]
  )
  // Format functions
  const formatPrice = (price: number) => priceFmt(price)
  const formatPoints = (points: number) => `${points.toFixed(1)}`
  const formatStrength = (strength: number, decimals?: number) =>
    strength.toFixed(decimals)

  // Get position color
  const getPositionColor = (position: Position) => {
    return colorByPos[position]
  }

  // Get xPoints color based on value
  const getxPointsColor = (xPoints: number) => {
    if (xPoints >= 8) return "#4caf50" // High - Green
    if (xPoints >= 5) return "#ffeb3b" // Medium - Yellow
    return "#f44336" // Low - Red
  }

  return (
    <Paper variant="outlined" sx={{ width: "100%" }}>
      {/* Loading State */}
      {isLoading && (
        <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Box sx={{ p: 2 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      {/* Table */}
      {!isLoading && !error && (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Player</TableCell>
                <TableCell>Team</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>xPoints</TableCell>
                <TableCell>Fixture</TableCell>
                <TableCell>Opponent</TableCell>
                <TableCell>Team Attack</TableCell>
                <TableCell>Team Defence</TableCell>
                <TableCell>Opponent Attack</TableCell>
                <TableCell>Opponent Defence</TableCell>
                <TableCell>Opponent xGC</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {players.map((player) => (
                <TableRow key={player.element.id} hover>
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      sx={{
                        color: getxPointsColor(player.xPoints),
                      }}>
                      {player.element.web_name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography variant="body2">
                        {player.team.short_name}
                      </Typography>
                      {player.isHome && (
                        <Box
                          sx={{
                            ml: 0.5,
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            backgroundColor: "#2196f3",
                          }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={player.position}
                      size="small"
                      variant="outlined"
                      sx={{
                        backgroundColor:
                          getPositionColor(player.position) + "20",
                        borderColor: getPositionColor(player.position),
                        color: getPositionColor(player.position),
                      }}
                    />
                  </TableCell>
                  <TableCell>{formatPrice(player.element.now_cost)}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={{ color: getxPointsColor(player.xPoints) }}>
                      {formatPoints(player.xPoints)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box
                        sx={{
                          width: "100%",
                          height: 24,
                          borderRadius: "5%",
                          backgroundColor: interpolateColor(
                            player.fixtureDifficulty
                          ),
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {player.opponent.short_name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatStrength(player.teamAttackStrength)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatStrength(player.teamDefenceStrength)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatStrength(player.opponentAttackStrength)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatStrength(player.opponentDefenceStrength)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatStrength(
                        +(
                          team2Players.get(player.opponent.id)?.[0].element
                            .expected_goals_conceded_per_90 || 0
                        ),
                        2
                      )}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  )
}
