"use client";
import Orb from "@/components/Orb";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HeroSection() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  return (
    <section className="relative overflow-hidden min-h-[600px] py-12">
      <div className="absolute inset-0 z-0">
        <Orb hue={220} forceHoverState={true} />
      </div>
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
          EVOLV: Gamified Adaptive Learning
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          AI adjusts difficulty in coding, vocab, and finance. Play offline, track analytics, and stay cheat-free with engaging challenges.
        </p>
        
        {!session && !isPending && (
          <div className="mb-8 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-primary font-medium mb-2">Ready to evolve? Sign up free!</p>
            <div className="flex gap-2 justify-center">
              <Button asChild variant="outline">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
          <input
            type="text"
            placeholder="Start with Coding Challenges..."
            className="flex-1 px-4 py-3 rounded-full border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-none"
          />
          <Button size="lg" className="px-8 rounded-full" onClick={() => router.push(session ? "/dashboard" : "/register")}>
            {session ? "Launch Adventure" : "Start Learning"}
          </Button>
        </div>
        <div className="flex justify-center gap-4 mt-8 flex-wrap">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/quiz/coding">Coding Quests</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/quiz/vocab">Vocab Battles</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/quiz/finance">Finance Simulations</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}