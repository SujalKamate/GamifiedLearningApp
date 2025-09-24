import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { quizzes } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth-utils';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { subject = 'coding', difficulty = 1, questionCount = 5 } = await request.json();
    const validSubjects = ['coding', 'vocab', 'finance'];
    if (!validSubjects.includes(subject)) {
      return NextResponse.json({ error: 'Invalid subject', code: 'INVALID_SUBJECT' }, { status: 400 });
    }
    const count = Math.min(Number(questionCount) || 5, 10);
    const sessionId = `quiz_session_${randomUUID()}`;
    const questions = Array.from({ length: count }).map((_, i) => ({
      id: i + 1,
      question: `Sample ${subject} question #${i + 1}?`,
      options: ['A', 'B', 'C', 'D'],
      difficulty
    }));
    const sessionResponse = {
      sessionId,
      subject,
      questions,
      timeLimit: 60 * count,
      maxAttempts: 3,
      startedAt: new Date().toISOString()
    };
    return NextResponse.json(sessionResponse, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}