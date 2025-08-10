import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  Slider,
  Typography,
} from "@mui/material"
import { Refresh as RefreshIcon } from "@mui/icons-material"
import { useEffect, useState } from "react"
import type { WeightKey } from "../../app/settings"
import { MAX_TUNES, useSettingsStore } from "../../app/settings"
import SpaceBetween from "../../components/SpaceBetween"
import { useLocalStorage } from "../../hooks/useLocalStorage"

const WeightSettings = () => {
  const { weights: currentWeights, setWeights } = useSettingsStore()
  const [weightsState, setWeightsState] = useLocalStorage(
    "algorithm-weights",
    currentWeights,
    500
  )
  const [totalChanges, setTotalChanges] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)

  // Calculate total changes from default weights
  useEffect(() => {
    let changes = 0
    Object.entries(weightsState).forEach(([key, value]) => {
      const defaultValue = currentWeights[key as WeightKey]
      changes += Math.abs(value - defaultValue)
    })
    // setTotalChanges(Math.round(changes * 10) / 10) // Round to 1 decimal place
  }, [weightsState, currentWeights])

  const handleWeightChange = (key: WeightKey, newValue: number) => {
    const defaultValue = currentWeights[key]
    const currentWeight = weightsState[key]

    // Calculate the actual change in deviation (not absolute)
    const currentDeviation = currentWeight - defaultValue
    const newDeviation = newValue - defaultValue
    const changeDelta = newDeviation - currentDeviation

    // Check if this change would exceed the maximum
    if (totalChanges + changeDelta > MAX_TUNES) {
      setError(
        `Cannot adjust weight. Maximum of ${MAX_TUNES} points of deviation reached.`
      )
      return
    }

    const total = totalChanges + changeDelta
    if (total < 0) return

    setTotalChanges(total)

    setError(null)

    setWeightsState((prev) => {
      const val = {
        ...prev,
        [key]: newValue,
      }
      setWeights(val)
      return val
    })
  }

  const resetWeights = () => {
    setResetDialogOpen(true)
  }

  const handleConfirmReset = () => {
    setTotalChanges(0)
    setWeightsState(currentWeights)
    setWeights(currentWeights)
    setError(null)
    setResetDialogOpen(false)
  }

  const weightEntries = Object.entries(weightsState).map(([key, value]) => ({
    key: key as WeightKey,
    name: key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase()),
    value,
    defaultValue: currentWeights[key as WeightKey],
    deviation: value - currentWeights[key as WeightKey],
  }))

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Algorithm Weight Settings
      </Typography>

      <Typography variant="body1" color="text.secondary" gutterBottom>
        Adjust the weights for different factors in the algorithm. You have a
        total of {MAX_TUNES} points of deviation from the default values. Each
        slider ranges from -25 to +25 from the default. Changes are saved
        automatically.
      </Typography>

      <Box sx={{ mb: 3 }}>
        <SpaceBetween>
          <Typography variant="h6" gutterBottom>
            Total Changes Used: {totalChanges.toFixed(2)} / {MAX_TUNES}
          </Typography>
          <Box
            sx={{ mb: 1, display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button variant="outlined" onClick={resetWeights} color="error">
              Reset All to Defaults
            </Button>
          </Box>
        </SpaceBetween>
        <Box
          sx={{
            height: 10,
            bgcolor: "grey.200",
            borderRadius: 1,
            overflow: "hidden",
          }}>
          <Box
            sx={{
              height: "100%",
              bgcolor: totalChanges > MAX_TUNES ? "error.main" : "primary.main",
              width: `${Math.min(100, (totalChanges / MAX_TUNES) * 100)}%`,
            }}
          />
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        {weightEntries.map((weight) => (
          <Grid
            key={weight.key}
            size={{
              xs: 12,
              md: 6,
              lg: 4,
            }}
            sx={{ width: "100%" }}>
            <Box
              sx={{
                mb: 3,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                padding: 2,
              }}>
              <Typography variant="h6" gutterBottom>
                {weight.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Default: {weight.defaultValue}
              </Typography>
              <SpaceBetween>
                <span>-25</span>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    flex: 1,
                  }}>
                  <Slider
                    value={weight.value}
                    onChange={(_, newValue) =>
                      handleWeightChange(weight.key, newValue as number)
                    }
                    min={weight.defaultValue - 25}
                    max={weight.defaultValue + 25}
                    step={0.1}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => value.toFixed(1)}
                    disabled={totalChanges >= MAX_TUNES}
                    sx={{ flex: 1 }}
                  />
                  <IconButton
                    size="small"
                    onClick={() =>
                      handleWeightChange(weight.key, currentWeights[weight.key])
                    }
                    disabled={weight.value === weight.defaultValue}
                    title="Reset to default"
                    sx={{ minWidth: "auto", p: 0.5 }}>
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Box>
                <span>25</span>
              </SpaceBetween>
              <SpaceBetween>
                <Typography variant="body2" color="text.secondary">
                  Current: {weight.value.toFixed(1)}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color:
                      weight.deviation > 0
                        ? "success.main"
                        : weight.deviation < 0
                        ? "error.main"
                        : "text.secondary",
                    fontWeight: "medium",
                  }}>
                  {weight.deviation > 0
                    ? `+${weight.deviation.toFixed(1)}`
                    : weight.deviation.toFixed(1)}
                </Typography>
              </SpaceBetween>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        aria-labelledby="reset-dialog-title"
        aria-describedby="reset-dialog-description">
        <DialogTitle id="reset-dialog-title">Reset All Weights</DialogTitle>
        <DialogContent>
          <DialogContentText id="reset-dialog-description">
            Are you sure you want to reset all weight settings to their default
            values? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmReset}
            variant="contained"
            color="error">
            Reset All
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default WeightSettings
