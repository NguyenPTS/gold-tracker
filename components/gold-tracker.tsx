"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, RefreshCw } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import GoldPriceDisplay from "./gold-price-display"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface GoldPrice {
  name: string
  buy: number
  sell: number
}

interface GoldData {
  goldType: string
  amount: string
  unit: string
  buyPrice: string
}

export default function GoldTracker() {
  const [goldPrices, setGoldPrices] = useState<GoldPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedGoldType, setSelectedGoldType] = useState("SJC")

  const [goldData, setGoldData] = useLocalStorage<GoldData>("goldData", {
    goldType: "SJC",
    amount: "",
    unit: "grams",
    buyPrice: "",
  })

  const [profit, setProfit] = useState<{
    value: number
    percentage: number
    currentValue: number
  } | null>(null)

  const fetchGoldPrices = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/gold-prices")
      if (!response.ok) {
        throw new Error("Failed to fetch gold prices")
      }
      const data = await response.json()
      setGoldPrices(data)
    } catch (err) {
      setError("Failed to fetch gold prices. Please try again later.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGoldPrices()

    // Refresh prices every 5 minutes
    const intervalId = setInterval(fetchGoldPrices, 5 * 60 * 1000)

    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    calculateProfit()
  }, [goldData, goldPrices, selectedGoldType])

  const handleInputChange = (field: keyof GoldData, value: string) => {
    setGoldData({
      ...goldData,
      [field]: value,
    })
  }

  const calculateProfit = () => {
    if (!goldData.amount || !goldData.buyPrice || goldPrices.length === 0) {
      setProfit(null)
      return
    }

    const selectedPrice = goldPrices.find((price) => price.name === selectedGoldType)
    if (!selectedPrice) {
      setProfit(null)
      return
    }

    const amount = Number.parseFloat(goldData.amount)
    const buyPrice = Number.parseFloat(goldData.buyPrice)
    const currentPrice = selectedPrice.sell

    // Convert taels to grams if needed (1 tael = 37.5 grams)
    const amountInGrams = goldData.unit === "taels" ? amount * 37.5 : amount

    const initialValue = buyPrice * amountInGrams
    const currentValue = currentPrice * amountInGrams
    const profitValue = currentValue - initialValue
    const profitPercentage = (profitValue / initialValue) * 100

    setProfit({
      value: profitValue,
      percentage: profitPercentage,
      currentValue: currentValue,
    })
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Current Gold Prices</CardTitle>
          <CardDescription>Live gold prices from BTMC</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <Tabs defaultValue={selectedGoldType} onValueChange={setSelectedGoldType}>
              <TabsList>
                {goldPrices.map((price) => (
                  <TabsTrigger key={price.name} value={price.name}>
                    {price.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <Button variant="outline" size="sm" onClick={fetchGoldPrices} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {error ? (
            <div className="text-red-500 text-center p-4">{error}</div>
          ) : (
            <GoldPriceDisplay goldPrices={goldPrices} selectedType={selectedGoldType} loading={loading} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Gold Investment</CardTitle>
          <CardDescription>Enter your gold details to calculate profit/loss</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="goldType">Gold Type</Label>
                <Select value={goldData.goldType} onValueChange={(value) => handleInputChange("goldType", value)}>
                  <SelectTrigger id="goldType">
                    <SelectValue placeholder="Select gold type" />
                  </SelectTrigger>
                  <SelectContent>
                    {goldPrices.map((price) => (
                      <SelectItem key={price.name} value={price.name}>
                        {price.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unit">Unit</Label>
                <Select
                  value={goldData.unit}
                  onValueChange={(value) => handleInputChange("unit", value as "grams" | "taels")}
                >
                  <SelectTrigger id="unit">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grams">Grams</SelectItem>
                    <SelectItem value="taels">Taels</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={goldData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="buyPrice">Purchase Price (per gram)</Label>
              <Input
                id="buyPrice"
                type="number"
                placeholder="Enter purchase price per gram"
                value={goldData.buyPrice}
                onChange={(e) => handleInputChange("buyPrice", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {profit && (
        <Card className={profit.value >= 0 ? "bg-green-50 dark:bg-green-950/30" : "bg-red-50 dark:bg-red-950/30"}>
          <CardHeader>
            <CardTitle>Investment Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Current Value</p>
                  <p className="text-2xl font-bold">{profit.currentValue.toLocaleString()} VND</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Profit/Loss</p>
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-2xl font-bold ${profit.value >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                    >
                      {profit.value >= 0 ? "+" : ""}
                      {profit.value.toLocaleString()} VND
                    </p>
                    <ArrowUpDown
                      className={`h-5 w-5 ${profit.value >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <div
                  className={`text-xl font-semibold px-4 py-2 rounded-full ${
                    profit.value >= 0
                      ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                  }`}
                >
                  {profit.value >= 0 ? "+" : ""}
                  {profit.percentage.toFixed(2)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
