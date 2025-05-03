"use client"

import { useGoldPrice } from "@/components/gold-price-provider"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function GoldPriceTable() {
  const { goldPrices, isLoading } = useGoldPrice()

  // Make sure goldPrices is an array before using array methods
  const goldPricesArray = Array.isArray(goldPrices) ? goldPrices : []

  // Define categories based on the new ID format
  const goldCategories = {
    sjc: ["SJC"], // SJC gold
    btmc: ["BTMC-999.9", "BTMC-99.9"], // BTMC gold
    other: ["VRTL", "NHAN", "QUA", "NL"], // Other gold types
  }

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
  const formatPrice = (price: string) => {
    if (!price || price === "0") return "N/A"

    // If the price already has commas, return it as is
    if (price.includes(",")) return price

    // Otherwise, format it with commas
    return Number.parseInt(price).toLocaleString("vi-VN")
  }

  const renderGoldTable = (categoryIds: string[]) => {
    // Filter the gold prices based on category IDs
    const filteredGold = goldPricesArray.filter((gold) => {
      if (!gold || !gold.id) return false
      return categoryIds.includes(gold.id)
    })

    // For SJC tab, show all items that have "SJC" in their name if no exact matches
    // For BTMC tab, show all items that have "BTMC" in their name if no exact matches
    // For other tab, show all remaining items
    let goldToShow = filteredGold

    if (filteredGold.length === 0) {
      if (categoryIds === goldCategories.sjc) {
        goldToShow = goldPricesArray.filter((gold) => gold && gold.name && gold.name.includes("SJC"))
      } else if (categoryIds === goldCategories.btmc) {
        goldToShow = goldPricesArray.filter((gold) => gold && gold.name && gold.name.includes("BTMC"))
      } else {
        goldToShow = goldPricesArray.filter(
          (gold) => gold && gold.name && !gold.name.includes("SJC") && !gold.name.includes("BTMC"),
        )
      }
    }

    // If we still have no items to show, just show all gold prices
    if (goldToShow.length === 0) {
      goldToShow = goldPricesArray
    }

    return (
      <div>
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
            {goldToShow.length > 0 ? (
              goldToShow.map((gold, index) => (
                <TableRow
                  key={gold.id || index}
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
                    {gold.updatedAt}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-amber-700 dark:text-amber-300">
                  Không có dữ liệu cho danh mục này
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="mt-2 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 p-2 rounded-md">
          <p>* Giá Mua: Giá bạn có thể mua vàng từ các đại lý</p>
          <p>* Giá Bán: Giá các đại lý sẽ mua lại vàng từ bạn</p>
        </div>
      </div>
    )
  }

  return (
    <Tabs defaultValue="sjc" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-amber-300 to-yellow-300 dark:from-amber-800 dark:to-yellow-800">
        <TabsTrigger
          value="sjc"
          className="data-[state=active]:bg-amber-500 data-[state=active]:text-white dark:data-[state=active]:bg-amber-600"
        >
          Vàng SJC
        </TabsTrigger>
        <TabsTrigger
          value="btmc"
          className="data-[state=active]:bg-amber-500 data-[state=active]:text-white dark:data-[state=active]:bg-amber-600"
        >
          Vàng BTMC
        </TabsTrigger>
        <TabsTrigger
          value="other"
          className="data-[state=active]:bg-amber-500 data-[state=active]:text-white dark:data-[state=active]:bg-amber-600"
        >
          Loại Khác
        </TabsTrigger>
      </TabsList>
      <TabsContent value="sjc" className="animate-in fade-in-50">
        {renderGoldTable(goldCategories.sjc)}
      </TabsContent>
      <TabsContent value="btmc" className="animate-in fade-in-50">
        {renderGoldTable(goldCategories.btmc)}
      </TabsContent>
      <TabsContent value="other" className="animate-in fade-in-50">
        {renderGoldTable(goldCategories.other)}
      </TabsContent>
    </Tabs>
  )
}
