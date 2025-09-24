"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";

type Question = { id: number; question: string; options: string[]; difficulty: number };
type QuizSession = {
  sessionId: string;
  subject: string;
  questions: Question[];
  timeLimit: number; // seconds total
  maxAttempts: number;
  startedAt: string;
};

export default function QuizRunner() {
  const { subject } = useParams() as { subject: string };
  const params = useSearchParams();
  const router = useRouter();
  const sessionId = params.get("sessionId");

  const [session, setSession] = useState<QuizSession | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [remaining, setRemaining] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load session from sessionStorage fallback to API if needed
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!sessionId) return;
      const key = `quiz_session_${sessionId}`;
      const raw = typeof window !== "undefined" ? sessionStorage.getItem(key) : null;
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as QuizSession;
          if (!cancelled) {
            setSession(parsed);
            setRemaining(parsed.timeLimit);
          }
          return;
        } catch {}
      }
      // Fallback: create a new mock session if missing
      try {
        const res = await fetch(`/api/quizzes/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subject, difficulty: 1, questionCount: 5 })
        });
        if (!res.ok) throw new Error('Failed to start a new session');
        const data = (await res.json()) as QuizSession;
        if (!cancelled) {
          sessionStorage.setItem(`quiz_session_${data.sessionId}`, JSON.stringify(data));
          setSession(data);
          setRemaining(data.timeLimit);
          // Update URL with the new sessionId
          router.replace(`/challenges/${subject}/quiz?sessionId=${data.sessionId}`);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Unable to load quiz');
      }
    }
    load();
    return () => { cancelled = true; }
  }, [sessionId, subject, router]);

  // Countdown timer
  useEffect(() => {
    if (!session || remaining <= 0) return;
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [session, remaining]);

  const current = useMemo(() => (session ? session.questions[index] : null), [session, index]);

  const selectOption = (optIndex: number) => {
    if (!current) return;
    setAnswers((prev) => ({ ...prev, [current.id]: optIndex }));
  };

  const nextQuestion = () => {
    if (!session) return;
    if (index < session.questions.length - 1) setIndex(index + 1);
  };

  const prevQuestion = () => {
    if (index > 0) setIndex(index - 1);
  };

  const submitQuiz = async () => {
    if (!session) return;
    setSubmitting(true);
    // Mock submit - compute a pretend score from answers length
    const score = Object.keys(answers).length * 20;
    // Navigate to a simple result or back to dashboard for now
    router.push(`/dashboard`);
  };

  if (!sessionId || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        {!error ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Loading quiz...</p>
          </div>
        ) : (
          <div className="w-full max-w-md">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" /> Could not load quiz
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{error}</p>
                <div className="flex gap-2">
                  <Button onClick={() => {
                    setError(null);
                    // Trigger reload logic by replacing with same URL (keeps sessionId)
                    router.refresh();
                  }}>Retry</Button>
                  <Button variant="outline" onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{session.subject.toUpperCase()} Quiz</span>
            <span className="text-sm text-muted-foreground">Time left: {Math.max(0, remaining)}s</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Question {index + 1} / {session.questions.length}</div>
            <div className="text-lg font-medium mb-4">{current?.question}</div>
            <div className="grid gap-2">
              {current?.options.map((opt, i) => {
                const selected = answers[current.id] === i;
                return (
                  <Button key={i} variant={selected ? "default" : "outline"} className="justify-start" onClick={() => selectOption(i)}>
                    {opt}
                  </Button>
                );
              })}
            </div>
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={prevQuestion} disabled={index === 0}>Previous</Button>
            {index < session.questions.length - 1 ? (
              <Button onClick={nextQuestion}>Next</Button>
            ) : (
              <Button onClick={submitQuiz} disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


