import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { LanguageProvider } from "@/contexts/LanguageContext";

// Pages
import Home from "@/pages/Home";
import Directory from "@/pages/Directory";
import ProfileDetail from "@/pages/ProfileDetail";
import SubmitProfile from "@/pages/SubmitProfile";
import Contact from "@/pages/Contact";
import HeritageTours from "@/pages/HeritageTours";
import PunjabVillages from "@/pages/PunjabVillages";
import LahoreHistory from "@/pages/LahoreHistory";
import ModernCities from "@/pages/ModernCities";
import MyProfiles from "@/pages/MyProfiles";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import VerifyEmail from "@/pages/VerifyEmail";
import NotFound from "@/pages/not-found";

// Helper layout
function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navigation />
      {children}
      <Footer />
    </div>
  );
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/directory" component={Directory} />
        <Route path="/profile/:id" component={ProfileDetail} />
        <Route path="/submit" component={SubmitProfile} />
        <Route path="/tours" component={HeritageTours} />
        <Route path="/tours/villages" component={PunjabVillages} />
        <Route path="/tours/lahore-history" component={LahoreHistory} />
        <Route path="/tours/modern-cities" component={ModernCities} />
        <Route path="/contact" component={Contact} />
        <Route path="/my-profiles" component={MyProfiles} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/verify-email" component={VerifyEmail} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <Router />
          <Toaster />
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
