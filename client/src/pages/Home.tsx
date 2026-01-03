import { useState } from "react";
import { useLocation } from "wouter";
import { Search, ArrowRight, Users, Map, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { useProfiles } from "@/hooks/use-profiles";
import { ProfileCard } from "@/components/ProfileCard";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [search, setSearch] = useState("");
  const [, setLocation] = useLocation();
  const { data: profiles, isLoading } = useProfiles();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      setLocation(`/directory?search=${encodeURIComponent(search)}`);
    }
  };

  const featuredProfiles = profiles?.slice(0, 3) || [];

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          {/* Unsplash image: Punjab fields sunset rural */}
          <img 
            src="https://images.unsplash.com/photo-1541364577457-4186419504f7?q=80&w=2070&auto=format&fit=crop"
            alt="Rural Punjab Landscape"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-background"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-white drop-shadow-lg leading-tight">
              Reconnecting Roots <br/> 
              <span className="text-primary italic">Across Borders</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto font-light leading-relaxed">
              Help us document the stories of Sikhs who left their ancestral villages. 
              A digital archive to find lost connections and preserve our heritage.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mt-10 max-w-2xl mx-auto relative group">
              <div className="relative flex items-center p-2 bg-white rounded-full shadow-2xl transform transition-transform group-hover:scale-[1.01]">
                <Search className="absolute left-6 w-6 h-6 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by Village, District or Name..."
                  className="w-full py-4 pl-16 pr-36 rounded-full border-none focus:ring-0 text-lg bg-transparent text-foreground placeholder:text-muted-foreground/60"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Button 
                  type="submit" 
                  className="absolute right-2 top-2 bottom-2 rounded-full px-8 bg-primary hover:bg-primary/90 text-white font-semibold text-lg"
                >
                  Search
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Stats / Mission Section */}
      <section className="py-24 bg-background border-b border-border/40">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {[
              { icon: Users, title: "Find Relatives", desc: "Search our database for family members separated during migration." },
              { icon: BookOpen, title: "Share Stories", desc: "Document the oral histories of your elders before they are lost." },
              { icon: Map, title: "Connect Villages", desc: "Bridge the gap between current locations and ancestral homes." }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="flex flex-col items-center space-y-4 p-6 rounded-2xl bg-white border border-border/50 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <item.icon className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-secondary">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Profiles Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-serif text-4xl font-bold text-secondary mb-3">Recently Added Profiles</h2>
              <p className="text-muted-foreground">Recent entries from our growing community archive.</p>
            </div>
            <Button 
              variant="outline" 
              className="hidden md:flex gap-2 border-primary text-primary hover:bg-primary/5"
              onClick={() => setLocation("/directory")}
            >
              View All <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-96 bg-gray-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredProfiles.map((profile, i) => (
                <ProfileCard key={profile.id} profile={profile} index={i} />
              ))}
            </div>
          )}

          <div className="mt-12 text-center md:hidden">
            <Button 
              className="w-full bg-white border border-input shadow-sm"
              onClick={() => setLocation("/directory")}
            >
              View Directory
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-secondary text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pattern-dots"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">Do you know someone who left?</h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">
            Your contribution could be the key to reuniting a family or preserving a precious memory. 
            It takes less than 5 minutes to create a profile.
          </p>
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-white rounded-full shadow-xl shadow-black/20"
            onClick={() => setLocation("/submit")}
            data-testid="button-submit-profile-cta"
          >
            Submit a Profile
          </Button>
        </div>
      </section>
    </main>
  );
}
