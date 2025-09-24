import { NextRequest, NextResponse } from 'next/server';
import { proxyBackend } from '@/lib/backend';

export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const auth = request.headers.get('authorization') || request.headers.get('Authorization') || '';
    const token = auth ? auth.replace('Bearer ', '') : '';
    
    const res = await proxyBackend(`/offline/sync/${params.userId}`, {
      method: 'POST',
      token: token,
      body: await request.text(),
    });
    
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    console.error('Offline sync error:', e);
    return NextResponse.json({ 
      error: (e as any).data?.error || String(e),
      code: (e as any).data?.code || 'UNKNOWN_ERROR'
    }, { status: (e as any).status || 500 });
  }
}


