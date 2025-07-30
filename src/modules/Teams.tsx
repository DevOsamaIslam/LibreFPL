import LineupDisplay from "./LineupDisplay"
import { pickOptimalFPLTeamAdvanced } from "../app/algo"
import snapshot from "../snapshot.json"
import Container from "@mui/material/Container"
import Typography from "@mui/material/Typography"
import type { ISnapshot, Player } from "../lib/types"

import { useState } from "react"

function Teams() {
  const [optimalTeam, setOptimalTeam] = useState<Player[]>([])

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Teams
      </Typography>

      <Typography variant="h6" component="h2" gutterBottom>
        Lineup
      </Typography>
      {/* Placeholder for Lineup */}
      <LineupDisplay lineup={optimalTeam} />
      <button
        onClick={() => {
          const newOptimalTeam = pickOptimalFPLTeamAdvanced(
            snapshot as unknown as ISnapshot
          )
          setOptimalTeam(newOptimalTeam)
          // alert(JSON.stringify(optimalTeam))
        }}>
        Generate Lineup
      </button>

      <Typography variant="h6" component="h2" gutterBottom>
        Substitutes
      </Typography>
      {/* Placeholder for Substitutes */}
      <LineupDisplay lineup={optimalTeam} />
    </Container>
  )
}

export default Teams
