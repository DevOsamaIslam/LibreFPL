import { Refresh as RefreshIcon } from "@mui/icons-material"
import {
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
import { useState } from "react"
import {
  MAX_TUNES,
  useSettingsStore,
  type WeightKey,
  WEIGHTS,
} from "../../app/settings"
import PageTitle from "../../components/PageTitle"
import SpaceBetween from "../../components/SpaceBetween"
import { useLocalStorage } from "../../hooks/useLocalStorage"

const TuneAlgo = () => {
  const { weights: currentWeights, setWeights } = useSettingsStore()
  const [weightsState, setWeightsState] = useLocalStorage(
    "algorithm-weights",
    currentWeights,
    500
  )
  const [resetDialogOpen, setResetDialogOpen] = useState(false)

  const handleWeightChange = (key: WeightKey, newValue: number) => {
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
    setWeightsState(WEIGHTS)
    setWeights(WEIGHTS)
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
    <>
      <PageTitle>Tune Algo</PageTitle>
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
          <Box
            sx={{
              mb: 1,
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
            }}>
            <Button variant="outlined" onClick={resetWeights} color="error">
              Reset All to Defaults
            </Button>
          </Box>
          <Box
            sx={{
              height: 10,
              bgcolor: "grey.200",
              borderRadius: 1,
              overflow: "hidden",
            }}></Box>
        </Box>

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
                  Default: {WEIGHTS[weight.key]?.toFixed(1)}
                </Typography>
                <SpaceBetween>
                  <span>-10</span>
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
                      min={-10}
                      max={+10}
                      step={0.5}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(value) => value.toFixed(1)}
                      sx={{ flex: 1 }}
                    />
                    <IconButton
                      size="small"
                      onClick={() =>
                        handleWeightChange(weight.key, WEIGHTS[weight.key])
                      }
                      disabled={weight.value === WEIGHTS[weight.key]}
                      title="Reset to default"
                      sx={{ minWidth: "auto", p: 0.5 }}>
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <span>10</span>
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
              Are you sure you want to reset all weight settings to their
              default values? This action cannot be undone.
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
    </>
  )
}

export default TuneAlgo
