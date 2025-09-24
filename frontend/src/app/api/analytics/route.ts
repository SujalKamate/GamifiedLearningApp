import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { analytics } from '@/db/schema';
import { eq, gte, desc, sql } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    if (isNaN(days) || days <= 0) {
      return NextResponse.json({ error: 'Days parameter must be positive integer', code: 'INVALID_DAYS_PARAMETER' }, { status: 400 });
    }

    // Mock summary
    const summary = {
      totalPlayTime: 540, // minutes
      totalSessions: 18,
      uniqueAchievements: ['Quick Starter', 'Consistent Learner', 'Milestone 500'],
      averageSessionTime: 30,
      dailyAverage: Math.round(540 / days),
      recentSessions: Array.from({ length: Math.min(10, days) }).map((_, i) => ({
        sessionId: `sess_${1000 + i}`,
        playTime: 20 + (i % 3) * 10,
        createdAt: new Date(Date.now() - i * 86400000).toISOString(),
        achievements: i % 2 === 0 ? ['Quick Starter'] : []
      }))
    };

    return NextResponse.json(summary, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const created = {
      sessionId: body.sessionId ?? `sess_${Math.floor(Math.random() * 10000)}`,
      achievements: body.achievements ?? [],
      playTime: body.playTime ?? 25,
      createdAt: new Date().toISOString()
    };
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}