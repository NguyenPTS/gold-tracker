'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Log tất cả params từ URL
    const allParams = Object.fromEntries(searchParams.entries());
    console.log('Auth Success - All URL Params:', allParams);

    // Kiểm tra cookie
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    console.log('Current cookies:', cookies);

    const token = searchParams.get('access_token') || 
                 searchParams.get('token') || 
                 searchParams.get('jwt');

    if (token) {
      console.log('Token found in URL, preparing user info');
      
      // Chuẩn bị user info từ URL params
      const urlUserInfo = {
        email: searchParams.get('email'),
        name: searchParams.get('name'),
        username: searchParams.get('username') || searchParams.get('name') || searchParams.get('email')?.split('@')[0],
        picture: searchParams.get('picture') || searchParams.get('avatar'),
      };

      console.log('Prepared user info:', urlUserInfo);

      try {
        // Set auth token với secure và SameSite
        document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=lax`;
        
        // Set user info với proper encoding và sử dụng dấu gạch dưới
        const encodedUserInfo = encodeURIComponent(JSON.stringify(urlUserInfo));
        document.cookie = `user_info=${encodedUserInfo}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=lax`;

        console.log('Cookies set successfully');
        console.log('New cookies:', document.cookie);
        
        // Redirect sau khi set cookies thành công
        console.log('Redirecting to /gold-price');
        router.replace('/gold-price');
      } catch (error) {
        console.error('Error setting cookies:', error);
        router.replace('/login?error=cookie_error');
      }
    } else {
      console.log('No token found in URL, redirecting to login');
      router.replace('/login?error=no_token');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Đang xử lý đăng nhập...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
      </div>
    </div>
  );
} 