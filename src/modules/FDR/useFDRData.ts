import { useEffect, useState } from "react"
import { type TeamFDRByGw, computeFDR } from "../../app/fdrAlgo"

export function useFDRData({
  spanGWs,
  startingFrom,
}: {
  spanGWs: number
  startingFrom: number
}) {
  const [data, setData] = useState<TeamFDRByGw[]>([])
  useEffect(() => {
    const res = computeFDR({ spanGWs, startingFrom })
    setData(res)
  }, [spanGWs])
  return data
}
