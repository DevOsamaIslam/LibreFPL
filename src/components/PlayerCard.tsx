import CloseIcon from "@mui/icons-material/Close"
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material"
import type { ReactNode } from "react"
import { colorByPos, NUMBER_OF_MATCHES } from "../app/settings"
import type { IOptimalTeamPlayer } from "../lib/types"
import type { Team } from "../modules/player-compare/control"
import {
  ELEMENT_TYPE,
  label,
  numberFmt,
  pctFmt,
  priceFmt,
  teamAttackStrength,
  teamDefenseStrength,
} from "../modules/player-compare/control"
import { getTeamFDR } from "../app/fdrAlgo"
import Cell from "./Cell"

export default function PlayerCard({
  element,
  team,
  onRemove,
}: {
  element: IOptimalTeamPlayer
  team?: Team
  onRemove?: () => void
}) {
  const { element: player, score } = element
  const ownership =
    (player.selected_by_percent as unknown as number) ?? undefined
  const xg = (player as any).expected_goals as number | undefined
  const xa = (player as any).expected_assists as number | undefined

  const position = ELEMENT_TYPE[player.element_type]

  const att = teamAttackStrength(team)
  const def = teamDefenseStrength(team)

  const FDR = getTeamFDR(player.team, { span: 5 })

  const Row = ({ left, right }: { left: ReactNode; right: ReactNode }) => (
    <Stack
      direction="row"
      justifyContent="space-between"
      gap={2}
      sx={{ py: 0.25 }}>
      <Typography variant="body2" color="text.secondary">
        {left}
      </Typography>
      <Typography variant="body2">{right}</Typography>
    </Stack>
  )

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardHeader
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h6" fontWeight={700}>
              {player.web_name}
            </Typography>
            <Chip
              size="small"
              label={position}
              sx={{
                height: 20,
                "& .MuiChip-label": { px: 0.75 },
                background: colorByPos[position],
                color: "white",
              }}
            />
            <Chip
              size="small"
              color="primary"
              label={`Score: ${element.score.toFixed(0)}`}
              sx={{
                height: 20,
                "& .MuiChip-label": { px: 0.75 },
                color: "white",
              }}
            />
          </Stack>
        }
        action={
          onRemove && (
            <IconButton aria-label="remove" color="error" onClick={onRemove}>
              <CloseIcon />
            </IconButton>
          )
        }
        sx={{ pb: 0.5 }}
      />
      <CardContent sx={{ pt: 1.5 }}>
        <Section title={label.basic}>
          <Row
            left={label.teamLabel}
            right={String(team?.short_name ?? team?.name ?? "-")}
          />
          <Row left={label.position} right={position} />
          <Row left={label.price} right={String(priceFmt(player.now_cost))} />
          <Row
            left={label.selection}
            right={
              typeof ownership === "number"
                ? String(pctFmt(ownership))
                : String(player.selected_by_percent ?? "-")
            }
          />
        </Section>

        <Section title={label.performance}>
          <Row left={"Score"} right={String(numberFmt(score, 0))} />
          <Row
            left={label.points}
            right={String(numberFmt(player.total_points, 0))}
          />
          <Row left={label.mins} right={String(numberFmt(player.minutes, 0))} />
          <Row
            left={"Minutes per 90"}
            right={String(numberFmt(player.minutes / NUMBER_OF_MATCHES, 0))}
          />
          <Row
            left={label.goals}
            right={String(numberFmt(player.goals_scored, 0))}
          />
          <Row
            left={label.assists}
            right={String(numberFmt(player.assists, 0))}
          />
          <Row
            left={label.xPointsNext}
            right={String(numberFmt(+(player.ep_this || player.ep_next), 0))}
          />
          <Row
            left={label.cleanSheet}
            right={String(numberFmt(player.clean_sheets, 0))}
          />
          <Row
            left={label.conceded}
            right={String(numberFmt(player.goals_conceded, 0))}
          />
          <Row
            left={label.saves}
            right={
              <Stack direction={"row"} spacing={1}>
                {String(numberFmt(player.saves, 0))} (
                {numberFmt(player.saves_per_90, 0)} per match)
              </Stack>
            }
          />
          <Row
            left={label.defCon}
            right={numberFmt(player.defensive_contribution, 0) || "-"}
          />
          <Row
            left={label.xG}
            right={xg !== undefined ? String(numberFmt(xg, 2)) : "-"}
          />
          <Row
            left={label.xA}
            right={xa !== undefined ? String(numberFmt(xa, 2)) : "-"}
          />
        </Section>

        <Section title={label.discipline}>
          <Row
            left={label.yellowCards}
            right={String(numberFmt(player.yellow_cards, 0))}
          />
          <Row
            left={label.redCards}
            right={String(numberFmt(player.red_cards, 0))}
          />
        </Section>

        <Section title={label.team}>
          <Row
            left={label.attack}
            right={att !== undefined ? String(numberFmt(att, 0)) : "-"}
          />
          <Row
            left={label.defense}
            right={def !== undefined ? String(numberFmt(def, 0)) : "-"}
          />
          <Row
            left={label.upcomingGWs}
            right={
              <Stack direction={"row"} spacing={1}>
                {FDR.teamFDR.map((fdr) => (
                  <Cell
                    key={fdr.score}
                    label={fdr.score.toFixed(2)}
                    score={fdr.score}
                  />
                ))}
                <Cell
                  label={FDR.average.toFixed(2)}
                  score={FDR.average}
                  showLabel
                />
              </Stack>
            }
          />
        </Section>
      </CardContent>
    </Card>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <Box sx={{ pt: 1.5 }}>
      <Divider textAlign="left" sx={{ mb: 1.25 }}>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ letterSpacing: "0.06em" }}>
          {title}
        </Typography>
      </Divider>
      {children}
    </Box>
  )
}
