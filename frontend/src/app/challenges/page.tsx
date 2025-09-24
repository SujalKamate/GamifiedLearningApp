"use client";

import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

const subjects = [
  { id: 'coding', title: 'Coding Challenges', description: 'Master algorithms and data structures through gamified quests.', icon: '💻' },
  { id: 'vocab', title: 'Vocabulary Battles', description: 'Build your word power with engaging vocabulary duels.', icon: '📚' },
  { id: 'finance', title: 'Finance Simulations', description: 'Learn financial concepts through interactive market simulations.', icon: '💰' },
];

export default function Challenges() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login?redirect=/challenges');
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Choose Your Challenge</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select a subject to start your gamified learning adventure. AI adapts to your skill level!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {subjects.map((subject) => (
            <Card key={subject.id} className="bg-card hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="text-4xl mb-2">{subject.icon}</div>
                <CardTitle className="text-2xl">{subject.title}</CardTitle>
                <CardDescription>{subject.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={`/challenges/${subject.id}`}>Start Challenge</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}