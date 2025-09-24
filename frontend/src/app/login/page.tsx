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
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (!isPending && session?.user) {
      router.push("/dashboard");
    }
  }, [session, isPending, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {};

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
            Continue with Google to start your gamified learning journey.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting to Google...
              </>
            ) : (
              "Continue with Google"
            )}
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            New users are created automatically.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}