import React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Skeleton,
} from "@mui/material"

export const CaptaincyTableSkeleton: React.FC = () => {
  return (
    <Paper variant="outlined" sx={{ width: "100%" }}>
      {/* Filter Skeleton */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
        <Skeleton variant="rectangular" height={40} sx={{ mb: 2 }} />
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          <Skeleton variant="rectangular" height={40} width={120} />
          <Skeleton variant="rectangular" height={40} width={150} />
          <Skeleton variant="rectangular" height={40} width={120} />
          <Skeleton variant="rectangular" height={40} width={120} />
          <Skeleton variant="rectangular" height={40} width={120} />
          <Skeleton variant="rectangular" height={40} width={40} />
        </Box>
      </Box>

      {/* Table Skeleton */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><Skeleton variant="text" width={100} /></TableCell>
              <TableCell><Skeleton variant="text" width={80} /></TableCell>
              <TableCell><Skeleton variant="text" width={80} /></TableCell>
              <TableCell><Skeleton variant="text" width={80} /></TableCell>
              <TableCell><Skeleton variant="text" width={100} /></TableCell>
              <TableCell><Skeleton variant="text" width={100} /></TableCell>
              <TableCell><Skeleton variant="text" width={100} /></TableCell>
              <TableCell><Skeleton variant="text" width={100} /></TableCell>
              <TableCell><Skeleton variant="text" width={100} /></TableCell>
              <TableCell><Skeleton variant="text" width={100} /></TableCell>
              <TableCell><Skeleton variant="text" width={100} /></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(5)].map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Skeleton variant="circular" width={32} height={32} sx={{ mr: 1 }} />
                    <Skeleton variant="text" width={120} />
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Skeleton variant="text" width={80} />
                    <Skeleton variant="circular" width={16} height={16} sx={{ ml: 0.5 }} />
                  </Box>
                </TableCell>
                <TableCell>
                  <Skeleton variant="rectangular" width={60} height={24} />
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" width={80} />
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" width={80} />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Skeleton variant="circular" width={16} height={16} sx={{ mr: 0.5 }} />
                    <Skeleton variant="text" width={80} />
                  </Box>
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" width={80} />
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" width={80} />
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" width={80} />
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" width={80} />
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" width={80} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Skeleton */}
      <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
        <Skeleton variant="rectangular" width={200} height={40} />
      </Box>
    </Paper>
  )
}