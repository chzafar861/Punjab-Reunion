import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";
import { useLanguage } from "@/contexts/LanguageContext";

export default function VerifyEmail() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  
  useSEO({
    title: "Email Verified - 47DaPunjab",
    description: "Your email has been verified for 47DaPunjab.",
    canonicalPath: "/verify-email",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setLocation("/");
    }, 3000);
    return () => clearTimeout(timer);
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md shadow-xl text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="font-serif text-3xl text-secondary">Email Verification</CardTitle>
          <CardDescription>
            47DaPunjab uses secure authentication through Replit. Email verification is handled automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            You will be redirected to the home page in a few seconds.
          </p>
          <Link href="/">
            <Button data-testid="button-go-home">{t("verify.goHome") || "Go to Home"}</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
