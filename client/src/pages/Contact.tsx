import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateInquiry } from "@/hooks/use-inquiries";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/use-seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Send } from "lucide-react";

// Form validation schema with required fields
const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email"),
  phone: z.string().optional(),
  message: z.string().min(1, "Message is required"),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export default function Contact() {
  useSEO({
    title: "Contact 47DaPunjab | Punjabi Ancestral Roots & Heritage Support",
    description:
      "Contact 47DaPunjab for help with Punjabi ancestral research, 1947 Partition stories, heritage tours, or submitting your family history from Punjab.",
    keywords:
      "contact 47DaPunjab, Punjabi ancestry help, 1947 Partition research, ancestral village Punjab, Punjabi heritage support",
    canonicalPath: "/contact",
  });


  const { toast } = useToast();
  const createInquiry = useCreateInquiry();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
      phone: "",
    },
  });

  const onSubmit = (data: ContactFormData) => {
    createInquiry.mutate(data, {
      onSuccess: () => {
        toast({
          title: "Message Sent",
          description: "We'll get back to you shortly.",
        });
        form.reset();
      },
      onError: (err) => {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-secondary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-white/70 max-w-2xl mx-auto">
            We are here to help you in your search or to answer any questions about the 47DaPunjab archive project.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className="font-serif text-2xl font-bold text-secondary mb-4">Get in Touch</h2>
              <p className="text-muted-foreground leading-relaxed">
                Whether you have a suggestion, want to volunteer, or need help with a profile, feel free to reach out. We are a community-driven initiative.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-secondary">Email</h3>
                  <p className="text-muted-foreground">support@47dapunjab.com</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-secondary">Phone</h3>
                  <p className="text-muted-foreground">+92 325 4877717</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-secondary">Office</h3>
                  <p className="text-muted-foreground">
                    Gujranwala, Punjab<br/>
                    Pakistan
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-border">
            <h2 className="font-serif text-2xl font-bold text-secondary mb-6">Send a Message</h2>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name <span className="text-destructive">*</span></Label>
                <Input id="name" data-testid="input-name" {...form.register("name")} />
                {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                <Input id="email" type="email" data-testid="input-email" {...form.register("email")} />
                {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input id="phone" data-testid="input-phone" {...form.register("phone")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">How can we help? <span className="text-destructive">*</span></Label>
                <Textarea id="message" rows={5} data-testid="input-message" {...form.register("message")} />
                {form.formState.errors.message && <p className="text-sm text-destructive">{form.formState.errors.message.message}</p>}
              </div>

              <Button 
                type="submit" 
                data-testid="button-submit-contact"
                className="w-full bg-secondary text-white font-semibold"
                disabled={createInquiry.isPending}
              >
                {createInquiry.isPending ? "Sending..." : (
                  <>Send Message <Send className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
