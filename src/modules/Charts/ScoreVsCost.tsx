import {
  Chart as ChartJS,
  Legend,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from "chart.js"
import { useMemo } from "react"
import { Scatter } from "react-chartjs-2"
import { useSearchParams } from "react-router"
import { useSettingsStore } from "../../app/settings"

ChartJS.register(LinearScale, PointElement, Tooltip, Legend, Title)

// Centralized constants to avoid hard-coded strings and to align with SquadRating
const QUERY_KEYS = {
  players: "players",
} as const

function toNumber(value: unknown): number | null {
  if (typeof value === "number") return isFinite(value) ? value : null
  if (typeof value === "string") {
    const n = Number(value)
    return isFinite(n) ? n : null
  }
  return null
}

export default function ScoreVsCost() {
  const { sortedPlayers: allPlayers = [] } = useSettingsStore()
  const [searchParams] = useSearchParams()

  // Constrain player pool if ?players=... is present (same behavior as Squad Rating)
  const players = useMemo(() => {
    const raw = searchParams.get(QUERY_KEYS.players)
    if (!raw) return allPlayers
    const wantedIds = new Set(
      raw
        .split(",")
        .map((s) => Number(s.trim()))
        .filter((n) => Number.isFinite(n))
    )
    // keep only valid ones that exist in the current pool
    const filtered = allPlayers.filter((p) => wantedIds.has(p.element.id))
    return filtered
  }, [allPlayers, searchParams])

  const pointsVsPrice = useMemo(() => {
    const ptsPrice = players
      .map((player) => {
        const price = toNumber(player.element.now_cost)
        const points = toNumber(player.score)
        return { player, price, points }
      })
      .filter((r) => r.price != null && r.points != null)

    const dataPoints = ptsPrice.map(({ player, price, points }) => ({
      x: price,
      y: points,
      player: player.element.web_name,
      team: player.teamName ?? "",
      position: player.position,
    }))

    return dataPoints
  }, [players])

  // Central color map derived from position; shared across chart and legend
  const colorByPos = useMemo(() => {
    return {
      GK: "#8B4513", // brown
      DEF: "#F59E0B", // yellow
      MID: "#10B981", // green
      FWD: "#EF4444", // red
      "1": "#8B4513",
      "2": "#F59E0B",
      "3": "#10B981",
      "4": "#EF4444",
    }
  }, [])

  const chartData = useMemo(() => {
    const groupedByPosition = Object.groupBy(pointsVsPrice, (p) => p.position)
    return {
      datasets: Object.entries(groupedByPosition).map(([pos, group]) => ({
        label: pos,
        data:
          group?.map((d) => ({
            x: d.x,
            y: d.y,
            meta: {
              name: d.player,
              team: d.team,
              position: d.position,
            },
          })) ?? [],
        backgroundColor: (colorByPos as Record<string, string>)[pos],
        pointRadius: 4,
        pointHoverRadius: 6,
      })),
    }
  }, [pointsVsPrice, colorByPos])

  const options = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: "top" as const },
        title: { display: true, text: "Player Total Points vs Price" },
        tooltip: {
          callbacks: {
            label: (ctx: any) => {
              const raw = ctx.raw as {
                x: number
                y: number
                meta?: { name?: string; position?: string | number }
              }
              const name = raw.meta?.name ?? "Player"
              const posVal = String(raw.meta?.position ?? "")
              const posCode =
                posVal === "1"
                  ? "GK"
                  : posVal === "2"
                  ? "DEF"
                  : posVal === "3"
                  ? "MID"
                  : posVal === "4"
                  ? "FWD"
                  : posVal
              return `${name} (${posCode}): Price ${raw.x}, Points ${raw.y}`
            },
          },
        },
      },
      scales: {
        x: {
          title: { display: true, text: "Price" },
          ticks: { precision: 0 },
          grid: { color: "rgba(0,0,0,0.05)" },
        },
        y: {
          title: { display: true, text: "Total Points" },
          ticks: { precision: 0 },
          grid: { color: "rgba(0,0,0,0.05)" },
        },
      },
    }
  }, [])

  return (
    <div
      style={{
        width: "100%",
        height: 460,
        display: "flex",
        flexDirection: "column",
      }}>
      <div style={{ flex: 1 }}>
        <Scatter data={chartData} options={options} />
      </div>
    </div>
  )
}
