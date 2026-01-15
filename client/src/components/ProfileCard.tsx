import { type Profile } from "@shared/schema";
import { MapPin, Calendar, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useSignedUrl } from "@/hooks/use-signed-url";
import { useLanguage } from "@/contexts/LanguageContext";

export function ProfileCard({ profile, index = 0 }: { profile: Profile; index?: number }) {
  const { t } = useLanguage();
  const placeholderImage = "https://images.unsplash.com/photo-1544256658-63640b7952a2?w=400&h=400&fit=crop"; 
  const imageUrl = useSignedUrl(profile.photoUrl);

  return (
    <Link href={`/profile/${profile.id}`}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
        className="group relative bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-border cursor-pointer"
        data-testid={`card-profile-${profile.id}`}
      >
        <div className="aspect-[4/3] overflow-hidden bg-muted relative">
          <img 
            src={imageUrl || placeholderImage} 
            alt={profile.fullName}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
            <span className="text-white font-medium text-sm">{t("profile.readFullStory")}</span>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-2 text-primary font-medium text-xs uppercase tracking-wider mb-2">
            <MapPin className="w-3 h-3" />
            <span>{profile.district}</span>
          </div>

          <h3 className="font-serif text-xl font-bold text-foreground mb-2 line-clamp-1">
            {profile.fullName}
          </h3>

          <div className="space-y-1 mb-4 text-muted-foreground text-sm">
            <p className="flex items-center gap-2">
              <span className="font-semibold text-foreground/80">{t("profile.village")}:</span> {profile.villageName}
            </p>
            {profile.yearLeft && (
              <p className="flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                <span>{t("myProfiles.leftIn")} {profile.yearLeft}</span>
              </p>
            )}
          </div>

          <div className="inline-flex items-center gap-2 text-primary font-semibold text-sm">
            {t("profile.viewProfile")} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
