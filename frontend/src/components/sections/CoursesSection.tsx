import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Users, Activity } from 'lucide-react';
import Link from 'next/link';

const learningPaths = [
  {
    title: 'Coding Mastery Path',
    description: 'Beginner to advanced coding challenges with AI adaptation.',
    level: 'All Levels',
    interested: 1247,
    icon: '💻',
    rating: 4.8,
  },
  {
    title: 'Vocab Champion Path',
    description: 'Build vocabulary through daily battles and word quests.',
    level: 'Beginner-Intermediate',
    interested: 892,
    icon: '📚',
    rating: 4.7,
  },
  {
    title: 'Finance Guru Path',
    description: 'Interactive simulations for financial literacy and investing.',
    level: 'Beginner-Advanced',
    interested: 1563,
    icon: '💰',
    rating: 4.9,
  },
];

const CoursesSection = () => {
  return (
    <section className="bg-background py-16">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold font-heading">Learning Paths</h2>
          <Link href="/challenges">
            <Button variant="outline" className="text-primary border-primary hover:bg-primary/5">View All Challenges</Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {learningPaths.map((path, index) => (
            <Card key={index} className="bg-card border-border/50 hover:shadow-2xl transition-all duration-300 group border rounded-2xl overflow-hidden">
              <CardHeader className="pb-4">
                <div className="text-4xl mb-3">{path.icon}</div>
                <CardTitle className="text-xl font-semibold">{path.title}</CardTitle>
                <CardDescription className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Activity className="h-4 w-4" />
                  {path.level}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">{path.description}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <span>{path.rating}</span>
                  <Users className="h-4 w-4 ml-4" />
                  <span>{path.interested.toLocaleString()} learners</span>
                </div>
                <Button asChild className="w-full group-hover:scale-105 transition-all duration-300 font-blocky text-lg">
                  <Link href={`/challenges/${path.title.toLowerCase().replace(' path', '')}`}>Start Path</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;