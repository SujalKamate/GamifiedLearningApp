import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { achievements, userAchievements, learningProgress } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const typeFilter = searchParams.get('type');
    const validTypes = ['streak', 'level', 'quiz', 'milestone'];
    if (typeFilter && !validTypes.includes(typeFilter)) {
      return NextResponse.json({ error: 'Invalid achievement type', code: 'INVALID_TYPE_FILTER' }, { status: 400 });
    }

    const mock = [
      { id: 1, name: 'Quick Starter', description: 'Finish first quiz', icon: '🚀', type: 'quiz', earned: true, awardedAt: new Date().toISOString() },
      { id: 2, name: 'Word Wizard', description: 'Reach level 2 in vocab', icon: '🪄', type: 'level', earned: false, progress: 70 },
      { id: 3, name: 'Finance Rookie', description: 'Score 100 in finance', icon: '💰', type: 'milestone', earned: false, progress: 30 },
      { id: 4, name: '7-Day Streak', description: 'Play 7 days in a row', icon: '🔥', type: 'streak', earned: false, progress: 0 }
    ];
    const filtered = typeFilter ? mock.filter(a => a.type === typeFilter) : mock;
    return NextResponse.json(filtered);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}