import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { learningProgress } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth-utils';

const VALID_SUBJECTS = ['coding', 'vocab', 'finance'] as const;

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const subject = searchParams.get('subject');

    // Validate subject parameter if provided
    if (subject && !VALID_SUBJECTS.includes(subject as any)) {
      return NextResponse.json({ 
        error: `Invalid subject. Must be one of: ${VALID_SUBJECTS.join(', ')}`,
        code: "INVALID_SUBJECT" 
      }, { status: 400 });
    }

    // Build query conditions
    let whereCondition = eq(learningProgress.userId, user.id);
    
    if (subject) {
      whereCondition = and(
        eq(learningProgress.userId, user.id),
        eq(learningProgress.subject, subject)
      );
    }

    const results = await db.select()
      .from(learningProgress)
      .where(whereCondition);

    return NextResponse.json(results);

  } catch (error) {
    console.error('GET error:', error);
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
    const { subject, currentLevel, totalScore, achievements, offlineSync } = requestBody;

    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody) {
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

    // Validate subject enum
    if (!VALID_SUBJECTS.includes(subject as any)) {
      return NextResponse.json({ 
        error: `Invalid subject. Must be one of: ${VALID_SUBJECTS.join(', ')}`,
        code: "INVALID_SUBJECT" 
      }, { status: 400 });
    }

    // Check if progress already exists for this user and subject
    const existingProgress = await db.select()
      .from(learningProgress)
      .where(and(
        eq(learningProgress.userId, user.id),
        eq(learningProgress.subject, subject)
      ))
      .limit(1);

    if (existingProgress.length > 0) {
      return NextResponse.json({ 
        error: "Learning progress already exists for this subject",
        code: "PROGRESS_ALREADY_EXISTS" 
      }, { status: 400 });
    }

    // Prepare insert data with defaults and system fields
    const insertData = {
      userId: user.id,
      subject: subject.trim(),
      currentLevel: currentLevel || 1,
      totalScore: totalScore || 0,
      achievements: achievements || [],
      offlineSync: offlineSync || false,
      updatedAt: new Date().toISOString()
    };

    const newProgress = await db.insert(learningProgress)
      .values(insertData)
      .returning();

    return NextResponse.json(newProgress[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const requestBody = await request.json();
    const { subject, currentLevel, totalScore, achievements, offlineSync } = requestBody;

    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Validate subject if provided
    if (subject && !VALID_SUBJECTS.includes(subject as any)) {
      return NextResponse.json({ 
        error: `Invalid subject. Must be one of: ${VALID_SUBJECTS.join(', ')}`,
        code: "INVALID_SUBJECT" 
      }, { status: 400 });
    }

    // Check if record exists and belongs to user
    const existingRecord = await db.select()
      .from(learningProgress)
      .where(and(
        eq(learningProgress.id, parseInt(id)),
        eq(learningProgress.userId, user.id)
      ))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ error: 'Learning progress not found' }, { status: 404 });
    }

    // Prepare update data
    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if (subject !== undefined) updates.subject = subject.trim();
    if (currentLevel !== undefined) updates.currentLevel = currentLevel;
    if (totalScore !== undefined) updates.totalScore = totalScore;
    if (achievements !== undefined) updates.achievements = achievements;
    if (offlineSync !== undefined) updates.offlineSync = offlineSync;

    const updated = await db.update(learningProgress)
      .set(updates)
      .where(and(
        eq(learningProgress.id, parseInt(id)),
        eq(learningProgress.userId, user.id)
      ))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Learning progress not found' }, { status: 404 });
    }

    return NextResponse.json(updated[0]);

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if record exists and belongs to user
    const existingRecord = await db.select()
      .from(learningProgress)
      .where(and(
        eq(learningProgress.id, parseInt(id)),
        eq(learningProgress.userId, user.id)
      ))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ error: 'Learning progress not found' }, { status: 404 });
    }

    const deleted = await db.delete(learningProgress)
      .where(and(
        eq(learningProgress.id, parseInt(id)),
        eq(learningProgress.userId, user.id)
      ))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Learning progress not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Learning progress deleted successfully',
      deletedRecord: deleted[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}