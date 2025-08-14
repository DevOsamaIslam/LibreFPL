import type { SxProps } from "@mui/material";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import type { GridProps } from "@mui/material/Grid";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";

type Feature = (typeof FEATURES)[number];

const ROUTES = {
  players: "/players",
  teams: "/teams",
  compare: "/players-compare",
  rating: "/squad-rating",
  fdr: "/fdr",
  charts: "/charts",
  suggestedTransfers: "/suggested-transfers",
  weightSettings: "/weight-settings",
  rules: "/rules",
  support: "/support",
} as const;

const FEATURES = [
  {
    key: "players",
    title: "Players",
    description: "Search, filter, and analyze players across all positions.",
    route: ROUTES.players,
    badge: "Core",
  },
  {
    key: "compare",
    title: "Players Compare",
    description: "Head-to-head comparison across stats and projections.",
    route: ROUTES.compare,
    badge: "Analysis",
  },
  {
    key: "rating",
    title: "Squad Rating",
    description: "Evaluate your squad with eligibility and rating.",
    route: ROUTES.rating,
    badge: "Insights",
  },
  {
    key: "fdr",
    title: "Fixture Difficulty (FDR)",
    description:
      "Extended heatmap of upcoming fixtures, with difficulty ratings, and averages for each team.",
    route: ROUTES.fdr,
    badge: "New",
  },
  {
    key: "charts",
    title: "Charts",
    description: "Visualizations of player stats and projections.",
    route: ROUTES.charts,
    badge: "New",
  },
  // {
  //   key: "generate-lineup",
  //   title: "Generate Lineup",
  //   description: "Generate the optimal lineup based on our inhouse algorithm.",
  //   route: ROUTES.teams,
  //   badge: "Beta",
  // },
  {
    key: "suggested-transfers",
    title: "Suggested Transfers",
    description: "Pick your squad and get optimal swap suggestions.",
    route: ROUTES.suggestedTransfers,
    badge: "New",
  },
  {
    key: "weight-settings",
    title: "Weight Settings",
    description: "Customize algorithm weights for player evaluation.",
    route: ROUTES.weightSettings,
    badge: "Advanced",
  },
] as const;

function Home() {
  const cardSx: SxProps = {
    display: "flex",
    height: "100%",
    width: 400,
    borderRadius: 2,
    transition:
      "transform 150ms ease, box-shadow 200ms ease, border-color 200ms ease",
    border: (theme: any) => `1px solid ${theme.palette.divider}`,
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: 6,
      borderColor: (theme: any) => theme.palette.primary.light,
    },
  } as const;

  const actionSx = {
    display: "flex",
    alignItems: "stretch",
    height: "100%",
  } as const;

  const contentSx = {
    display: "flex",
    flexDirection: "column",
    gap: 1,
    height: "100%",
    p: 3,
  } as const;

  const headerRowSx = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    mb: 1,
  } as const;

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 6, textAlign: { xs: "left", md: "left" } }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 700 }}
        >
          Fantasy Tools
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          A suite of utilities to research players, compare options, and rate
          squads.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {FEATURES.map((f: Feature) => (
          <Grid
            {...({
              key: f.key,
              item: true,
              xs: 12,
              sm: 6,
              md: 4,
            } as GridProps)}
          >
            <Card elevation={0} sx={cardSx}>
              <CardActionArea
                component={RouterLink}
                to={f.route}
                sx={{ ...actionSx, width: "100%" }}
              >
                <CardContent sx={{ ...contentSx, width: "100%" }}>
                  <Box sx={headerRowSx}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {f.title}
                    </Typography>
                    <Chip
                      label={f.badge}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ flexGrow: 1 }}
                  >
                    {f.description}
                  </Typography>

                  <Box
                    sx={{
                      mt: "auto",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      pt: 1,
                    }}
                  >
                    <Typography variant="button" color="primary">
                      Open
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ py: 6 }} />
    </Container>
  );
}

export default Home;
