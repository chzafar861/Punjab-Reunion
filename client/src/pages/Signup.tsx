import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/use-seo";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader2, Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { supabase } from "@/lib/supabase";

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username too long")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function Signup() {
  const { t } = useLanguage();
  
  useSEO({
    title: "Create Account - 47DaPunjab",
    description: "Create your 47DaPunjab account to submit heritage profiles and connect with your roots.",
    canonicalPath: "/signup",
  });

  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      // First check if username is available
      const usernameCheck = await fetch(`/api/auth/check-username/${encodeURIComponent(data.username)}`);
      
      // Handle non-OK responses
      if (!usernameCheck.ok) {
        const errorText = await usernameCheck.text();
        console.error('Username check failed:', usernameCheck.status, errorText);
        toast({
          title: "Error",
          description: "Could not verify username availability. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      const usernameResult = await usernameCheck.json();
      
      if (!usernameResult.available) {
        toast({
          title: usernameResult.error ? "Validation Error" : "Username taken",
          description: usernameResult.message || "This username is already in use. Please choose a different one.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const { data: signUpData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username,
            first_name: data.firstName || "",
            last_name: data.lastName || "",
          },
          emailRedirectTo: `${window.location.origin}/verify-email`,
        },
      });

      if (error) {
        console.error('Supabase signup error:', error.message, error.status, error);
        toast({
          title: "Signup failed",
          description: error.message || "An error occurred during signup",
          variant: "destructive",
        });
        return;
      }

      // Check if user needs email confirmation
      if (signUpData?.user && !signUpData?.session) {
        // Email confirmation required
        queryClient.invalidateQueries({ queryKey: ["supabase-auth"] });
        toast({
          title: "Check your email!",
          description: "We've sent you a confirmation link. Please verify your email to complete signup.",
        });
        setLocation("/");
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["supabase-auth"] });
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });
      setLocation("/");
    } catch (err: any) {
      toast({
        title: "Signup failed",
        description: err.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="font-serif text-3xl text-secondary">{t("auth.signupTitle")}</CardTitle>
          <CardDescription>{t("auth.signupSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t("auth.firstName")}</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder={t("auth.firstName")}
                  data-testid="input-firstname"
                  {...form.register("firstName")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t("auth.lastName")}</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder={t("auth.lastName")}
                  data-testid="input-lastname"
                  {...form.register("lastName")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")} <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  className="pl-10"
                  data-testid="input-email"
                  {...form.register("email")}
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username <span className="text-destructive">*</span></Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose a username"
                  className="pl-10"
                  data-testid="input-username"
                  {...form.register("username")}
                />
              </div>
              {form.formState.errors.username && (
                <p className="text-sm text-destructive">{form.formState.errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")} <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("auth.passwordPlaceholder")}
                  className="pl-10 pr-10"
                  data-testid="input-password"
                  {...form.register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("auth.confirmPassword")} <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={t("auth.confirmPasswordPlaceholder")}
                  className="pl-10 pr-10"
                  data-testid="input-confirm-password"
                  {...form.register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              data-testid="button-signup"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("auth.creatingAccount")}
                </>
              ) : (
                t("auth.signup")
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {t("auth.haveAccount")}{" "}
            <Link href="/login" className="text-primary font-medium hover:underline" data-testid="link-login">
              {t("auth.login")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
