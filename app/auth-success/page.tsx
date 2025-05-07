'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/use-auth-store';
import Cookies from 'js-cookie';

export default function AuthSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(true);
  const [status, setStatus] = useState('Đang xử lý token...');
  const [tokenProcessed, setTokenProcessed] = useState(false);

  useEffect(() => {
    // Chỉ xử lý token một lần
    if (tokenProcessed) return;
    
    const token = searchParams.get('token');
    console.log('[AuthSuccess] Received token:', token ? `${token.substring(0, 10)}...` : 'none');

    if (!token) {
      setStatus('Không tìm thấy token, đang chuyển hướng về trang đăng nhập...');
      console.log('[AuthSuccess] No token found, redirecting to /login');
      setTimeout(() => {
        router.replace('/login');
        setIsProcessing(false);
      }, 500);
      return;
    }

    // Đánh dấu đã xử lý token
    setTokenProcessed(true);

    // Xử lý token bằng cả cookie trực tiếp và store
    const processToken = async () => {
      try {
        // 1. Lưu vào cả LocalStorage và cookie để đảm bảo an toàn
        console.log('[AuthSuccess] Saving token to multiple storage mechanisms');
        
        // LocalStorage (backup)
        localStorage.setItem('auth_token', token);
        
        // Cookie với các options thông thường
        Cookies.set('access_token', token, {
          expires: 7,
          path: '/',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production'
        });
        
        // Cookie với SameSite=None (có thể cần cho một số trường hợp)
        if (process.env.NODE_ENV === 'development') {
          document.cookie = `access_token=${token}; path=/; max-age=${7*24*60*60}`;
        }
        
        // 2. Kiểm tra lại việc lưu trữ
        const savedCookie = Cookies.get('access_token');
        const savedLocal = localStorage.getItem('auth_token');
        console.log('[AuthSuccess] Storage check:', { 
          cookieSaved: !!savedCookie, 
          localStorageSaved: !!savedLocal,
          allCookies: document.cookie
        });
        
        // 3. Lưu vào store
        setStatus('Đang cập nhật trạng thái đăng nhập...');
        console.log('[AuthSuccess] Updating auth store');
        login(token);
        
        // 4. Đợi để store cập nhật
        setStatus('Đăng nhập thành công, đang chuyển hướng...');
        
        // 5. Chuyển hướng sau khi đã xử lý
        setTimeout(() => {
          console.log('[AuthSuccess] Final check before redirect:', {
            cookieExists: !!Cookies.get('access_token'),
            localStorageExists: !!localStorage.getItem('auth_token'),
            storeAuthenticated: isAuthenticated,
            allCookies: document.cookie
          });
          
          console.log('[AuthSuccess] Redirecting to /gold-price');
          // Sử dụng window.location.href thay vì router để làm mới hoàn toàn trang
          window.location.href = '/gold-price';
          setIsProcessing(false);
        }, 1000);
      } catch (error) {
        console.error('[AuthSuccess] Error processing token:', error);
        setStatus('Có lỗi xảy ra, đang chuyển hướng về trang đăng nhập...');
        setTimeout(() => {
          router.replace('/login');
          setIsProcessing(false);
        }, 1000);
      }
    };

    processToken();
  }, [searchParams, login, router, isAuthenticated, tokenProcessed]);

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-32 w-32 animate-spin rounded-full border-t-2 border-b-2 border-amber-600"></div>
        <p className="mt-4 text-amber-700 dark:text-amber-300">{status}</p>
        <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
          {isProcessing ? 'Vui lòng đợi trong giây lát...' : ''}
        </p>
      </div>
    </div>
  );
} 