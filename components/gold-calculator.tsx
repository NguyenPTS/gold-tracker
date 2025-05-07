"use client"

import { useEffect, useState } from "react"
import { ArrowDown, ArrowUp, RotateCcw } from "lucide-react"
import { useGoldPrice } from "@/components/gold-price-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Skeleton } from "@/components/ui/skeleton"
import { GoldPriceTable } from "@/components/gold-price-table"

type GoldUnit = "taels" | "chi"

interface UserInput {
  goldType: string
  amount: string
  unit: GoldUnit
  purchasePrice: string
}

// 1 tael = 37.5 grams
const TAEL_TO_GRAM = 37.5
// 1 chi = 3.75 grams
const CHI_TO_GRAM = 3.75

// Default gold type options
const DEFAULT_GOLD_TYPES = {
  SJC: "VÀNG MIẾNG SJC (Vàng SJC)",
  "BTMC-999.9": "TRANG SỨC BẰNG VÀNG RỒNG THĂNG LONG 999.9 (Vàng BTMC)",
  "BTMC-99.9": "TRANG SỨC BẰNG VÀNG RỒNG THĂNG LONG 99.9 (Vàng BTMC)",
  VRTL: "VÀNG MIẾNG VRTL (Vàng Rồng Thăng Long)",
}

export function GoldCalculator() {
  const { goldPrices, isLoading, refetch, lastUpdated } = useGoldPrice()
  const [mounted, setMounted] = useState(false)

  const [userInput, setUserInput] = useState<UserInput>({
    goldType: "SJC",
    amount: "",
    unit: "chi",
    purchasePrice: "",
  })

  const [result, setResult] = useState<{
    currentValue: number
    profit: number
    profitPercentage: number
    purchasePrice: number
    currentPrice: number
    investmentValue: number
    amount: number
    unit: GoldUnit
  } | null>(null)

  // Set mounted state after hydration
  useEffect(() => {
    setMounted(true)
    
    // Load saved input after mounting
    const savedInput = localStorage.getItem("goldCalculatorInput")
    if (savedInput) {
      try {
        setUserInput(JSON.parse(savedInput))
      } catch (error) {
        console.error("Error loading saved input:", error)
      }
    }
  }, [])

  // Save user input to localStorage whenever it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("goldCalculatorInput", JSON.stringify(userInput))
    }
  }, [userInput, mounted])

  const handleInputChange = (field: keyof UserInput, value: string) => {
    setUserInput((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const calculateProfit = () => {
    if (!goldPrices || !userInput.amount || !userInput.purchasePrice) return

    // Make sure goldPrices is an array
    const goldPricesArray = Array.isArray(goldPrices) ? goldPrices : []

    const selectedGold = goldPricesArray.find((gold) => gold && gold.type === userInput.goldType)
    if (!selectedGold) return

    // Current sell price and purchase price per unit
    const currentPriceStr = selectedGold.sellPrice.toString()
    const currentPrice = Number.parseFloat(currentPriceStr.replace(/,/g, ""))
    let purchasePrice = Number.parseFloat(userInput.purchasePrice.replace(/,/g, ""))

    if (isNaN(currentPrice) || isNaN(purchasePrice)) return

    // Convert amount to number
    let amount = Number.parseFloat(userInput.amount)
    if (isNaN(amount)) return

    // Calculate values based on input unit
    const currentValue = currentPrice * amount
    const investmentValue = purchasePrice * amount
    const profit = currentValue - investmentValue
    const profitPercentage = ((currentPrice - purchasePrice) / purchasePrice) * 100

    setResult({
      currentValue,
      profit,
      profitPercentage,
      purchasePrice,
      currentPrice,
      investmentValue,
      amount,
      unit: userInput.unit
    })
  }

  const resetCalculator = () => {
    setUserInput({
      goldType: "SJC",
      amount: "",
      unit: "chi",
      purchasePrice: "",
    })
    setResult(null)
  }

  // Don't render anything until after hydration
  if (!mounted) {
    return null
  }

  const isButtonDisabled = !userInput.amount || !userInput.purchasePrice

  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Format currency in compact notation for large numbers
  const formatCurrencyCompact = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(2)} tỷ VND`
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)} triệu VND`
    } else {
      return `${formatCurrency(value)} VND`
    }
  }

  return (
    <div className="space-y-6">
      {/* Bảng giá vàng */}
      <Card className="border-2 border-amber-200 dark:border-amber-800 shadow-lg bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-slate-900 dark:to-amber-950">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-amber-200 dark:border-amber-800">
          <div>
            <CardTitle className="text-amber-800 dark:text-amber-300">Giá Vàng Hiện Tại</CardTitle>
            <CardDescription className="text-amber-600 dark:text-amber-400">
              {isLoading ? "Đang tải..." : `Cập nhật lúc: ${lastUpdated}`}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={refetch}
            className="border-amber-400 hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900"
          >
            <RotateCcw className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </Button>
        </CardHeader>
        <CardContent>
          <GoldPriceTable />
        </CardContent>
      </Card>

      {/* Máy tính vàng */}
      <Card className="border-2 border-amber-200 dark:border-amber-800 shadow-lg">
        <CardHeader>
          <CardTitle className="text-amber-800 dark:text-amber-300">Máy Tính Vàng</CardTitle>
          <CardDescription className="text-amber-600 dark:text-amber-400">
            Tính toán lãi/lỗ đầu tư vàng của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="goldType">Loại Vàng</Label>
                <Select value={userInput.goldType} onValueChange={(value) => handleInputChange("goldType", value)}>
                  <SelectTrigger id="goldType">
                    <SelectValue placeholder="Chọn loại vàng" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DEFAULT_GOLD_TYPES).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Đơn Vị</Label>
                <RadioGroup
                  value={userInput.unit}
                  onValueChange={(value) => handleInputChange("unit", value as GoldUnit)}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="chi" id="chi" />
                    <Label htmlFor="chi">Chỉ</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="taels" id="taels" />
                    <Label htmlFor="taels">Lượng</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Số Lượng</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.1"
                  value={userInput.amount}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                  placeholder={`Nhập số ${userInput.unit === "taels" ? "lượng" : "chỉ"}`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Giá Mua (VND)</Label>
                <Input
                  id="purchasePrice"
                  type="text"
                  value={userInput.purchasePrice}
                  onChange={(e) => handleInputChange("purchasePrice", e.target.value)}
                  placeholder="Nhập giá mua"
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={calculateProfit}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                disabled={isButtonDisabled}
              >
                Tính Toán
              </Button>
              <Button
                onClick={resetCalculator}
                variant="outline"
                className="border-amber-400 hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900"
              >
                Đặt Lại
              </Button>
            </div>

            {result && (
              <Card className="mt-6 border-2 border-amber-200 dark:border-amber-800">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Giá Trị Hiện Tại</p>
                      <p className="text-2xl font-bold text-amber-800 dark:text-amber-200">
                        {formatCurrencyCompact(result.currentValue)}
                      </p>
                      <p className="text-sm text-amber-600 dark:text-amber-400">
                        {`(${result.amount} ${result.unit === "taels" ? "lượng" : "chỉ"} × ${formatCurrency(result.currentPrice)} VND)`}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Giá Trị Đầu Tư</p>
                      <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                        {formatCurrencyCompact(result.investmentValue)}
                      </p>
                      <p className="text-sm text-amber-600 dark:text-amber-400">
                        {`(${result.amount} ${result.unit === "taels" ? "lượng" : "chỉ"} × ${formatCurrency(result.purchasePrice)} VND)`}
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Lãi/Lỗ</p>
                      <div className="flex items-center space-x-2">
                        <p className={`text-2xl font-bold ${result.profit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                          {formatCurrencyCompact(Math.abs(result.profit))}
                        </p>
                        <span className={`text-lg ${result.profit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                          {result.profit >= 0 ? (
                            <ArrowUp className="h-6 w-6" />
                          ) : (
                            <ArrowDown className="h-6 w-6" />
                          )}
                        </span>
                      </div>
                      <p className={`text-sm ${result.profit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                        {result.profit >= 0 ? "Lãi" : "Lỗ"} {Math.abs(result.profitPercentage).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
