import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default_secret_key_change_this_in_production'
);

const COOKIE_NAME = 'auth-token';

export interface UserJwtPayload {
  id: number;
  email: string;
  username: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export async function verifyAuth(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as UserJwtPayload;
  } catch (err) {
    return null;
  }
}

export async function signToken(payload: Omit<UserJwtPayload, 'iat' | 'exp'>) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);

  return token;
}

export async function getToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME);
  return token?.value;
}

export async function setToken(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });
}

export async function removeToken() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function login(formData: { email: string; password: string }) {
  // Demo login - thay thế bằng call API thực tế
  if (formData.email === 'demo@example.com' && formData.password === 'password123') {
    const user = { 
      id: 1, 
      email: formData.email,
      username: 'demo',
      role: 'user' 
    };
    const token = await signToken(user);
    await setToken(token);
    return { success: true, user };
  }
  throw new Error('Email hoặc mật khẩu không đúng');
}

export async function logout() {
  await removeToken();
}

export async function getSession() {
  const token = await getToken();
  if (!token) return null;
  
  try {
    const request = new Request('http://dummy.url', {
      headers: {
        cookie: `${COOKIE_NAME}=${token}`
      }
    });
    return await verifyAuth(new NextRequest(request));
  } catch (error) {
    return null;
  }
}

export async function updateSession(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const parsed = await verifyAuth(request);
    if (!parsed) return null;

    // Tạo token mới để reset thời gian hết hạn
    const newToken = await signToken({
      id: parsed.id,
      email: parsed.email,
      username: parsed.username,
      role: parsed.role
    });
    
    await setToken(newToken);
    return parsed;
  } catch (error) {
    return null;
  }
} 