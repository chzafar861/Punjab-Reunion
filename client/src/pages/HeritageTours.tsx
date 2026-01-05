import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { api, type TourInquiryInput } from "@shared/routes";
import { useCreateTourInquiry } from "@/hooks/use-tour-inquiries";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/use-seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Video, 
  Package, 
  MapPin, 
  Camera, 
  ArrowRight,
  Clock,
  DollarSign,
  Heart,
  Send,
  Building2,
  TreeDeciduous,
  Landmark
} from "lucide-react";

import ruralVillageImg from "@assets/Rural_Punjab_Village_1767631924193.jpg";
import agriculturalFieldsImg from "@assets/Agricultural_Fields_1767631924193.jpg";
import villageLifeImg from "@assets/Village_Life_1767631924193.jpg";
import badshahiMosqueImg from "@assets/Badshahi_Mosque_1767631924193.jpg";
import modernLahoreImg from "@assets/Modern_Lahore_1767631924193.jpg";
import urbanDevelopmentImg from "@assets/Urban_Development_1767631924193.jpg";
import fiveRiversMapImg from "@assets/The_Land_of_Five_Rivers_1767631924193.jpg";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const villageImages = [
  {
    url: ruralVillageImg,
    title: "Rural Punjab Village",
    desc: "Traditional brick homes and peaceful lanes",
  },
  {
    url: agriculturalFieldsImg,
    title: "Agricultural Fields",
    desc: "Golden wheat fields of Punjab",
  },
  {
    url: villageLifeImg,
    title: "Village Life",
    desc: "Simple, beautiful rural living",
  },
];

const lahoreImages = [
  {
    url: badshahiMosqueImg,
    title: "Badshahi Mosque",
    desc: "Historic Mughal-era masterpiece",
    era: "Historic",
  },
  {
    url: badshahiMosqueImg,
    title: "Lahore Fort",
    desc: "UNESCO World Heritage Site",
    era: "Historic",
  },
  {
    url: modernLahoreImg,
    title: "Modern Lahore",
    desc: "Contemporary city skyline",
    era: "Modern",
  },
  {
    url: urbanDevelopmentImg,
    title: "Urban Development",
    desc: "New architectural marvels",
    era: "Modern",
  },
];

const historicalImages = [
  {
    url: ruralVillageImg,
    title: "1947 Partition Era",
    desc: "Historic moments captured",
  },
  {
    url: villageLifeImg,
    title: "Ancient Streets",
    desc: "Historic pathways of Punjab",
  },
  {
    url: badshahiMosqueImg,
    title: "Heritage Architecture",
    desc: "Colonial and Mughal influences",
  },
];

export default function HeritageTours() {
  useSEO({
    title: "Heritage Tours & Services",
    description: "Experience Punjab heritage through virtual home visits, guided tours, and heritage import services. Book $100 video calls to see your ancestral village, or order authentic soil and handicrafts from your family's homeland.",
    keywords: "Punjab heritage tour, virtual home visit, ancestral village video call, heritage import, Punjab soil, handicrafts Pakistan, Lahore tour, village visit",
    canonicalPath: "/tours",
  });

  const { toast } = useToast();
  const createTourInquiry = useCreateTourInquiry();
  const [activeTab, setActiveTab] = useState<"video" | "import">("video");

  const form = useForm<TourInquiryInput>({
    resolver: zodResolver(api.tours.create.input),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      travelDates: "",
      groupSize: 1,
      interestAreas: "",
      message: "",
    },
  });

  const onSubmit = (data: TourInquiryInput) => {
    createTourInquiry.mutate(data, {
      onSuccess: () => {
        toast({
          title: "Inquiry Submitted",
          description: "We will contact you within 24 hours.",
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
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={badshahiMosqueImg}
            alt="Badshahi Mosque Lahore"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-white drop-shadow-lg leading-tight">
              Heritage Tours
              <br />
              <span className="text-primary italic">Visit Your Roots</span>
            </h1>

            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto font-light leading-relaxed">
              Let us take you on a journey through Punjab, Pakistan. Visit your ancestral village, 
              explore historic Lahore, and reconnect with your heritage.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Button
                size="lg"
                className="bg-primary text-white rounded-full shadow-xl"
                onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
                data-testid="button-explore-services"
              >
                Explore Services <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full bg-white/10 backdrop-blur-md border-white/30 text-white"
                onClick={() => document.getElementById("gallery")?.scrollIntoView({ behavior: "smooth" })}
                data-testid="button-view-gallery"
              >
                View Gallery
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div {...fadeIn} className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-secondary mb-4">
              Our Services
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We offer unique ways to connect with your ancestral homeland
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Video Call Service */}
            <motion.div {...fadeIn} transition={{ delay: 0.1 }}>
              <Card className="h-full overflow-hidden border-2 border-primary/20">
                <div className="bg-primary/10 p-8">
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-4">
                    <Video className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-secondary mb-2">
                    Virtual Home Visit
                  </h3>
                  <div className="flex items-center gap-2 text-primary font-bold text-3xl">
                    <DollarSign className="w-6 h-6" />
                    <span>100</span>
                    <span className="text-base text-muted-foreground font-normal">USD only</span>
                  </div>
                </div>
                <CardContent className="p-8 space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    Want to see your ancestral home, village, or neighborhood in Pakistan? 
                    We will visit the location and show you everything through a live video call.
                  </p>
                  <ul className="space-y-3">
                    {[
                      "Live video tour of your ancestral village",
                      "Visit your old family home or property",
                      "Meet locals who may remember your family",
                      "Record video footage for your memories",
                      "60-minute dedicated session",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Heart className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <span className="text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Import Service */}
            <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
              <Card className="h-full overflow-hidden border-2 border-secondary/20">
                <div className="bg-secondary/10 p-8">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                    <Package className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-secondary mb-2">
                    Heritage Imports
                  </h3>
                  <p className="text-muted-foreground">Custom pricing based on request</p>
                </div>
                <CardContent className="p-8 space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    Want to bring a piece of your homeland with you? We can help you import 
                    meaningful items from Punjab, Pakistan.
                  </p>
                  <ul className="space-y-3">
                    {[
                      "Soil from your ancestral village",
                      "Traditional Punjabi handicrafts",
                      "Local textiles and fabrics",
                      "Photographs of your old home",
                      "Any special items upon request",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Package className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
                        <span className="text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div {...fadeIn} className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-secondary mb-4">
              Explore Pakistan
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover the beauty of Punjab - from peaceful villages to the grandeur of Lahore
            </p>
          </motion.div>

          {/* Villages */}
          <div className="mb-16">
            <motion.div {...fadeIn} className="flex items-center justify-between gap-3 mb-8">
              <div className="flex items-center gap-3">
                <TreeDeciduous className="w-8 h-8 text-primary" />
                <h3 className="font-serif text-3xl font-bold text-secondary">Punjab Villages</h3>
              </div>
              <Link href="/tours/villages">
                <Button variant="outline" data-testid="link-explore-villages">
                  Explore More <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {villageImages.map((img, i) => (
                <motion.div
                  key={i}
                  {...fadeIn}
                  transition={{ delay: i * 0.1 }}
                  className="group relative aspect-[4/3] rounded-xl overflow-hidden"
                >
                  <img
                    src={img.url}
                    alt={img.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h4 className="font-serif text-xl font-bold text-white">{img.title}</h4>
                    <p className="text-white/80 text-sm">{img.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Lahore */}
          <div className="mb-16">
            <motion.div {...fadeIn} className="flex items-center justify-between gap-3 mb-8">
              <div className="flex items-center gap-3">
                <Landmark className="w-8 h-8 text-primary" />
                <h3 className="font-serif text-3xl font-bold text-secondary">Lahore - Historic & Modern</h3>
              </div>
              <Link href="/tours/lahore-history">
                <Button variant="outline" data-testid="link-explore-lahore">
                  Explore More <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {lahoreImages.map((img, i) => (
                <motion.div
                  key={i}
                  {...fadeIn}
                  transition={{ delay: i * 0.1 }}
                  className="group relative aspect-[3/4] rounded-xl overflow-hidden"
                >
                  <img
                    src={img.url}
                    alt={img.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      img.era === "Historic" ? "bg-amber-500 text-white" : "bg-blue-500 text-white"
                    }`}>
                      {img.era}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h4 className="font-serif text-xl font-bold text-white">{img.title}</h4>
                    <p className="text-white/80 text-sm">{img.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Historical 1947 */}
          <div className="mb-16">
            <motion.div {...fadeIn} className="flex items-center gap-3 mb-8">
              <Clock className="w-8 h-8 text-primary" />
              <h3 className="font-serif text-3xl font-bold text-secondary">Historical Punjab (1947 Era)</h3>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {historicalImages.map((img, i) => (
                <motion.div
                  key={i}
                  {...fadeIn}
                  transition={{ delay: i * 0.1 }}
                  className="group relative aspect-[4/3] rounded-xl overflow-hidden"
                >
                  <img
                    src={img.url}
                    alt={img.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 sepia-[0.3]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h4 className="font-serif text-xl font-bold text-white">{img.title}</h4>
                    <p className="text-white/80 text-sm">{img.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Map Section */}
          <motion.div {...fadeIn} className="mt-16">
            <div className="flex items-center gap-3 mb-8">
              <MapPin className="w-8 h-8 text-primary" />
              <h3 className="font-serif text-3xl font-bold text-secondary">Punjab Region Map</h3>
            </div>
            <Card className="overflow-hidden">
              <div className="aspect-[16/9] md:aspect-[21/9] relative">
                <img
                  src={fiveRiversMapImg}
                  alt="Map of Punjab Region"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
                <div className="absolute left-8 top-1/2 -translate-y-1/2 max-w-lg">
                  <h4 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
                    The Land of Five Rivers
                  </h4>
                  <p className="text-white/90 text-lg leading-relaxed">
                    Punjab, meaning "Land of Five Rivers," spans across India and Pakistan. 
                    Let us help you trace your roots across this historic region.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Modern Cities Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div {...fadeIn} className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Building2 className="w-8 h-8 text-primary" />
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-secondary">
                Modern Pakistan
              </h2>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
              Experience the vibrant, developing cities of today's Pakistan
            </p>
            <Link href="/tours/modern-cities">
              <Button variant="outline" data-testid="link-explore-modern">
                Explore Modern Pakistan <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <motion.div {...fadeIn} className="relative aspect-[4/3] rounded-xl overflow-hidden">
              <img
                src={modernLahoreImg}
                alt="Modern Lahore City"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <h4 className="font-serif text-2xl font-bold text-white">Lahore Today</h4>
                <p className="text-white/80">A blend of tradition and modernity</p>
              </div>
            </motion.div>
            <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="relative aspect-[4/3] rounded-xl overflow-hidden">
              <img
                src={urbanDevelopmentImg}
                alt="Pakistan Urban Development"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <h4 className="font-serif text-2xl font-bold text-white">Urban Progress</h4>
                <p className="text-white/80">New infrastructure and growth</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Inquiry Form Section */}
      <section id="inquiry" className="py-24 bg-secondary text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <motion.div {...fadeIn} className="space-y-8">
              <div>
                <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
                  Book Your Heritage Experience
                </h2>
                <p className="text-white/70 text-lg leading-relaxed">
                  Ready to reconnect with your roots? Fill out this form and we'll get back to you 
                  within 24 hours to plan your personalized heritage experience.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Video className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Virtual Home Visits</h3>
                    <p className="text-white/70">$100 USD for a 60-minute live video tour</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Heritage Imports</h3>
                    <p className="text-white/70">Soil, handicrafts, and more from your village</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Camera className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Photo Documentation</h3>
                    <p className="text-white/70">Professional photos of your ancestral locations</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
              <div className="bg-white p-8 rounded-2xl shadow-xl">
                <h3 className="font-serif text-2xl font-bold text-secondary mb-6">
                  Request Information
                </h3>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-secondary">Your Name</Label>
                      <Input 
                        id="name" 
                        {...form.register("name")} 
                        className="border-border bg-white text-secondary"
                        data-testid="input-tour-name"
                      />
                      {form.formState.errors.name && (
                        <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-secondary">Phone Number</Label>
                      <Input 
                        id="phone" 
                        {...form.register("phone")} 
                        className="border-border bg-white text-secondary"
                        data-testid="input-tour-phone"
                      />
                      {form.formState.errors.phone && (
                        <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-secondary">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      {...form.register("email")} 
                      className="border-border bg-white text-secondary"
                      data-testid="input-tour-email"
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="travelDates" className="text-secondary">Preferred Dates (Optional)</Label>
                      <Input 
                        id="travelDates" 
                        placeholder="e.g., March 2026"
                        {...form.register("travelDates")} 
                        className="border-border bg-white text-secondary"
                        data-testid="input-tour-dates"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="groupSize" className="text-secondary">Group Size</Label>
                      <Input 
                        id="groupSize" 
                        type="number" 
                        min={1}
                        {...form.register("groupSize", { valueAsNumber: true })} 
                        className="border-border bg-white text-secondary"
                        data-testid="input-tour-group-size"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="interestAreas" className="text-secondary">
                      What interests you?
                    </Label>
                    <Input 
                      id="interestAreas" 
                      placeholder="e.g., Village visit, Lahore tour, Import soil from village"
                      {...form.register("interestAreas")} 
                      className="border-border bg-white text-secondary"
                      data-testid="input-tour-interests"
                    />
                    {form.formState.errors.interestAreas && (
                      <p className="text-sm text-destructive">{form.formState.errors.interestAreas.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-secondary">
                      Tell us about your ancestral village or specific requests
                    </Label>
                    <Textarea 
                      id="message" 
                      rows={4}
                      placeholder="Share your village name, district, and what you'd like us to find or show you..."
                      {...form.register("message")} 
                      className="border-border bg-white text-secondary"
                      data-testid="input-tour-message"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold"
                    disabled={createTourInquiry.isPending}
                    data-testid="button-submit-tour-inquiry"
                  >
                    {createTourInquiry.isPending ? (
                      "Submitting..."
                    ) : (
                      <>
                        Submit Inquiry <Send className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
