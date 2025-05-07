'use client';

import { useEffect, useState } from "react";
import { GoldPriceProvider } from "@/components/gold-price-provider";
import { AssetManager } from "@/components/asset-manager";
import { useAuthStore } from "@/store/use-auth-store";
import Cookies from "js-cookie";

// Check token from multiple sources
const hasAuthToken = (): boolean => {
  // 1. Check cookie
  const cookieToken = Cookies.get('access_token');
  if (cookieToken) return true;
  
  // 2. Check localStorage
  const localToken = localStorage.getItem('auth_token');
  if (localToken) {
    // If found in localStorage but not in cookie, restore the cookie
    console.log('[AssetsPage] Restoring token from localStorage to cookie');
    Cookies.set('access_token', localToken, {
      expires: 7,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
    return true;
  }
  
  return false;
};

export default function AssetsPage() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const [hasToken, setHasToken] = useState(false);
  
  // Check token directly to avoid any state synchronization issues
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tokenExists = hasAuthToken();
      console.log('[AssetsPage] Token check:', {
        tokenExists,
        storeAuthenticated: isAuthenticated
      });
      
      setHasToken(tokenExists);
      
      // If token exists but state says not authenticated, update state
      if (tokenExists && !isAuthenticated) {
        console.log('[AssetsPage] Token exists but state not authenticated, running checkAuth');
        checkAuth();
      }
    }
  }, [isAuthenticated, checkAuth]);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="container py-6">
        <div className="flex h-64 w-full items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-t-2 border-b-2 border-amber-600"></div>
        </div>
      </div>
    );
  }
  
  // Allow access if either store says authenticated or we directly found a token
  if (!isAuthenticated && !hasToken) {
    return (
      <div className="container py-6">
        <div className="rounded-md border border-amber-200 dark:border-amber-800 p-6 text-center">
          <h2 className="text-xl font-semibold text-amber-800 dark:text-amber-300 mb-2">
            Yêu cầu đăng nhập
          </h2>
          <p className="text-amber-700 dark:text-amber-400">
            Vui lòng đăng nhập để xem và quản lý tài sản vàng của bạn.
          </p>
        </div>
      </div>
    );
  }

  return (
    <GoldPriceProvider>
      <div className="container py-6">
        <AssetManager />
      </div>
    </GoldPriceProvider>
  );
} 