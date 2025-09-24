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
  const sessionHook = useSession();
  const session = sessionHook?.data ?? null;
  const sessionPending = sessionHook?.isPending ?? false;
  const refetch = sessionHook?.refetch ?? (async () => {});
  const router = useRouter();

  // Gamification state (fetch on mount when logged in)
  const [xp, setXp] = useState(0);
  const [badges, setBadges] = useState(0);
  const [loadingGamification, setLoadingGamification] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setXp(950);
      setBadges(3);
    } else {
      setXp(0);
      setBadges(0);
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
          <Link href="/challenges" className="text-sm font-medium transition-colors hover:text-primary">
            Challenges
          </Link>
          <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
            Dashboard
          </Link>
          <Link href="/analytics" className="text-sm font-medium transition-colors hover:text-primary">
            Analytics
          </Link>
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
            <Button asChild>
              <Link href="/login">Continue with Google</Link>
            </Button>
          )}
          {session && (
            <Button variant="outline" size="sm" onClick={handleSignOut}>Sign out</Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;