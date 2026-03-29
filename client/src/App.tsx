import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider, useUser } from "@/contexts/user-context";

// Page Imports
import Navigation from "@/components/navigation";
import NotFound from "@/pages/not-found";
import Welcome from "@/pages/welcome";
import AuthPage from "@/pages/auth-page"; // 👈 Added Auth Page
import Onboarding from "@/pages/onboarding";
import Dashboard from "@/pages/dashboard";
import Quests from "@/pages/quests";
import Leaderboard from "@/pages/leaderboard";
import Schemes from "@/pages/schemes";
import Market from "@/pages/market";
import Profile from "@/pages/profile";

function Router() {
  const { user, isLoading } = useUser();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // 1. Wait for Firebase to finish checking
    if (isLoading) return;

    // 2. Define pages that anyone can see without logging in
    const publicPaths = ["/", "/auth"];
    const isPublicPath = publicPaths.includes(location);

    // 3. The Traffic Cop Rules:
    if (!user && !isPublicPath) {
      // Not logged in + trying to see a private page? Go to Login.
      setLocation("/auth");
    } else if (user && isPublicPath) {
      // Logged in + trying to see the Welcome/Login page? Go to Dashboard.
      setLocation("/dashboard");
    }
  }, [user, isLoading, location, setLocation]);

  // Show a loading screen while Firebase connects
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-green-700 font-medium">
        Loading KrishiVerse...
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Welcome} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/quests" component={Quests} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/schemes" component={Schemes} />
      <Route path="/market" component={Market} />
      <Route path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UserProvider>
          {/* Layout wrapper to ensure the sidebar doesn't overlap your pages */}
          <div className="min-h-screen bg-background">
            <Navigation />
            <main className="md:pl-64 pb-16 md:pb-0 min-h-screen">
              <Router />
            </main>
          </div>
          <Toaster />
        </UserProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;