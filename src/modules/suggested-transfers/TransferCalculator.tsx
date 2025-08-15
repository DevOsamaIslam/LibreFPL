import { Button, TextField, Stack } from "@mui/material"

interface TransferCalculatorProps {
  bankInput: string
  setBankInput: (value: string) => void
  freeTransfers: string
  setFreeTransfers: (value: string) => void
  handleSuggest: () => void
  selectedPlayersLength: number
}

export function TransferCalculator({
  bankInput,
  setBankInput,
  freeTransfers,
  setFreeTransfers,
  handleSuggest,
  selectedPlayersLength,
}: TransferCalculatorProps) {
  return (
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
        disabled={!selectedPlayersLength}>
        Suggest
      </Button>
    </Stack>
  )
}
