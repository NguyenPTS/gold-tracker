'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/use-auth-store';

export default function AuthSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      console.log('[AuthSuccess] Token found, processing login...');
      
      // Lưu token vào store (không dùng redirectPath tham số)
      login(token);
      
      // Để thời gian cho store cập nhật
      setTimeout(() => {
        console.log('[AuthSuccess] Redirecting to gold-price page...');
        router.push('/gold-price');
        setIsProcessing(false);
      }, 500);
    } else {
      console.log('[AuthSuccess] No token found, redirecting to login...');
      router.push('/login');
      setIsProcessing(false);
    }
  }, [searchParams, login, router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="text-center">
        <div className="h-32 w-32 animate-spin rounded-full border-t-2 border-b-2 border-amber-600 mx-auto"></div>
        <p className="mt-4 text-lg text-amber-800 dark:text-amber-300">
          {isProcessing ? 'Đang xử lý đăng nhập...' : 'Đang chuyển hướng...'}
        </p>
      </div>
    </div>
  );
} 