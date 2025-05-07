"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, TrendingDown, TrendingUp } from "lucide-react"
import { Button as ShadButton } from "@/components/ui/button"
import { useGoldPrice } from "@/components/gold-price-provider"
import { Badge } from "@/components/ui/badge"
import { Asset, assetApi } from "@/lib/api"
import { useAuthStore } from "@/store/use-auth-store"
import { useAssetStore } from "@/store/use-asset-store"

interface AssetWithStats extends Asset {
  currentValue: number
  profit: number
  profitPercentage: number
}

const GOLD_TYPES = {
  "SJC": "Vàng SJC",
  "VRTL": "Vàng VRTL",
  "BTMC": "Vàng BTMC",
}

export function AssetManager() {
  const { isAuthenticated, isLoading: authLoading } = useAuthStore()
  const { goldPrices } = useGoldPrice()
  const { 
    assets, 
    loading, 
    error,
    fetchAssets,
    addAsset,
    deleteAsset,
    updateAsset 
  } = useAssetStore()
  const [formData, setFormData] = useState({
    type: "SJC",
    amount: 1,
    buyPrice: 0,
    note: "",
  })
  const [sortConfig, setSortConfig] = useState<{
    key: keyof AssetWithStats
    direction: 'asc' | 'desc'
  } | null>(null)

  // Fetch assets when component mounts
  useEffect(() => {
    fetchAssets()
  }, [fetchAssets])

  // Tính toán thống kê cho từng tài sản
  const assetsWithStats: AssetWithStats[] = useMemo(() => {
    if (!goldPrices) return []

    return assets.map(asset => {
      const currentPrice = goldPrices.find(price => {
        if (asset.type === "SJC") return price.name === "VÀNG MIẾNG SJC"
        if (asset.type === "VRTL") return price.name === "VÀNG MIẾNG VRTL"
        if (asset.type === "BTMC") return price.name === "TRANG SỨC BẰNG VÀNG RỒNG THĂNG LONG 999.9"
        return false
      })

      if (!currentPrice) return {
        ...asset,
        currentValue: 0,
        profit: 0,
        profitPercentage: 0
      }

      const currentValue = asset.amount * currentPrice.sellPrice
      const initialValue = asset.amount * asset.buyPrice
      const profit = currentValue - initialValue
      const profitPercentage = (profit / initialValue) * 100

      return {
        ...asset,
        currentValue,
        profit,
        profitPercentage
      }
    })
  }, [assets, goldPrices])

  // Tính tổng thống kê
  const totalStats = useMemo(() => {
    return assetsWithStats.reduce((acc, asset) => {
      return {
        totalInvestment: acc.totalInvestment + (asset.amount * asset.buyPrice),
        totalCurrentValue: acc.totalCurrentValue + asset.currentValue,
        totalProfit: acc.totalProfit + asset.profit
      }
    }, {
      totalInvestment: 0,
      totalCurrentValue: 0,
      totalProfit: 0
    })
  }, [assetsWithStats])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await addAsset(formData)
      // Reset form
      setFormData({
        type: "SJC",
        amount: 1,
        buyPrice: 0,
        note: "",
      })
    } catch (err) {
      console.error(err)
    }
  }

  // Format price to VND
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Sort assets
  const sortedAssets = [...assetsWithStats].sort((a, b) => {
    if (!sortConfig) return 0

    const { key, direction } = sortConfig
    if (a[key] < b[key]) return direction === 'asc' ? -1 : 1
    if (a[key] > b[key]) return direction === 'asc' ? 1 : -1
    return 0
  })

  // Handle sort
  const handleSort = (key: keyof AssetWithStats) => {
    setSortConfig(current => {
      if (!current || current.key !== key) {
        return { key, direction: 'asc' }
      }
      if (current.direction === 'asc') {
        return { key, direction: 'desc' }
      }
      return null
    })
  }

  if (authLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-2 border-amber-200 dark:border-amber-800">
              <CardHeader className="pb-2">
                <div className="h-6 w-24 bg-amber-100 dark:bg-amber-800/50 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-32 bg-amber-100 dark:bg-amber-800/50 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-2 border-amber-200 dark:border-amber-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-amber-800 dark:text-amber-300">
              Tổng Đầu Tư
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {formatPrice(totalStats.totalInvestment)} VND
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-200 dark:border-amber-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-amber-800 dark:text-amber-300">
              Giá Trị Hiện Tại
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {formatPrice(totalStats.totalCurrentValue)} VND
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-amber-200 dark:border-amber-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-amber-800 dark:text-amber-300">
              Lãi/Lỗ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold flex items-center gap-2 
              ${totalStats.totalProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatPrice(Math.abs(totalStats.totalProfit))} VND
              {totalStats.totalProfit >= 0 ? (
                <TrendingUp className="h-6 w-6" />
              ) : (
                <TrendingDown className="h-6 w-6" />
              )}
            </div>
            <div className={`text-sm ${totalStats.totalProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {((totalStats.totalProfit / totalStats.totalInvestment) * 100).toFixed(2)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form thêm tài sản */}
      <Card className="border-2 border-amber-200 dark:border-amber-800">
        <CardHeader>
          <CardTitle className="text-amber-800 dark:text-amber-300">Thêm Tài Sản Mới</CardTitle>
          <CardDescription className="text-amber-600 dark:text-amber-400">
            Nhập thông tin tài sản vàng của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Loại Vàng</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Chọn loại vàng" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(GOLD_TYPES).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Số Lượng (Lượng)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                  className="border-amber-200 dark:border-amber-800"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="buyPrice">Giá Mua (VND)</Label>
                <Input
                  id="buyPrice"
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.buyPrice}
                  onChange={(e) => setFormData({ ...formData, buyPrice: parseInt(e.target.value) })}
                  className="border-amber-200 dark:border-amber-800"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Ghi Chú</Label>
                <Textarea
                  id="note"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="border-amber-200 dark:border-amber-800"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            >
              {loading ? "Đang xử lý..." : "Thêm Tài Sản"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Bảng tài sản */}
      <Card className="border-2 border-amber-200 dark:border-amber-800">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-amber-800 dark:text-amber-300">Danh Sách Tài Sản</CardTitle>
              <CardDescription className="text-amber-600 dark:text-amber-400">
                Quản lý danh mục đầu tư vàng của bạn
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-amber-200 dark:border-amber-800">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/50"
                    onClick={() => handleSort('type')}
                  >
                    Loại Vàng
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/50"
                    onClick={() => handleSort('amount')}
                  >
                    Số Lượng
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/50"
                    onClick={() => handleSort('buyPrice')}
                  >
                    Giá Mua
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/50"
                    onClick={() => handleSort('currentValue')}
                  >
                    Giá Trị Hiện Tại
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/50"
                    onClick={() => handleSort('profit')}
                  >
                    Lãi/Lỗ
                  </TableHead>
                  <TableHead>Ghi Chú</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/50"
                    onClick={() => handleSort('createdAt')}
                  >
                    Ngày Tạo
                  </TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAssets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-amber-600 dark:text-amber-400">
                      Chưa có tài sản nào
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedAssets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell className="font-medium">
                        {GOLD_TYPES[asset.type as keyof typeof GOLD_TYPES]}
                      </TableCell>
                      <TableCell>{asset.amount} lượng</TableCell>
                      <TableCell>{formatPrice(asset.buyPrice)} VND</TableCell>
                      <TableCell>{formatPrice(asset.currentValue)} VND</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={asset.profit >= 0 ? "success" : "destructive"}
                            className="font-medium"
                          >
                            {formatPrice(Math.abs(asset.profit))} VND
                          </Badge>
                          <span className={`text-sm ${
                            asset.profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            ({asset.profitPercentage.toFixed(2)}%)
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{asset.note}</TableCell>
                      <TableCell>
                        {new Date(asset.createdAt).toLocaleDateString("vi-VN")}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <ShadButton variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </ShadButton>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-red-600 dark:text-red-400"
                              onClick={() => deleteAsset(asset.id)}
                            >
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 