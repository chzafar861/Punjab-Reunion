import { useRoute } from "wouter";
import { useProfile } from "@/hooks/use-profiles";
import { useCreateInquiry } from "@/hooks/use-inquiries";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, MapPin, Calendar, Globe, Share2, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api, type InquiryInput } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function ProfileDetail() {
  const [, params] = useRoute("/profile/:id");
  const id = parseInt(params?.id || "0");
  const { data: profile, isLoading } = useProfile(id);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  // Inquiry Form Logic
  const createInquiry = useCreateInquiry();
  const form = useForm<InquiryInput>({
    resolver: zodResolver(api.inquiries.create.input),
    defaultValues: {
      profileId: id,
      name: "",
      email: "",
      phone: "",
      message: "I would like to connect regarding this profile...",
    }
  });

  const onSubmit = (data: InquiryInput) => {
    createInquiry.mutate(data, {
      onSuccess: () => {
        toast({
          title: "Inquiry Sent",
          description: "We will forward your message to the profile guardian.",
        });
        setOpen(false);
        form.reset();
      },
      onError: (err) => {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <h2 className="text-2xl font-serif">Profile not found</h2>
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  // Placeholder image if none provided
  const displayImage = profile.photoUrl || "https://images.unsplash.com/photo-1544256658-63640b7952a2?w=800&h=800&fit=crop";

  return (
    <div className="min-h-screen bg-background pb-24 pt-8">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-border">
          {/* Header Image Area - Mobile Only */}
          <div className="md:hidden h-64 w-full bg-muted">
             <img src={displayImage} alt={profile.fullName} className="w-full h-full object-cover" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12">
            {/* Sidebar / Image - Desktop */}
            <div className="hidden md:block md:col-span-5 h-full min-h-[500px] relative bg-muted">
               <img src={displayImage} alt={profile.fullName} className="absolute inset-0 w-full h-full object-cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>

            {/* Content Area */}
            <div className="md:col-span-7 p-8 md:p-12 space-y-8">
              <div>
                <div className="flex flex-wrap gap-2 mb-4">
                   <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase rounded-full tracking-wider">
                     {profile.district}
                   </span>
                   {profile.yearLeft && (
                     <span className="px-3 py-1 bg-secondary/10 text-secondary text-xs font-bold uppercase rounded-full tracking-wider">
                       Since {profile.yearLeft}
                     </span>
                   )}
                </div>
                <h1 className="font-serif text-4xl md:text-5xl font-bold text-secondary mb-2">
                  {profile.fullName}
                </h1>
                <p className="text-xl text-muted-foreground flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" /> 
                  Village {profile.villageName}
                </p>
              </div>

              <div className="prose prose-stone max-w-none">
                <h3 className="font-serif text-2xl font-bold text-secondary">The Story</h3>
                <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
                  {profile.story}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-y border-border">
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <span className="block text-sm font-semibold text-secondary uppercase">Current Location</span>
                    <span className="text-foreground">{profile.currentLocation || "Unknown"}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <span className="block text-sm font-semibold text-secondary uppercase">Year of Migration</span>
                    <span className="text-foreground">{profile.yearLeft || "Unknown"}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg shadow-primary/20">
                      <Mail className="w-4 h-4 mr-2" /> Connect / Inquire
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="font-serif text-2xl">Send Inquiry</DialogTitle>
                      <DialogDescription>
                        Send a message to the guardians of this profile. We help facilitate the connection.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Your Name</Label>
                        <Input id="name" {...form.register("name")} />
                        {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" {...form.register("email")} />
                          {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input id="phone" {...form.register("phone")} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea id="message" rows={4} {...form.register("message")} />
                        {form.formState.errors.message && <p className="text-sm text-destructive">{form.formState.errors.message.message}</p>}
                      </div>
                      <Button type="submit" className="w-full bg-primary" disabled={createInquiry.isPending}>
                        {createInquiry.isPending ? "Sending..." : "Send Message"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
                
                <Button variant="outline" size="lg" className="flex-1 rounded-full border-secondary text-secondary hover:bg-secondary/5">
                  <Share2 className="w-4 h-4 mr-2" /> Share Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
