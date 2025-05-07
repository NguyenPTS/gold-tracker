'use client';

import { GoldCalculator } from "@/components/gold-calculator";
import { GoldPriceProvider } from "@/components/gold-price-provider";
import { GoldPriceChart } from "@/components/gold-price-chart";
import { AssetManager } from "@/components/asset-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function GoldPricePage() {
  return (
    <GoldPriceProvider>
      <div className="container py-6 space-y-6">
        <Tabs defaultValue="prices" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="prices">Giá Vàng</TabsTrigger>
            <TabsTrigger value="assets">Tài Sản</TabsTrigger>
          </TabsList>
          <TabsContent value="prices" className="space-y-6">
            <GoldCalculator />
            <GoldPriceChart />
          </TabsContent>
          <TabsContent value="assets">
            <AssetManager />
          </TabsContent>
        </Tabs>
      </div>
    </GoldPriceProvider>
  );
} 