import { Box, Stack } from "@mui/material"
import AppBar from "@mui/material/AppBar"
import Button from "@mui/material/Button"
import CssBaseline from "@mui/material/CssBaseline"
import { ThemeProvider } from "@mui/material/styles"
import Toolbar from "@mui/material/Toolbar"
import { useEffect } from "react"
import { HashRouter, Link, Route, Routes } from "react-router"
import { pickOptimalFPLTeamAdvanced } from "./app/algo"
import { useSettingsStore } from "./app/settings"
import theme from "./app/theme"
import PageTitle from "./components/PageTitle"
import SpaceBetween from "./components/SpaceBetween"
import Charts from "./modules/Charts"
import FDRPage from "./modules/FDR"
import GenerateLineup from "./modules/GenerateLineup"
import Home from "./modules/Home"
import Players from "./modules/Players"
import PlayersCompare from "./modules/PlayersCompare/PlayersCompare"
import SquadRatingPage from "./modules/SquadRating/SquadRatingPage"
import Support from "./modules/Support"

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
        <HashRouter>
          <AppBar position="static" sx={{ mb: 2 }}>
            <Toolbar sx={{ color: "white" }}>
              <SpaceBetween>
                <Link to={"/"}>
                  <img
                    src={`${
                      import.meta.env.MODE === "production" ? "/LibreFPL" : ""
                    }/logo.png`}
                    alt="logo"
                    width={100}
                    style={{ padding: 8 }}
                  />
                </Link>
                <Stack direction="row" spacing={2}>
                  <Button color="inherit" component={Link} to="/players">
                    Players
                  </Button>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/generate-lineup">
                    Generate Lineup
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
                  <Button color="inherit" component={Link} to="/fdr">
                    FDR
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
              <Route path="/generate-lineup" element={<GenerateLineup />} />
              <Route path="/compare" element={<PlayersCompare />} />
              <Route path="/squad-rating" element={<SquadRatingPage />} />
              <Route path="/charts" element={<Charts />} />
              <Route path="/fdr" element={<FDRPage />} />
              <Route path="/support" element={<Support />} />
            </Routes>
          </Box>
        </HashRouter>
      </ThemeProvider>
    </>
  )
}

export default App
