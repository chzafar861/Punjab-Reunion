import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSEO } from "@/hooks/use-seo";
import { 
  TreeDeciduous, 
  ArrowLeft,
  MapPin,
  Home,
  Users,
  Wheat,
  Heart
} from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const villages = [
  {
    name: "Lyallpur (Faisalabad)",
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=2070",
    description: "Once known as Lyallpur, this city was the heart of Punjab's agricultural belt. Many Sikh and Hindu families had their roots here before 1947.",
    features: ["Canal Colony Architecture", "Agricultural Heritage", "Historical Markets"],
  },
  {
    name: "Rawalpindi",
    image: "https://images.unsplash.com/photo-1623850606806-15c65efcdb1b?q=80&w=2070",
    description: "A twin city of Islamabad, Rawalpindi has deep historical roots. Many families trace their ancestry to the bustling bazaars and neighborhoods here.",
    features: ["Raja Bazaar", "British Era Buildings", "Military Cantonment"],
  },
  {
    name: "Sialkot",
    image: "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?q=80&w=2074",
    description: "Known for its craftsmanship, Sialkot was home to many artisan families. The region is famous for sports goods and surgical instruments.",
    features: ["Artisan Heritage", "Iqbal's Birthplace", "Historic Temples"],
  },
  {
    name: "Gujranwala",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070",
    description: "The birthplace of Maharaja Ranjit Singh, Gujranwala holds immense historical significance for Punjabi culture and Sikh history.",
    features: ["Ranjit Singh Memorial", "Traditional Bazaars", "Agricultural Lands"],
  },
];

const articles = [
  {
    title: "Life in Pre-Partition Punjab Villages",
    content: `Before 1947, Punjab villages were vibrant communities where Hindus, Muslims, and Sikhs lived together in harmony. The village was the center of life - from the morning prayers at temples, gurdwaras, and mosques to the evening gatherings under the old banyan trees.

Each village had its own character. Some were known for their fertile lands fed by the five rivers, others for their skilled craftsmen. The chaupal (village square) was where elders would gather, disputes were settled, and stories of ancestors were shared with younger generations.

The harvest season brought everyone together. Baisakhi celebrations saw the entire village dancing bhangra, sharing food, and celebrating the bounty of the land. These traditions, though now divided by borders, remain alive in the hearts of those who trace their roots to these villages.`,
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2070",
  },
  {
    title: "The Agricultural Legacy of Punjab",
    content: `Punjab, meaning "Land of Five Rivers," earned its name from the Jhelum, Chenab, Ravi, Beas, and Sutlej rivers that nourish its soil. This fertile land became known as the breadbasket of the subcontinent.

Families who left during partition often speak of their ancestral lands with deep emotion. The golden wheat fields, the mango orchards, the sugarcane farms - these weren't just sources of livelihood but repositories of family memories spanning generations.

Today, we help families reconnect with these lands. Whether it's visiting the site of an old family farm, meeting with current residents who may have known your ancestors, or simply walking the same paths your grandparents once walked - these experiences bring closure and connection.`,
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2070",
  },
  {
    title: "Finding Your Ancestral Home",
    content: `Many families who left during partition remember specific details about their homes - the courtyard where children played, the well that provided water, the room where grandparents slept. These memories, passed down through generations, become precious clues in our search.

Our team works with local historians, village elders, and land records to trace these properties. Sometimes the original structures still stand, albeit with modifications. Other times, we find the plot of land where the home once stood, now occupied by new buildings.

The emotional journey of standing where your ancestors once lived cannot be described in words. We've witnessed reunions between families separated for decades, discovered photographs in old albums held by current residents, and helped piece together stories that were thought to be lost forever.`,
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=2025",
  },
];

export default function PunjabVillages() {
  useSEO({
    title: "Punjab Villages - Ancestral Homes and Heritage",
    description: "Explore the ancestral villages of Punjab where generations of families lived before 1947. Learn about Lyallpur, Rawalpindi, Sialkot, Gujranwala and find your family's roots.",
    keywords: "Punjab villages, ancestral village, Lyallpur, Faisalabad, Rawalpindi, Sialkot, Gujranwala, partition villages, family roots",
    canonicalPath: "/tours/villages",
  });

  return (
    <main className="flex-1">
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1587474260584-136574528ed5?q=80&w=2070"
            alt="Punjab Village"
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
              Punjab Villages
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto font-light">
              Explore the ancestral villages of Punjab where generations of families built their lives
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <Link href="/tours">
            <Button variant="ghost" className="mb-8" data-testid="button-back-tours">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Heritage Tours
            </Button>
          </Link>

          <motion.div {...fadeIn} className="mb-16">
            <h2 className="font-serif text-4xl font-bold text-secondary mb-4">
              Historic Villages of Punjab
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl">
              These cities and villages were home to thousands of families before partition. 
              Many descendants still carry memories and stories passed down through generations.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {villages.map((village, i) => (
              <motion.div key={village.name} {...fadeIn} transition={{ delay: i * 0.1 }}>
                <Card className="overflow-hidden h-full" data-testid={`card-village-${i}`}>
                  <div className="aspect-[16/9] relative">
                    <img
                      src={village.image}
                      alt={village.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <h3 className="font-serif text-2xl font-bold text-white">{village.name}</h3>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground mb-4">{village.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {village.features.map((feature) => (
                        <span
                          key={feature}
                          className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                        >
                          {feature}
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
              key={article.title}
              {...fadeIn}
              transition={{ delay: i * 0.1 }}
              className="mb-16 last:mb-0"
            >
              <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center ${i % 2 === 1 ? "lg:flex-row-reverse" : ""}`}>
                <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="aspect-[4/3] rounded-xl overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                  <h3 className="font-serif text-3xl font-bold text-secondary mb-4">
                    {article.title}
                  </h3>
                  <div className="prose prose-lg text-muted-foreground">
                    {article.content.split('\n\n').map((paragraph, j) => (
                      <p key={j} className="mb-4">{paragraph}</p>
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
                Ready to Visit Your Ancestral Village?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Let us help you trace your roots and arrange a visit to your family's ancestral village in Punjab.
              </p>
              <Link href="/tours#inquiry">
                <Button size="lg" className="bg-primary text-white" data-testid="button-book-village-visit">
                  Book a Heritage Visit
                </Button>
              </Link>
            </Card>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
