import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/use-seo";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader2, UserPlus } from "lucide-react";

export default function Signup() {
  const { t } = useLanguage();
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  useSEO({
    title: "Create Account - 47DaPunjab",
    description: "Create a 47DaPunjab account to submit and manage heritage profiles.",
    canonicalPath: "/signup",
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  const handleSignup = () => {
    window.location.href = "/api/login";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="font-serif text-3xl text-secondary">{t("auth.signupTitle")}</CardTitle>
          <CardDescription>{t("auth.signupSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Create an account to submit heritage profiles and connect with the Punjabi diaspora community.
            </p>
            <Button
              onClick={handleSignup}
              size="lg"
              className="w-full"
              data-testid="button-signup"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Create Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
