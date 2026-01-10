import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
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

    const handle = async () => {
      if (token) {
        verifyMutation.mutate(token);
        return;
      }

      // Try Supabase redirect flow (access_token/refresh_token in URL hash)
      try {
        const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash;
        const hashParams = new URLSearchParams(hash);
        const access_token = hashParams.get("access_token");
        const refresh_token = hashParams.get("refresh_token");

        if (access_token) {
          // setSession may not be listed on the typed client in some setups, use any to be safe
          await (supabase.auth as any).setSession({ access_token, refresh_token });
          setStatus("success");
          setMessage("Email verified successfully!");
          return;
        }

        setStatus("error");
        setMessage("No verification token provided");
      } catch (err: any) {
        setStatus("error");
        setMessage(err?.message || "Verification failed");
      }
    };

    handle();
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
