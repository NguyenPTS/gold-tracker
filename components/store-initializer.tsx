'use client'

import { useEffect } from 'react'
import { bootstrapApp } from '@/lib/initialization'

export function StoreInitializer() {
  useEffect(() => {
    bootstrapApp()
  }, [])

  return null
} 