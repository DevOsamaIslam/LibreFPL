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
  Switch,
  TextField,
} from "@mui/material"
import { useSettingsStore } from "../app/settings"
import PageTitle from "../components/PageTitle"

function Teams() {
  const [optimalTeam, setOptimalTeam] = useState<IOptimalTeamPlayer[]>([])
  const {
    desiredFormation,
    benchBoostEnabled,
    tripleCaptainEnabled,
    numberEnablers,
    sortedPlayers,
    setDesiredFormation,
    setBenchBoostEnabled,
    setTripleCaptainEnabled,
    setNumberEnablers,
  } = useSettingsStore()

  return (
    <>
      <PageTitle>Lineup Builder</PageTitle>
      <Typography variant="h4" component="h1" gutterBottom>
        Teams
      </Typography>

      <Grid container>
        <Grid size={8} style={{ marginBottom: "20px" }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Lineup
          </Typography>
          <Typography variant="h6" component="h2" gutterBottom>
            Team Cost: $
            {optimalTeam
              .reduce((acc, player) => acc + player.element.now_cost / 10, 0)
              .toFixed(2)}
          </Typography>
          <Typography variant="h6" component="h2" gutterBottom>
            Team score:{" "}
            {optimalTeam
              .reduce((acc, player) => acc + player.score, 0)
              .toFixed(2)}
          </Typography>
          {/* Placeholder for Lineup */}
          <Button
            variant="contained"
            onClick={() => {
              setOptimalTeam(
                selectTeam({
                  players: sortedPlayers,
                  desiredFormation,
                  benchBoostEnabled,
                  tripleCaptainEnabled,
                  numberEnablers,
                })
              )
            }}>
            Generate Lineup
          </Button>
          <LineupDisplay lineup={optimalTeam} />
        </Grid>

        <Grid size={2} style={{ flex: 1, marginRight: "20px" }}>
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

          <div
            style={{
              width: "1px",
              backgroundColor: "gray",
              height: "100px",
              marginRight: "20px",
            }}></div>

          <div style={{ flex: 1 }}>
            <div>
              <label>Bench Boost Enabled:</label>
              <Switch
                checked={benchBoostEnabled}
                onChange={(e) => setBenchBoostEnabled(e.target.checked)}
              />
            </div>

            <div>
              <label>Triple Captain Enabled:</label>
              <Switch
                checked={tripleCaptainEnabled}
                onChange={(e) => setTripleCaptainEnabled(e.target.checked)}
              />
            </div>

            <FormControl fullWidth margin="normal">
              <TextField
                id="number-enablers"
                label="Number of Enablers"
                type="number"
                value={numberEnablers}
                onChange={(e) => setNumberEnablers(Number(e.target.value))}
                inputProps={{ min: 0, max: 4 }}
              />
            </FormControl>
          </div>
        </Grid>
      </Grid>
    </>
  )
}

export default Teams
