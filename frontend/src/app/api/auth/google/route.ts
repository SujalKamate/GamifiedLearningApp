import { NextRequest, NextResponse } from 'next/server';
import { proxyBackend } from '@/lib/backend';

export async function POST(request: NextRequest) {
  try {
    const { id_token } = await request.json();
    if (!id_token) {
      return NextResponse.json({ error: 'id_token is required' }, { status: 400 });
    }
    
    // Use the enhanced proxyBackend function with skipAuth since this is the auth endpoint
    const res = await proxyBackend('/auth/google', {
      method: 'POST',
      skipAuth: true, // Skip auth since this is the auth endpoint itself
      body: JSON.stringify({ id_token }),
    });
    
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    console.error('Google auth error:', e);
    // Handle specific error types
    if ((e as any).status === 401) {
      return NextResponse.json({ error: 'Invalid Google token' }, { status: 401 });
    }
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

