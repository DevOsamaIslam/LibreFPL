import { useState, useMemo } from "react"
import { useSettingsStore } from "../app/settings"
import { usePlayerSelector } from "./usePlayerSelector"
import { useSearchBase } from "./usePlayerSelector"
import { suggestTransfers, type SuggestTransfersResult } from "../app/transfers"

export function useSuggestedTransfers() {
  const sortedPlayers = useSettingsStore((s) => s.sortedPlayers)

  const {
    selectedPlayers,
    togglePlayer,
    replacePlayers,
    removePlayer,
    selectedIds,
    max,
  } = usePlayerSelector({ players: sortedPlayers })

  const { q, setQ, result } = useSearchBase(sortedPlayers)
  const filtered = useMemo(() => result.slice(0, 200), [result])

  const [bankInput, setBankInput] = useState<string>("0.0")
  const [freeTransfers, setFreeTransfers] = useState<string>("1")
  const [calc, setCalc] = useState<SuggestTransfersResult | null>(null)

  const totalSelectedCost = useMemo(
    () =>
      selectedPlayers.reduce((acc, p) => acc + (p.element.now_cost ?? 0), 0) /
      10,
    [selectedPlayers]
  )

  const totalSelectedScore = useMemo(
    () => selectedPlayers.reduce((acc, p) => acc + p.score, 0),
    [selectedPlayers]
  )

  const handleSuggest = () => {
    const bankNowCost = Math.max(0, Math.round((Number(bankInput) || 0) * 10))
    const ft = Math.max(0, Math.floor(Number(freeTransfers) || 0))
    const res = suggestTransfers({
      squad: selectedPlayers,
      candidates: sortedPlayers,
      bankNowCost,
      freeTransfers: ft,
    })
    setCalc(res)
  }

  return {
    // Player selection
    selectedPlayers,
    togglePlayer,
    replacePlayers,
    removePlayer,
    selectedIds,
    max,
    // Search
    q,
    setQ,
    filtered,
    // Form inputs
    bankInput,
    setBankInput,
    freeTransfers,
    setFreeTransfers,
    // Calculations
    totalSelectedCost,
    totalSelectedScore,
    calc,
    handleSuggest,
  }
}
