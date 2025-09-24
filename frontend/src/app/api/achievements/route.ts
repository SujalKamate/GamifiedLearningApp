import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { achievements, userAchievements, learningProgress } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const typeFilter = searchParams.get('type');

    // Validate type filter if provided
    const validTypes = ['streak', 'level', 'quiz', 'milestone'];
    if (typeFilter && !validTypes.includes(typeFilter)) {
      return NextResponse.json({ 
        error: "Invalid achievement type. Must be one of: streak, level, quiz, milestone",
        code: "INVALID_TYPE_FILTER" 
      }, { status: 400 });
    }

    // Get all achievements with user's earned status
    let achievementsQuery = db
      .select({
        id: achievements.id,
        name: achievements.name,
        description: achievements.description,
        icon: achievements.icon,
        type: achievements.type,
        criteria: achievements.criteria,
        awardedAt: userAchievements.awardedAt
      })
      .from(achievements)
      .leftJoin(
        userAchievements, 
        and(
          eq(userAchievements.achievementId, achievements.id),
          eq(userAchievements.userId, user.id)
        )
      );

    // Apply type filter if provided
    if (typeFilter) {
      achievementsQuery = achievementsQuery.where(eq(achievements.type, typeFilter));
    }

    const allAchievements = await achievementsQuery;

    // Get user's learning progress for calculating unearned achievement progress
    const userProgress = await db.select()
      .from(learningProgress)
      .where(eq(learningProgress.userId, user.id));

    // Calculate progress for each achievement
    const achievementsWithProgress = allAchievements.map(achievement => {
      const earned = achievement.awardedAt !== null;
      const baseAchievement = {
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        type: achievement.type,
        earned,
        awardedAt: achievement.awardedAt
      };

      // Calculate progress for unearned achievements
      if (!earned) {
        const criteria = achievement.criteria as any;
        let progress = 0;

        try {
          switch (achievement.type) {
            case 'level':
              if (criteria.subject && criteria.targetLevel) {
                const subjectProgress = userProgress.find(p => p.subject === criteria.subject);
                if (subjectProgress) {
                  progress = Math.min(100, Math.round((subjectProgress.currentLevel / criteria.targetLevel) * 100));
                }
              }
              break;

            case 'quiz':
              if (criteria.subject && criteria.targetScore) {
                const subjectProgress = userProgress.find(p => p.subject === criteria.subject);
                if (subjectProgress) {
                  progress = Math.min(100, Math.round((subjectProgress.totalScore / criteria.targetScore) * 100));
                }
              }
              break;

            case 'streak':
              // Streak progress would need additional streak tracking data
              // For now, return 0 as we don't have streak data in the schema
              progress = 0;
              break;

            case 'milestone':
              // Milestone progress depends on specific criteria
              // Could be based on total XP, total quizzes completed, etc.
              if (criteria.type === 'total_score') {
                const totalScore = userProgress.reduce((sum, p) => sum + p.totalScore, 0);
                progress = Math.min(100, Math.round((totalScore / criteria.target) * 100));
              }
              break;
          }
        } catch (error) {
          console.error('Error calculating progress for achievement', achievement.id, error);
          progress = 0;
        }

        return {
          ...baseAchievement,
          progress
        };
      }

      return baseAchievement;
    });

    // Sort achievements: earned first (by awarded date desc), then unearned (by progress desc)
    achievementsWithProgress.sort((a, b) => {
      if (a.earned && !b.earned) return -1;
      if (!a.earned && b.earned) return 1;
      
      if (a.earned && b.earned) {
        // Sort earned by awarded date (most recent first)
        return new Date(b.awardedAt!).getTime() - new Date(a.awardedAt!).getTime();
      }
      
      if (!a.earned && !b.earned) {
        // Sort unearned by progress (highest first)
        return (b.progress || 0) - (a.progress || 0);
      }
      
      return 0;
    });

    return NextResponse.json(achievementsWithProgress);

  } catch (error) {
    console.error('GET achievements error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}