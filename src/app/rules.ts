export default {
  MAX_PER_TEAM: 3, // Max 3 players per Premier League club
  MAX_PLAYERS: 15, // Squad size allowed
  SCORING: {
    goal: {
      def: 6, // Defender goal = 6 points
      mid: 5, // Midfielder goal = 5 points
      att: 4, // Forward goal = 4 points
    },
    assist: 3, // Assist = 3 points
    clean_sheet: {
      def: 4, // Defender clean sheet = 4 points
      gk: 4, // Goalkeeper clean sheet = 4 points
      mid: 1, // Midfielder clean sheet = 1 point
    },
    appearance: {
      min60: 2, // ≥60 mins played (excludes stoppage) = 2 points
      less60: 1, // <60 mins = 1 point
    },
    goals_conceded: {
      gk_def: -1, // −1 for every 2 goals conceded by goalkeeper or defender
    },
    penalty_miss: -2, // Penalty miss
    yellow_card: -1,
    red_card: -3,
    own_goal: -2,
    save: {
      gk: "per 3 saves: 1", // one point per every 3 saves (but BPS influences)
    },
    penalty_save: 5,
    // Defensive contributions (new for 2025/26)
    def_contribution: {
      def: { threshold: 10, points: 2 }, // CBIT ≥10 → +2
      mid: { threshold: 12, points: 2 }, // CBIRT ≥12 → +2
      att: { threshold: 12, points: 2 }, // same threshold for forwards
    },
    bonus_points: "BPS‑based 1‑3", // Bonus for top 3 performers via BPS
  },
}
