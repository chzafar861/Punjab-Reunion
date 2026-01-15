import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSEO } from "@/hooks/use-seo";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Building2, 
  ArrowLeft,
  Plane,
  ShoppingBag,
  Utensils,
  Camera,
  Globe
} from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

export default function ModernCities() {
  const { t } = useLanguage();
  
  const cities = [
    {
      nameKey: "modern.lahoreToday",
      image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=2070",
      descKey: "modern.lahoreDesc",
      highlights: ["MM Alam Road", "Packages Mall", "Fortress Stadium", "DHA"],
    },
    {
      nameKey: "modern.islamabad",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070",
      descKey: "modern.islamabadDesc",
      highlights: ["Faisal Mosque", "Daman-e-Koh", "Centaurus Mall", "Margalla Hills"],
    },
    {
      nameKey: "modern.karachi",
      image: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=2070",
      descKey: "modern.karachiDesc",
      highlights: ["Clifton Beach", "Port Grand", "DO Darya", "Saddar"],
    },
    {
      nameKey: "modern.faisalabad",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070",
      descKey: "modern.faisalabadDesc",
      highlights: ["Clock Tower", "Canal Road", "Textile Mills", "Agricultural University"],
    },
  ];

  const articles = [
    {
      titleKey: "modern.economicTitle",
      contentKey: "modern.economicContent",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070",
    },
    {
      titleKey: "modern.culinaryTitle",
      contentKey: "modern.culinaryContent",
      image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=2070",
    },
    {
      titleKey: "modern.connectingTitle",
      contentKey: "modern.connectingContent",
      image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=2070",
    },
    {
      titleKey: "modern.travelTipsTitle",
      contentKey: "modern.travelTipsContent",
      image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2070",
    },
  ];

  useSEO({
    title: t("modern.seoTitle"),
    description: t("modern.seoDescription"),
    keywords: "modern Pakistan, Lahore today, Islamabad, Karachi, Faisalabad, Pakistan travel, diaspora visit, CPEC development",
    canonicalPath: "/tours/modern-cities",
  });

  return (
    <main className="flex-1">
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=2070"
            alt={t("modern.heroAlt")}
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
            <div className="flex items-center justify-center gap-3 mb-4">
              <Building2 className="w-12 h-12 text-primary" />
            </div>
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-white drop-shadow-lg">
              {t("modern.title")}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto font-light">
              {t("modern.subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <Link href="/tours">
            <Button variant="ghost" className="mb-8" data-testid="button-back-tours">
              <ArrowLeft className="w-4 h-4 mr-2" /> {t("modern.backToTours")}
            </Button>
          </Link>

          <motion.div {...fadeIn} className="mb-16">
            <h2 className="font-serif text-4xl font-bold text-secondary mb-4">
              {t("modern.majorCities")}
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl">
              {t("modern.majorCitiesDesc")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {cities.map((city, i) => (
              <motion.div key={city.nameKey} {...fadeIn} transition={{ delay: i * 0.1 }}>
                <Card className="overflow-hidden h-full" data-testid={`card-city-${i}`}>
                  <div className="aspect-[16/9] relative">
                    <img
                      src={city.image}
                      alt={t(city.nameKey)}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <h3 className="font-serif text-2xl font-bold text-white">{t(city.nameKey)}</h3>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground mb-4">{t(city.descKey)}</p>
                    <div className="flex flex-wrap gap-2">
                      {city.highlights.map((highlight) => (
                        <span
                          key={highlight}
                          className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm rounded-full"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="space-y-20">
            {articles.map((article, i) => (
              <motion.article
                key={article.titleKey}
                {...fadeIn}
                transition={{ delay: i * 0.1 }}
              >
                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center`}>
                  <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                    <div className="aspect-[4/3] rounded-xl overflow-hidden">
                      <img
                        src={article.image}
                        alt={t(article.titleKey)}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                    <div className="flex items-center gap-2 mb-4">
                      <Globe className="w-5 h-5 text-primary" />
                      <span className="text-primary text-sm font-semibold">{t("modern.article")}</span>
                    </div>
                    <h3 className="font-serif text-3xl font-bold text-secondary mb-4">
                      {t(article.titleKey)}
                    </h3>
                    <div className="prose prose-lg text-muted-foreground">
                      {t(article.contentKey).split('\n\n').map((paragraph, j) => (
                        <p key={j} className="mb-4">{paragraph}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          <motion.div {...fadeIn} className="mt-20 text-center">
            <Card className="bg-primary/5 border-primary/20 p-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Plane className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-secondary mb-4">
                {t("modern.planTrip")}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                {t("modern.planTripDesc")}
              </p>
              <Link href="/tours#inquiry">
                <Button size="lg" className="bg-primary text-white" data-testid="button-plan-trip">
                  {t("modern.startPlanning")}
                </Button>
              </Link>
            </Card>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
