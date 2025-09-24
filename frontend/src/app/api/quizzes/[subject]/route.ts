import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { quizzes } from '@/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { subject: string } }
) {
  try {
    // Authentication check
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { subject } = params;
    const { searchParams } = new URL(request.url);

    // Validate subject parameter
    const validSubjects = ['coding', 'vocab', 'finance'];
    if (!validSubjects.includes(subject)) {
      return NextResponse.json({ 
        error: 'Invalid subject. Must be one of: coding, vocab, finance',
        code: 'INVALID_SUBJECT'
      }, { status: 400 });
    }

    // Parse and validate query parameters
    const difficultyParam = searchParams.get('difficulty');
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    const randomizeParam = searchParams.get('randomize');

    // Validate difficulty parameter
    let difficulty: number | null = null;
    if (difficultyParam) {
      difficulty = parseInt(difficultyParam);
      if (isNaN(difficulty) || difficulty < 1 || difficulty > 3) {
        return NextResponse.json({ 
          error: 'Difficulty must be an integer between 1-3',
          code: 'INVALID_DIFFICULTY'
        }, { status: 400 });
      }
    }

    // Validate and set limit (default 10, max 50)
    let limit = 10;
    if (limitParam) {
      limit = parseInt(limitParam);
      if (isNaN(limit) || limit < 1) {
        return NextResponse.json({ 
          error: 'Limit must be a positive integer',
          code: 'INVALID_LIMIT'
        }, { status: 400 });
      }
      limit = Math.min(limit, 50); // Cap at 50
    }

    // Validate and set offset (default 0)
    let offset = 0;
    if (offsetParam) {
      offset = parseInt(offsetParam);
      if (isNaN(offset) || offset < 0) {
        return NextResponse.json({ 
          error: 'Offset must be a non-negative integer',
          code: 'INVALID_OFFSET'
        }, { status: 400 });
      }
    }

    // Parse randomize parameter (default true)
    const randomize = randomizeParam !== 'false';

    // Build query conditions
    let whereConditions = eq(quizzes.subject, subject);
    if (difficulty !== null) {
      whereConditions = and(eq(quizzes.subject, subject), eq(quizzes.difficulty, difficulty));
    }

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(quizzes)
      .where(whereConditions);
    
    const totalCount = totalCountResult[0]?.count || 0;

    if (totalCount === 0) {
      return NextResponse.json({ 
        error: 'No questions found for the specified criteria',
        code: 'NO_QUESTIONS_FOUND'
      }, { status: 404 });
    }

    // Build main query
    let query = db
      .select({
        id: quizzes.id,
        subject: quizzes.subject,
        question: quizzes.question,
        options: quizzes.options,
        difficulty: quizzes.difficulty,
        antiCheatFlags: quizzes.antiCheatFlags
        // SECURITY: Never include correctAnswer
      })
      .from(quizzes)
      .where(whereConditions);

    // Apply randomization or default ordering
    if (randomize) {
      query = query.orderBy(sql`RANDOM()`);
    } else {
      query = query.orderBy(desc(quizzes.id));
    }

    // Apply pagination
    query = query.limit(limit).offset(offset);

    const results = await query;

    // Set pagination header
    const response = NextResponse.json(results);
    response.headers.set('X-Total-Count', totalCount.toString());
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Expose-Headers', 'X-Total-Count');

    return response;

  } catch (error) {
    console.error('GET quizzes error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}