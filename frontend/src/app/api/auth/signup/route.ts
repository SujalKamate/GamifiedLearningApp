import { NextRequest, NextResponse } from 'next/server';
import { proxyBackend } from '@/lib/backend';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await proxyBackend('/auth/signup', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}


