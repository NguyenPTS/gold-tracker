'use client';

import { GoldCalculator } from "@/components/gold-calculator";
import { GoldPriceProvider } from "@/components/gold-price-provider";

export default function GoldPricePage() {
  return (
    <GoldPriceProvider>
      <div className="container py-6">
        <GoldCalculator />
      </div>
    </GoldPriceProvider>
  );
} 