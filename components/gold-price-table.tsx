"use client"

import { useGoldPrice } from "@/components/gold-price-provider"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import type { GoldPrice } from "@/lib/api"

export function GoldPriceTable() {
  const { goldPrices, isLoading } = useGoldPrice()

  // Make sure goldPrices is an array before using array methods
  const goldPricesArray = Array.isArray(goldPrices) ? goldPrices : []

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full bg-amber-200 dark:bg-amber-800" />
        <Skeleton className="h-8 w-full bg-amber-200 dark:bg-amber-800" />
        <Skeleton className="h-8 w-full bg-amber-200 dark:bg-amber-800" />
        <Skeleton className="h-8 w-full bg-amber-200 dark:bg-amber-800" />
        <Skeleton className="h-8 w-full bg-amber-200 dark:bg-amber-800" />
      </div>
    )
  }

  if (!goldPricesArray || goldPricesArray.length === 0) {
    return <p className="text-center py-4 text-amber-700 dark:text-amber-300">Không có dữ liệu giá vàng</p>
  }

  // Format price with commas
  const formatPrice = (price: string | number) => {
    if (!price || price === "0") return "N/A"

    // Convert to string if it's a number
    const priceStr = price.toString()

    // If the price already has commas, return it as is
    if (typeof priceStr === 'string' && priceStr.includes(",")) return priceStr

    // Otherwise, format it with commas
    return Number(priceStr).toLocaleString("vi-VN")
  }

  // Group prices by type
  const goldCategories = {
    sjc: goldPricesArray.filter(p => p.name.includes('SJC')),
    btmc: goldPricesArray.filter(p => p.name.includes('BTMC')),
    other: goldPricesArray.filter(p => !p.name.includes('SJC') && !p.name.includes('BTMC')),
  }

  const renderGoldSection = (title: string, prices: GoldPrice[]) => {
    if (prices.length === 0) return null;

    return (
      <div className="mb-6 last:mb-0">
        <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-3">{title}</h3>
        <Table className="border-collapse">
          <TableHeader className="bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900 dark:to-yellow-900">
            <TableRow>
              <TableHead className="text-amber-800 dark:text-amber-200 font-bold">Loại Vàng</TableHead>
              <TableHead className="text-amber-800 dark:text-amber-200 font-bold">Giá Mua (VND)</TableHead>
              <TableHead className="text-amber-800 dark:text-amber-200 font-bold">Giá Bán (VND)</TableHead>
              <TableHead className="hidden md:table-cell text-amber-800 dark:text-amber-200 font-bold">
                Cập Nhật
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prices.map((gold, index) => (
              <TableRow
                key={gold.row}
                className={
                  index % 2 === 0 ? "bg-amber-50 dark:bg-amber-950/30" : "bg-yellow-50 dark:bg-yellow-950/30"
                }
              >
                <TableCell className="font-medium text-amber-900 dark:text-amber-100">{gold.name}</TableCell>
                <TableCell className="text-green-700 dark:text-green-400 font-semibold">
                  {formatPrice(gold.buyPrice)}
                </TableCell>
                <TableCell className="text-red-700 dark:text-red-400 font-semibold">
                  {formatPrice(gold.sellPrice)}
                </TableCell>
                <TableCell className="hidden md:table-cell text-amber-700 dark:text-amber-300">
                  {gold.timestamp}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div>
      {renderGoldSection("Vàng SJC", goldCategories.sjc)}
      {renderGoldSection("Vàng BTMC", goldCategories.btmc)}
      {renderGoldSection("Các Loại Vàng Khác", goldCategories.other)}
      
      <div className="mt-4 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 p-2 rounded-md">
        <p>* Giá Mua: Giá bạn có thể mua vàng từ các đại lý</p>
        <p>* Giá Bán: Giá các đại lý sẽ mua lại vàng từ bạn</p>
      </div>
    </div>
  )
}
