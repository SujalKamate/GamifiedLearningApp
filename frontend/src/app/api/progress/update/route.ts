import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { learningProgress } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth-utils';

const VALID_SUBJECTS = ['coding', 'vocab', 'finance'] as const;
type Subject = typeof VALID_SUBJECTS[number];

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Parse request body
    const requestBody = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { 
      subject, 
      scoreIncrement = 0, 
      levelIncrement = 0, 
      newAchievements = [], 
      offlineSync 
    } = requestBody;

    // Validate required fields
    if (!subject) {
      return NextResponse.json({ 
        error: "Subject is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Validate subject enum
    if (!VALID_SUBJECTS.includes(subject as Subject)) {
      return NextResponse.json({ 
        error: `Subject must be one of: ${VALID_SUBJECTS.join(', ')}`,
        code: "INVALID_SUBJECT" 
      }, { status: 400 });
    }

    // Validate numeric inputs
    if (typeof scoreIncrement !== 'number' || typeof levelIncrement !== 'number') {
      return NextResponse.json({ 
        error: "Score and level increments must be numbers",
        code: "INVALID_INCREMENT" 
      }, { status: 400 });
    }

    // Validate achievements array
    if (!Array.isArray(newAchievements) || !newAchievements.every(a => typeof a === 'string')) {
      return NextResponse.json({ 
        error: "New achievements must be an array of strings",
        code: "INVALID_ACHIEVEMENTS" 
      }, { status: 400 });
    }

    const currentTimestamp = new Date().toISOString();

    // Find existing progress record
    const existingProgress = await db.select()
      .from(learningProgress)
      .where(and(
        eq(learningProgress.userId, user.id),
        eq(learningProgress.subject, subject)
      ))
      .limit(1);

    if (existingProgress.length === 0) {
      // Create new progress record
      const newProgress = await db.insert(learningProgress)
        .values({
          userId: user.id,
          subject,
          currentLevel: Math.max(1 + levelIncrement, 1),
          totalScore: Math.max(scoreIncrement, 0),
          achievements: newAchievements.length > 0 ? newAchievements : null,
          offlineSync: offlineSync !== undefined ? offlineSync : false,
          updatedAt: currentTimestamp
        })
        .returning();

      return NextResponse.json(newProgress[0], { status: 201 });
    } else {
      // Update existing progress record
      const existingRecord = existingProgress[0];
      
      // Merge achievements (remove duplicates)
      const existingAchievements = Array.isArray(existingRecord.achievements) 
        ? existingRecord.achievements as string[]
        : [];
      const mergedAchievements = [...new Set([...existingAchievements, ...newAchievements])];

      // Calculate new values
      const newTotalScore = Math.max((existingRecord.totalScore || 0) + scoreIncrement, 0);
      const newCurrentLevel = Math.max((existingRecord.currentLevel || 1) + levelIncrement, 1);

      // Prepare update data
      const updateData: any = {
        totalScore: newTotalScore,
        currentLevel: newCurrentLevel,
        achievements: mergedAchievements.length > 0 ? mergedAchievements : existingRecord.achievements,
        updatedAt: currentTimestamp
      };

      // Update offlineSync if provided
      if (offlineSync !== undefined) {
        updateData.offlineSync = offlineSync;
      }

      const updatedProgress = await db.update(learningProgress)
        .set(updateData)
        .where(and(
          eq(learningProgress.userId, user.id),
          eq(learningProgress.subject, subject)
        ))
        .returning();

      if (updatedProgress.length === 0) {
        return NextResponse.json({ 
          error: 'Failed to update progress record',
          code: 'UPDATE_FAILED' 
        }, { status: 500 });
      }

      return NextResponse.json(updatedProgress[0], { status: 200 });
    }

  } catch (error) {
    console.error('POST learning progress error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}