import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Gold Tracker - Theo dõi giá vàng thời gian thực",
  description: "Ứng dụng theo dõi giá vàng và quản lý đầu tư vàng thời gian thực",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="min-h-screen bg-amber-50 dark:bg-slate-900">
          <Header />
          <main>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
              {children}
            </ThemeProvider>
          </main>
        </div>
      </body>
    </html>
  )
}
