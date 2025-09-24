"use client";

import Image from "next/image";
import Link from "next/link";
import { authClient, useSession } from "@/lib/auth-client";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { User, LogOut, Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";

// Simple inline Logo component to fix ReferenceError and keep header self-contained
const Logo = () => (
  <Link href="/" className="flex items-center gap-2">
    <Image
      src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/8f190879-6517-435f-8705-9ee4ec646889/generated_images/modern-blocky-pixel-art-logo-for-evolv-g-ab922207-20250924102636.jpg?"
      alt="EVOLV"
      width={40}
      height={40}
      className="rounded-sm drop-shadow-md" // Slight shadow for fascination
    />
    <span className="font-bold tracking-wide text-2xl font-blocky">EVOLV</span>
  </Link>
);

const Header = () => {
  const { theme, setTheme } = useTheme();
  const { data: session, isPending: sessionPending, refetch } = useSession();
  const router = useRouter();

  // Gamification state (fetch on mount when logged in)
  const [xp, setXp] = useState(0);
  const [badges, setBadges] = useState(0);
  const [loadingGamification, setLoadingGamification] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setLoadingGamification(true);
      // Fetch XP from leaderboard API
      fetch('/api/gamification/leaderboard?limit=1&includeUser=true', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('bearer_token')}`,
        },
      })
        .then(res => res.json())
        .then(data => {
          if (data.currentUser) {
            setXp(data.currentUser.xp);
          }
        })
        .catch(() => setXp(0))
        .finally(() => setLoadingGamification(false));
      
      // Fetch badges from achievements API
      fetch('/api/achievements', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('bearer_token')}`,
        },
      })
        .then(res => res.json())
        .then(data => {
          const earnedBadges = data.filter(a => a.earned).length;
          setBadges(earnedBadges);
        })
        .catch(() => setBadges(0));
    }
  }, [session]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleSignOut = async () => {
    const { error } = await authClient.signOut();
    if (error?.code) {
      toast.error(error.code);
      return;
    }
    localStorage.removeItem("bearer_token");
    await refetch();
    router.push("/");
    toast.success("Signed out successfully!");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Logo />
        <nav className="ml-4 hidden items-center space-x-4 md:flex">
          <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
            Home
          </Link>
          <Link href="/quiz/coding" className="text-sm font-medium transition-colors hover:text-primary">
            Coding
          </Link>
          <Link href="/quiz/vocab" className="text-sm font-medium transition-colors hover:text-primary">
            Vocab
          </Link>
          <Link href="/quiz/finance" className="text-sm font-medium transition-colors hover:text-primary">
            Finance
          </Link>
          <Link href="/leaderboard" className="text-sm font-medium transition-colors hover:text-primary">
            Leaderboard
          </Link>
          {session && (
            <>
              <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
                Dashboard
              </Link>
              <Link href="/profile" className="text-sm font-medium transition-colors hover:text-primary">
                Profile
              </Link>
            </>
          )}
        </nav>
        
        {/* Gamification Indicators - only show when logged in */}
        {session && (
          <div className="ml-4 hidden md:flex items-center gap-4">
            {/* XP Progress Bar */}
            <div className="flex items-center gap-1 text-xs">
              <div className="w-20 bg-muted rounded-full h-1.5">
                <div 
                  className="bg-primary h-1.5 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min((xp % 100) / 100 * 100, 100)}%` }}
                />
              </div>
              <span className="text-foreground/70">Lv. {Math.floor(xp / 100) + 1}</span>
            </div>
            {/* Badges Count */}
            <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-xs font-medium">
              <span>🏆 {badges}</span>
            </div>
            {loadingGamification && <div className="text-xs text-muted-foreground">Loading...</div>}
          </div>
        )}
        
        <div className="ml-auto flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={toggleTheme}>
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
          {!session && (
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          )}
          {session && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar>
                    <AvatarImage src={session.user.image || undefined} alt={session.user.name || "User"} />
                    <AvatarFallback>{session.user.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session.user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={handleSignOut}
                  className="focus:bg-destructive focus:text-destructive-foreground"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;