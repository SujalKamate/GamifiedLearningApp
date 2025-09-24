import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { learningProgress } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth-utils';

const VALID_SUBJECTS = ['coding', 'vocab', 'finance'] as const;

export async function GET(request: NextRequest) {
  try {
    // Return mock data for all subjects without auth
    const mock = [
      { subject: 'coding', currentLevel: 3, totalScore: 420, achievements: ['First Code', 'Bug Squasher'] },
      { subject: 'vocab', currentLevel: 2, totalScore: 260, achievements: ['Word Wizard'] },
      { subject: 'finance', currentLevel: 1, totalScore: 120, achievements: [] }
    ];

    const searchParams = request.nextUrl.searchParams;
    const subject = searchParams.get('subject');
    if (subject) {
      if (!VALID_SUBJECTS.includes(subject as any)) {
        return NextResponse.json({ 
          error: `Invalid subject. Must be one of: ${VALID_SUBJECTS.join(', ')}`,
          code: 'INVALID_SUBJECT'
        }, { status: 400 });
      }
      return NextResponse.json(mock.filter(m => m.subject === subject));
    }
    return NextResponse.json(mock);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Accept and echo back with mock ID to simulate creation
  try {
    const body = await request.json();
    const created = {
      id: Math.floor(Math.random() * 10000),
      subject: body.subject ?? 'coding',
      currentLevel: body.currentLevel ?? 1,
      totalScore: body.totalScore ?? 0,
      achievements: body.achievements ?? [],
      offlineSync: body.offlineSync ?? false,
      updatedAt: new Date().toISOString()
    };
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id') || String(Math.floor(Math.random() * 10000));
    const body = await request.json();
    const updated = {
      id: Number(id),
      subject: body.subject ?? 'coding',
      currentLevel: body.currentLevel ?? 1,
      totalScore: body.totalScore ?? 0,
      achievements: body.achievements ?? [],
      offlineSync: body.offlineSync ?? false,
      updatedAt: new Date().toISOString()
    };
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ error: 'Valid ID is required', code: 'INVALID_ID' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Deleted', id: Number(id) });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}