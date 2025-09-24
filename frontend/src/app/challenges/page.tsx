"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const subjects = [
  { id: 'coding', title: 'Coding Challenges', description: 'Master algorithms and data structures.', icon: '💻' },
  { id: 'vocab', title: 'Vocabulary Battles', description: 'Build your word power with duels.', icon: '📚' },
  { id: 'finance', title: 'Finance Simulations', description: 'Basics, budgeting, and investing.', icon: '💰' },
];

export default function Challenges() {
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