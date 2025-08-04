import { BrowserRouter, Routes, Route, Link } from "react-router"
import Home from "./modules/Home"
import Players from "./modules/Players"
import Teams from "./modules/Teams"
import Rules from "./modules/Rules"
import SquadRatingPage from "./modules/SquadRating/SquadRatingPage"
import { ThemeProvider } from "@mui/material/styles"
import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import Container from "@mui/material/Container"
import theme from "./app/theme"
import CssBaseline from "@mui/material/CssBaseline"
import { useSettingsStore } from "./app/settings"
import { useEffect } from "react"
import { pickOptimalFPLTeamAdvanced } from "./app/algo"

function App() {
  const { setSortedPlayers, snapshot } = useSettingsStore()
  useEffect(() => {
    if (snapshot) setSortedPlayers(pickOptimalFPLTeamAdvanced(snapshot))
  }, [])

  return (
    <>
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
              <Button color="inherit" component={Link} to="/squad-rating">
                Squad Rating
              </Button>
              <Button color="inherit" component={Link} to="/rules">
                Rules
              </Button>
            </Toolbar>
          </AppBar>
          <Container maxWidth="xl">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/players" element={<Players />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/rules" element={<Rules />} />
              <Route path="/squad-rating" element={<SquadRatingPage />} />
            </Routes>
          </Container>
        </BrowserRouter>
      </ThemeProvider>
    </>
  )
}

export default App
