import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { api, type TourInquiryInput } from "@shared/routes";
import { useCreateTourInquiry } from "@/hooks/use-tour-inquiries";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/use-seo";
import { useLanguage } from "@/contexts/LanguageContext";
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
  Landmark,
} from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const villageImages = [
  {
    url: "https://images.unsplash.com/photo-1760740516377-264362f7ba57?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzJ8fFJ1cmFsJTIwUHVuamFiJTIwVmlsbGFnZXxlbnwwfHwwfHx8MA%3D%3D",
    titleKey: "tours.ruralPunjabVillage",
    descKey: "tours.ruralDesc",
  },
  {
    url: "https://images.unsplash.com/photo-1694093817187-0c913bc4ad87?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8QWdyaWN1bHR1cmFsJTIwRmllbGRzfGVufDB8fDB8fHww",
    titleKey: "tours.agriculturalFields",
    descKey: "tours.agriculturalDesc",
  },
  {
    url: "https://images.unsplash.com/photo-1562658601-0ae4a690ae1f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8VmlsbGFnZSUyMExpZmV8ZW58MHx8MHx8fDA%3D",
    titleKey: "tours.villageLife",
    descKey: "tours.villageLifeDesc",
  },
];

const lahoreImages = [
  {
    url: "https://images.unsplash.com/photo-1707882791939-b929784ebddf?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fEJhZHNoYWhpJTIwTW9zcXVlfGVufDB8fDB8fHww",
    titleKey: "tours.badshahiMosque",
    descKey: "tours.badshahiDesc",
    eraKey: "tours.historic",
  },
  {
    url: "https://images.unsplash.com/photo-1669551671277-f9cbdd107288?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8TGFob3JlJTIwRm9ydHxlbnwwfHwwfHx8MA%3D%3D",
    titleKey: "tours.lahoreFort",
    descKey: "tours.lahoreFortDesc",
    eraKey: "tours.historic",
  },
  {
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070",
    titleKey: "tours.modernLahore",
    descKey: "tours.modernLahoreDesc",
    eraKey: "tours.modern",
  },
  {
    url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070",
    titleKey: "tours.urbanDevelopment",
    descKey: "tours.urbanDevelopmentDesc",
    eraKey: "tours.modern",
  },
];

const historicalImages = [
  {
    url: "https://plus.unsplash.com/premium_photo-1669387727429-0a444196038d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8MTk0NyUyMFBhcnRpdGlvbiUyMEVyYSUyMHBhayUyMGluZGlhfGVufDB8fDB8fHww",
    titleKey: "tours.partitionEra",
    descKey: "tours.partitionDesc",
  },
  {
    url: "https://media.istockphoto.com/id/2244623300/photo/rohtas-fort-sohail-gate-historic-mughal-stronghold-view.jpg?s=612x612&w=0&k=20&c=awd2e2OTDK_iUyfPnvusfDyw_8M8RmYmZo7WCtKz7dU=",
    titleKey: "tours.ancientStreets",
    descKey: "tours.ancientStreetsDesc",
  },
  {
    url: "https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=2070",
    titleKey: "tours.heritageArchitecture",
    descKey: "tours.heritageArchitectureDesc",
  },
];

export default function HeritageTours() {
  const { t } = useLanguage();
  
  useSEO({
    title: "Heritage Tours & Services",
    description:
      "Experience Punjab heritage through virtual home visits, guided tours, and heritage import services. Book $100 video calls to see your ancestral village, or order authentic soil and handicrafts from your family's homeland.",
    keywords:
      "Punjab heritage tour, virtual home visit, ancestral village video call, heritage import, Punjab soil, handicrafts Pakistan, Lahore tour, village visit",
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
          title: t("tours.inquirySubmitted"),
          description: t("tours.inquirySubmittedDesc"),
        });
        form.reset();
      },
      onError: (err) => {
        toast({
          title: t("common.error"),
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
            src="https://images.unsplash.com/photo-1567157577867-05ccb1388e66?q=80&w=2074"
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
              {t("tours.title")}
              <br />
              <span className="text-primary italic">{t("tours.visitYourRoots")}</span>
            </h1>

            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto font-light leading-relaxed">
              {t("tours.heroSubtitle")}
            </p>

            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Button
                size="lg"
                className="bg-primary text-white rounded-full shadow-xl"
                onClick={() =>
                  document
                    .getElementById("services")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                data-testid="button-explore-services"
              >
                {t("tours.exploreServices")} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full bg-white/10 backdrop-blur-md border-white/30 text-white"
                onClick={() =>
                  document
                    .getElementById("gallery")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                data-testid="button-view-gallery"
              >
                {t("tours.viewGallery")}
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
              {t("tours.ourServices")}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t("tours.servicesSubtitle")}
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
                    {t("tours.virtualVisit")}
                  </h3>
                  <div className="flex items-center gap-2 text-primary font-bold text-3xl">
                    <DollarSign className="w-6 h-6" />
                    <span>100</span>
                    <span className="text-base text-muted-foreground font-normal">
                      {t("tours.usdOnly")}
                    </span>
                  </div>
                </div>
                <CardContent className="p-8 space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    {t("tours.virtualHomeVisitDesc")}
                  </p>
                  <ul className="space-y-3">
                    {[
                      t("tours.virtualFeature1"),
                      t("tours.virtualFeature2"),
                      t("tours.virtualFeature3"),
                      t("tours.virtualFeature4"),
                      t("tours.virtualFeature5"),
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
                    {t("tours.heritageImports")}
                  </h3>
                  <p className="text-muted-foreground">
                    {t("tours.customPricing")}
                  </p>
                </div>
                <CardContent className="p-8 space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                    {t("tours.heritageImportsDesc")}
                  </p>
                  <ul className="space-y-3">
                    {[
                      t("tours.importFeature1"),
                      t("tours.importFeature2"),
                      t("tours.importFeature3"),
                      t("tours.importFeature4"),
                      t("tours.importFeature5"),
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
              {t("tours.explorePakistan")}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t("tours.exploreSubtitle")}
            </p>
          </motion.div>

          {/* Villages */}
          <div className="mb-16">
            <motion.div
              {...fadeIn}
              className="flex items-center justify-between gap-3 mb-8"
            >
              <div className="flex items-center gap-3">
                <TreeDeciduous className="w-8 h-8 text-primary" />
                <h3 className="font-serif text-3xl font-bold text-secondary">
                  {t("tours.punjabVillages")}
                </h3>
              </div>
              <Link href="/tours/villages">
                <Button variant="outline" data-testid="link-explore-villages">
                  {t("tours.exploreMore")} <ArrowRight className="w-4 h-4 ml-2" />
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
                    alt={t(img.titleKey)}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h4 className="font-serif text-xl font-bold text-white">
                      {t(img.titleKey)}
                    </h4>
                    <p className="text-white/80 text-sm">{t(img.descKey)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Lahore */}
          <div className="mb-16">
            <motion.div
              {...fadeIn}
              className="flex items-center justify-between gap-3 mb-8"
            >
              <div className="flex items-center gap-3">
                <Landmark className="w-8 h-8 text-primary" />
                <h3 className="font-serif text-3xl font-bold text-secondary">
                  {t("tours.lahoreHistoricModern")}
                </h3>
              </div>
              <Link href="/tours/lahore-history">
                <Button variant="outline" data-testid="link-explore-lahore">
                  {t("tours.exploreMore")} <ArrowRight className="w-4 h-4 ml-2" />
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
                    alt={t(img.titleKey)}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute top-4 right-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        img.eraKey === "tours.historic"
                          ? "bg-amber-500 text-white"
                          : "bg-blue-500 text-white"
                      }`}
                    >
                      {t(img.eraKey)}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h4 className="font-serif text-xl font-bold text-white">
                      {t(img.titleKey)}
                    </h4>
                    <p className="text-white/80 text-sm">{t(img.descKey)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Historical 1947 */}
          <div className="mb-16">
            <motion.div {...fadeIn} className="flex items-center gap-3 mb-8">
              <Clock className="w-8 h-8 text-primary" />
              <h3 className="font-serif text-3xl font-bold text-secondary">
                {t("tours.historicalPunjab")}
              </h3>
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
                    alt={t(img.titleKey)}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 sepia-[0.3]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h4 className="font-serif text-xl font-bold text-white">
                      {t(img.titleKey)}
                    </h4>
                    <p className="text-white/80 text-sm">{t(img.descKey)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Map Section */}
          <motion.div {...fadeIn} className="mt-16">
            <div className="flex items-center gap-3 mb-8">
              <MapPin className="w-8 h-8 text-primary" />
              <h3 className="font-serif text-3xl font-bold text-secondary">
                {t("tours.punjabRegionMap")}
              </h3>
            </div>
            <Card className="overflow-hidden">
              <div className="aspect-[16/9] md:aspect-[21/9] relative">
                <img
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074"
                  alt="Map of Punjab Region"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
                <div className="absolute left-8 top-1/2 -translate-y-1/2 max-w-lg">
                  <h4 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
                    {t("tours.landOfFiveRivers")}
                  </h4>
                  <p className="text-white/90 text-lg leading-relaxed">
                    {t("tours.fiveRiversDesc")}
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
                {t("tours.modernPakistan")}
              </h2>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
              {t("tours.modernPakistanSubtitle")}
            </p>
            <Link href="/tours/modern-cities">
              <Button variant="outline" data-testid="link-explore-modern">
                {t("tours.exploreModernPakistan")} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <motion.div
              {...fadeIn}
              className="relative aspect-[4/3] rounded-xl overflow-hidden"
            >
              <img
                src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=2070"
                alt="Modern Lahore City"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <h4 className="font-serif text-2xl font-bold text-white">
                  {t("tours.lahoreToday")}
                </h4>
                <p className="text-white/80">
                  {t("tours.lahoreBlend")}
                </p>
              </div>
            </motion.div>
            <motion.div
              {...fadeIn}
              transition={{ delay: 0.1 }}
              className="relative aspect-[4/3] rounded-xl overflow-hidden"
            >
              <img
                src="https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=2070"
                alt="Pakistan Urban Development"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <h4 className="font-serif text-2xl font-bold text-white">
                  {t("tours.urbanProgress")}
                </h4>
                <p className="text-white/80">{t("tours.urbanProgressDesc")}</p>
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
                  {t("tours.bookHeritageExperience")}
                </h2>
                <p className="text-white/70 text-lg leading-relaxed">
                  {t("tours.bookFormSubtitle")}
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Video className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{t("tours.virtualHomeVisits")}</h3>
                    <p className="text-white/70">
                      {t("tours.virtualPrice")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{t("tours.heritageImports")}</h3>
                    <p className="text-white/70">
                      {t("tours.soilHandicrafts")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Camera className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{t("tours.photoDocumentation")}</h3>
                    <p className="text-white/70">
                      {t("tours.photoDocDesc")}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div {...fadeIn} transition={{ delay: 0.2 }}>
              <div className="bg-white p-8 rounded-2xl shadow-xl">
                <h3 className="font-serif text-2xl font-bold text-secondary mb-6">
                  {t("tours.requestInfo")}
                </h3>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-secondary">
                        {t("tours.yourName")}
                      </Label>
                      <Input
                        id="name"
                        {...form.register("name")}
                        className="border-border bg-white text-secondary"
                        data-testid="input-tour-name"
                      />
                      {form.formState.errors.name && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.name.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-secondary">
                        {t("tours.phoneNumber")}
                      </Label>
                      <Input
                        id="phone"
                        {...form.register("phone")}
                        className="border-border bg-white text-secondary"
                        data-testid="input-tour-phone"
                      />
                      {form.formState.errors.phone && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.phone.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-secondary">
                      {t("tours.emailAddress")}
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register("email")}
                      className="border-border bg-white text-secondary"
                      data-testid="input-tour-email"
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="travelDates" className="text-secondary">
                        {t("tours.preferredDates")}
                      </Label>
                      <Input
                        id="travelDates"
                        placeholder="e.g., March 2026"
                        {...form.register("travelDates")}
                        className="border-border bg-white text-secondary"
                        data-testid="input-tour-dates"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="groupSize" className="text-secondary">
                        {t("tours.groupSize")}
                      </Label>
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
                      {t("tours.whatInterests")}
                    </Label>
                    <Input
                      id="interestAreas"
                      placeholder={t("tours.interestsPlaceholder")}
                      {...form.register("interestAreas")}
                      className="border-border bg-white text-secondary"
                      data-testid="input-tour-interests"
                    />
                    {form.formState.errors.interestAreas && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.interestAreas.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-secondary">
                      {t("tours.ancestralVillageLabel")}
                    </Label>
                    <Textarea
                      id="message"
                      rows={4}
                      placeholder={t("tours.villagePlaceholder")}
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
                      t("tours.submitting")
                    ) : (
                      <>
                        {t("tours.submitInquiry")} <Send className="w-4 h-4 ml-2" />
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
