import { useEffect, useState } from "react"
import { type TeamFDRByGw, computeFDR } from "../../app/fdrAlgo"
import { NUMBER_OF_MATCHES, useSettingsStore } from "../../app/settings"

export function useFDRData({
  spanGWs,
  startingFrom,
}: {
  spanGWs: number
  startingFrom: number
}) {
  const gwwIndex = startingFrom - 1

  if (gwwIndex + spanGWs > NUMBER_OF_MATCHES) {
    spanGWs -= gwwIndex
  }
  const [data, setData] = useState<TeamFDRByGw[]>([])
  const teamMap = useSettingsStore((s) => s.teams)
  useEffect(() => {
    const res = computeFDR({ spanGWs, startingFrom, teamMap })
    setData(res)
  }, [spanGWs])
  return data
}
