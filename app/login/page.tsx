'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import { authApi } from '@/lib/api';
import type { LoginResponse } from '@/lib/api';
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Lấy trang redirect sau khi đăng nhập
  const from = searchParams.get('from') || '/gold-price';

  // Xử lý Google OAuth callback
  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    
    if (error) {
      setError('Đăng nhập bằng Google thất bại: ' + error);
      return;
    }

    if (code) {
      handleGoogleCallback(code);
    }
  }, [searchParams]);

  async function handleGoogleCallback(code: string) {
    try {
      setIsLoading(true);
      setError('');
      console.log('Processing Google callback...');
      
      const response = await authApi.googleCallback(code);
      console.log('Google login successful:', response);

      if (!response.access_token) {
        throw new Error('Token không hợp lệ');
      }

      // Lưu token và thông tin user
      handleLoginSuccess(response);

    } catch (err: any) {
      console.error('Google login error:', err);
      setError('Đăng nhập bằng Google thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleLoginSuccess(response: LoginResponse) {
    // Lưu token vào cookie
    console.log('Setting auth token cookie...');
    document.cookie = `auth-token=${response.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=lax`;

    // Lưu thông tin user
    console.log('Setting user info cookie...');
    document.cookie = `user-info=${JSON.stringify(response.user)}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;

    // Luôn chuyển hướng về trang gold-price sau khi đăng nhập thành công
    console.log('Redirecting to /gold-price');
    router.push('/gold-price');
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('Starting login process...');
      const formData = new FormData(event.currentTarget);
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;

      console.log('Calling login API...', { email });
      const response = await authApi.login({ 
        email, 
        password 
      });
      console.log('Login successful:', response);

      handleLoginSuccess(response);

    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Email hoặc mật khẩu không đúng');
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleLogin = () => {
    console.log('Starting Google login...');
    setIsLoading(true);
    authApi.googleLogin();
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Gold theme */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 p-8 flex flex-col justify-between">
        <div className="flex items-center gap-2">
          <Icons.goldBar className="h-8 w-8 text-yellow-900" />
          <h1 className="text-2xl font-bold text-yellow-900">Gold Tracker</h1>
        </div>
        <div className="hidden md:block">
          <h2 className="text-3xl font-bold text-yellow-900 mb-4">
            Theo dõi giá vàng thời gian thực
          </h2>
          <p className="text-yellow-800 text-lg">
            Cập nhật giá vàng 24/7, phân tích xu hướng và quản lý danh mục đầu tư vàng của bạn
          </p>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full md:w-1/2 p-8 flex items-center justify-center">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight">
              Đăng nhập vào tài khoản
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Nhập thông tin đăng nhập của bạn để tiếp tục
            </p>
          </div>

          {/* Google Login Button */}
          <div className="space-y-4">
            <Button
              variant="outline"
              type="button"
              disabled={isLoading}
              className="w-full py-6 flex items-center justify-center gap-2"
              onClick={handleGoogleLogin}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span className="text-sm font-semibold">
                Đăng nhập với Google
              </span>
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Hoặc đăng nhập với email
              </span>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  className="w-full"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full"
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="h-4 w-4 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                  />
                  <Label htmlFor="remember" className="text-sm">
                    Ghi nhớ đăng nhập
                  </Label>
                </div>

                <Button
                  variant="link"
                  className="text-sm text-yellow-600 hover:text-yellow-500"
                  onClick={() => router.push('/forgot-password')}
                >
                  Quên mật khẩu?
                </Button>
              </div>

              <Button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Icons.spinner className="h-4 w-4 animate-spin" />
                ) : (
                  "Đăng nhập"
                )}
              </Button>
            </div>
          </form>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Chưa có tài khoản?{' '}
              <Button
                variant="link"
                className="text-yellow-600 hover:text-yellow-500"
                onClick={() => router.push('/register')}
              >
                Đăng ký ngay
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
