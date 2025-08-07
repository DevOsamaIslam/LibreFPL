import { useEffect, useState } from "react"
import { type TeamFDRByGw, computeFDR } from "./fdrAlgo"

export function useFDRData(span: number) {
  const [data, setData] = useState<TeamFDRByGw[]>([])
  useEffect(() => {
    const res = computeFDR(span)
    setData(res)
  }, [span])
  return data
}
