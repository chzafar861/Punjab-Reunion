import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSEO } from "@/hooks/use-seo";
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

const cities = [
  {
    name: "Lahore Today",
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=2070",
    description: "Pakistan's cultural capital blends ancient heritage with modern development. From the historic Walled City to the trendy cafes of Gulberg, Lahore offers the best of both worlds.",
    highlights: ["MM Alam Road", "Packages Mall", "Fortress Stadium", "DHA"],
  },
  {
    name: "Islamabad",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070",
    description: "The planned capital city features wide boulevards, modern architecture, and the stunning Faisal Mosque. A hub for diplomacy and business in South Asia.",
    highlights: ["Faisal Mosque", "Daman-e-Koh", "Centaurus Mall", "Margalla Hills"],
  },
  {
    name: "Karachi",
    image: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=2070",
    description: "Pakistan's largest city and economic hub. A metropolis of over 15 million people, Karachi is the financial heart of the country.",
    highlights: ["Clifton Beach", "Port Grand", "DO Darya", "Saddar"],
  },
  {
    name: "Faisalabad",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070",
    description: "Once known as Lyallpur, this industrial city is the textile capital of Pakistan. Many diaspora families trace their roots to this prosperous city.",
    highlights: ["Clock Tower", "Canal Road", "Textile Mills", "Agricultural University"],
  },
];

const articles = [
  {
    title: "Pakistan's Economic Transformation",
    content: `Modern Pakistan is undergoing a remarkable transformation. Major cities are seeing unprecedented development with new infrastructure, shopping centers, and business districts emerging across the country.

The China-Pakistan Economic Corridor (CPEC) has brought billions in investment, creating new highways, ports, and economic zones. Cities like Gwadar are emerging as future economic hubs, while established cities like Lahore and Karachi continue to modernize.

For diaspora visitors, this transformation can be surprising. The Pakistan they heard about from their grandparents has evolved into a country of smartphones, food delivery apps, and modern shopping malls - while still retaining its cultural traditions and hospitality.`,
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070",
  },
  {
    title: "A Culinary Journey Through Modern Pakistan",
    content: `Pakistani cuisine has always been celebrated, but today's food scene combines traditional flavors with modern presentation. From the street food of Lahore's Food Street to the upscale restaurants of Islamabad's F-7, there's something for every palate.

The famous dishes remain - nihari, biryani, seekh kebabs, and halwa puri - but they're now served alongside international cuisine in trendy cafes and restaurants. Coffee culture has taken root, with specialty coffee shops appearing in every major city.

Our heritage tours include culinary experiences that let you taste the foods your ancestors enjoyed, prepared in traditional ways. We'll take you to the oldest establishments in the Walled City where recipes have been passed down for generations.`,
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=2070",
  },
  {
    title: "Connecting the Old and New",
    content: `For those visiting Pakistan to trace their roots, the contrast between the old and new can be striking. Your ancestral village might now be connected by a modern highway, and the city your grandparents remembered might have grown tenfold.

This is where our services become invaluable. We help bridge this gap, guiding you through modern Pakistan while helping you find the traces of the past. We know which neighborhoods have retained their character, which families have lived in the same areas for generations, and where to find the authentic experiences that connect you to your heritage.

Whether you want to explore the modern shopping districts, visit historic sites, or find the exact street where your family once lived, we make it possible. Pakistan welcomes its diaspora with open arms, and we're here to help you experience both the Pakistan of your ancestors and the Pakistan of today.`,
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=2070",
  },
  {
    title: "Travel Tips for Diaspora Visitors",
    content: `Visiting Pakistan for the first time (or returning after years) requires some preparation. The country has changed significantly, and knowing what to expect makes the journey smoother.

Visa processes have been streamlined for many countries, with online visa applications and special visa categories for people of Pakistani origin. Major cities have Uber and local ride-hailing apps, making transportation convenient. English is widely spoken in urban areas, though knowing some Urdu or Punjabi helps in rural villages.

The best time to visit is October through March when the weather is pleasant. Ramadan is a special time to visit for the cultural experience, though some services may be limited during fasting hours. We recommend booking heritage tours well in advance, especially for village visits that require coordination with local contacts.

Mobile connectivity is excellent throughout the country, with 4G coverage in most urban and semi-urban areas. This makes it easy to stay connected with family back home while documenting your heritage journey.`,
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2070",
  },
];

export default function ModernCities() {
  useSEO({
    title: "Modern Pakistan - Contemporary Cities and Travel",
    description: "Experience the vibrant, developing cities of modern Pakistan. Explore Lahore, Islamabad, Karachi and Faisalabad with travel tips for diaspora visitors returning to their roots.",
    keywords: "modern Pakistan, Lahore today, Islamabad, Karachi, Faisalabad, Pakistan travel, diaspora visit, CPEC development",
    canonicalPath: "/tours/modern-cities",
  });

  return (
    <main className="flex-1">
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=2070"
            alt="Modern City Skyline"
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
              Modern Pakistan
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto font-light">
              Experience the vibrant, developing cities of today's Pakistan
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
              Major Cities of Pakistan
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl">
              From the cultural heart of Lahore to the economic powerhouse of Karachi, 
              discover what Pakistan's cities offer today.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {cities.map((city, i) => (
              <motion.div key={city.name} {...fadeIn} transition={{ delay: i * 0.1 }}>
                <Card className="overflow-hidden h-full" data-testid={`card-city-${i}`}>
                  <div className="aspect-[16/9] relative">
                    <img
                      src={city.image}
                      alt={city.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <h3 className="font-serif text-2xl font-bold text-white">{city.name}</h3>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground mb-4">{city.description}</p>
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
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                    <div className="flex items-center gap-2 mb-4">
                      <Globe className="w-5 h-5 text-primary" />
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
                <Plane className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-secondary mb-4">
                Plan Your Pakistan Trip
              </h3>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Let us help you plan a comprehensive tour that combines heritage exploration with modern city experiences.
              </p>
              <Link href="/tours#inquiry">
                <Button size="lg" className="bg-primary text-white" data-testid="button-plan-trip">
                  Start Planning
                </Button>
              </Link>
            </Card>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
