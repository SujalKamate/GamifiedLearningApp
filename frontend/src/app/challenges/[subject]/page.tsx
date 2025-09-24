"use client";

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Play } from 'lucide-react';
import { toast } from 'sonner';

interface QuizSession {
  sessionId: string;
  subject: string;
  questions: { id: number; question: string; options: string[]; difficulty: number }[];
  timeLimit: number;
  maxAttempts: number;
  startedAt: string;
}

export default function SubjectChallenge() {
  const { subject } = useParams() as { subject: string };
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [quizSession, setQuizSession] = useState<QuizSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);

  // Mock mode: do not redirect unauthenticated users

  useEffect(() => {
    if (subject) {
      startQuiz();
    }
  }, [subject]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (quizSession) {
      // Proceed to quiz (for now, redirect to a quiz component or show questions)
      router.push(`/challenges/${subject}/quiz?sessionId=${quizSession.sessionId}`);
    }
  }, [countdown, quizSession, subject, router]);

  const startQuiz = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/quizzes/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          difficulty: 1, // Start with easy
          questionCount: 5,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to start quiz');
      }

      const data: QuizSession = await response.json();
      setQuizSession(data);
      try {
        // Persist session so the quiz page can load it
        sessionStorage.setItem(`quiz_session_${data.sessionId}`, JSON.stringify(data));
      } catch {}
      toast.success(`Quiz started! Difficulty adapted to your level.`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to start quiz');
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Preparing your challenge...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p>{error}</p>
            <Button onClick={startQuiz}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const subjectConfig = {
    coding: { icon: '💻', title: 'Coding Challenge' },
    vocab: { icon: '📚', title: 'Vocabulary Battle' },
    finance: { icon: '💰', title: 'Finance Simulation' },
  }[subject as keyof typeof subjectConfig];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="text-6xl mb-4">{subjectConfig.icon}</div>
          <CardTitle className="text-3xl">{subjectConfig.title}</CardTitle>
          <p className="text-muted-foreground">Get ready! Quiz starting in {countdown} seconds.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Time limit: {quizSession?.timeLimit / 60} min • Max attempts: {quizSession?.maxAttempts}
          </p>
        </CardHeader>
        <CardContent className="text-center">
          <Button size="lg" disabled>
            <Play className="mr-2 h-4 w-4" /> Starting Quiz...
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            Anti-cheat enabled: Session tracking and time limits apply.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}