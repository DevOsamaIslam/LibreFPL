import { Box } from "@mui/material"
import AppBar from "@mui/material/AppBar"
import Button from "@mui/material/Button"
import CssBaseline from "@mui/material/CssBaseline"
import { ThemeProvider } from "@mui/material/styles"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import { useEffect } from "react"
import { BrowserRouter, Link, Route, Routes } from "react-router"
import { pickOptimalFPLTeamAdvanced } from "./app/algo"
import { APP_NAME, useSettingsStore } from "./app/settings"
import theme from "./app/theme"
import Home from "./modules/Home"
import Players from "./modules/Players"
import PlayersCompare from "./modules/PlayersCompare/PlayersCompare"
import Rules from "./modules/Rules"
import SquadRatingPage from "./modules/SquadRating/SquadRatingPage"
import Teams from "./modules/Teams"
import PageTitle from "./components/PageTitle"

function App() {
  const { setSortedPlayers, snapshot } = useSettingsStore()
  useEffect(() => {
    if (snapshot) setSortedPlayers(pickOptimalFPLTeamAdvanced(snapshot))
  }, [])

  return (
    <>
      <PageTitle></PageTitle>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Fantasy PL
              </Typography>
              <Button color="inherit" component={Link} to="/">
                Home
              </Button>
              <Button color="inherit" component={Link} to="/players">
                Players
              </Button>
              <Button color="inherit" component={Link} to="/teams">
                Teams
              </Button>
              <Button color="inherit" component={Link} to="/compare">
                Compare
              </Button>
              <Button color="inherit" component={Link} to="/squad-rating">
                Squad Rating
              </Button>
              <Button color="inherit" component={Link} to="/rules">
                Rules
              </Button>
            </Toolbar>
          </AppBar>
          <Box sx={{ width: "90vw", marginInline: "5vw" }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/players" element={<Players />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/compare" element={<PlayersCompare />} />
              <Route path="/rules" element={<Rules />} />
              <Route path="/squad-rating" element={<SquadRatingPage />} />
            </Routes>
          </Box>
        </BrowserRouter>
      </ThemeProvider>
    </>
  )
}

export default App
