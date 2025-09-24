import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { quizzes, learningProgress, leaderboard } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const requestBody = await request.json();
    const { quizId, selectedAnswer, sessionId, timeSpent } = requestBody;

    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Validate required fields
    if (!quizId || typeof quizId !== 'number') {
      return NextResponse.json({ 
        error: "Valid quizId is required",
        code: "MISSING_QUIZ_ID" 
      }, { status: 400 });
    }

    if (selectedAnswer === undefined || typeof selectedAnswer !== 'number') {
      return NextResponse.json({ 
        error: "Valid selectedAnswer is required",
        code: "MISSING_SELECTED_ANSWER" 
      }, { status: 400 });
    }

    // Fetch quiz from database
    const quiz = await db.select()
      .from(quizzes)
      .where(eq(quizzes.id, quizId))
      .limit(1);

    if (quiz.length === 0) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    const quizData = quiz[0];
    const isCorrect = selectedAnswer === quizData.correctAnswer;

    // Calculate XP based on difficulty and correctness
    let xpEarned = 0;
    if (isCorrect) {
      xpEarned = quizData.difficulty * 10; // easy=10, medium=20, hard=30
    } else {
      xpEarned = quizData.difficulty * 2; // participation points
    }

    // Get or create learning progress
    let progressRecord = await db.select()
      .from(learningProgress)
      .where(eq(learningProgress.userId, user.id))
      .limit(1);

    let currentProgress;
    let leveledUp = false;
    const oldLevel = progressRecord.length > 0 ? progressRecord[0].currentLevel : 1;
    const oldScore = progressRecord.length > 0 ? progressRecord[0].totalScore : 0;
    const newScore = oldScore + xpEarned;
    const newLevel = Math.floor(newScore / 100) + 1;
    leveledUp = newLevel > oldLevel;

    if (progressRecord.length === 0) {
      // Create new progress record
      currentProgress = await db.insert(learningProgress)
        .values({
          userId: user.id,
          subject: quizData.subject,
          currentLevel: newLevel,
          totalScore: newScore,
          achievements: null,
          offlineSync: false,
          updatedAt: new Date().toISOString()
        })
        .returning();
    } else {
      // Update existing progress
      currentProgress = await db.update(learningProgress)
        .set({
          currentLevel: newLevel,
          totalScore: newScore,
          updatedAt: new Date().toISOString()
        })
        .where(eq(learningProgress.userId, user.id))
        .returning();
    }

    // Update or create leaderboard entry
    const existingLeaderboard = await db.select()
      .from(leaderboard)
      .where(eq(leaderboard.userId, user.id))
      .limit(1);

    if (existingLeaderboard.length === 0) {
      // Create new leaderboard entry
      await db.insert(leaderboard)
        .values({
          userId: user.id,
          xp: newScore,
          rank: 0, // Will be recalculated below
          updatedAt: new Date().toISOString()
        });
    } else {
      // Update existing leaderboard entry
      await db.update(leaderboard)
        .set({
          xp: newScore,
          updatedAt: new Date().toISOString()
        })
        .where(eq(leaderboard.userId, user.id));
    }

    // Recalculate all ranks based on XP
    const allLeaderboardEntries = await db.select()
      .from(leaderboard)
      .orderBy(desc(leaderboard.xp));

    // Update ranks for all users
    for (let i = 0; i < allLeaderboardEntries.length; i++) {
      const entry = allLeaderboardEntries[i];
      await db.update(leaderboard)
        .set({
          rank: i + 1,
          updatedAt: new Date().toISOString()
        })
        .where(eq(leaderboard.userId, entry.userId));
    }

    // Generate explanation
    const options = quizData.options as string[];
    const explanation = `The correct answer is "${options[quizData.correctAnswer]}". ${isCorrect ? 'Well done!' : 'Better luck next time!'}`;

    return NextResponse.json({
      correct: isCorrect,
      correctAnswer: quizData.correctAnswer,
      explanation: explanation,
      xpEarned: xpEarned,
      totalXp: newScore,
      currentLevel: newLevel,
      leveledUp: leveledUp
    }, { status: 200 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}