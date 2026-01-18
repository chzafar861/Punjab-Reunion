import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Crown, FileText, Users, Globe, Send, Loader2, ShoppingBag, Check } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

const subscriptionRequestSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(5, "Phone number is required"),
  country: z.string().min(2, "Country is required"),
  city: z.string().min(2, "City is required"),
  reason: z.string().min(10, "Please explain why you want this subscription"),
  plan: z.enum(["contributor", "seller"]),
});

type SubscriptionRequestData = z.infer<typeof subscriptionRequestSchema>;

export default function SubscriptionRequest() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [submitted, setSubmitted] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"contributor" | "seller">("contributor");

  const form = useForm<SubscriptionRequestData>({
    resolver: zodResolver(subscriptionRequestSchema),
    defaultValues: {
      fullName: user?.firstName && user?.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user?.username || "",
      email: user?.email || "",
      phone: "",
      country: "",
      city: "",
      reason: "",
      plan: "contributor",
    },
  });

  const submitRequest = useMutation({
    mutationFn: async (data: SubscriptionRequestData) => {
      const response = await apiRequest("POST", "/api/subscription-requests", data);
      return response.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Request Submitted",
        description: "We've received your subscription request. We'll contact you soon!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SubscriptionRequestData) => {
    submitRequest.mutate({ ...data, plan: selectedPlan });
  };

  const handlePlanSelect = (plan: "contributor" | "seller") => {
    setSelectedPlan(plan);
    form.setValue("plan", plan);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>{t("subscription.loginRequired")}</CardTitle>
            <CardDescription>
              {t("subscription.loginRequiredDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/login")} className="w-full">
              {t("subscription.goToLogin")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background py-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">{t("subscription.submitted")}</CardTitle>
              <CardDescription className="text-lg mt-2">
                {t("subscription.thankYou")} {selectedPlan === "seller" ? t("subscription.sellerPlan") : t("subscription.contributorPlan")}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {t("subscription.submittedDesc")}
              </p>
              <Button onClick={() => setLocation("/")} variant="outline">
                {t("subscription.returnHome")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-10">
          <Badge variant="secondary" className="mb-4">
            <Crown className="w-3 h-3 mr-1" />
            {t("subscription.choosePlan")}
          </Badge>
          <h1 className="font-serif text-4xl font-bold text-secondary mb-4">
            {t("subscription.title")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("subscription.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <Card 
            className={`cursor-pointer transition-all ${
              selectedPlan === "contributor" 
                ? "ring-2 ring-primary border-primary bg-primary/5" 
                : "hover:border-primary/50"
            }`}
            onClick={() => handlePlanSelect("contributor")}
            data-testid="plan-contributor"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  {t("subscription.contributorPlan")}
                </CardTitle>
                {selectedPlan === "contributor" && (
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>
              <div className="mt-4">
                <span className="text-4xl font-bold text-primary">$20</span>
                <span className="text-muted-foreground">{t("subscription.perMonth")}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <span>{t("subscription.submitProfiles")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <span>{t("subscription.editProfiles")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <span>{t("subscription.uploadPhotos")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <span>{t("subscription.helpFamilies")}</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all ${
              selectedPlan === "seller" 
                ? "ring-2 ring-primary border-primary bg-primary/5" 
                : "hover:border-primary/50"
            }`}
            onClick={() => handlePlanSelect("seller")}
            data-testid="plan-seller"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                  {t("subscription.sellerPlan")}
                </CardTitle>
                <Badge variant="secondary" className="text-xs">{t("subscription.popular")}</Badge>
              </div>
              {selectedPlan === "seller" && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              <div className="mt-4">
                <span className="text-4xl font-bold text-primary">$25</span>
                <span className="text-muted-foreground">{t("subscription.perMonth")}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <span>{t("subscription.everythingContributor")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <span className="font-medium">{t("subscription.sellProducts")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <span>{t("subscription.manageProducts")}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                  <span>{t("subscription.fulfillOrders")}</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>
              {t("subscription.requestAccess")} - {selectedPlan === "seller" ? t("subscription.sellerPlan") : t("subscription.contributorPlan")}
            </CardTitle>
            <CardDescription>
              {t("subscription.fillDetails")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="p-3 bg-muted rounded-lg flex items-center gap-3">
                <div className={`p-2 rounded-full ${selectedPlan === "seller" ? "bg-primary/20" : "bg-primary/10"}`}>
                  {selectedPlan === "seller" ? (
                    <ShoppingBag className="w-5 h-5 text-primary" />
                  ) : (
                    <FileText className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{selectedPlan === "seller" ? t("subscription.sellerPlan") : t("subscription.contributorPlan")}</p>
                  <p className="text-sm text-muted-foreground">${selectedPlan === "seller" ? "25" : "20"}{t("subscription.perMonth")}</p>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="ml-auto"
                  onClick={() => handlePlanSelect(selectedPlan === "seller" ? "contributor" : "seller")}
                >
                  {t("subscription.changePlan")}
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">{t("subscription.fullName")} *</Label>
                <Input
                  id="fullName"
                  {...form.register("fullName")}
                  placeholder="Enter your full name"
                  data-testid="input-subscription-name"
                />
                {form.formState.errors.fullName && (
                  <p className="text-sm text-destructive">{form.formState.errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("subscription.email")} *</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  placeholder="Enter your email"
                  data-testid="input-subscription-email"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t("subscription.phone")} *</Label>
                <Input
                  id="phone"
                  type="tel"
                  {...form.register("phone")}
                  placeholder="Enter your phone number"
                  data-testid="input-subscription-phone"
                />
                {form.formState.errors.phone && (
                  <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">{t("subscription.country")} *</Label>
                  <Input
                    id="country"
                    {...form.register("country")}
                    placeholder="e.g., Pakistan"
                    data-testid="input-subscription-country"
                  />
                  {form.formState.errors.country && (
                    <p className="text-sm text-destructive">{form.formState.errors.country.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">{t("subscription.city")} *</Label>
                  <Input
                    id="city"
                    {...form.register("city")}
                    placeholder="e.g., Lahore"
                    data-testid="input-subscription-city"
                  />
                  {form.formState.errors.city && (
                    <p className="text-sm text-destructive">{form.formState.errors.city.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">{t("subscription.reason")} *</Label>
                <Textarea
                  id="reason"
                  {...form.register("reason")}
                  placeholder={selectedPlan === "seller" 
                    ? "Tell us about the products you want to sell and your connection to Punjab heritage..."
                    : "Tell us about your connection to Punjab heritage and why you want to contribute..."
                  }
                  rows={4}
                  data-testid="input-subscription-reason"
                />
                {form.formState.errors.reason && (
                  <p className="text-sm text-destructive">{form.formState.errors.reason.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={submitRequest.isPending}
                data-testid="button-submit-subscription"
              >
                {submitRequest.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("subscription.submitting")}
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    {t("subscription.submitRequest")}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
