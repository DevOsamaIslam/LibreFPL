import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  TextField,
  Typography,
  Grid,
} from "@mui/material";
import { useMemo, useState } from "react";
import PageTitle from "../components/PageTitle";
import { useSettingsStore } from "../app/settings";
import type { IOptimalTeamPlayer } from "../lib/types";
import {
  suggestTransfers,
  type SuggestTransfersResult,
} from "../app/transfers";
import {
  usePlayerSelector,
  useSearchBase,
  priceFmt,
} from "../hooks/usePlayerSelector";

function PlayerRow({
  p,
  onClick,
  selected,
  teamName,
  teamShort,
}: {
  p: IOptimalTeamPlayer;
  onClick: () => void;
  selected: boolean;
  teamName: string;
  teamShort: string;
}) {
  return (
    <Button
      onClick={onClick}
      variant={selected ? "contained" : "text"}
      color={selected ? "primary" : "inherit"}
      sx={{
        justifyContent: "space-between",
        textTransform: "none",
        px: 1.5,
        py: 1,
        borderRadius: 1,
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ overflow: "hidden" }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {p.element.web_name}
        </Typography>
        <Chip size="small" label={p.position} />
        <Chip size="small" variant="outlined" label={teamShort || teamName} />
        <Typography variant="caption" color="text.secondary">
          {teamName}
        </Typography>
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="caption">Score {p.score.toFixed(1)}</Typography>
        <Chip size="small" label={`$${priceFmt(p.element.now_cost)}`} />
      </Stack>
    </Button>
  );
}

function SelectedChip({
  p,
  onRemove,
  teamName,
  teamShort,
}: {
  p: IOptimalTeamPlayer;
  onRemove: () => void;
  teamName: string;
  teamShort: string;
}) {
  return (
    <Chip
      label={`${p.element.web_name} (${p.position}) $${priceFmt(
        p.element.now_cost
      )} – ${teamShort || teamName}`}
      onDelete={onRemove}
      color="primary"
      variant="outlined"
      sx={{ mr: 1, mb: 1 }}
    />
  );
}

function SuggestedTransfersPage() {
  const sortedPlayers = useSettingsStore((s) => s.sortedPlayers);
  const {
    teamsById,
    selectedPlayers,
    togglePlayer,
    removePlayer,
    selectedIds,
    max,
  } = usePlayerSelector({ players: sortedPlayers });

  const { q, setQ, result } = useSearchBase(sortedPlayers);
  const filtered = useMemo(() => result.slice(0, 200), [result]);

  const [bankInput, setBankInput] = useState<string>("0.0");
  const [freeTransfers, setFreeTransfers] = useState<string>("1");
  const [calc, setCalc] = useState<SuggestTransfersResult | null>(null);

  const totalSelectedCost = useMemo(
    () =>
      selectedPlayers.reduce((acc, p) => acc + (p.element.now_cost ?? 0), 0) /
      10,
    [selectedPlayers]
  );
  const totalSelectedScore = useMemo(
    () => selectedPlayers.reduce((acc, p) => acc + p.score, 0),
    [selectedPlayers]
  );

  const handleSuggest = () => {
    const bankNowCost = Math.max(0, Math.round((Number(bankInput) || 0) * 10));
    const ft = Math.max(0, Math.floor(Number(freeTransfers) || 0));
    const res = suggestTransfers({
      squad: selectedPlayers,
      candidates: sortedPlayers,
      bankNowCost,
      freeTransfers: ft,
    });
    setCalc(res);
  };

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
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <TextField
                  label="Search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  size="small"
                />
                <Typography variant="body2" color="text.secondary">
                  {selectedIds.length}/{max} selected
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cost ${totalSelectedCost.toFixed(1)} | Score{" "}
                  {totalSelectedScore.toFixed(1)}
                </Typography>
              </Stack>

              <Stack spacing={1} sx={{ maxHeight: 400, overflowY: "auto" }}>
                {filtered.map((p) => {
                  const t = teamsById.get(p.element.team);
                  return (
                    <PlayerRow
                      key={p.element.id}
                      p={p}
                      onClick={() => togglePlayer(p.element.id)}
                      selected={selectedIds.includes(p.element.id)}
                      teamName={t?.name ?? ""}
                      teamShort={t?.short_name ?? ""}
                    />
                  );
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
              <Box>
                {selectedPlayers.map((p) => {
                  const t = teamsById.get(p.element.team);
                  return (
                    <SelectedChip
                      key={p.element.id}
                      p={p}
                      onRemove={() => removePlayer(p.element.id)}
                      teamName={t?.name ?? ""}
                      teamShort={t?.short_name ?? ""}
                    />
                  );
                })}
              </Box>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <TextField
                  label="Bank (m)"
                  value={bankInput}
                  onChange={(e) => setBankInput(e.target.value)}
                  size="small"
                  inputProps={{ inputMode: "decimal" }}
                />
                <TextField
                  label="Free Transfers"
                  value={freeTransfers}
                  onChange={(e) => setFreeTransfers(e.target.value)}
                  size="small"
                  inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                />
                <Button
                  variant="contained"
                  onClick={handleSuggest}
                  disabled={!selectedPlayers.length}
                >
                  Suggest
                </Button>
              </Stack>

              {calc && (
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Best Moves ({calc.suggestions.length})
                  </Typography>
                  {!calc.suggestions.length && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      No beneficial transfer found within your budget and team
                      limits.
                    </Typography>
                  )}
                  <Stack spacing={1}>
                    {calc.suggestions.map((s, i) => {
                      const outTeam = teamsById.get(s.out.element.team);
                      const inTeam = teamsById.get(s.in.element.team);
                      return (
                        <Box
                          key={i}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography variant="body2">
                            Out {s.out.element.web_name} (
                            {outTeam?.short_name ?? outTeam?.name ?? ""}) → In{" "}
                            {s.in.element.web_name} (
                            {inTeam?.short_name ?? inTeam?.name ?? ""})
                          </Typography>
                          <Stack direction="row" spacing={1}>
                            <Chip
                              size="small"
                              color={s.deltaScore > 0 ? "success" : "default"}
                              label={`+${s.deltaScore.toFixed(2)} pts`}
                            />
                            <Chip
                              size="small"
                              label={`$${(s.deltaCost / 10).toFixed(1)}m`}
                              variant="outlined"
                            />
                          </Stack>
                        </Box>
                      );
                    })}
                  </Stack>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      Total delta score: {calc.totalDeltaScore.toFixed(2)}
                    </Typography>
                    <Typography variant="body2">
                      Used bank: ${((calc.usedBank || 0) / 10).toFixed(1)}m
                    </Typography>
                    <Typography variant="body2">
                      Initial score: {calc.initialScore.toFixed(2)}
                    </Typography>
                    <Typography variant="body2">
                      Final score: {calc.finalScore.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default SuggestedTransfersPage;
