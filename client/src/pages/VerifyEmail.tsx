import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";

export default function VerifyEmail() {
  useSEO({
    title: "Verify Email - 47DaPunjab",
    description: "Verify your email address for your 47DaPunjab account.",
    canonicalPath: "/verify-email",
  });

  const [location] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  const verifyMutation = useMutation({
    mutationFn: async (token: string) => {
      const response = await fetch(`/api/auth/verify-email?token=${token}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Verification failed");
      }
      return data;
    },
    onSuccess: (data) => {
      setStatus("success");
      setMessage(data.message || "Email verified successfully!");
    },
    onError: (error: any) => {
      setStatus("error");
      setMessage(error.message || "Verification failed");
    },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    
    if (token) {
      verifyMutation.mutate(token);
    } else {
      setStatus("error");
      setMessage("No verification token provided");
    }
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md shadow-xl text-center">
        <CardHeader>
          <CardTitle className="font-serif text-3xl text-secondary">Email Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Verifying your email...</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
              <p className="text-lg font-medium text-secondary">{message}</p>
              <Link href="/">
                <Button data-testid="button-go-home">Go to Home</Button>
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-4">
              <XCircle className="h-12 w-12 text-destructive" />
              <p className="text-lg font-medium text-secondary">{message}</p>
              <div className="flex gap-4">
                <Link href="/login">
                  <Button variant="outline" data-testid="button-go-login">logIn</Button>
                </Link>
                <Link href="/signup">
                  <Button data-testid="button-go-signup">Create Account</Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
