import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";
import { useLanguage } from "@/contexts/LanguageContext";

export default function VerifyEmail() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useSEO({
    title: "Email Verification - 47DaPunjab",
    description: "Verify your email address for 47DaPunjab.",
    canonicalPath: "/verify-email",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }

    fetch(`/api/auth/verify-email?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully!");
        } else {
          setStatus("error");
          setMessage(data.message || "Verification failed.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Verification failed. Please try again.");
      });
  }, []);

  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => {
        setLocation("/");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [status, setLocation]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md shadow-xl text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            {status === "loading" && (
              <Loader2 className="h-12 w-12 animate-spin text-primary" data-testid="icon-loading" />
            )}
            {status === "success" && (
              <CheckCircle className="h-12 w-12 text-green-600" data-testid="icon-success" />
            )}
            {status === "error" && (
              <XCircle className="h-12 w-12 text-destructive" data-testid="icon-error" />
            )}
          </div>
          <CardTitle className="font-serif text-3xl text-secondary" data-testid="text-verify-title">
            {status === "loading" && "Verifying Email..."}
            {status === "success" && "Email Verified!"}
            {status === "error" && "Verification Failed"}
          </CardTitle>
          <CardDescription data-testid="text-verify-message">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === "success" && (
            <p className="text-muted-foreground">
              You will be redirected to the home page in a few seconds.
            </p>
          )}
          <Link href="/">
            <Button data-testid="button-go-home">{t("verify.goHome") || "Go to Home"}</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
