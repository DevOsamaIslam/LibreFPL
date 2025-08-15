import { Alert, Snackbar as MuiSnackbar } from "@mui/material"
import { styled } from "@mui/material/styles"
import { useSnackbar } from "../context/SnackbarContext"

const SnackbarContainer = styled("div")(({ theme }) => ({
  position: "fixed",
  top: theme.spacing(2),
  right: theme.spacing(2),
  zIndex: theme.zIndex.snackbar,
  width: "100%",
  maxWidth: "360px",
}))

const Snackbar = () => {
  const { messages, hideSnackbar } = useSnackbar()

  const getSeverity = (type: "success" | "error" | "info" | "warning") => {
    switch (type) {
      case "success":
        return "success"
      case "error":
        return "error"
      case "warning":
        return "warning"
      default:
        return "info"
    }
  }

  return (
    <SnackbarContainer>
      {messages.map((message) => (
        <MuiSnackbar
          key={message.id}
          open={true}
          autoHideDuration={message.duration}
          onClose={() => hideSnackbar(message.id)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}>
          <Alert
            onClose={() => hideSnackbar(message.id)}
            severity={getSeverity(message.type)}
            sx={{ width: "100%" }}>
            {message.message}
          </Alert>
        </MuiSnackbar>
      ))}
    </SnackbarContainer>
  )
}

export default Snackbar
