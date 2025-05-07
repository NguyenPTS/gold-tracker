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
import { MoreHorizontal, TrendingDown, TrendingUp, Trash2 } from "lucide-react"
import { Button as ShadButton } from "@/components/ui/button"
import { useGoldPrice } from "@/components/gold-price-provider"
import { Badge } from "@/components/ui/badge"
import { Asset, assetApi } from "@/lib/api"
import { useAuthStore } from "@/store/use-auth-store"
import { useAssetStore } from "@/store/use-asset-store"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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
  const [operationLoading, setOperationLoading] = useState(false)
  const [deleteAssetId, setDeleteAssetId] = useState<string | number | null>(null)

  // Fetch assets when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      console.log('[AssetManager] Initial loading of assets')
      fetchAssets()
    }
  }, [fetchAssets, isAuthenticated])

  // Thêm refresh cho asset list với loading
  const refreshAssets = async () => {
    try {
      console.log('[AssetManager] Manually refreshing asset list')
      await fetchAssets()
      toast.success('Đã cập nhật danh sách tài sản')
    } catch (error) {
      toast.error('Không thể cập nhật danh sách tài sản')
      console.error('[AssetManager] Error refreshing assets:', error)
    }
  }

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

      // Use Number() to ensure we're working with numbers from API string values
      const assetAmount = Number(asset.amount)
      const assetBuyPrice = Number(asset.buyPrice)
      const currentSellPrice = currentPrice.sellPrice

      const currentValue = assetAmount * currentSellPrice
      const initialValue = assetAmount * assetBuyPrice
      const profit = currentValue - initialValue
      const profitPercentage = initialValue > 0 ? (profit / initialValue) * 100 : 0

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
      // Use Number() to ensure we're working with numbers
      const assetAmount = Number(asset.amount)
      const assetBuyPrice = Number(asset.buyPrice)
      
      return {
        totalInvestment: acc.totalInvestment + (assetAmount * assetBuyPrice),
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
    
    // Validate data before submission
    if (formData.amount <= 0) {
      toast.error("Số lượng phải lớn hơn 0");
      return;
    }
    
    if (formData.buyPrice <= 0) {
      toast.error("Giá mua phải lớn hơn 0");
      return;
    }
    
    // Ensure amounts are within reasonable limits
    if (formData.amount > 1000) {
      toast.error("Số lượng quá lớn. Vui lòng kiểm tra lại");
      return;
    }
    
    // Format data to match API expectations
    const assetData = {
      type: formData.type,
      amount: Number(formData.amount),
      buyPrice: Number(formData.buyPrice),
      note: formData.note.trim()
    };
    
    console.log('[AssetManager] Submitting asset data:', assetData);
    
    try {
      setOperationLoading(true)
      
      await addAsset(assetData)
      
      toast.success("Đã thêm tài sản mới")
      
      // Reset form
      setFormData({
        type: "SJC",
        amount: 1,
        buyPrice: 0,
        note: "",
      })
      
      // Refresh asset list to show the new asset
      await fetchAssets()
    } catch (err: any) {
      console.error('[AssetManager] Error adding asset:', err)
      
      // Handle different error types
      if (err?.message?.includes('500')) {
        toast.error("Lỗi máy chủ. Dữ liệu có thể không hợp lệ hoặc máy chủ đang gặp sự cố");
      } else if (err?.message?.includes('401')) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else if (err?.message?.includes('400')) {
        toast.error("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các thông tin.");
      } else {
        toast.error("Không thể thêm tài sản: " + (err?.message || "Vui lòng thử lại sau."));
      }
    } finally {
      setOperationLoading(false)
    }
  }

  const handleDelete = async (id: string | number) => {
    try {
      setOperationLoading(true)
      console.log(`[AssetManager] Deleting asset with ID: ${id}`)
      
      // Gọi API để xóa tài sản
      await deleteAsset(String(id))
      
      // Thông báo thành công
      toast.success("Đã xóa tài sản thành công")
      
      // Refresh danh sách tài sản sau khi xóa thành công
      console.log('[AssetManager] Refreshing asset list after deletion')
      fetchAssets()
    } catch (err: any) {
      // Xử lý các trường hợp lỗi khác nhau
      if (err?.message?.includes('404')) {
        toast.error("Không tìm thấy tài sản. Có thể tài sản đã bị xóa trước đó.")
        // Vẫn refresh để đảm bảo danh sách được cập nhật
        fetchAssets()
      } else if (err?.message?.includes('401')) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.")
      } else {
        toast.error("Không thể xóa tài sản. " + (err?.message || "Vui lòng thử lại sau."))
      }
      console.error('[AssetManager] Delete asset error:', err)
    } finally {
      setOperationLoading(false)
      setDeleteAssetId(null)
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
    
    // Handle numeric fields with string values from API
    const getComparableValue = (asset: AssetWithStats, key: keyof AssetWithStats) => {
      const value = asset[key]
      if (typeof value === 'string' && !isNaN(Number(value))) {
        return Number(value)
      }
      return value
    }
    
    const aValue = getComparableValue(a, key)
    const bValue = getComparableValue(b, key)
    
    // Add null/undefined check
    if (aValue == null && bValue == null) return 0
    if (aValue == null) return direction === 'asc' ? -1 : 1
    if (bValue == null) return direction === 'asc' ? 1 : -1
    
    if (aValue < bValue) return direction === 'asc' ? -1 : 1
    if (aValue > bValue) return direction === 'asc' ? 1 : -1
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

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN')
  }

  // Thêm hàm này để mở dialog xác nhận xóa
  const confirmDelete = (id: string | number) => {
    setDeleteAssetId(id)
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
              {totalStats.totalInvestment > 0 ? ((totalStats.totalProfit / totalStats.totalInvestment) * 100).toFixed(2) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form thêm tài sản */}
      <Card className="border-2 border-amber-200 dark:border-amber-800">
        <CardHeader>
          <CardTitle className="text-amber-800 dark:text-amber-300">Thêm Tài Sản Mới</CardTitle>
          <CardDescription className="text-amber-600 dark:text-amber-400">
            Nhập thông tin tài sản vàng mới bạn muốn theo dõi
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
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Số Lượng (chỉ)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="buyPrice">Giá Mua (VND/chỉ)</Label>
                <Input
                  id="buyPrice"
                  type="number"
                  value={formData.buyPrice}
                  onChange={(e) => setFormData({ ...formData, buyPrice: Number(e.target.value) })}
                  min="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Ghi Chú</Label>
                <Textarea
                  id="note"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Thêm ghi chú về tài sản này"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-800" 
              disabled={loading || operationLoading}
            >
              {operationLoading ? (
                <>
                  <span className="h-4 w-4 mr-2 animate-spin rounded-full border-t-2 border-white"></span>
                  Đang xử lý...
                </>
              ) : (
                'Thêm Tài Sản'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Bảng tài sản */}
      <Card className="border-2 border-amber-200 dark:border-amber-800">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-amber-800 dark:text-amber-300">
                Danh Sách Tài Sản ({assets.length})
              </CardTitle>
              <CardDescription className="text-amber-600 dark:text-amber-400">
                Quản lý danh sách tài sản vàng của bạn
              </CardDescription>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshAssets} 
              disabled={loading || operationLoading}
              className="text-amber-600 border-amber-300 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-700 dark:hover:bg-amber-900/30"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 mr-2 animate-spin rounded-full border-t-2 border-amber-600 dark:border-amber-400"></span>
                  Đang tải...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Làm mới
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-2 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-md">
              {error}
            </div>
          )}

          {assets.length === 0 ? (
            <div className="text-center py-6 text-amber-600 dark:text-amber-400">
              Bạn chưa có tài sản nào. Hãy thêm tài sản mới để bắt đầu theo dõi.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('type')}>
                    Loại Vàng
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('amount')}>
                    Số Lượng
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('buyPrice')}>
                    Giá Mua
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('currentValue')}>
                    Giá Trị Hiện Tại
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('profit')}>
                    Lãi/Lỗ
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('buyDate')}>
                    Ngày Mua
                  </TableHead>
                  <TableHead>Ghi Chú</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAssets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell>
                      {GOLD_TYPES[asset.type as keyof typeof GOLD_TYPES]}
                    </TableCell>
                    <TableCell>{Number(asset.amount).toFixed(2)}</TableCell>
                    <TableCell>{formatPrice(Number(asset.buyPrice))}</TableCell>
                    <TableCell>{formatPrice(asset.currentValue)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={asset.profit >= 0 ? "success" : "destructive"}>
                          {asset.profit >= 0 ? '+' : ''}{formatPrice(asset.profit)}
                        </Badge>
                        <span className={`text-xs ${asset.profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          ({asset.profit >= 0 ? '+' : ''}{asset.profitPercentage.toFixed(2)}%)
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(asset.buyDate)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{asset.note}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <ShadButton variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Mở menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </ShadButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => confirmDelete(asset.id)}
                            className="text-red-600 dark:text-red-400 focus:text-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Xoá tài sản
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteAssetId !== null} onOpenChange={(open) => !open && setDeleteAssetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa tài sản</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tài sản này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={operationLoading}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                if (deleteAssetId !== null) {
                  handleDelete(deleteAssetId)
                }
              }}
              disabled={operationLoading}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
            >
              {operationLoading ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}