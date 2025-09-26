import React from "react"
import {
  Box,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material"
import FilterListIcon from "@mui/icons-material/FilterList"
import type { Position } from "../../../lib/types"

interface CaptaincyFilterPanelProps {
  availablePositions: Position[]
  availableTeams: { id: number; name: string; short_name: string }[]
  filters: {
    search: string
    position: Position | ""
    team: number | ""
    minPrice: number | ""
    maxPrice: number | ""
    minxPoints: number | ""
  }
  onFilterChange: (key: "search" | "position" | "team" | "minPrice" | "maxPrice" | "minxPoints", value: string | number) => void
  onResetFilters: () => void
  isOpen: boolean
  onToggle: () => void
}

export const CaptaincyFilterPanel: React.FC<CaptaincyFilterPanelProps> = ({
  availablePositions,
  availableTeams,
  filters,
  onFilterChange,
  onResetFilters,
  isOpen,
}) => {
  return (
    <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
      <TextField
        placeholder="Search players..."
        value={filters.search}
        onChange={(e) => onFilterChange("search", e.target.value)}
        size="small"
        sx={{ width: "100%", mb: 2 }}
        InputProps={{
          startAdornment: (
            <Box component="span" sx={{ mr: 1 }}>
              🔍
            </Box>
          ),
        }}
      />

      {/* Filter Panel */}
      {isOpen && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Position</InputLabel>
            <Select
              value={filters.position}
              onChange={(e) => onFilterChange("position", e.target.value as Position | "")}
              label="Position"
            >
              <MenuItem value="">All Positions</MenuItem>
              {availablePositions.map(pos => (
                <MenuItem key={pos} value={pos}>{pos}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Team</InputLabel>
            <Select
              value={filters.team}
              onChange={(e) => onFilterChange("team", e.target.value as number | "")}
              label="Team"
            >
              <MenuItem value="">All Teams</MenuItem>
              {availableTeams.map(team => (
                <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Min Price"
            type="number"
            value={filters.minPrice}
            onChange={(e) => onFilterChange("minPrice", e.target.value ? Number(e.target.value) : "")}
            size="small"
            sx={{ minWidth: 120 }}
            InputProps={{ startAdornment: <Box component="span" sx={{ mr: 1 }}>£</Box> }}
          />

          <TextField
            label="Max Price"
            type="number"
            value={filters.maxPrice}
            onChange={(e) => onFilterChange("maxPrice", e.target.value ? Number(e.target.value) : "")}
            size="small"
            sx={{ minWidth: 120 }}
            InputProps={{ startAdornment: <Box component="span" sx={{ mr: 1 }}>£</Box> }}
          />

          <TextField
            label="Min xPoints"
            type="number"
            value={filters.minxPoints}
            onChange={(e) => onFilterChange("minxPoints", e.target.value ? Number(e.target.value) : "")}
            size="small"
            sx={{ minWidth: 120 }}
            InputProps={{
              startAdornment: <Box component="span" sx={{ mr: 1 }}>⭐</Box>,
              inputProps: { min: 0, step: 0.1 }
            }}
          />

          <IconButton onClick={onResetFilters} size="small" sx={{ p: 1 }}>
            <FilterListIcon />
          </IconButton>
        </Box>
      )}
    </Box>
  )
}