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

type GoldUnit = "grams" | "taels" | "chi"

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

  const [userInput, setUserInput] = useState<UserInput>(() => {
    // Try to load from localStorage if available
    if (typeof window !== "undefined") {
      const savedInput = localStorage.getItem("goldCalculatorInput")
      if (savedInput) {
        return JSON.parse(savedInput)
      }
    }

    return {
      goldType: "SJC", // Default to SJC gold
      amount: "",
      unit: "chi" as GoldUnit, // Default to chi instead of grams
      purchasePrice: "",
    }
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

  // Save user input to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("goldCalculatorInput", JSON.stringify(userInput))
  }, [userInput])

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

    const selectedGold = goldPricesArray.find((gold) => gold && gold.id === userInput.goldType)
    if (!selectedGold) return

    // Current sell price and purchase price per chỉ
    const currentPriceStr = selectedGold.sellPrice || "0"
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

    // Add debug logging
    console.log('Debug calculation:', {
      currentPriceStr,
      currentPrice,
      purchasePrice,
      amount,
      unit: userInput.unit,
      currentValue,
      investmentValue,
      profit,
      profitPercentage
    })

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

  const formatCurrency = (value: number) => {
    // Ensure the value is a valid number
    if (isNaN(value) || !isFinite(value)) {
      console.warn('Invalid value for currency formatting:', value)
      return '0 ₫'
    }
    
    try {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      }).format(value)
    } catch (error) {
      console.error('Error formatting currency:', error)
      return '0 ₫'
    }
  }

  const formatCurrencyCompact = (value: number) => {
    // Ensure the value is a valid number
    if (isNaN(value) || !isFinite(value)) {
      console.warn('Invalid value for compact currency formatting:', value)
      return '0 ₫'
    }
    
    try {
      if (value >= 1000000000) {
        return `${(value / 1000000000).toFixed(2)} tỷ`
      } else if (value >= 1000000) {
        return `${(value / 1000000).toFixed(2)} triệu`
      }
      return formatCurrency(value)
    } catch (error) {
      console.error('Error formatting compact currency:', error)
      return '0 ₫'
    }
  }

  const formatPercentage = (value: number) => {
    // Ensure the value is a valid number
    if (isNaN(value) || !isFinite(value)) {
      console.warn('Invalid value for percentage formatting:', value)
      return '0,00'
    }
    
    try {
      return new Intl.NumberFormat("vi-VN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value)
    } catch (error) {
      console.error('Error formatting percentage:', error)
      return '0,00'
    }
  }

  // Create gold type options from the available gold prices
  const goldTypeOptions = goldPrices
    ? goldPrices.reduce(
        (acc, gold) => {
          if (gold.id && gold.name && !acc[gold.id]) {
            acc[gold.id] = gold.name
          }
          return acc
        },
        {} as Record<string, string>,
      )
    : DEFAULT_GOLD_TYPES

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="md:col-span-2 border-2 border-amber-200 dark:border-amber-800 shadow-lg bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-slate-900 dark:to-amber-950">
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

      <Card className="border-2 border-amber-200 dark:border-amber-800 shadow-lg bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-slate-900 dark:to-amber-950">
        <CardHeader className="border-b border-amber-200 dark:border-amber-800">
          <CardTitle className="text-amber-800 dark:text-amber-300">Chi Tiết Đầu Tư</CardTitle>
          <CardDescription className="text-amber-600 dark:text-amber-400">
            Nhập thông tin đầu tư vàng của bạn
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="goldType" className="text-amber-700 dark:text-amber-300">
                Loại Vàng
              </Label>
              <Select value={userInput.goldType} onValueChange={(value) => handleInputChange("goldType", value)}>
                <SelectTrigger
                  id="goldType"
                  className="border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800"
                >
                  <SelectValue placeholder="Chọn loại vàng" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(goldTypeOptions).map(([id, name]) => (
                    <SelectItem key={id} value={id}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount" className="text-amber-700 dark:text-amber-300">
                Số Lượng
              </Label>
              <div className="flex gap-2">
                <Input
                  id="amount"
                  type="number"
                  placeholder="Nhập số lượng"
                  value={userInput.amount}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                  className="border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800"
                />
                <RadioGroup
                  className="flex"
                  value={userInput.unit}
                  onValueChange={(value) => handleInputChange("unit", value as GoldUnit)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="chi" id="chi" className="text-amber-600 dark:text-amber-400" />
                    <Label htmlFor="chi" className="text-amber-700 dark:text-amber-300">
                      Chỉ
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="taels" id="taels" className="text-amber-600 dark:text-amber-400" />
                    <Label htmlFor="taels" className="text-amber-700 dark:text-amber-300">
                      Lượng
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="purchasePrice" className="text-amber-700 dark:text-amber-300">
                Giá Mua Vào (VND/chỉ)
              </Label>
              <Input
                id="purchasePrice"
                placeholder="Nhập giá mua vào (VD: 11810000 hoặc 118100000)"
                value={userInput.purchasePrice}
                onChange={(e) => handleInputChange("purchasePrice", e.target.value)}
                className="border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800"
              />
              <p className="text-xs text-amber-600 dark:text-amber-400">
                * Nhập giá mua thực tế của bạn
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={calculateProfit}
                className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
              >
                Tính Toán
              </Button>
              <Button
                variant="outline"
                onClick={resetCalculator}
                className="border-amber-400 hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-300"
              >
                Đặt Lại
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-amber-200 dark:border-amber-800 shadow-lg bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-slate-900 dark:to-amber-950">
        <CardHeader className="border-b border-amber-200 dark:border-amber-800">
          <CardTitle className="text-amber-800 dark:text-amber-300">Kết Quả Đầu Tư</CardTitle>
          <CardDescription className="text-amber-600 dark:text-amber-400">
            Tính toán lợi nhuận/lỗ dựa trên giá hiện tại
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full bg-amber-200 dark:bg-amber-800" />
              <Skeleton className="h-4 w-full bg-amber-200 dark:bg-amber-800" />
              <Skeleton className="h-4 w-full bg-amber-200 dark:bg-amber-800" />
            </div>
          ) : result ? (
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Giá Trị Hiện Tại</p>
                <p className="text-2xl font-bold text-amber-800 dark:text-amber-200">
                  {formatCurrencyCompact(result.currentValue)}
                </p>
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  {`(${result.amount} ${result.unit === "taels" ? "lượng" : "chỉ"} × ${formatCurrency(result.currentPrice)})`}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Giá Trị Đầu Tư</p>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                  {formatCurrencyCompact(result.investmentValue)}
                </p>
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  {`(${result.amount} ${result.unit === "taels" ? "lượng" : "chỉ"} × ${formatCurrency(result.purchasePrice)})`}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Lợi Nhuận/Lỗ</p>
                <div className="flex items-center gap-2">
                  <p
                    className={`text-2xl font-bold ${result.profit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                  >
                    {formatCurrencyCompact(result.profit)}
                  </p>
                  <span
                    className={`flex items-center ${result.profit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                  >
                    {result.profit >= 0 ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
                    {formatPercentage(result.profitPercentage)}%
                  </span>
                </div>
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  {`(${formatCurrency(result.currentPrice - result.purchasePrice)} × ${result.amount} ${result.unit === "taels" ? "lượng" : "chỉ"})`}
                </p>
              </div>

              <div className="mt-4 p-4 rounded-md bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/50 dark:to-yellow-900/50 border border-amber-200 dark:border-amber-800">
                <h3 className="font-medium mb-1 text-amber-800 dark:text-amber-200">Khuyến Nghị Bán</h3>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  {result.profitPercentage >= 5
                    ? "✅ Thời điểm tốt để bán! Bạn đã đạt mức lợi nhuận trên 5%."
                    : result.profitPercentage > 0
                      ? "⚠️ Bạn có thể bán để có lợi nhuận nhỏ, nhưng có thể đợi giá tốt hơn."
                      : "❌ Không nên bán lúc này. Bạn sẽ bị lỗ."}
                </p>
                <p className="text-xs mt-2 text-amber-600 dark:text-amber-400">
                  Số lượng: {result.amount} {result.unit === "taels" ? "lượng" : "chỉ"}
                  <br />
                  Giá mua: {formatCurrency(result.purchasePrice)}/{result.unit === "taels" ? "lượng" : "chỉ"}
                  <br />
                  Giá bán hiện tại: {formatCurrency(result.currentPrice)}/{result.unit === "taels" ? "lượng" : "chỉ"}
                </p>
              </div>

              <div className="pt-4 border-t border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  {result.profit > 0
                    ? "Điều kiện thị trường hiện tại thuận lợi để bán đầu tư vàng của bạn."
                    : "Có thể tốt hơn nếu giữ đầu tư vàng của bạn cho đến khi giá cải thiện."}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <p className="text-amber-600 dark:text-amber-400">
                Nhập thông tin đầu tư của bạn và nhấn Tính Toán để xem kết quả
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
