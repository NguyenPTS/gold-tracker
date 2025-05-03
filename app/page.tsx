import { GoldCalculator } from "@/components/gold-calculator"
import { GoldPriceProvider } from "@/components/gold-price-provider"

export default function Home() {
  return (
    <main className="min-h-screen bg-amber-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-amber-600 dark:text-amber-400">Theo Dõi Đầu Tư Vàng</h1>
          <p className="text-amber-700 dark:text-amber-300">
            Theo dõi đầu tư vàng và tìm thời điểm tốt nhất để bán với lợi nhuận cao
          </p>
        </div>

        <GoldPriceProvider>
          <GoldCalculator />
        </GoldPriceProvider>
      </div>
    </main>
  )
}
