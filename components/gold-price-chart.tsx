"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"

interface GoldPriceHistory {
  row: string
  name: string
  type: string
  purity: string
  buyPrice: number
  sellPrice: number
  timestamp: string
}

const DEFAULT_GOLD_TYPES = {
  "VÀNG MIẾNG SJC": "Vàng SJC",
  "VÀNG MIẾNG VRTL": "Vàng VRTL",
  "QUÀ MỪNG BẢN VỊ VÀNG": "Quà Mừng Bản Vị Vàng",
  "VÀNG NGUYÊN LIỆU": "Vàng Nguyên Liệu",
  "NHẪN TRÒN TRƠN": "Nhẫn Tròn Trơn",
  "TRANG SỨC BẰNG VÀNG RỒNG THĂNG LONG 999.9": "Vàng BTMC 999.9",
  "TRANG SỨC BẰNG VÀNG RỒNG THĂNG LONG 99.9": "Vàng BTMC 99.9",
}

const TIME_RANGES = {
  "15M": "15 phút qua",
  "1H": "1 giờ qua",
  "24H": "24 giờ qua",
  "7D": "7 ngày qua",
  "30D": "30 ngày qua",
  "ALL": "Tất cả",
}

export function GoldPriceChart() {
  const [priceHistory, setPriceHistory] = useState<GoldPriceHistory[]>([])
  const [selectedGoldType, setSelectedGoldType] = useState<string>("VÀNG MIẾNG SJC")
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("ALL")
  const [isLoading, setIsLoading] = useState(true)

  const fetchPriceHistory = async () => {
    setIsLoading(true)
    try {
      // const response = await fetch("http://localhost:3002/gold/prices/history")
      const response = await fetch("https://giavang.trungthanhdev.com/gold/prices/history")
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      const data = await response.json()
      console.log("Fetched price history:", data)
      setPriceHistory(data)
    } catch (error) {
      console.error("Error fetching price history:", error)
      // Sử dụng dữ liệu mẫu khi không thể fetch từ API
      generateAndUseMockData()
    } finally {
      setIsLoading(false)
    }
  }

  // Tạo và sử dụng dữ liệu mẫu khi API bị lỗi
  const generateAndUseMockData = () => {
    const mockData: GoldPriceHistory[] = []
    const goldTypes = Object.keys(DEFAULT_GOLD_TYPES)
    
    // Tạo dữ liệu cho 7 ngày gần đây
    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      // Tạo giá cho mỗi loại vàng
      goldTypes.forEach((type, index) => {
        // Giá cơ sở
        const basePrice = type === "VÀNG MIẾNG SJC" ? 12000000 : 11700000
        
        // Thêm một chút biến động ngẫu nhiên
        const randomVariation = Math.floor(Math.random() * 100000) - 50000
        const buyPrice = basePrice + randomVariation - i * 10000
        const sellPrice = type === "VÀNG NGUYÊN LIỆU" ? 0 : buyPrice + 300000
        
        mockData.push({
          row: (index + 1).toString(),
          name: type,
          type: "24k",
          purity: type.includes("99.9") ? "99.9" : "999.9",
          buyPrice,
          sellPrice,
          timestamp: date.toLocaleString("vi-VN")
        })
      })
    }
    
    console.log("Using mock data:", mockData)
    setPriceHistory(mockData)
  }

  useEffect(() => {
    fetchPriceHistory()
    // Tự động cập nhật mỗi 5 phút
    const interval = setInterval(fetchPriceHistory, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Lọc dữ liệu theo thời gian
  const filterDataByTimeRange = (data: GoldPriceHistory[]) => {
    if (selectedTimeRange === "ALL") return data

    const now = new Date()
    const hours = parseInt(selectedTimeRange)
    const timeLimit = new Date(now.getTime() - hours * 60 * 60 * 1000)

    return data.filter((price) => new Date(price.timestamp) > timeLimit)
  }

  // Lọc và xử lý dữ liệu cho biểu đồ
  const chartData = filterDataByTimeRange(priceHistory)
    .filter((price) => price.name === selectedGoldType)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map((price) => ({
      timestamp: new Date(price.timestamp).toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      buyPrice: price.buyPrice,
      sellPrice: price.sellPrice,
      spread: price.sellPrice - price.buyPrice,
    }))

  // Tính giá trung bình để vẽ đường tham chiếu
  const averagePrice = chartData.length > 0
    ? chartData.reduce((acc, curr) => acc + (curr.buyPrice + curr.sellPrice) / 2, 0) / chartData.length
    : 0

  // Format giá vàng
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Custom Tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const buyPrice = payload[0].value
      const sellPrice = payload[1].value
      const spread = sellPrice - buyPrice

      return (
        <div className="bg-white dark:bg-slate-800 p-4 border border-amber-200 dark:border-amber-800 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">{label}</p>
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Giá mua: {formatPrice(buyPrice)} VND
          </p>
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Giá bán: {formatPrice(sellPrice)} VND
          </p>
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Chênh lệch: {formatPrice(spread)} VND
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="border-2 border-amber-200 dark:border-amber-800 shadow-lg bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-slate-900 dark:to-amber-950">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-amber-200 dark:border-amber-800">
        <div>
          <CardTitle className="text-amber-800 dark:text-amber-300">Biểu Đồ Giá Vàng</CardTitle>
          <CardDescription className="text-amber-600 dark:text-amber-400">
            Theo dõi biến động giá vàng theo thời gian
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={fetchPriceHistory}
          className="border-amber-400 hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900"
        >
          <RotateCcw className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </Button>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="goldType">Loại Vàng</Label>
              <Select value={selectedGoldType} onValueChange={setSelectedGoldType}>
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
              <Label htmlFor="timeRange">Khoảng Thời Gian</Label>
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger id="timeRange">
                  <SelectValue placeholder="Chọn khoảng thời gian" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TIME_RANGES).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="h-[400px] w-full">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Skeleton className="w-full h-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={chartData} 
                  margin={{ top: 20, right: 50, left: 80, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="timestamp"
                    height={60}
                    tick={{ fill: "#92400E", fontSize: 12 }}
                    tickMargin={10}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    domain={["dataMin - 100000", "dataMax + 100000"]}
                    tickFormatter={formatPrice}
                    width={100}
                    tick={{ fill: "#92400E", fontSize: 12 }}
                    tickMargin={10}
                  />
                  <Tooltip 
                    content={<CustomTooltip />}
                    wrapperStyle={{ zIndex: 1000 }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={50}
                    wrapperStyle={{
                      paddingTop: "10px",
                      paddingBottom: "30px",
                    }}
                  />
                  <ReferenceLine
                    y={averagePrice}
                    label={{
                      value: "Giá TB",
                      position: "right",
                      fill: "#92400E",
                      fontSize: 12,
                      offset: 10,
                    }}
                    stroke="#92400E"
                    strokeDasharray="3 3"
                    strokeOpacity={0.5}
                  />
                  <Line
                    type="monotone"
                    dataKey="buyPrice"
                    name="Giá Mua"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ fill: "#f59e0b", r: 2 }}
                    activeDot={{ r: 6, strokeWidth: 1 }}
                    animationDuration={500}
                  />
                  <Line
                    type="monotone"
                    dataKey="sellPrice"
                    name="Giá Bán"
                    stroke="#b45309"
                    strokeWidth={2}
                    dot={{ fill: "#b45309", r: 2 }}
                    activeDot={{ r: 6, strokeWidth: 1 }}
                    animationDuration={500}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 