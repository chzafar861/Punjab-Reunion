import { Link, useLocation } from "wouter";
import { Menu, X, Globe, User, LogOut, FileText, PlusCircle } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading, logout, isLoggingOut } = useAuth();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/directory", label: "Directory" },
    { href: "/tours", label: "Heritage Tours" },
    { href: "/contact", label: "Contact Us" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors">
              <Globe className="w-6 h-6 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold text-secondary tracking-tight">47DaPunjab</span>
              <span className="text-xs text-muted-foreground uppercase tracking-widest font-sans">Connecting Roots</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === link.href ? "text-primary font-bold" : "text-secondary"
                }`}
                data-testid={`link-nav-${link.href.replace("/", "") || "home"}`}
              >
                {link.label}
              </Link>
            ))}
            {isLoading ? null : isAuthenticated ? (
              <>
                <Link href="/submit">
                  <Button variant="default" size="sm" className="gap-1" data-testid="button-submit-profile">
                    <PlusCircle className="h-4 w-4" />
                    Submit Profile
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2" data-testid="button-user-menu">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.profileImageUrl || undefined} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-base font-semibold">{user?.username || user?.firstName || "Account"}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/my-profiles" className="cursor-pointer" data-testid="link-my-profiles">
                        <FileText className="mr-2 h-4 w-4" />
                        My Profiles
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <button
                        type="button"
                        onClick={() => logout(undefined, { onSuccess: () => setLocation("/") })}
                        className="cursor-pointer w-full text-left"
                        data-testid="button-logout"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" data-testid="button-login">
                    LogIn
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="default" data-testid="button-signup">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-secondary"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-border bg-background"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={`text-lg font-medium py-2 ${
                    location === link.href ? "text-primary" : "text-secondary"
                  }`}
                  onClick={() => setIsOpen(false)}
                  data-testid={`link-nav-mobile-${link.href.replace("/", "") || "home"}`}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && (
                <>
                  <Link 
                    href="/submit"
                    className={`text-lg font-medium py-2 ${
                      location === "/submit" ? "text-primary" : "text-secondary"
                    }`}
                    onClick={() => setIsOpen(false)}
                    data-testid="link-nav-mobile-submit"
                  >
                    Submit Profile
                  </Link>
                  <Link 
                    href="/my-profiles"
                    className={`text-lg font-medium py-2 ${
                      location === "/my-profiles" ? "text-primary" : "text-secondary"
                    }`}
                    onClick={() => setIsOpen(false)}
                    data-testid="link-nav-mobile-my-profiles"
                  >
                    My Profiles
                  </Link>
                </>
              )}
              <div className="pt-2 border-t border-border">
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => {
                      logout(undefined, { onSuccess: () => setLocation("/") });
                      setIsOpen(false);
                    }}
                    className="text-lg font-medium py-2 text-secondary flex items-center gap-2 w-full text-left"
                    data-testid="button-mobile-logout"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link 
                      href="/login"
                      className="text-lg font-medium py-2 text-primary"
                      onClick={() => setIsOpen(false)}
                      data-testid="button-mobile-login"
                    >
                      Sign In
                    </Link>
                    <Link 
                      href="/signup"
                      className="text-lg font-medium py-2 text-secondary"
                      onClick={() => setIsOpen(false)}
                      data-testid="button-mobile-signup"
                    >
                      Create Account
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
