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
import { goldApi, type GoldPrice } from "@/lib/api"

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
  const [selectedGoldType, setSelectedGoldType] = useState("VÀNG MIẾNG SJC")

  const [goldData, setGoldData] = useLocalStorage<GoldData>("goldData", {
    goldType: "VÀNG MIẾNG SJC",
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
      const data = await goldApi.getLatestPrices()
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
    const currentPrice = selectedPrice.sellPrice

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
                placeholder="Enter purchase price"
                value={goldData.buyPrice}
                onChange={(e) => handleInputChange("buyPrice", e.target.value)}
              />
            </div>

            {profit && (
              <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold mb-2">Profit/Loss Analysis</h3>
                <div className="grid gap-2">
                  <div className="flex justify-between">
                    <span>Current Value:</span>
                    <span className="font-medium">{profit.currentValue.toLocaleString()} VND</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Profit/Loss:</span>
                    <span
                      className={`font-medium ${
                        profit.value >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {profit.value.toLocaleString()} VND ({profit.percentage.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
