"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "", rememberMe: false });

  useEffect(() => {
    if (!isPending && session?.user) {
      router.push("/dashboard");
    }
  }, [session, isPending, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = (document.getElementById("email") as HTMLInputElement).value;
    const password = (document.getElementById("password") as HTMLInputElement).value;
    const rememberMe = (document.getElementById("remember") as HTMLInputElement).checked;
    
    setIsLoading(true);
    const { data, error } = await authClient.signIn.email({
      email,
      password,
      rememberMe,
      callbackURL: "/dashboard"
    });

    if (error?.code) {
      toast.error("Invalid email or password. Please make sure you have already registered an account and try again.");
      setIsLoading(false);
      return;
    }

    toast.success("Signed in successfully!");
    router.push("/dashboard");
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const { data, error } = await authClient.signIn.social({
      provider: "google"
    });
    if (error?.code) {
      toast.error("Google sign-in failed. Please try again.");
      setIsLoading(false);
      return;
    }
    toast.success("Signed in successfully!");
    router.push("/dashboard");
  };

  if (isPending) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Welcome to EVOLV</CardTitle>
          <CardDescription>
            Sign in to start your gamified learning journey in coding, vocab, and finance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="Enter your email" required />
          </div>
          <div className="grid gap-4">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="Enter your password" required autocomplete="off" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="remember">Remember me</Label>
            <Input id="remember" type="checkbox" />
          </div>
          <Button type="submit" className="w-full" onClick={handleEmailLogin} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            No account? Sign up happens automatically with Google.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}