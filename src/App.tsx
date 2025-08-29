import { Box, Stack } from "@mui/material"
import AppBar from "@mui/material/AppBar"
import Button from "@mui/material/Button"
import CssBaseline from "@mui/material/CssBaseline"
import { ThemeProvider } from "@mui/material/styles"
import Toolbar from "@mui/material/Toolbar"
import { useEffect, useState } from "react"
import { HashRouter, Link, Route, Routes } from "react-router"
import { pickOptimalFPLTeam } from "./app/algo"
import { useSettingsStore } from "./app/settings"
import theme from "./app/theme"
import PageTitle from "./components/PageTitle"
import Snackbar from "./components/Snackbar"
import SpaceBetween from "./components/SpaceBetween"
import { initializeGlobalSnackbar, useSnackbarUtils } from "./lib/snackbar"
import Charts from "./modules/Charts"
import FDRPage from "./modules/FDR"
import GenerateLineup from "./modules/GenerateLineup"
import GWTodosDrawer from "./components/GWTodosDrawer"
import Home from "./modules/Home"
import PlayersCompare from "./modules/player-compare/PlayersCompare"
import Players from "./modules/players"
import SquadRatingPage from "./modules/squad-rating/SquadRatingPage"
import SuggestedTransfersPage from "./modules/suggested-transfers"
import Support from "./modules/Support"
import TuneAlgo from "./modules/tune-algo"
import { useGWTodos } from "./hooks/useGWTodos"

function App() {
  const { setSortedPlayers, snapshot } = useSettingsStore()
  const snackbarUtils = useSnackbarUtils()
  const [isTodosDrawerOpen, setIsTodosDrawerOpen] = useState(false)
  const { todoStats, addTodos, toggleTodo, deleteTodo, getTodosForGW } =
    useGWTodos()

  useEffect(() => {
    if (snapshot) setSortedPlayers(pickOptimalFPLTeam(snapshot))
  }, [])

  // Initialize global snackbar
  useEffect(() => {
    initializeGlobalSnackbar(snackbarUtils)
  }, [snackbarUtils])

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
                  {/* <Button
                    color="inherit"
                    component={Link}
                    to="/generate-lineup">
                    Generate Lineup (Beta)
                  </Button> */}
                  <Button color="inherit" component={Link} to="/compare">
                    Compare
                  </Button>
                  <Button color="inherit" component={Link} to="/squad-rating">
                    Squad Rating
                  </Button>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/suggested-transfers">
                    Suggested Transfers
                  </Button>
                  <Button color="inherit" component={Link} to="/charts">
                    Charts
                  </Button>
                  <Button color="inherit" component={Link} to="/fdr">
                    FDR
                  </Button>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/weight-settings">
                    Weight Settings
                  </Button>
                  <Button
                    color="inherit"
                    onClick={() => setIsTodosDrawerOpen(true)}
                    startIcon={<span style={{ fontSize: "20px" }}>✓</span>}>
                    GW Todos
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
              <Route
                path="/suggested-transfers"
                element={<SuggestedTransfersPage />}
              />
              <Route path="/charts" element={<Charts />} />
              <Route path="/fdr" element={<FDRPage />} />
              <Route path="/weight-settings" element={<TuneAlgo />} />
              <Route path="/support" element={<Support />} />
            </Routes>
          </Box>
          <Snackbar />
          <GWTodosDrawer
            isOpen={isTodosDrawerOpen}
            onClose={() => setIsTodosDrawerOpen(false)}
            todoStats={todoStats}
            onAddTodo={addTodos}
            onToggleTodo={toggleTodo}
            onDeleteTodo={deleteTodo}
            getTodosForGW={getTodosForGW}
          />
        </HashRouter>
      </ThemeProvider>
    </>
  )
}

export default App
