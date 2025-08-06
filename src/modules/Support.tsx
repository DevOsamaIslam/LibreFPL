import { useMemo, useState } from "react"
import {
  Box,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import PageTitle from "../components/PageTitle"
import { SUPPORT_ADDRESSES } from "../app/settings"

// Minimal QR component using a simple API for rendering without extra deps.
// In production, consider a local QR generator to avoid network dependency.
const QR: React.FC<{ text: string; size?: number }> = ({
  text,
  size = 180,
}) => {
  const src = useMemo(() => {
    // Encode for URL; using Google Charts API which is deprecated but widely available.
    // Replace with a self-hosted QR generator if desired.
    const enc = encodeURIComponent(text)
    return `https://quickchart.io/qr?text==${enc}`
  }, [text, size])
  return <img src={src} width={size} height={size} alt="QR code" />
}

type Currency = keyof typeof SUPPORT_ADDRESSES // "BTC" | "XMR"

export default function Support() {
  const [currency, setCurrency] = useState<Currency>("BTC")
  const [copied, setCopied] = useState(false)
  const address = SUPPORT_ADDRESSES[currency]

  const handleToggle = (_: React.ChangeEvent<{}>, checked: boolean) => {
    setCurrency(checked ? "XMR" : "BTC")
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
    } catch {
      // no-op; avoid noisy alerts
    }
  }

  const handleCloseSnack = () => setCopied(false)

  return (
    <>
      <PageTitle>Support</PageTitle>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Typography variant="h4" component="h1">
            Support
          </Typography>

          <Typography variant="body1" color="text.secondary">
            If you find this project useful, you can support development by
            sending a tip. Use the switch to choose your preferred network, scan
            the QR code, or copy the wallet address.
          </Typography>

          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="subtitle1">Bitcoin</Typography>
            <Switch
              color="primary"
              checked={currency === "XMR"}
              onChange={handleToggle}
              inputProps={{ "aria-label": "Toggle Bitcoin / Monero" }}
            />
            <Typography variant="subtitle1">Monero</Typography>
          </Stack>

          <Divider />

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={3}
            alignItems={{ xs: "flex-start", sm: "center" }}>
            <Box>
              <QR text={address} size={200} />
            </Box>

            <Box sx={{ minWidth: 360, width: "100%" }}>
              <TextField
                fullWidth
                label={`${currency} Address`}
                value={address}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="Copy address"
                        onClick={handleCopy}>
                        <ContentCopyIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Stack>
          <Snackbar
            open={copied}
            autoHideDuration={2000}
            onClose={handleCloseSnack}
            message={`${currency} address copied`}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          />
        </Stack>
      </Container>
    </>
  )
}
