import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSEO } from "@/hooks/use-seo";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation } from "@/lib/translations";
import {
  Landmark,
  ArrowLeft,
  BookOpen,
  Crown,
} from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

export default function LahoreHistory() {
  const { language } = useLanguage();
  const t = (key: string) => getTranslation(language, key);

  const landmarks = [
    {
      nameKey: "lahore.badshahi",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2x_7itWyz_hQZLuCd5qlKkb1eNWFq9NhcHQ&s",
      year: "1673",
      descKey: "lahore.badshahiDesc",
      significanceKey: "lahore.badshahiSignificance",
    },
    {
      nameKey: "lahore.fort",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Alamgiri_Gate%2C_Lahore_Fort.jpg/1200px-Alamgiri_Gate%2C_Lahore_Fort.jpg",
      year: "1566",
      descKey: "lahore.fortDesc",
      significanceKey: "lahore.fortSignificance",
    },
    {
      nameKey: "lahore.shalimar",
      image:
        "https://gypsytours.pk/wp-content/uploads/2023/05/Shalimar-Gardens.jpg",
      year: "1641",
      descKey: "lahore.shalimarDesc",
      significanceKey: "lahore.shalimarSignificance",
    },
    {
      nameKey: "lahore.dataDarbar",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Data_Darbar.jpg/1200px-Data_Darbar.jpg",
      year: "11th Century",
      descKey: "lahore.dataDarbarDesc",
      significanceKey: "lahore.dataDarbarSignificance",
    },
  ];

  const articles = [
    {
      titleKey: "lahore.heartTitle",
      contentKey: "lahore.heartContent",
      image:
        "https://www.geo.tv/assets/uploads/updates/2020-07-11/297459_5433584_updates.jpg",
    },
    {
      titleKey: "lahore.walledCityTitle",
      contentKey: "lahore.walledCityContent",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Lahore_walled_city.jpg/1200px-Lahore_walled_city.jpg",
    },
    {
      titleKey: "lahore.mughalTitle",
      contentKey: "lahore.mughalContent",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Badshahi_Mosque_July_1_2005_pic32_by_Ali_Imran_%281%29.jpg/1200px-Badshahi_Mosque_July_1_2005_pic32_by_Ali_Imran_%281%29.jpg",
    },
    {
      titleKey: "lahore.prePartitionTitle",
      contentKey: "lahore.prePartitionContent",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Lahore_Museum.jpg/1200px-Lahore_Museum.jpg",
    },
  ];

  useSEO({
    title: t("lahore.seoTitle"),
    description: t("lahore.seoDescription"),
    keywords:
      "Lahore history, Badshahi Mosque, Lahore Fort, Mughal architecture, Walled City, Punjab capital, Shalimar Gardens, heritage site",
    canonicalPath: "/tours/lahore-history",
  });

  return (
    <main className="flex-1">
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1567157577867-05ccb1388e66?q=80&w=2074"
            alt={t("lahore.heroAlt")}
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
              <Landmark className="w-12 h-12 text-primary" />
            </div>
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-white drop-shadow-lg">
              {t("lahore.title")}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto font-light">
              {t("lahore.subtitle")}
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
              <ArrowLeft className="w-4 h-4 mr-2" /> {t("lahore.backToTours")}
            </Button>
          </Link>

          <motion.div {...fadeIn} className="mb-16">
            <h2 className="font-serif text-4xl font-bold text-secondary mb-4">
              {t("lahore.landmarksTitle")}
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl">
              {t("lahore.landmarksDesc")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {landmarks.map((landmark, i) => (
              <motion.div
                key={landmark.nameKey}
                {...fadeIn}
                transition={{ delay: i * 0.1 }}
              >
                <Card
                  className="overflow-hidden h-full"
                  data-testid={`card-landmark-${i}`}
                >
                  <div className="aspect-[16/9] relative">
                    <img
                      src={landmark.image}
                      alt={t(landmark.nameKey)}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-amber-500 text-white text-sm rounded-full font-semibold">
                        {t("lahore.est")} {landmark.year}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <h3 className="font-serif text-2xl font-bold text-white">
                        {t(landmark.nameKey)}
                      </h3>
                      <p className="text-white/80 text-sm">
                        {t(landmark.significanceKey)}
                      </p>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground">
                      {t(landmark.descKey)}
                    </p>
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
                <div
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center`}
                >
                  <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                    <div className="aspect-[4/3] rounded-xl overflow-hidden">
                      <img
                        src={article.image}
                        alt={t(article.titleKey)}
                        className="w-full h-full object-cover sepia-[0.2]"
                      />
                    </div>
                  </div>
                  <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                    <div className="flex items-center gap-2 mb-4">
                      <BookOpen className="w-5 h-5 text-primary" />
                      <span className="text-primary text-sm font-semibold">
                        {t("lahore.article")}
                      </span>
                    </div>
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
          </div>

          <motion.div {...fadeIn} className="mt-20 text-center">
            <Card className="bg-primary/5 border-primary/20 p-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Crown className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-secondary mb-4">
                {t("lahore.ctaTitle")}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                {t("lahore.ctaDesc")}
              </p>
              <Link href="/tours#inquiry">
                <Button
                  size="lg"
                  className="bg-primary text-white"
                  data-testid="button-book-lahore-tour"
                >
                  {t("lahore.bookTour")}
                </Button>
              </Link>
            </Card>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
