import React from 'react';
import { Button } from '@/components/ui/button';
import { TrendingUp, Play, Trophy, Shield } from 'lucide-react';
import Link from 'next/link';

const mustExploreItems = [
  {
    title: 'Daily Challenges',
    description: 'New adaptive quests every day',
    icon: TrendingUp,
    href: '/challenges',
  },
  {
    title: 'Live Sessions',
    description: 'Join interactive learning streams',
    icon: Play,
    href: '/dashboard',
  },
  {
    title: 'Achievement Leaderboard',
    description: 'Compete and climb the ranks',
    icon: Trophy,
    href: '/analytics',
  },
  {
    title: 'Secure Learning',
    description: 'Anti-cheat protected environment',
    icon: Shield,
    href: '/profile',
  },
];

const MustExplore = () => {
  return (
    <section className="bg-primary/5 py-16">
      <div className="container mx-auto px-6 max-w-6xl">
        <h2 className="text-3xl font-bold text-center text-primary mb-12 font-heading">Must Explore</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mustExploreItems.map((item, index) => (
            <Link key={index} href={item.href} className="group">
              <Button
                variant="ghost"
                className="w-full h-32 flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 border border-primary/10 group-hover:border-primary/30 transition-all duration-500 rounded-xl shadow-lg hover:shadow-xl font-blocky text-base"
              >
                <item.icon className="h-8 w-8 mb-3 text-primary group-hover:scale-110 transition-transform" />
                <span className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">{item.title}</span>
                <span className="text-xs text-muted-foreground mt-1 text-center max-w-[120px]">{item.description}</span>
                <span className="ml-2 font-blocky text-xl group-hover:translate-x-2 transition-all">→</span>
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MustExplore;