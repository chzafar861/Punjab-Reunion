import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateProfile } from "@/hooks/use-profiles";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, UploadCloud, CheckCircle, Image } from "lucide-react";
import { useUpload } from "@/hooks/use-upload";
import { useSEO } from "@/hooks/use-seo";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/contexts/LanguageContext";

// Form validation schema - all fields required except yearLeft, email, phone
const profileFormSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  villageName: z.string().min(1, "Village name is required"),
  district: z.string().min(1, "District is required"),
  story: z.string().min(1, "Story is required"),
  currentLocation: z.string().min(1, "Current location is required"),
  photoUrl: z.string().min(1, "Photo is required"),
  yearLeft: z.number().optional(),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

export default function SubmitProfile() {
  const { t } = useLanguage();
  
  useSEO({
    title: "Submit a Profile - Document Your Heritage",
    description: "Help preserve Punjab heritage by submitting a profile of someone who migrated during the 1947 partition. Document family stories, ancestral villages, and precious memories for future generations.",
    keywords: "submit profile, document heritage, partition story, family history submission, ancestral record, Punjab migration",
    canonicalPath: "/submit",
  });

  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const createProfile = useCreateProfile();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [uploadedFileName, setUploadedFileName] = useState<string>("");

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: "",
      villageName: "",
      district: "",
      story: "",
      currentLocation: "",
      photoUrl: "",
      email: "",
      phone: "",
    },
  });

  const { uploadFile, isUploading } = useUpload({
    onSuccess: (response) => {
      // Create full URL from objectPath for proper image display
      const fullUrl = `${window.location.origin}${response.objectPath}`;
      form.setValue("photoUrl", fullUrl);
      setUploadedFileName(response.metadata.name);
      toast({
        title: t("toast.uploadSuccess"),
        description: t("toast.uploadSuccessDesc"),
      });
    },
    onError: (error) => {
      toast({
        title: t("toast.uploadFailed"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: t("auth.signInRequired"),
        description: t("auth.signInRequiredDesc"),
        variant: "destructive",
      });
      setTimeout(() => {
        setLocation("/login");
      }, 500);
    }
  }, [authLoading, isAuthenticated, toast, setLocation, t]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">{t("auth.redirecting")}</p>
      </div>
    );
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: t("toast.invalidFile"),
          description: t("toast.invalidFileDesc"),
          variant: "destructive",
        });
        return;
      }
      setUploadedFileName(file.name);
      await uploadFile(file);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    const cleanedData = {
      ...data,
      email: data.email || undefined,
      phone: data.phone || undefined,
    };

    createProfile.mutate(cleanedData, {
      onSuccess: () => {
        toast({
          title: t("submit.success"),
          description: t("submit.successDesc"),
        });
        setLocation("/directory");
      },
      onError: (err) => {
        toast({
          title: t("toast.submissionFailed"),
          description: err.message,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12 space-y-4">
          <h1 className="font-serif text-4xl font-bold text-secondary">{t("submit.title")}</h1>
          <p className="text-muted-foreground text-lg">
            {t("submit.subtitle")}
          </p>
        </div>

        <Card className="shadow-xl border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="font-serif text-2xl">{t("submit.title")}</CardTitle>
            <CardDescription>{t("submit.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Personal Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-secondary border-b pb-2">{t("submit.sectionIdentity")}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">{t("submit.fullName")} <span className="text-destructive">*</span></Label>
                    <Input id="fullName" data-testid="input-fullname" placeholder={t("submit.fullNamePlaceholder")} {...form.register("fullName")} className="bg-muted/30" />
                    {form.formState.errors.fullName && <p className="text-sm text-destructive">{form.formState.errors.fullName.message}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="yearLeft">{t("submit.yearLeft")}</Label>
                    <Input id="yearLeft" data-testid="input-yearleft" type="number" placeholder="1947" {...form.register("yearLeft", { valueAsNumber: true })} className="bg-muted/30" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="villageName">{t("submit.villageName")} <span className="text-destructive">*</span></Label>
                    <Input id="villageName" data-testid="input-villagename" placeholder={t("submit.villageNamePlaceholder")} {...form.register("villageName")} className="bg-muted/30" />
                    {form.formState.errors.villageName && <p className="text-sm text-destructive">{form.formState.errors.villageName.message}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="district">{t("submit.district")} <span className="text-destructive">*</span></Label>
                    <Input id="district" data-testid="input-district" placeholder={t("submit.districtPlaceholder")} {...form.register("district")} className="bg-muted/30" />
                    {form.formState.errors.district && <p className="text-sm text-destructive">{form.formState.errors.district.message}</p>}
                  </div>
                </div>
              </div>

              {/* Story */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-secondary border-b pb-2">{t("submit.sectionStory")}</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="story">{t("submit.story")} <span className="text-destructive">*</span></Label>
                  <Textarea 
                    id="story" 
                    data-testid="input-story"
                    placeholder={t("submit.storyPlaceholder")} 
                    className="min-h-[150px] bg-muted/30 resize-y"
                    {...form.register("story")}
                  />
                  {form.formState.errors.story && <p className="text-sm text-destructive">{form.formState.errors.story.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentLocation">{t("submit.currentLocation")} <span className="text-destructive">*</span></Label>
                  <Input id="currentLocation" data-testid="input-currentlocation" placeholder={t("submit.currentLocationPlaceholder")} {...form.register("currentLocation")} className="bg-muted/30" />
                  {form.formState.errors.currentLocation && <p className="text-sm text-destructive">{form.formState.errors.currentLocation.message}</p>}
                </div>
              </div>

              {/* Photo */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-secondary border-b pb-2">{t("submit.sectionPhoto")}</h3>
                <div className="space-y-2">
                   <Label htmlFor="photo">{t("submit.photo")} <span className="text-destructive">*</span></Label>
                   <div className="flex flex-col gap-3">
                     <div className="flex gap-2 items-center">
                       <label 
                         htmlFor="photo-upload" 
                         className="flex items-center gap-2 cursor-pointer border border-dashed border-border rounded-lg p-4 w-full bg-muted/30 hover-elevate transition-colors"
                       >
                         {isUploading ? (
                           <>
                             <Loader2 className="w-5 h-5 animate-spin text-primary" />
                             <span className="text-muted-foreground">{t("submit.photoUploading")}</span>
                           </>
                         ) : uploadedFileName ? (
                           <>
                             <CheckCircle className="w-5 h-5 text-green-600" />
                             <span className="text-foreground">{uploadedFileName}</span>
                           </>
                         ) : (
                           <>
                             <Image className="w-5 h-5 text-muted-foreground" />
                             <span className="text-muted-foreground">{t("submit.photoSelect")}</span>
                           </>
                         )}
                       </label>
                       <input
                         id="photo-upload"
                         type="file"
                         accept="image/*"
                         className="hidden"
                         onChange={handleFileChange}
                         disabled={isUploading}
                         data-testid="input-photo-upload"
                       />
                     </div>
                   </div>
                   {form.formState.errors.photoUrl && <p className="text-sm text-destructive">{form.formState.errors.photoUrl.message}</p>}
                   <p className="text-xs text-muted-foreground">{t("submit.photoHint")}</p>
                </div>
              </div>

              {/* Contact Info (for admin use - not displayed publicly) */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-secondary border-b pb-2">{t("submit.sectionContact")}</h3>
                <p className="text-sm text-muted-foreground">{t("submit.contactNote")}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("submit.email")}</Label>
                    <Input id="email" type="email" data-testid="input-email" placeholder={t("submit.emailPlaceholder")} {...form.register("email")} className="bg-muted/30" />
                    {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("submit.phone")}</Label>
                    <Input id="phone" type="tel" data-testid="input-phone" placeholder={t("submit.phonePlaceholder")} {...form.register("phone")} className="bg-muted/30" />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  size="lg" 
                  data-testid="button-submit-profile"
                  className="w-full bg-primary text-white font-semibold text-lg rounded-xl shadow-lg shadow-primary/20"
                  disabled={createProfile.isPending || isUploading}
                >
                  {createProfile.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t("submit.submitting")}
                    </>
                  ) : (
                    t("submit.button")
                  )}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
