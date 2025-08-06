import { Box, Stack } from "@mui/material"
import AppBar from "@mui/material/AppBar"
import Button from "@mui/material/Button"
import CssBaseline from "@mui/material/CssBaseline"
import { ThemeProvider } from "@mui/material/styles"
import Toolbar from "@mui/material/Toolbar"
import { useEffect } from "react"
import { BrowserRouter, Link, Route, Routes } from "react-router"
import { pickOptimalFPLTeamAdvanced } from "./app/algo"
import { useSettingsStore } from "./app/settings"
import theme from "./app/theme"
import PageTitle from "./components/PageTitle"
import SpaceBetween from "./components/SpaceBetween"
import Home from "./modules/Home"
import Players from "./modules/Players"
import PlayersCompare from "./modules/PlayersCompare/PlayersCompare"
import SquadRatingPage from "./modules/SquadRating/SquadRatingPage"
import Teams from "./modules/Teams"
import Support from "./modules/Support"
import Charts from "./modules/Charts"

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
          <AppBar position="static" sx={{ mb: 2 }}>
            <Toolbar sx={{ color: "white" }}>
              <SpaceBetween>
                <Link to={"/"}>
                  <img
                    src="/logo.png"
                    alt="logo"
                    width={100}
                    style={{ padding: 8 }}
                  />
                </Link>
                <Stack direction="row" spacing={2}>
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
                  <Button color="inherit" component={Link} to="/charts">
                    Charts
                  </Button>
                  <Button
                    color="secondary"
                    component={Link}
                    to="/support"
                    variant="contained">
                    Support
                  </Button>
                </Stack>
              </SpaceBetween>
            </Toolbar>
          </AppBar>
          <Box sx={{ width: "90vw", marginInline: "5vw" }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/players" element={<Players />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/compare" element={<PlayersCompare />} />
              <Route path="/squad-rating" element={<SquadRatingPage />} />
              <Route path="/charts" element={<Charts />} />
              <Route path="/support" element={<Support />} />
            </Routes>
          </Box>
        </BrowserRouter>
      </ThemeProvider>
    </>
  )
}

export default App
