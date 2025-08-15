import { Box, Grid, Card, CardContent, Stack, Typography } from "@mui/material"
import PageTitle from "../../components/PageTitle"
import { useSuggestedTransfers } from "../../hooks/useSuggestedTransfers"
import { PlayerRow } from "./PlayerRow"
import { PlayerSearch } from "./PlayerSearch"
import { SelectedSquad } from "./SelectedSquad"
import { TransferCalculator } from "./TransferCalculator"
import { TransferResults } from "./TransferResults"
import { useSavedSquads } from "../../hooks/useSavedSquads"
import { useEffect } from "react"

export default function SuggestedTransfersPage() {
  const {
    // Player selection
    teamsById,
    selectedPlayers,
    togglePlayer,
    replacePlayers,
    removePlayer,
    selectedIds,
    max,
    // Search
    q,
    setQ,
    filtered,
    // Form inputs
    bankInput,
    setBankInput,
    freeTransfers,
    setFreeTransfers,
    // Calculations
    totalSelectedCost,
    totalSelectedScore,
    calc,
    handleSuggest,
  } = useSuggestedTransfers()

  const { SavedSquadSelector, activeSquad } = useSavedSquads()

  useEffect(() => {
    if (activeSquad) replacePlayers(activeSquad.playerIds)
  }, [activeSquad])

  return (
    <Box>
      <PageTitle>Suggested Transfers</PageTitle>
      <Typography variant="h4" component="h1" gutterBottom>
        Suggested Transfers
      </Typography>

      <Grid container>
        <Grid size={7} sx={{ pr: 2 }}>
          <Card variant="outlined">
            <CardContent>
              <PlayerSearch
                q={q}
                setQ={setQ}
                selectedIds={selectedIds}
                max={max}
                totalSelectedCost={totalSelectedCost}
                totalSelectedScore={totalSelectedScore}
              />

              <Stack spacing={1} sx={{ maxHeight: 400, overflowY: "auto" }}>
                {filtered.map((p) => {
                  const t = teamsById.get(p.element.team)
                  return (
                    <PlayerRow
                      key={p.element.id}
                      p={p}
                      onClick={() => togglePlayer(p.element.id)}
                      selected={selectedIds.includes(p.element.id)}
                      teamName={t?.name ?? ""}
                      teamShort={t?.short_name ?? ""}
                    />
                  )
                })}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={5} sx={{ pl: 2 }}>
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Selected Squad
              </Typography>
              <SavedSquadSelector />
              <SelectedSquad
                selectedPlayers={selectedPlayers}
                teamsById={teamsById}
                removePlayer={removePlayer}
              />
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <TransferCalculator
                bankInput={bankInput}
                setBankInput={setBankInput}
                freeTransfers={freeTransfers}
                setFreeTransfers={setFreeTransfers}
                handleSuggest={handleSuggest}
                selectedPlayersLength={selectedPlayers.length}
              />

              <TransferResults calc={calc} teamsById={teamsById} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
