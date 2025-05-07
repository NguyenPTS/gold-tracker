'use client'

import { useEffect } from 'react'
import { bootstrapApp } from '@/lib/initialization'

export function StoreInitializer() {
  useEffect(() => {
    console.log('[StoreInitializer] Initializing app...')
    bootstrapApp()
  }, [])

  return null
} 