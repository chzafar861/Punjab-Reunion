import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api, type InquiryInput } from "@shared/routes";
import { useCreateInquiry } from "@/hooks/use-inquiries";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function Contact() {
  const { toast } = useToast();
  const createInquiry = useCreateInquiry();

  const form = useForm<InquiryInput>({
    resolver: zodResolver(api.inquiries.create.input),
    defaultValues: {
      name: "",
      email: "",
      message: "",
      phone: "",
    },
  });

  const onSubmit = (data: InquiryInput) => {
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
                  <p className="text-muted-foreground">+91 (123) 456-7890</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-secondary">Office</h3>
                  <p className="text-muted-foreground">
                    Heritage Center<br/>
                    Amritsar, Punjab<br/>
                    India
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
                <Label htmlFor="name">Your Name</Label>
                <Input id="name" {...form.register("name")} />
                {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" {...form.register("email")} />
                {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input id="phone" {...form.register("phone")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">How can we help?</Label>
                <Textarea id="message" rows={5} {...form.register("message")} />
                {form.formState.errors.message && <p className="text-sm text-destructive">{form.formState.errors.message.message}</p>}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-secondary hover:bg-secondary/90 text-white font-semibold"
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
