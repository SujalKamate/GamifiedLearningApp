"use client";

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ProgressData {
  subject: string;
  currentLevel: number;
  totalScore: number;
  achievements?: string[];
}

export default function Dashboard() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [progress, setProgress] = useState<ProgressData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock mode: do not redirect unauthenticated users

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/progress');

      if (!response.ok) {
        throw new Error('Failed to fetch progress');
      }

      const data: ProgressData[] = await response.json();
      // Ensure all subjects have entries, default to level 1, score 0
      const subjects = ['coding', 'vocab', 'finance'];
      const fullProgress = subjects.map(sub => {
        const entry = data.find(p => p.subject === sub);
        return entry || { subject: sub, currentLevel: 1, totalScore: 0, achievements: [] };
      });
      setProgress(fullProgress);
    } catch (err) {
      console.error(err);
      setError('Failed to load progress. Please try again.');
      toast.error('Failed to load progress');
    } finally {
      setLoading(false);
    }
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
          <h2 className="text-2xl font-bold">Error</h2>
          <p>{error}</p>
          <Button onClick={fetchProgress}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, {session?.user?.name || 'Learner'}!</h1>
          <p className="text-muted-foreground">Track your learning journey across subjects.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {progress.map((item) => (
            <Card key={item.subject} className="bg-card">
              <CardHeader>
                <CardTitle className="capitalize">{item.subject}</CardTitle>
                <CardDescription>Level {item.currentLevel} • Score: {item.totalScore}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={(item.totalScore / 1000) * 100} className="w-full" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Next Level: {item.totalScore + 1}/1000</span>
                  <span>Achievements: {item.achievements?.length || 0}</span>
                </div>
                <Button className="w-full" asChild>
                  <a href={`/challenges/${item.subject}`}>Continue Learning</a>
                </Button>
                {item.achievements && item.achievements.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.achievements.slice(0, 3).map((ach, idx) => (
                      <span key={idx} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        {ach}
                      </span>
                    ))}
                    {item.achievements.length > 3 && (
                      <span className="text-xs text-muted-foreground">+{item.achievements.length - 3} more</span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="w-full">View Analytics</Button>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
                <Button variant="outline" asChild>
                  <a href="/challenges/coding">Start Coding</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/challenges/vocab">Start Vocab</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/challenges/finance">Start Finance</a>
                </Button>
              </div>
              <Button variant="outline" className="w-full">View Profile</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}