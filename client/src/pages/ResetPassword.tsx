import { useLocation, Link } from "wouter";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useSEO } from "@/hooks/use-seo";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, Info } from "lucide-react";

export default function ResetPassword() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  
  useSEO({
    title: "Reset Password - 47DaPunjab",
    description: "Password reset information for 47DaPunjab.",
    canonicalPath: "/reset-password",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setLocation("/login");
    }, 5000);
    return () => clearTimeout(timer);
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Info className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="font-serif text-3xl text-secondary">Password Reset</CardTitle>
          <CardDescription>
            47DaPunjab uses secure authentication through Replit. Password management is handled by your identity provider.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-muted-foreground">
            You will be redirected to the login page in a few seconds.
          </p>
          <Link href="/login">
            <Button className="w-full" data-testid="button-back-to-login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("auth.backToLogin") || "Back to Login"}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
