"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { goldApi, type GoldPrice } from "@/lib/api"

interface GoldPriceContextType {
  goldPrices: GoldPrice[] | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  lastUpdated: string
}

const GoldPriceContext = createContext<GoldPriceContextType | undefined>(undefined)

// Default gold prices to use if the API fails
const DEFAULT_GOLD_PRICES: GoldPrice[] = [
  {
    row: "1",
    name: "VÀNG MIẾNG SJC",
    type: "24k",
    purity: "999.9",
    buyPrice: 11810000,
    sellPrice: 12100000,
    timestamp: new Date().toLocaleString(),
  },
  {
    row: "2",
    name: "VÀNG MIẾNG VRTL",
    type: "24k",
    purity: "999.9",
    buyPrice: 11640000,
    sellPrice: 11970000,
    timestamp: new Date().toLocaleString(),
  },
  {
    row: "3",
    name: "TRANG SỨC BẰNG VÀNG RỒNG THĂNG LONG 999.9",
    type: "24k",
    purity: "999.9",
    buyPrice: 11560000,
    sellPrice: 11950000,
    timestamp: new Date().toLocaleString(),
  },
  {
    row: "4",
    name: "TRANG SỨC BẰNG VÀNG RỒNG THĂNG LONG 99.9",
    type: "24k",
    purity: "99.9",
    buyPrice: 11550000,
    sellPrice: 11940000,
    timestamp: new Date().toLocaleString(),
  },
]

export function GoldPriceProvider({ children }: { children: React.ReactNode }) {
  const [goldPrices, setGoldPrices] = useState<GoldPrice[]>(DEFAULT_GOLD_PRICES)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString())

  const fetchGoldPrices = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("Fetching gold prices...")
      const data = await goldApi.getLatestPrices()
      console.log("Received gold prices:", data)

      // Check if we got valid data
      if (Array.isArray(data) && data.length > 0) {
        setGoldPrices(data)
      } else {
        console.warn("Received empty or invalid data, using default gold prices")
        setGoldPrices(DEFAULT_GOLD_PRICES)
      }

      // Update last updated time
      const now = new Date()
      setLastUpdated(now.toLocaleTimeString())
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
      console.error("Error fetching gold prices:", err)

      // Set default data on error
      setGoldPrices(DEFAULT_GOLD_PRICES)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch gold prices on initial load
  useEffect(() => {
    fetchGoldPrices()

    // Set up auto-refresh every 5 minutes
    const intervalId = setInterval(fetchGoldPrices, 5 * 60 * 1000)

    return () => clearInterval(intervalId)
  }, [])

  return (
    <GoldPriceContext.Provider
      value={{
        goldPrices,
        isLoading,
        error,
        refetch: fetchGoldPrices,
        lastUpdated,
      }}
    >
      {children}
    </GoldPriceContext.Provider>
  )
}

export function useGoldPrice() {
  const context = useContext(GoldPriceContext)

  if (context === undefined) {
    throw new Error("useGoldPrice must be used within a GoldPriceProvider")
  }

  return context
}
