import { Link, useLocation } from "wouter";
import { Menu, X, Globe, User, LogOut, FileText, PlusCircle, ShoppingBag, Settings, Package, ClipboardList, Users, Shield } from "lucide-react";
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
import { LanguageSelector } from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading, authReady, logout, isLoggingOut } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [settingUpAdmin, setSettingUpAdmin] = useState(false);
  
  // Check if any admin exists - only show "Become Admin" if NO admins exist
  // Wait for auth to be ready before checking to ensure consistent behavior
  const { data: hasAdminData, isFetched: adminCheckDone } = useQuery<{ hasAdmin: boolean }>({
    queryKey: ["/api/auth/has-admin"],
    staleTime: 60000, // Cache for 1 minute
    enabled: authReady, // Only check after auth is ready
  });
  const systemHasAdmin = !adminCheckDone || (hasAdminData?.hasAdmin ?? true); // Default to true to hide button until checked
  
  const handleBecomeAdmin = async () => {
    setSettingUpAdmin(true);
    try {
      const response = await apiRequest("POST", "/api/auth/setup-admin");
      const data = await response.json();
      if (data.success) {
        toast({ title: "Success", description: "You are now an admin! Refreshing..." });
        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
        setTimeout(() => window.location.reload(), 1000);
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to set up admin", variant: "destructive" });
    } finally {
      setSettingUpAdmin(false);
    }
  };

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/directory", label: t("nav.directory") },
    { href: "/tours", label: t("nav.tours") },
    { href: "/shop", label: t("nav.shop") },
    { href: "/contact", label: t("nav.contact") },
  ];
  
  const isAdmin = user?.role === "admin";
  const canSubmitProfiles = isAdmin || user?.canSubmitProfiles === true;

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
                {canSubmitProfiles && (
                  <Link href="/submit">
                    <Button variant="default" size="sm" className="gap-1" data-testid="button-submit-profile">
                      <PlusCircle className="h-4 w-4" />
                      {t("nav.submit")}
                    </Button>
                  </Link>
                )}
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
                        {t("nav.myProfiles")}
                      </Link>
                    </DropdownMenuItem>
                    {/* Only show "Become Admin" if NO admins exist in the system (first-time setup) */}
                    {!isAdmin && !systemHasAdmin && (
                      <DropdownMenuItem asChild>
                        <button
                          type="button"
                          onClick={handleBecomeAdmin}
                          disabled={settingUpAdmin}
                          className="cursor-pointer w-full text-left"
                          data-testid="button-become-admin"
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          {settingUpAdmin ? "Setting up..." : "Become Admin"}
                        </button>
                      </DropdownMenuItem>
                    )}
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin/products" className="cursor-pointer" data-testid="link-admin-products">
                            <Package className="mr-2 h-4 w-4" />
                            Manage Products
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/admin/orders" className="cursor-pointer" data-testid="link-admin-orders">
                            <ClipboardList className="mr-2 h-4 w-4" />
                            Manage Orders
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/admin/users" className="cursor-pointer" data-testid="link-admin-users">
                            <Users className="mr-2 h-4 w-4" />
                            Manage Users
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <a
                        href="/api/logout"
                        className="cursor-pointer w-full text-left flex items-center"
                        data-testid="button-logout"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        {t("nav.logout")}
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <LanguageSelector />
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" data-testid="link-login-nav">
                    {t("nav.login")}
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="default" data-testid="link-signup-nav">
                    {t("nav.signup")}
                  </Button>
                </Link>
                <LanguageSelector />
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
                  {canSubmitProfiles && (
                    <Link 
                      href="/submit"
                      className={`text-lg font-medium py-2 ${
                        location === "/submit" ? "text-primary" : "text-secondary"
                      }`}
                      onClick={() => setIsOpen(false)}
                      data-testid="link-nav-mobile-submit"
                    >
                      {t("nav.submit")}
                    </Link>
                  )}
                  <Link 
                    href="/my-profiles"
                    className={`text-lg font-medium py-2 ${
                      location === "/my-profiles" ? "text-primary" : "text-secondary"
                    }`}
                    onClick={() => setIsOpen(false)}
                    data-testid="link-nav-mobile-my-profiles"
                  >
                    {t("nav.myProfiles")}
                  </Link>
                  {isAdmin && (
                    <>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide mt-2">Admin</div>
                      <Link 
                        href="/admin/products"
                        className={`text-lg font-medium py-2 flex items-center gap-2 ${
                          location === "/admin/products" ? "text-primary" : "text-secondary"
                        }`}
                        onClick={() => setIsOpen(false)}
                        data-testid="link-nav-mobile-admin-products"
                      >
                        <Package className="w-5 h-5" />
                        Manage Products
                      </Link>
                      <Link 
                        href="/admin/orders"
                        className={`text-lg font-medium py-2 flex items-center gap-2 ${
                          location === "/admin/orders" ? "text-primary" : "text-secondary"
                        }`}
                        onClick={() => setIsOpen(false)}
                        data-testid="link-nav-mobile-admin-orders"
                      >
                        <ClipboardList className="w-5 h-5" />
                        Manage Orders
                      </Link>
                      <Link 
                        href="/admin/users"
                        className={`text-lg font-medium py-2 flex items-center gap-2 ${
                          location === "/admin/users" ? "text-primary" : "text-secondary"
                        }`}
                        onClick={() => setIsOpen(false)}
                        data-testid="link-nav-mobile-admin-users"
                      >
                        <Users className="w-5 h-5" />
                        Manage Users
                      </Link>
                    </>
                  )}
                </>
              )}
              <div className="pt-2 border-t border-border flex items-center justify-between">
                {isAuthenticated ? (
                  <a
                    href="/api/logout"
                    className="text-lg font-medium py-2 text-secondary flex items-center gap-2 text-left"
                    data-testid="button-mobile-logout"
                  >
                    <LogOut className="h-5 w-5" />
                    {t("nav.logout")}
                  </a>
                ) : (
                  <div className="flex gap-4">
                    <Link 
                      href="/login"
                      className="text-lg font-medium py-2 text-primary"
                      onClick={() => setIsOpen(false)}
                      data-testid="button-mobile-login"
                    >
                      {t("nav.login")}
                    </Link>
                    <Link 
                      href="/signup"
                      className="text-lg font-medium py-2 text-secondary"
                      onClick={() => setIsOpen(false)}
                      data-testid="button-mobile-signup"
                    >
                      {t("nav.signup")}
                    </Link>
                  </div>
                )}
                <LanguageSelector />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
