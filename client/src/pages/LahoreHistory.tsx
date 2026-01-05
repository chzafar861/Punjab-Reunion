import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSEO } from "@/hooks/use-seo";
import { 
  Landmark, 
  ArrowLeft,
  BookOpen,
  Building,
  Crown,
  Scroll
} from "lucide-react";

import badshahiMosqueImg from "@assets/Badshahi_Mosque_1767631924193.jpg";
import modernLahoreImg from "@assets/Modern_Lahore_1767631924193.jpg";
import villageLifeImg from "@assets/Village_Life_1767631924193.jpg";
import ruralVillageImg from "@assets/Rural_Punjab_Village_1767631924193.jpg";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const landmarks = [
  {
    name: "Badshahi Mosque",
    image: badshahiMosqueImg,
    year: "1673",
    description: "One of the largest mosques in the world, built by Emperor Aurangzeb. Its stunning Mughal architecture attracts visitors from around the globe.",
    significance: "Mughal Era Masterpiece",
  },
  {
    name: "Lahore Fort (Shahi Qila)",
    image: badshahiMosqueImg,
    year: "1566",
    description: "A UNESCO World Heritage Site, this citadel contains palaces, halls, and gardens from the Mughal emperors who ruled from Lahore.",
    significance: "UNESCO World Heritage",
  },
  {
    name: "Shalimar Gardens",
    image: modernLahoreImg,
    year: "1641",
    description: "Built by Emperor Shah Jahan, these terraced gardens represent the height of Mughal horticultural art with their fountains and pavilions.",
    significance: "Mughal Garden Heritage",
  },
  {
    name: "Data Darbar",
    image: badshahiMosqueImg,
    year: "11th Century",
    description: "The shrine of Hazrat Data Ganj Bakhsh, one of the most revered Sufi saints in South Asia, drawing millions of devotees annually.",
    significance: "Sufi Heritage",
  },
];

const articles = [
  {
    title: "Lahore: The Heart of Punjab",
    content: `Lahore, the cultural capital of Pakistan, has been the soul of Punjab for over a thousand years. Known as the "City of Gardens" and the "Paris of the East," Lahore has witnessed the rise and fall of empires, from the Ghaznavids to the Mughals, from the Sikhs to the British.

For families tracing their roots, Lahore often holds the key to their ancestral history. The city's neighborhoods - from the walled city's narrow lanes to the grand avenues of Model Town - each tell stories of the diverse communities that called this city home.

Before 1947, Lahore was a melting pot of cultures. The Anarkali Bazaar bustled with merchants of all faiths, the Lahore College educated students who would shape the subcontinent's future, and the gardens of Lawrence Gardens (now Bagh-e-Jinnah) saw families of all backgrounds enjoying the shade of ancient trees.`,
    image: "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?q=80&w=2074",
  },
  {
    title: "The Walled City: A Living Museum",
    content: `The Walled City of Lahore, known as Androon Shehr, is one of the few remaining examples of a living, breathing historic city in South Asia. Within its 13 gates lie centuries of history waiting to be explored.

Many families who migrated during partition had homes within these walls. The havelis (traditional mansions) with their intricate woodwork, the neighborhood mosques and temples, and the famous food streets all hold memories of pre-partition life.

Today, restoration efforts are bringing the Walled City back to its former glory. The Shahi Hammam (Royal Bath), the Wazir Khan Mosque with its stunning tile work, and the countless havelis are being preserved for future generations. For those seeking their roots, walking these ancient streets offers a tangible connection to their ancestors' world.`,
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2070",
  },
  {
    title: "The Mughal Legacy",
    content: `The Mughals transformed Lahore into one of the greatest cities of their empire. From Akbar to Aurangzeb, each emperor left his mark on the city. The Lahore Fort, with its ornate Sheesh Mahal (Palace of Mirrors), the magnificent Badshahi Mosque, and the serene Shalimar Gardens are testaments to their vision.

For heritage tourists, understanding the Mughal period is essential to appreciating Lahore's architecture and culture. The symmetry of Mughal gardens, the intricate tilework of their mosques, and the grandeur of their forts all reflect a civilization at its peak.

Our guided tours take you through this history, explaining not just the buildings but the lives of those who built and inhabited them. From the royal courts to the common markets, we bring the Mughal era to life.`,
    image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?q=80&w=2069",
  },
  {
    title: "Pre-Partition Lahore: A Cosmopolitan City",
    content: `Before 1947, Lahore was perhaps the most cosmopolitan city in Punjab. Hindu merchants traded in the markets of Shah Alami, Sikh families owned businesses on Mall Road, and Muslim scholars studied at the city's famous madrassas. This diversity made Lahore a unique cultural center.

The city was home to famous institutions like the Government College (now GCU), the King Edward Medical University, and the Punjab University. Students of all backgrounds studied here, many going on to become leaders in their respective fields.

The literary scene was particularly vibrant. Progressive writers gathered at cafes, Urdu poetry flourished in mushairas, and the film industry was beginning to take root. This cultural heritage, though divided by partition, continues to influence both sides of the border.`,
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=2025",
  },
];

export default function LahoreHistory() {
  useSEO({
    title: "Historic Lahore - Cultural Capital of Punjab",
    description: "Discover the rich history of Lahore, Punjab's cultural capital. Explore Badshahi Mosque, Lahore Fort, Shalimar Gardens, and the vibrant Walled City with centuries of Mughal heritage.",
    keywords: "Lahore history, Badshahi Mosque, Lahore Fort, Mughal architecture, Walled City, Punjab capital, Shalimar Gardens, heritage site",
    canonicalPath: "/tours/lahore-history",
  });

  return (
    <main className="flex-1">
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
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
            <div className="flex items-center justify-center gap-3 mb-4">
              <Landmark className="w-12 h-12 text-primary" />
            </div>
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-white drop-shadow-lg">
              Historic Lahore
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto font-light">
              Discover the rich history of the cultural capital of Punjab
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
              Historic Landmarks
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl">
              Lahore's historic sites span centuries of history, from Mughal masterpieces to Sufi shrines.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {landmarks.map((landmark, i) => (
              <motion.div key={landmark.name} {...fadeIn} transition={{ delay: i * 0.1 }}>
                <Card className="overflow-hidden h-full" data-testid={`card-landmark-${i}`}>
                  <div className="aspect-[16/9] relative">
                    <img
                      src={landmark.image}
                      alt={landmark.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-amber-500 text-white text-sm rounded-full font-semibold">
                        Est. {landmark.year}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <h3 className="font-serif text-2xl font-bold text-white">{landmark.name}</h3>
                      <p className="text-white/80 text-sm">{landmark.significance}</p>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground">{landmark.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="space-y-20">
            {articles.map((article, i) => (
              <motion.article
                key={article.title}
                {...fadeIn}
                transition={{ delay: i * 0.1 }}
              >
                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center`}>
                  <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                    <div className="aspect-[4/3] rounded-xl overflow-hidden">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover sepia-[0.2]"
                      />
                    </div>
                  </div>
                  <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                    <div className="flex items-center gap-2 mb-4">
                      <BookOpen className="w-5 h-5 text-primary" />
                      <span className="text-primary text-sm font-semibold">Article</span>
                    </div>
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
          </div>

          <motion.div {...fadeIn} className="mt-20 text-center">
            <Card className="bg-primary/5 border-primary/20 p-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Crown className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-secondary mb-4">
                Experience Historic Lahore
              </h3>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Join us for a guided tour of Lahore's most significant historical sites and discover the stories behind these magnificent monuments.
              </p>
              <Link href="/tours#inquiry">
                <Button size="lg" className="bg-primary text-white" data-testid="button-book-lahore-tour">
                  Book a Lahore Tour
                </Button>
              </Link>
            </Card>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
