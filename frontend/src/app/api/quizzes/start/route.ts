import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { quizzes } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth-utils';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const requestBody = await request.json();
    
    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { subject, difficulty, questionCount } = requestBody;

    // Validate required subject field
    if (!subject) {
      return NextResponse.json({ 
        error: "Subject is required",
        code: "MISSING_SUBJECT" 
      }, { status: 400 });
    }

    // Validate subject enum
    const validSubjects = ['coding', 'vocab', 'finance'];
    if (!validSubjects.includes(subject)) {
      return NextResponse.json({ 
        error: "Subject must be one of: coding, vocab, finance",
        code: "INVALID_SUBJECT" 
      }, { status: 400 });
    }

    // Validate difficulty if provided
    if (difficulty !== undefined && (difficulty < 1 || difficulty > 3 || !Number.isInteger(difficulty))) {
      return NextResponse.json({ 
        error: "Difficulty must be an integer between 1 and 3",
        code: "INVALID_DIFFICULTY" 
      }, { status: 400 });
    }

    // Validate question count
    const validQuestionCount = Math.min(parseInt(questionCount || '5'), 20);
    if (questionCount && (isNaN(parseInt(questionCount)) || parseInt(questionCount) < 1)) {
      return NextResponse.json({ 
        error: "Question count must be a positive integer",
        code: "INVALID_QUESTION_COUNT" 
      }, { status: 400 });
    }

    // Build query conditions
    let whereConditions = eq(quizzes.subject, subject);
    
    if (difficulty) {
      whereConditions = and(whereConditions, eq(quizzes.difficulty, difficulty));
    }

    // Fetch questions with randomization
    const availableQuestions = await db.select({
      id: quizzes.id,
      question: quizzes.question,
      options: quizzes.options,
      difficulty: quizzes.difficulty,
      antiCheatFlags: quizzes.antiCheatFlags
    })
    .from(quizzes)
    .where(whereConditions)
    .orderBy(sql`RANDOM()`)
    .limit(validQuestionCount);

    // Check if we found any questions
    if (availableQuestions.length === 0) {
      return NextResponse.json({ 
        error: "No questions found for the specified criteria",
        code: "NO_QUESTIONS_FOUND" 
      }, { status: 404 });
    }

    // Generate unique session ID
    const sessionId = `quiz_session_${randomUUID()}`;

    // Extract anti-cheat settings from first question (assuming consistent per subject)
    const antiCheatSettings = availableQuestions[0].antiCheatFlags || {};
    const timeLimit = antiCheatSettings.timer || 60; // default 60 seconds per question
    const maxAttempts = antiCheatSettings.max_attempts || 3; // default 3 attempts

    // Format questions for response (excluding correct answers)
    const questionResponse = availableQuestions.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options,
      difficulty: q.difficulty
    }));

    // Calculate total time limit (per question * number of questions)
    const totalTimeLimit = timeLimit * availableQuestions.length;

    const sessionResponse = {
      sessionId,
      subject,
      questions: questionResponse,
      timeLimit: totalTimeLimit,
      maxAttempts,
      startedAt: new Date().toISOString()
    };

    return NextResponse.json(sessionResponse, { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}