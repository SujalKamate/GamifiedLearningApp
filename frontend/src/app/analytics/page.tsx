"use client";

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface AnalyticsData {
  totalPlayTime: number;
  totalSessions: number;
  uniqueAchievements: string[];
  averageSessionTime: number;
  dailyAverage: number;
  recentSessions: any[];
}

export default function Analytics() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login?redirect=/analytics');
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      fetchAnalytics();
    }
  }, [session]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('bearer_token');
      const response = await fetch('/api/analytics?days=30', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data: AnalyticsData = await response.json();
      setAnalytics(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load analytics. Please try again.');
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
          <h2 className="text-2xl font-bold">Error</h2>
          <p>{error || 'No analytics data available'}</p>
          <Button onClick={fetchAnalytics}>Retry</Button>
        </div>
      </div>
    );
  }

  const chartData = analytics.recentSessions.slice(0, 7).map((session, index) => ({
    name: `Session ${analytics.recentSessions.length - index}`,
    playTime: session.playTime,
    achievements: session.achievements?.length || 0,
  }));

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Analytics Overview</h1>
          <p className="text-muted-foreground">Your learning progress over the last 30 days.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Play Time</CardTitle>
              <CardDescription>{analytics.totalPlayTime} minutes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{analytics.totalPlayTime}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Sessions</CardTitle>
              <CardDescription>Completed learning sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{analytics.totalSessions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Average Session</CardTitle>
              <CardDescription>Time per session</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{analytics.averageSessionTime} min</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
              <CardDescription>Play time and achievements per session</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="playTime" fill="#4285F4" name="Play Time (min)" />
                  <Bar dataKey="achievements" fill="#81C784" name="Achievements" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>Unique achievements unlocked</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {analytics.uniqueAchievements.map((ach, idx) => (
                  <span key={idx} className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                    {ach}
                  </span>
                ))}
              </div>
              {analytics.uniqueAchievements.length === 0 && (
                <p className="text-muted-foreground mt-4">No achievements yet. Start learning to unlock them!</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}