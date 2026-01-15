import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSEO } from "@/hooks/use-seo";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation } from "@/lib/translations";
import {
  TreeDeciduous,
  ArrowLeft,
  Heart,
} from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

export default function PunjabVillages() {
  const { language } = useLanguage();
  const t = (key: string) => getTranslation(language, key);

  const villages = [
    {
      nameKey: "villages.lyallpur",
      image:
        "https://img.dunyanews.tv/news/2022/January/01-24-22/news_big_images/638075_32861860.jpg",
      descKey: "villages.lyallpurDesc",
      featureKeys: ["villages.canalColony", "villages.agriculturalHeritage", "villages.historicalMarkets"],
    },
    {
      nameKey: "villages.rawalpindi",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Rawalpindi_City.jpg/1200px-Rawalpindi_City.jpg",
      descKey: "villages.rawalpindiDesc",
      featureKeys: ["villages.rajaBazaar", "villages.britishBuildings", "villages.militaryCantonment"],
    },
    {
      nameKey: "villages.sialkot",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Sialkot_Clock_Tower.jpg/800px-Sialkot_Clock_Tower.jpg",
      descKey: "villages.sialkotDesc",
      featureKeys: ["villages.artisanHeritage", "villages.iqbalBirthplace", "villages.historicTemples"],
    },
    {
      nameKey: "villages.gujranwala",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Gujranwala_City.jpg/1200px-Gujranwala_City.jpg",
      descKey: "villages.gujranwalaDesc",
      featureKeys: ["villages.ranjitSinghMemorial", "villages.traditionalBazaars", "villages.agriculturalLands"],
    },
  ];

  const articles = [
    {
      titleKey: "villages.prePartitionTitle",
      contentKey: "villages.prePartitionContent",
      image:
        "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2070",
    },
    {
      titleKey: "villages.agriculturalTitle",
      contentKey: "villages.agriculturalContent",
      image:
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2070",
    },
    {
      titleKey: "villages.ancestralHomeTitle",
      contentKey: "villages.ancestralHomeContent",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQN7bWOOca9HebNaHkn6kD83C-llls6AZW1aA&s",
    },
  ];

  useSEO({
    title: t("villages.seoTitle"),
    description: t("villages.seoDescription"),
    keywords:
      "Punjab villages, ancestral village, Lyallpur, Faisalabad, Rawalpindi, Sialkot, Gujranwala, partition villages, family roots",
    canonicalPath: "/tours/villages",
  });

  return (
    <main className="flex-1">
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=2070"
            alt={t("villages.heroAlt")}
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
              <TreeDeciduous className="w-12 h-12 text-primary" />
            </div>
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-white drop-shadow-lg">
              {t("villages.title")}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto font-light">
              {t("villages.subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <Link href="/tours">
            <Button
              variant="ghost"
              className="mb-8"
              data-testid="button-back-tours"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> {t("villages.backToTours")}
            </Button>
          </Link>

          <motion.div {...fadeIn} className="mb-16">
            <h2 className="font-serif text-4xl font-bold text-secondary mb-4">
              {t("villages.historicTitle")}
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl">
              {t("villages.historicDesc")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {villages.map((village, i) => (
              <motion.div
                key={village.nameKey}
                {...fadeIn}
                transition={{ delay: i * 0.1 }}
              >
                <Card
                  className="overflow-hidden h-full"
                  data-testid={`card-village-${i}`}
                >
                  <div className="aspect-[16/9] relative">
                    <img
                      src={village.image}
                      alt={t(village.nameKey)}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <h3 className="font-serif text-2xl font-bold text-white">
                        {t(village.nameKey)}
                      </h3>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground mb-4">
                      {t(village.descKey)}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {village.featureKeys.map((featureKey) => (
                        <span
                          key={featureKey}
                          className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                        >
                          {t(featureKey)}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {articles.map((article, i) => (
            <motion.article
              key={article.titleKey}
              {...fadeIn}
              transition={{ delay: i * 0.1 }}
              className="mb-16 last:mb-0"
            >
              <div
                className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center ${i % 2 === 1 ? "lg:flex-row-reverse" : ""}`}
              >
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
                  <h3 className="font-serif text-3xl font-bold text-secondary mb-4">
                    {t(article.titleKey)}
                  </h3>
                  <div className="prose prose-lg text-muted-foreground">
                    {t(article.contentKey).split("\n\n").map((paragraph, j) => (
                      <p key={j} className="mb-4">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </motion.article>
          ))}

          <motion.div {...fadeIn} className="mt-16 text-center">
            <Card className="bg-primary/5 border-primary/20 p-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-secondary mb-4">
                {t("villages.ctaTitle")}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                {t("villages.ctaDesc")}
              </p>
              <Link href="/tours#inquiry">
                <Button
                  size="lg"
                  className="bg-primary text-white"
                  data-testid="button-book-village-visit"
                >
                  {t("villages.bookVisit")}
                </Button>
              </Link>
            </Card>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
