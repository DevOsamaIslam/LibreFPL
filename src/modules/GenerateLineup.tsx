import Typography from "@mui/material/Typography"
import { selectTeam } from "../app/algo"
import type { IOptimalTeamPlayer } from "../lib/types"
import LineupDisplay from "../components/LineupDisplay"

import { useState } from "react"

import {
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  CircularProgress,
} from "@mui/material"
import { useSettingsStore } from "../app/settings"
import PageTitle from "../components/PageTitle"
import { useMutation } from "@tanstack/react-query"

function GenerateLineup() {
  const [optimalTeam, setOptimalTeam] = useState<{
    starting: IOptimalTeamPlayer[]
    bench: IOptimalTeamPlayer[]
  }>({
    starting: [],
    bench: [],
  })
  const {
    desiredFormation,
    benchBoostEnabled,
    numberEnablers,
    sortedPlayers,
    setDesiredFormation,
    setBenchBoostEnabled,
    setNumberEnablers,
  } = useSettingsStore()

  const { mutate: generateLineupMutation, isPending } = useMutation({
    mutationFn: selectTeam,
    onSuccess: (data) => {
      setOptimalTeam(data)
    },
  })

  const teamCost =
    [optimalTeam.starting, optimalTeam.bench]
      .flat()
      .reduce((acc, player) => acc + player.element.now_cost / 10, 0) || 0

  const teamScore =
    [optimalTeam.starting, optimalTeam.bench]
      .flat()
      .reduce((acc, player) => acc + player.score, 0) || 0

  return (
    <>
      <PageTitle>Lineup Builder</PageTitle>
      <Typography variant="h4" component="h1" gutterBottom>
        Teams
      </Typography>

      <Grid container>
        <Grid size={8} style={{ marginBottom: "20px" }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Team Cost: ${teamCost.toFixed(2)}
          </Typography>
          <Typography variant="h6" component="h2" gutterBottom>
            Team score: {teamScore.toFixed(2)}
          </Typography>
          {/* Placeholder for Lineup */}
          <Button
            variant="contained"
            onClick={() => {
              generateLineupMutation({
                players: sortedPlayers,
                desiredFormation,
                benchBoostEnabled,
                numberEnablers,
              })
            }}
            disabled={isPending}>
            {isPending ? (
              <>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                Generating...
              </>
            ) : (
              "Generate Lineup"
            )}
          </Button>
        </Grid>

        <Stack
          direction="row"
          spacing={2}
          style={{ flex: 1, marginRight: "20px" }}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="desired-formation-label">
              Desired Formation
            </InputLabel>
            <Select
              labelId="desired-formation-label"
              id="desired-formation"
              value={desiredFormation}
              onChange={(e) => setDesiredFormation(e.target.value as string)}>
              <MenuItem value="5-4-1">5-4-1</MenuItem>
              <MenuItem value="5-3-2">5-3-2</MenuItem>
              <MenuItem value="4-3-3">4-3-3</MenuItem>
              <MenuItem value="4-4-2">4-4-2</MenuItem>
              <MenuItem value="4-5-1">4-5-1</MenuItem>
              <MenuItem value="3-5-2">3-5-2</MenuItem>
              <MenuItem value="3-4-3">3-4-3</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <TextField
              id="number-enablers"
              label="Number of Enablers"
              type="number"
              value={numberEnablers}
              onChange={(e) => {
                const num = Number(e.target.value)
                if (num >= 0 && num <= 4) {
                  setNumberEnablers(num)
                }
              }}
            />
          </FormControl>

          <FormControl fullWidth margin="normal">
            <label>Bench Boost Enabled:</label>
            <Switch
              checked={benchBoostEnabled}
              onChange={(e) => setBenchBoostEnabled(e.target.checked)}
            />
          </FormControl>
        </Stack>
        {!!optimalTeam.starting.length && (
          <LineupDisplay
            lineup={[...optimalTeam.starting, ...optimalTeam.bench]}
          />
        )}
      </Grid>
    </>
  )
}

export default GenerateLineup
