import DeleteIcon from "@mui/icons-material/Delete"
import {
  Box,
  Button,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import React, { memo, useMemo } from "react"
import { useShallow } from "zustand/shallow"
import { stat2label, useSettingsStore } from "../../app/settings"
import SpaceBetween from "../../components/SpaceBetween"
import {
  NUMBER_FILTER_OPS,
  Position,
  STRING_FILTER_OPS,
  usePlayerFilterStore,
  type FilterOp,
  type FilterTuple,
} from "../../store/playerFilter.store"
import { convert2label } from "../../lib/helpers"

type TeamOption = { id: number; name: string }

interface PlayerFilterPanelProps {
  teams: TeamOption[]
}

const gap = 1

const isNumericValue = (value: any) => {
  if (typeof value === "number") return true
  if (typeof value === "string") return !isNaN(+value)
  if (typeof value === "boolean") return false
  return false
}

const PlayerFilterPanel: React.FC<PlayerFilterPanelProps> = ({ teams }) => {
  const { filters, addFilter, updateFilter, removeFilter } =
    usePlayerFilterStore(
      useShallow((s) => ({
        filters: s.filters,
        setFilters: s.setFilters,
        addFilter: s.addFilter,
        updateFilter: s.updateFilter,
        removeFilter: s.removeFilter,
      }))
    )

  const { sortedPlayers } = useSettingsStore()
  const randomPlayer = {
    ...sortedPlayers[0],
    ...sortedPlayers[0]?.element,
  }

  const teamOptions = teams.map((t) => t.name)

  const getOperators = (field: string) => {
    const value = randomPlayer?.[field]
    if (isNumericValue(value)) return NUMBER_FILTER_OPS
    return STRING_FILTER_OPS
  }

  const handleAddNameFilter = () =>
    addFilter(["web_name", STRING_FILTER_OPS[0], ""])

  const handleAddTeamFilter = () =>
    addFilter(["teamName", STRING_FILTER_OPS[0], ""])

  const handleAddPositionFilter = () =>
    addFilter(["position", STRING_FILTER_OPS[0], ""])

  const handleAddNumeric = (field: FilterTuple[0]) =>
    addFilter([field, NUMBER_FILTER_OPS[0], 0])

  // Example of some quick-adds. In a real UI you might render a dynamic list.
  const quickAdds = useMemo(
    () => [
      { label: "Add Name filter", onClick: handleAddNameFilter },
      { label: "Add Team filter", onClick: handleAddTeamFilter },
      { label: "Add Position filter", onClick: handleAddPositionFilter },
      {
        label: "Add Total Points filter",
        onClick: () => handleAddNumeric("total_points"),
      },
      {
        label: "Add Custom filter",
        onClick: () => handleAddNumeric("now_cost"),
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
              onClick={() => {
                qa.onClick()
              }}
            />
          ))}
        </Stack>

        <Divider sx={{ my: 1 }} />

        <Stack sx={{ gap }}>
          {filters.map((f, idx) => {
            const [field, op, value] = f
            const ops = getOperators(field as any)
            const isText = !isNumericValue(randomPlayer?.[field])
            const isTeam = field === "team"
            const isPosition = field === "position"

            return (
              <SpaceBetween spacing={1} key={idx}>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel id={`field-${idx}`}>Field</InputLabel>
                  <Select
                    labelId={`field-${idx}`}
                    label="Field"
                    value={field}
                    onChange={(e) => {
                      const nf = e.target.value
                      const next: FilterTuple = [nf, getOperators(nf)[0], ""]
                      updateFilter(idx, next)
                    }}>
                    {Object.keys(randomPlayer)
                      .sort()
                      .map((ff, idx) => (
                        <MenuItem key={idx} value={ff}>
                          {stat2label[ff] || convert2label(ff)}
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
