import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { quizzes } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth-utils';

const VALID_SUBJECTS = ['coding', 'vocab', 'finance'];
const VALID_DIFFICULTIES = [1, 2, 3];

export async function GET(
  request: NextRequest,
  { params }: { params: { subject: string; difficulty: string } }
) {
  try {
    // Authentication check
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { subject, difficulty } = params;
    const { searchParams } = new URL(request.url);

    // Validate subject parameter
    if (!VALID_SUBJECTS.includes(subject)) {
      return NextResponse.json({
        error: 'Invalid subject. Must be one of: coding, vocab, finance',
        code: 'INVALID_SUBJECT'
      }, { status: 400 });
    }

    // Validate difficulty parameter
    const difficultyNum = parseInt(difficulty);
    if (isNaN(difficultyNum) || !VALID_DIFFICULTIES.includes(difficultyNum)) {
      return NextResponse.json({
        error: 'Invalid difficulty. Must be 1, 2, or 3',
        code: 'INVALID_DIFFICULTY'
      }, { status: 400 });
    }

    // Parse query parameters
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const randomize = searchParams.get('randomize') !== 'false'; // default true

    // Query quizzes table
    let query = db.select({
      id: quizzes.id,
      subject: quizzes.subject,
      question: quizzes.question,
      options: quizzes.options,
      difficulty: quizzes.difficulty,
      antiCheatFlags: quizzes.antiCheatFlags
      // Explicitly exclude correctAnswer for security
    })
    .from(quizzes)
    .where(and(
      eq(quizzes.subject, subject),
      eq(quizzes.difficulty, difficultyNum)
    ));

    // Get all matching records first for total count
    const allResults = await query;

    if (allResults.length === 0) {
      return NextResponse.json({ error: 'No questions found for the specified criteria' }, { status: 404 });
    }

    // Apply randomization and limit
    let finalResults = allResults;
    if (randomize) {
      // Shuffle the array using Fisher-Yates algorithm
      for (let i = finalResults.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [finalResults[i], finalResults[j]] = [finalResults[j], finalResults[i]];
      }
    }

    // Apply limit
    finalResults = finalResults.slice(0, limit);

    // Create response with headers
    const response = NextResponse.json(finalResults);
    response.headers.set('X-Total-Count', allResults.length.toString());

    return response;

  } catch (error) {
    console.error('GET quizzes error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}