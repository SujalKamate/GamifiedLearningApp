import { NextRequest, NextResponse } from 'next/server';
import { proxyBackend } from '@/lib/backend';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const password = searchParams.get('password');
    if (!email || !password) {
      return NextResponse.json({ detail: 'email and password are required' }, { status: 400 });
    }
    const res = await proxyBackend('/auth/login', {
      method: 'GET',
      params: { email, password },
      skipAuth: true,
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}


