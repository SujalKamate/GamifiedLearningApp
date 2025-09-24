import { NextRequest, NextResponse } from 'next/server';
import { proxyBackend } from '@/lib/backend';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const auth = request.headers.get('authorization') || request.headers.get('Authorization') || '';
    const token = auth ? auth.replace('Bearer ', '') : '';
    
    const res = await proxyBackend('/quiz/submit-offline', {
      method: 'POST',
      token: token,
      body: JSON.stringify(body),
    });
    
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    console.error('Quiz submit offline error:', e);
    return NextResponse.json({ 
      error: (e as any).data?.error || String(e),
      code: (e as any).data?.code || 'UNKNOWN_ERROR'
    }, { status: (e as any).status || 500 });
  }
}


