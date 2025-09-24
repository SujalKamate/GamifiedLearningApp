import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { analytics } from '@/db/schema';
import { eq, gte, desc, sql } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    if (isNaN(days) || days <= 0) {
      return NextResponse.json({ 
        error: 'Days parameter must be a positive integer',
        code: 'INVALID_DAYS_PARAMETER' 
      }, { status: 400 });
    }

    // Calculate date threshold
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);
    const thresholdISO = dateThreshold.toISOString();

    // Fetch analytics data for the user within the date range
    const analyticsData = await db.select()
      .from(analytics)
      .where(eq(analytics.userId, user.id))
      .orderBy(desc(analytics.createdAt));

    // Filter by date range in memory (since createdAt is stored as text)
    const filteredData = analyticsData.filter(record => 
      record.createdAt >= thresholdISO
    );

    // Calculate summary statistics
    const totalPlayTime = filteredData.reduce((sum, record) => sum + record.playTime, 0);
    const totalSessions = filteredData.length;
    
    // Collect unique achievements
    const allAchievements = new Set<string>();
    filteredData.forEach(record => {
      if (record.achievements && Array.isArray(record.achievements)) {
        record.achievements.forEach(achievement => allAchievements.add(achievement));
      }
    });

    const averageSessionTime = totalSessions > 0 ? Math.round(totalPlayTime / totalSessions) : 0;
    const dailyAverage = Math.round(totalPlayTime / days);

    // Get recent sessions (last 10)
    const recentSessions = filteredData.slice(0, 10);

    const summary = {
      totalPlayTime,
      totalSessions,
      uniqueAchievements: Array.from(allAchievements),
      averageSessionTime,
      dailyAverage,
      recentSessions
    };

    return NextResponse.json(summary, { status: 200 });

  } catch (error) {
    console.error('GET analytics error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const requestBody = await request.json();
    
    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { sessionId, achievements, playTime } = requestBody;

    // Validate required fields
    if (!sessionId) {
      return NextResponse.json({ 
        error: "Session ID is required",
        code: "MISSING_SESSION_ID" 
      }, { status: 400 });
    }

    if (typeof sessionId !== 'string' || sessionId.trim().length === 0) {
      return NextResponse.json({ 
        error: "Session ID must be a non-empty string",
        code: "INVALID_SESSION_ID" 
      }, { status: 400 });
    }

    if (playTime === undefined || playTime === null) {
      return NextResponse.json({ 
        error: "Play time is required",
        code: "MISSING_PLAY_TIME" 
      }, { status: 400 });
    }

    if (!Number.isInteger(playTime) || playTime < 0) {
      return NextResponse.json({ 
        error: "Play time must be a non-negative integer",
        code: "INVALID_PLAY_TIME" 
      }, { status: 400 });
    }

    // Validate achievements if provided
    if (achievements !== undefined && achievements !== null) {
      if (!Array.isArray(achievements)) {
        return NextResponse.json({ 
          error: "Achievements must be an array",
          code: "INVALID_ACHIEVEMENTS_FORMAT" 
        }, { status: 400 });
      }

      // Validate each achievement is a string
      for (const achievement of achievements) {
        if (typeof achievement !== 'string') {
          return NextResponse.json({ 
            error: "All achievements must be strings",
            code: "INVALID_ACHIEVEMENT_TYPE" 
          }, { status: 400 });
        }
      }
    }

    // Prepare data for insertion
    const insertData = {
      userId: user.id,
      sessionId: sessionId.trim(),
      achievements: achievements || [],
      playTime,
      createdAt: new Date().toISOString()
    };

    // Insert new analytics record
    const newRecord = await db.insert(analytics)
      .values(insertData)
      .returning();

    return NextResponse.json(newRecord[0], { status: 201 });

  } catch (error) {
    console.error('POST analytics error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}