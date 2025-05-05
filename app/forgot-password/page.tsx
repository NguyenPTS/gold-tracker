'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData(event.currentTarget);
      const email = formData.get('email') as string;

      // TODO: Implement password reset API call
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <div className="container max-w-md mx-auto p-8">
        <div className="text-center space-y-4">
          <Icons.check className="h-12 w-12 text-green-500 mx-auto" />
          <h1 className="text-2xl font-bold">Kiểm tra email của bạn</h1>
          <p className="text-gray-600">
            Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn.
            Vui lòng kiểm tra hộp thư (và thư mục spam).
          </p>
          <Button
            onClick={() => router.push('/login')}
            className="mt-4"
          >
            Quay lại đăng nhập
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Quên mật khẩu?</h1>
        <p className="text-gray-600 mt-2">
          Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

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

        <Button
          type="submit"
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            'Gửi hướng dẫn đặt lại mật khẩu'
          )}
        </Button>

        <div className="text-center">
          <Button
            variant="link"
            className="text-sm text-gray-600"
            onClick={() => router.push('/login')}
          >
            Quay lại đăng nhập
          </Button>
        </div>
      </form>
    </div>
  );
} 