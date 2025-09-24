"use client";

import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function Profile() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login?redirect=/profile');
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
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Your Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              {session?.user.image && (
                <img
                  src={session.user.image}
                  alt={session.user.name}
                  className="h-16 w-16 rounded-full"
                />
              )}
              <div>
                <h2 className="text-xl font-semibold">{session?.user.name}</h2>
                <p className="text-muted-foreground">{session?.user.email}</p>
              </div>
            </div>
            <div className="space-y-4">
              <Button asChild className="w-full">
                <Link href="/dashboard">View Dashboard</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/analytics">View Analytics</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}