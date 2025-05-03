import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface GoldPrice {
  name: string
  buy: number
  sell: number
}

interface GoldPriceDisplayProps {
  goldPrices: GoldPrice[]
  selectedType: string
  loading: boolean
}

export default function GoldPriceDisplay({ goldPrices, selectedType, loading }: GoldPriceDisplayProps) {
  const selectedPrice = goldPrices.find((price) => price.name === selectedType)

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-32" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!selectedPrice) {
    return <div className="text-center p-4">No price data available</div>
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="bg-green-50 dark:bg-green-950/30">
        <CardContent className="p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">Buy Price</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {selectedPrice.buy.toLocaleString()} VND
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Per gram</p>
        </CardContent>
      </Card>
      <Card className="bg-red-50 dark:bg-red-950/30">
        <CardContent className="p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">Sell Price</p>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">{selectedPrice.sell.toLocaleString()} VND</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Per gram</p>
        </CardContent>
      </Card>
      <div className="col-span-2 text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
        Last updated: {new Date().toLocaleString()}
      </div>
    </div>
  )
}
