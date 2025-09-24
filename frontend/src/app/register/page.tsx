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

export default function RegisterPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });

  useEffect(() => {
    if (!isPending && session?.user) {
      router.push("/dashboard");
    }
  }, [session, isPending, router]);

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = (document.getElementById("name") as HTMLInputElement).value;
    const email = (document.getElementById("email") as HTMLInputElement).value;
    const password = (document.getElementById("password") as HTMLInputElement).value;
    const confirmPassword = (document.getElementById("confirm-password") as HTMLInputElement).value;
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    const { error } = await authClient.signUp.email({
      email,
      name,
      password
    });

    if (error?.code) {
      const errorMap = {
        USER_ALREADY_EXISTS: "Email already registered"
      };
      toast.error(errorMap[error.code] || "Registration failed");
      setIsLoading(false);
      return;
    }

    toast.success("Account created! Please check your email to verify.");
    router.push("/login?registered=true");
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    const { data, error } = await authClient.signIn.social({
      provider: "google"
    });
    if (error?.code) {
      toast.error("Google sign-up failed. Please try again.");
      setIsLoading(false);
      return;
    }
    toast.success("Account created and signed in!");
    router.push("/dashboard");
  };

  if (isPending) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Join EVOLV</CardTitle>
          <CardDescription>
            Start your gamified learning adventure in coding, vocab, and finance with Google.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" type="text" placeholder="Enter your full name" required />
          </div>
          <div className="grid gap-4">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="Enter your email" required />
          </div>
          <div className="grid gap-4">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="Enter your password" required autocomplete="off" />
          </div>
          <div className="grid gap-4">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input id="confirm-password" type="password" placeholder="Confirm your password" required autocomplete="off" />
          </div>
          <Button type="submit" className="w-full" onClick={handleEmailRegister} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Sign Up"
            )}
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            Already have an account? Sign in instead.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}