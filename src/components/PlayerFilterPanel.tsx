import React, { memo, useMemo } from "react"
import {
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
  Box,
  Divider,
  Typography,
  Stack,
  IconButton,
  Button,
} from "@mui/material"
import {
  usePlayerFilterStore,
  Position,
  FilterOp,
  FilterField,
  type FilterTuple,
} from "../store/playerFilter.store"
import { useShallow } from "zustand/shallow"
import SpaceBetween from "./SpaceBetween"
import DeleteIcon from "@mui/icons-material/Delete"

type TeamOption = { id: number; name: string }

interface PlayerFilterPanelProps {
  teams: TeamOption[]
}

const gap = 1
const colTemplate = "repeat(2, minmax(140px, 1fr))"

const textFields = [
  FilterField.name,
  FilterField.team,
  FilterField.position,
  FilterField.form,
  FilterField.points_per_game,
  FilterField.selected_by_percent,
  FilterField.value_form,
  FilterField.value_season,
] as const

const operatorOptionsByField: Record<
  (typeof FilterField)[keyof typeof FilterField],
  readonly FilterOp[]
> = {
  name: [FilterOp.contains, FilterOp.eq],
  team: [FilterOp.contains, FilterOp.eq],
  position: [FilterOp.contains, FilterOp.eq],
  chance_of_playing_next_round: [FilterOp.eq, FilterOp.gt, FilterOp.lt],
  total_points: [FilterOp.eq, FilterOp.gt, FilterOp.lt],
  now_cost: [FilterOp.eq, FilterOp.gt, FilterOp.lt],
  form: [FilterOp.contains, FilterOp.eq],
  points_per_game: [FilterOp.contains, FilterOp.eq],
  selected_by_percent: [FilterOp.contains, FilterOp.eq],
  transfers_in_event: [FilterOp.eq, FilterOp.gt, FilterOp.lt],
  transfers_out_event: [FilterOp.eq, FilterOp.gt, FilterOp.lt],
  value_form: [FilterOp.contains, FilterOp.eq],
  value_season: [FilterOp.contains, FilterOp.eq],
  minutes: [FilterOp.eq, FilterOp.gt, FilterOp.lt],
  goals_scored: [FilterOp.eq, FilterOp.gt, FilterOp.lt],
  assists: [FilterOp.eq, FilterOp.gt, FilterOp.lt],
  clean_sheets: [FilterOp.eq, FilterOp.gt, FilterOp.lt],
  goals_conceded: [FilterOp.eq, FilterOp.gt, FilterOp.lt],
}

const PlayerFilterPanel: React.FC<PlayerFilterPanelProps> = ({ teams }) => {
  const { filters, setFilters, addFilter, updateFilter, removeFilter } =
    usePlayerFilterStore(
      useShallow((s) => ({
        filters: s.filters,
        setFilters: s.setFilters,
        addFilter: s.addFilter,
        updateFilter: s.updateFilter,
        removeFilter: s.removeFilter,
      }))
    )

  const teamOptions = teams.map((t) => t.name)

  const handleAddNameFilter = () =>
    addFilter([FilterField.name, FilterOp.contains, ""])

  const handleAddTeamFilter = () =>
    addFilter([FilterField.team, FilterOp.eq, ""])

  const handleAddPositionFilter = () =>
    addFilter([FilterField.position, FilterOp.eq, ""])

  const handleAddNumeric = (
    field:
      | typeof FilterField.chance_of_playing_next_round
      | typeof FilterField.total_points
      | typeof FilterField.now_cost
      | typeof FilterField.minutes
      | typeof FilterField.goals_scored
      | typeof FilterField.assists
      | typeof FilterField.clean_sheets
      | typeof FilterField.goals_conceded
  ) => addFilter([field, FilterOp.eq, 0])

  // Example of some quick-adds. In a real UI you might render a dynamic list.
  const quickAdds = useMemo(
    () => [
      { label: "Add Name filter", onClick: handleAddNameFilter },
      { label: "Add Team filter", onClick: handleAddTeamFilter },
      { label: "Add Position filter", onClick: handleAddPositionFilter },
      {
        label: "Add Total Points filter",
        onClick: () => handleAddNumeric(FilterField.total_points),
      },
      {
        label: "Add Cost filter",
        onClick: () => handleAddNumeric(FilterField.now_cost),
      },
    ],
    []
  )

  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        alignSelf: "flex-start",
        maxHeight: "calc(100vh - 88px)",
        overflowY: "auto",
        p: 2,
        borderRadius: 2,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        backgroundColor: (theme) => theme.palette.background.paper,
      }}>
      <Typography variant="h6" sx={{ mb: 1.5 }}>
        Filter Players
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Stack sx={{ gap }}>
        <Typography variant="subtitle2">Quick add</Typography>
        <Stack direction={"row"} spacing={1}>
          {quickAdds.map((qa) => (
            <Button
              variant="outlined"
              key={qa.label}
              children={qa.label}
              size="small"
              onClick={(e) => {
                qa.onClick()
              }}
            />
          ))}
        </Stack>

        <Divider sx={{ my: 1 }} />

        <Stack sx={{ gap }}>
          {filters.map((f, idx) => {
            const [field, op, value] = f
            const ops = operatorOptionsByField[field]
            const isText = (textFields as readonly string[]).includes(field)
            const isTeam = field === FilterField.team
            const isPosition = field === FilterField.position

            return (
              <SpaceBetween spacing={1} key={idx}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel id={`field-${idx}`}>Field</InputLabel>
                  <Select
                    labelId={`field-${idx}`}
                    label="Field"
                    value={field}
                    onChange={(e) => {
                      const nf = e.target
                        .value as (typeof FilterField)[keyof typeof FilterField]
                      const next: FilterTuple = [
                        nf,
                        operatorOptionsByField[nf][0],
                        "",
                      ]
                      updateFilter(idx, next)
                    }}>
                    {Object.values(FilterField).map((ff) => (
                      <MenuItem key={ff} value={ff}>
                        {ff}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel id={`op-${idx}`}>Op</InputLabel>
                  <Select
                    labelId={`op-${idx}`}
                    label="Op"
                    value={op}
                    onChange={(e) => {
                      const next: FilterTuple = [
                        field,
                        e.target.value as FilterOp,
                        value,
                      ]
                      updateFilter(idx, next)
                    }}>
                    {ops.map((o) => (
                      <MenuItem key={o} value={o}>
                        {o}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {isTeam ? (
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel id={`val-${idx}`}>Team</InputLabel>
                    <Select
                      labelId={`val-${idx}`}
                      label="Team"
                      value={String(value ?? "")}
                      onChange={(e) =>
                        updateFilter(idx, [field, op, e.target.value])
                      }>
                      <MenuItem value="">
                        <em>Any</em>
                      </MenuItem>
                      {teamOptions.map((nm) => (
                        <MenuItem key={nm} value={nm}>
                          {nm}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : isPosition ? (
                  <FormControl size="small" sx={{ minWidth: 100 }}>
                    <InputLabel id={`pos-${idx}`}>Position</InputLabel>
                    <Select
                      labelId={`pos-${idx}`}
                      label="Position"
                      value={String(value ?? "")}
                      onChange={(e) =>
                        updateFilter(idx, [field, op, e.target.value])
                      }>
                      <MenuItem value="">
                        <em>Any</em>
                      </MenuItem>
                      <MenuItem value={Position.GK}>GK</MenuItem>
                      <MenuItem value={Position.DEF}>DEF</MenuItem>
                      <MenuItem value={Position.MID}>MID</MenuItem>
                      <MenuItem value={Position.FWD}>FWD</MenuItem>
                    </Select>
                  </FormControl>
                ) : isText ? (
                  <TextField
                    size="small"
                    label="Value"
                    value={String(value ?? "")}
                    onChange={(e) =>
                      updateFilter(idx, [field, op, e.target.value])
                    }
                  />
                ) : (
                  <TextField
                    type="number"
                    size="small"
                    label="Value"
                    value={
                      value === null || value === undefined ? "" : Number(value)
                    }
                    onChange={(e) =>
                      updateFilter(idx, [
                        field,
                        op,
                        e.target.value === "" ? 0 : Number(e.target.value),
                      ])
                    }
                  />
                )}

                <IconButton
                  aria-label="remove"
                  size="small"
                  onClick={() => removeFilter(idx)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </SpaceBetween>
            )
          })}
        </Stack>
      </Stack>
    </Box>
  )
}

export default memo(PlayerFilterPanel)
