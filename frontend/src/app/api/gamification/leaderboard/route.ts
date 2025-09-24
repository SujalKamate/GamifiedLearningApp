import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { leaderboard, user } from '@/db/schema';
import { eq, asc, desc, count } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    
    // Validate and parse query parameters
    const limitParam = searchParams.get('limit') || '10';
    const offsetParam = searchParams.get('offset') || '0';
    const includeUserParam = searchParams.get('includeUser') || 'true';
    
    const limit = Math.min(parseInt(limitParam), 100);
    const offset = parseInt(offsetParam);
    const includeUser = includeUserParam === 'true';
    
    if (isNaN(limit) || limit < 1) {
      return NextResponse.json({ 
        error: "Invalid limit parameter. Must be a positive number",
        code: "INVALID_LIMIT" 
      }, { status: 400 });
    }
    
    if (isNaN(offset) || offset < 0) {
      return NextResponse.json({ 
        error: "Invalid offset parameter. Must be a non-negative number",
        code: "INVALID_OFFSET" 
      }, { status: 400 });
    }

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: count() })
      .from(leaderboard);
    const total = totalCountResult[0]?.count || 0;

    // Get leaderboard with user info, ordered by rank
    const leaderboardData = await db
      .select({
        rank: leaderboard.rank,
        userId: leaderboard.userId,
        name: user.name,
        image: user.image,
        xp: leaderboard.xp,
        updatedAt: leaderboard.updatedAt
      })
      .from(leaderboard)
      .innerJoin(user, eq(leaderboard.userId, user.id))
      .orderBy(asc(leaderboard.rank))
      .limit(limit)
      .offset(offset);

    let currentUserRank = null;

    // If includeUser=true and current user not in results, get their rank
    if (includeUser) {
      const userInResults = leaderboardData.find(entry => entry.userId === currentUser.id);
      
      if (!userInResults) {
        // Get current user's rank data
        const currentUserData = await db
          .select({
            rank: leaderboard.rank,
            xp: leaderboard.xp
          })
          .from(leaderboard)
          .where(eq(leaderboard.userId, currentUser.id))
          .limit(1);

        if (currentUserData.length > 0) {
          currentUserRank = {
            rank: currentUserData[0].rank,
            xp: currentUserData[0].xp,
            totalUsers: total
          };
        }
      }
    }

    const response = {
      leaderboard: leaderboardData,
      pagination: {
        total,
        limit,
        offset
      }
    };

    // Add currentUser field only if we have data and user not in main results
    if (currentUserRank) {
      (response as any).currentUser = currentUserRank;
    }

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}