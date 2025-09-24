"use client";
import Orb from "@/components/Orb";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HeroSection() {
  const { data: session, isPending } = useSession();
  // session may be null; code below should guard accordingly
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
            <p className="text-primary font-medium mb-2">Ready to evolve? Continue with Google to start.</p>
            <div className="flex gap-2 justify-center">
              <Button asChild>
                <Link href="/login">Continue with Google</Link>
              </Button>
            </div>
          </div>
        )}
        {session && !isPending && (
          <div className="mb-8 flex justify-center">
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        )}
        <div className="flex justify-center gap-4 mt-4 flex-wrap">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/challenges/coding">Coding Quests</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/challenges/vocab">Vocab Battles</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/challenges/finance">Finance Simulations</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}