import { Link } from "wouter";
import { Heart } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function Footer() {
  const { user } = useAuth();
  const canSubmitProfiles = user?.role === "admin" || user?.canSubmitProfiles === true;

  return (
    <footer className="bg-secondary text-secondary-foreground py-12 border-t border-primary/20 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-serif text-2xl font-bold text-white">47DaPunjab</h3>
            <p className="text-secondary-foreground/70 max-w-sm leading-relaxed">
              Dedicated to the memories of those who left their homes. A digital bridge connecting families separated by time and borders.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-semibold text-primary">Explore</h4>
            <ul className="space-y-2">
              <li><Link href="/directory" className="hover:text-primary transition-colors">Browse Directory</Link></li>
              <li><Link href="/shop" className="hover:text-primary transition-colors">Heritage Shop</Link></li>
              {canSubmitProfiles && (
                <li><Link href="/submit" className="hover:text-primary transition-colors">Submit a Profile</Link></li>
              )}
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-semibold text-primary">Get in Touch</h4>
            <p className="text-secondary-foreground/70">
              Have questions or need help finding someone?
            </p>
            <a href="mailto:info@47dapunjab.com" className="text-white hover:text-primary underline transition-colors">
              info@47dapunjab.com
            </a>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center flex items-center justify-center gap-2 text-sm text-secondary-foreground/50">
          <span>Made with</span>
          <Heart className="w-4 h-4 text-red-400 fill-red-400" />
          <span>for the Panjab community</span>
        </div>
      </div>
    </footer>
  );
}
