import { NextResponse } from 'next/server';
import { z } from 'zod';
import { login } from '@/lib/auth';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});
//
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.errors.map(error => error.message);
      return NextResponse.json(
        { message: errors.join(', ') },
        { status: 400 }
      );
    }

    // Xử lý đăng nhập
    const loginResult = await login(result.data);
    
    if (!loginResult.success) {
      return NextResponse.json(
        { message: loginResult.error },
        { status: 401 }
      );
    }

    return NextResponse.json({
      message: 'Đăng nhập thành công',
      user: loginResult.user
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Có lỗi xảy ra, vui lòng thử lại sau' },
      { status: 500 }
    );
  }
} 