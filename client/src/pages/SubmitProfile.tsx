import { useState } from "react";
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

// Form validation schema - all fields required
const profileFormSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  villageName: z.string().min(1, "Village name is required"),
  district: z.string().min(1, "District is required"),
  story: z.string().min(1, "Story is required"),
  currentLocation: z.string().min(1, "Current location is required"),
  photoUrl: z.string().min(1, "Photo is required"),
  yearLeft: z.number().optional(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

export default function SubmitProfile() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const createProfile = useCreateProfile();
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const { uploadFile, isUploading } = useUpload({
    onSuccess: (response) => {
      form.setValue("photoUrl", response.objectPath);
      setUploadedFileName(response.metadata.name);
      toast({
        title: "Photo Uploaded",
        description: "Your image has been uploaded successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: "",
      villageName: "",
      district: "",
      story: "",
      currentLocation: "",
      photoUrl: "",
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid File",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }
      await uploadFile(file);
    }
  };

  const onSubmit = (data: ProfileFormData) => {
    createProfile.mutate(data, {
      onSuccess: () => {
        toast({
          title: "Profile Submitted",
          description: "Thank you for contributing to the archive.",
        });
        setLocation("/directory");
      },
      onError: (err) => {
        toast({
          title: "Submission Failed",
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
          <h1 className="font-serif text-4xl font-bold text-secondary">Submit a Profile</h1>
          <p className="text-muted-foreground text-lg">
            Share the details of a family member or friend who migrated. 
            Help us build the most comprehensive directory.
          </p>
        </div>

        <Card className="shadow-xl border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="font-serif text-2xl">Details of the Person</CardTitle>
            <CardDescription>Please provide as much detail as possible to help others find this profile.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Personal Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-secondary border-b pb-2">Identity & Origin</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name <span className="text-destructive">*</span></Label>
                    <Input id="fullName" data-testid="input-fullname" placeholder="e.g. Kartar Singh" {...form.register("fullName")} className="bg-muted/30" />
                    {form.formState.errors.fullName && <p className="text-sm text-destructive">{form.formState.errors.fullName.message}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="yearLeft">Year Left (Approximate)</Label>
                    <Input id="yearLeft" data-testid="input-yearleft" type="number" placeholder="1947" {...form.register("yearLeft", { valueAsNumber: true })} className="bg-muted/30" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="villageName">Village Name <span className="text-destructive">*</span></Label>
                    <Input id="villageName" data-testid="input-villagename" placeholder="Name of village left behind" {...form.register("villageName")} className="bg-muted/30" />
                    {form.formState.errors.villageName && <p className="text-sm text-destructive">{form.formState.errors.villageName.message}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="district">District <span className="text-destructive">*</span></Label>
                    <Input id="district" data-testid="input-district" placeholder="District in Punjab" {...form.register("district")} className="bg-muted/30" />
                    {form.formState.errors.district && <p className="text-sm text-destructive">{form.formState.errors.district.message}</p>}
                  </div>
                </div>
              </div>

              {/* Story */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-secondary border-b pb-2">Their Story</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="story">Detailed History <span className="text-destructive">*</span></Label>
                  <Textarea 
                    id="story" 
                    data-testid="input-story"
                    placeholder="Tell us about their journey, family members, specific memories, or identifying details..." 
                    className="min-h-[150px] bg-muted/30 resize-y"
                    {...form.register("story")}
                  />
                  {form.formState.errors.story && <p className="text-sm text-destructive">{form.formState.errors.story.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentLocation">Current Location <span className="text-destructive">*</span></Label>
                  <Input id="currentLocation" data-testid="input-currentlocation" placeholder="Where do they (or their descendants) live now?" {...form.register("currentLocation")} className="bg-muted/30" />
                  {form.formState.errors.currentLocation && <p className="text-sm text-destructive">{form.formState.errors.currentLocation.message}</p>}
                </div>
              </div>

              {/* Photo */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-secondary border-b pb-2">Photo</h3>
                <div className="space-y-2">
                   <Label htmlFor="photo">Upload Photo <span className="text-destructive">*</span></Label>
                   <div className="flex flex-col gap-3">
                     <div className="flex gap-2 items-center">
                       <label 
                         htmlFor="photo-upload" 
                         className="flex items-center gap-2 cursor-pointer border border-dashed border-border rounded-lg p-4 w-full bg-muted/30 hover-elevate transition-colors"
                       >
                         {isUploading ? (
                           <>
                             <Loader2 className="w-5 h-5 animate-spin text-primary" />
                             <span className="text-muted-foreground">Uploading...</span>
                           </>
                         ) : uploadedFileName ? (
                           <>
                             <CheckCircle className="w-5 h-5 text-green-600" />
                             <span className="text-foreground">{uploadedFileName}</span>
                           </>
                         ) : (
                           <>
                             <Image className="w-5 h-5 text-muted-foreground" />
                             <span className="text-muted-foreground">Click to select an image from your device</span>
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
                   <p className="text-xs text-muted-foreground">Select an image file from your device (JPG, PNG, etc.)</p>
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
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting...
                    </>
                  ) : (
                    "Submit Profile"
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
