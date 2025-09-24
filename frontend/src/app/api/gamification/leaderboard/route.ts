import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { leaderboard, user } from '@/db/schema';
import { eq, asc, desc, count } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit') || '10';
    const offsetParam = searchParams.get('offset') || '0';
    const includeUserParam = searchParams.get('includeUser') || 'true';
    const limit = Math.min(parseInt(limitParam), 100);
    const offset = parseInt(offsetParam);
    const includeUser = includeUserParam === 'true';
    if (isNaN(limit) || limit < 1) {
      return NextResponse.json({ error: 'Invalid limit parameter', code: 'INVALID_LIMIT' }, { status: 400 });
    }
    if (isNaN(offset) || offset < 0) {
      return NextResponse.json({ error: 'Invalid offset parameter', code: 'INVALID_OFFSET' }, { status: 400 });
    }

    const pool = Array.from({ length: 50 }).map((_, i) => ({
      rank: i + 1,
      userId: String(1000 + i),
      name: `Player ${i + 1}`,
      image: `https://i.pravatar.cc/100?u=${i + 1}`,
      xp: 1000 - i * 10,
      updatedAt: new Date().toISOString()
    }));
    const sliced = pool.slice(offset, offset + limit);
    const response: any = {
      leaderboard: sliced,
      pagination: { total: pool.length, limit, offset }
    };
    if (includeUser) {
      response.currentUser = { rank: 7, xp: 930, totalUsers: pool.length };
    }
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}