import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    console.log('Starting Google callback processing...');
    // Lấy authorization code từ Google callback
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    console.log('Received code:', code ? 'present' : 'missing');

    if (!code) {
      console.error('No authorization code found');
      return NextResponse.json(
        { message: 'Authorization code không hợp lệ' },
        { status: 400 }
      );
    }

    // Gọi API backend để đổi code lấy token
    console.log('Exchanging code for token...');
    const response = await fetch('http://localhost:3002/auth/google/callback', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Backend API error:', response.status);
      throw new Error('Lỗi khi xác thực với Google');
    }

    const data = await response.json();
    console.log('Received data from backend:', {
      hasAccessToken: !!data.access_token,
      hasUser: !!data.user
    });

    const { access_token, user } = data;

    // Tạo response với redirect đến trang test
    console.log('Creating redirect response to /test');
    const baseUrl = request.headers.get('origin') || 'http://localhost:3000';
    const redirectUrl = new URL('/test', baseUrl);
    console.log('Full redirect URL:', redirectUrl.toString());
    const frontendResponse = NextResponse.redirect(redirectUrl);

    // Lưu access token
    console.log('Setting cookies...');
    frontendResponse.cookies.set('auth-token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Lưu thông tin user (không bao gồm thông tin nhạy cảm)
    frontendResponse.cookies.set('user-info', JSON.stringify({
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      picture: user.picture
    }), {
      httpOnly: false, // Cho phép JavaScript đọc thông tin user
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    console.log('Callback processing completed, returning redirect response');
    return frontendResponse;
  } catch (error: any) {
    console.error('Callback error:', error);
    return NextResponse.json(
      { message: 'Đã có lỗi xảy ra khi xử lý đăng nhập' },
      { status: 500 }
    );
  }
} 