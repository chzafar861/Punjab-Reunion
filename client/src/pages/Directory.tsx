import { useState } from "react";
import { useLocation } from "wouter";
import { Search, Filter, Loader2 } from "lucide-react";
import { useProfiles } from "@/hooks/use-profiles";
import { ProfileCard } from "@/components/ProfileCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSEO } from "@/hooks/use-seo";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Directory() {
  const { t } = useLanguage();
  
  useSEO({
    title: "Profile Directory - Search Ancestral Records",
    description: "Browse and search through our directory of profiles documenting families who migrated during the 1947 partition. Find records by village name, district, or family name.",
    keywords: "partition records, Punjab directory, ancestral village search, family records 1947, Sikh migration records, Pakistan Punjab villages",
    canonicalPath: "/directory",
  });

  const [location] = useLocation();
  // Parse search params from URL manually since wouter doesn't provide a hook for it yet easily
  const searchParams = new URLSearchParams(window.location.search);
  const initialSearch = searchParams.get("search") || "";
  
  const [search, setSearch] = useState(initialSearch);
  const [district, setDistrict] = useState<string>("");
  
  // Debounce could be added here for production
  const { data: profiles, isLoading } = useProfiles(search, district === "all" ? "" : district);

  // Derive unique districts for filter (filter out empty strings)
  const districts = Array.from(new Set(profiles?.map(p => p.district).filter(d => d && d.trim()) || [])).sort();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-secondary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">{t("directory.title")}</h1>
          <p className="text-white/70 max-w-2xl mx-auto">
            {t("directory.subtitle")}
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="container mx-auto px-4 -mt-8">
        <div className="bg-white rounded-xl shadow-lg border border-border p-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input 
              placeholder={t("directory.search")} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
          
          <div className="w-full md:w-64">
            <Select value={district} onValueChange={setDistrict}>
              <SelectTrigger className="h-12 w-full">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <SelectValue placeholder="Filter by District" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Districts</SelectItem>
                {districts.map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="container mx-auto px-4 mt-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">{t("common.loading")}</p>
          </div>
        ) : profiles?.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed border-border">
            <h3 className="text-xl font-bold text-secondary mb-2">{t("directory.noResults")}</h3>
            <p className="text-muted-foreground mb-6">{t("common.retry")}</p>
            <Button variant="outline" onClick={() => { setSearch(""); setDistrict("all"); }}>
              {t("common.retry")}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <span className="text-muted-foreground">Showing {profiles?.length} results</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {profiles?.map((profile, i) => (
                <ProfileCard key={profile.id} profile={profile} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
