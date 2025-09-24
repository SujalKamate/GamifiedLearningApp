import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { achievements, userAchievements, learningProgress, leaderboard } from '@/db/schema';
import { eq, and, notInArray, sql } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const requestBody = await request.json();
    const { subject, scoreIncrement, quizzesCompleted } = requestBody;

    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody || 'authorId' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Validate required fields
    if (!subject) {
      return NextResponse.json({ 
        error: "Subject is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Get user's current achievements to avoid duplicates
    const currentUserAchievements = await db.select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, user.id));

    const currentAchievementIds = currentUserAchievements.map(ua => ua.achievementId);

    // Get all available achievements
    const allAchievements = await db.select()
      .from(achievements);

    // Filter out already awarded achievements
    const availableAchievements = currentAchievementIds.length > 0 
      ? allAchievements.filter(a => !currentAchievementIds.includes(a.id))
      : allAchievements;

    // Get user's current progress
    const userProgress = await db.select()
      .from(learningProgress)
      .where(and(
        eq(learningProgress.userId, user.id),
        eq(learningProgress.subject, subject)
      ))
      .limit(1);

    // Get user's leaderboard entry for total XP
    const userLeaderboard = await db.select()
      .from(leaderboard)
      .where(eq(leaderboard.userId, user.id))
      .limit(1);

    const currentLevel = userProgress.length > 0 ? userProgress[0].currentLevel : 1;
    const totalScore = userProgress.length > 0 ? userProgress[0].totalScore : 0;
    const totalXP = userLeaderboard.length > 0 ? userLeaderboard[0].xp : 0;

    // Get total quizzes completed across all subjects
    const allProgress = await db.select()
      .from(learningProgress)
      .where(eq(learningProgress.userId, user.id));

    const totalQuizzesCompleted = quizzesCompleted || 0;

    // Get count of subjects user has completed quizzes in
    const subjectsWithProgress = allProgress.filter(p => p.totalScore > 0).length;

    const newAchievements = [];

    // Check each available achievement
    for (const achievement of availableAchievements) {
      let shouldAward = false;
      const criteria = achievement.criteria as any;

      switch (criteria.type) {
        case 'level':
          // Check if user reached the required level
          if (criteria.subject) {
            // Subject-specific level achievement
            if (criteria.subject === subject && currentLevel >= criteria.value) {
              shouldAward = true;
            }
          } else {
            // Any subject level achievement
            if (currentLevel >= criteria.value) {
              shouldAward = true;
            }
          }
          break;

        case 'quiz_count':
          // Check quiz completion count
          if (criteria.subject) {
            // Subject-specific quiz count
            if (criteria.subject === subject && totalQuizzesCompleted >= criteria.value) {
              shouldAward = true;
            }
          } else {
            // Total quiz count across all subjects
            if (totalQuizzesCompleted >= criteria.value) {
              shouldAward = true;
            }
          }
          break;

        case 'score':
          // Check total score/XP achievements
          if (criteria.subject) {
            // Subject-specific score
            if (criteria.subject === subject && totalScore >= criteria.value) {
              shouldAward = true;
            }
          } else {
            // Total XP across all subjects
            if (totalXP >= criteria.value) {
              shouldAward = true;
            }
          }
          break;

        case 'milestone':
          // Special milestone achievements
          if (criteria.condition === 'multi_subject') {
            // Complete quizzes in all subjects (assuming 3 subjects: coding, vocab, finance)
            if (subjectsWithProgress >= criteria.value) {
              shouldAward = true;
            }
          } else if (criteria.condition === 'first_quiz') {
            // First quiz completion
            if (totalQuizzesCompleted >= 1) {
              shouldAward = true;
            }
          } else if (criteria.condition === 'perfect_score') {
            // This would need to be tracked separately in quiz sessions
            // For now, we'll check if score increment suggests perfect performance
            if (scoreIncrement && scoreIncrement >= criteria.value) {
              shouldAward = true;
            }
          }
          break;

        case 'streak':
          // Streak achievements would require additional tracking
          // For now, we'll skip these as they need session/date tracking
          break;
      }

      if (shouldAward) {
        // Award the achievement
        const awardedAt = new Date().toISOString();
        const newUserAchievement = await db.insert(userAchievements)
          .values({
            userId: user.id,
            achievementId: achievement.id,
            awardedAt
          })
          .returning();

        newAchievements.push({
          ...achievement,
          awardedAt
        });
      }
    }

    const message = newAchievements.length > 0 
      ? `Congratulations! You earned ${newAchievements.length} new achievement${newAchievements.length > 1 ? 's' : ''}!`
      : 'No new achievements earned this time. Keep learning!';

    return NextResponse.json({
      newAchievements,
      message
    }, { status: 200 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}