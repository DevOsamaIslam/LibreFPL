import { green, purple } from "@mui/material/colors"
import { createTheme } from "@mui/material/styles"

const theme = createTheme({
  palette: {
    primary: {
      main: green[500],
    },
    secondary: {
      main: purple[500],
    },
  },
  // Centralize frequently used values to reduce hard-coded styles
  shape: {
    borderRadius: 8,
    // custom token used in list selection left border width
    borderLeftWidth: 3,
  } as any,
  typography: {
    fontWeightSemiBold: 600 as any,
    fontWeightExtraBold: 800 as any,
  } as any,
  zIndex: {
    // provide a baseline so component zIndex can derive from this instead of magic numbers
    appBar: 1100,
    snackbar: 1400,
  },
})

export default theme
