import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider } from "@/contexts/user-context";
import Navigation from "@/components/navigation";
import NotFound from "@/pages/not-found";
import Welcome from "@/pages/welcome";
import Onboarding from "@/pages/onboarding";
import Dashboard from "@/pages/dashboard";
import Quests from "@/pages/quests";
import Leaderboard from "@/pages/leaderboard";
import Schemes from "@/pages/schemes";
import Market from "@/pages/market";
import Profile from "@/pages/profile";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Welcome} />
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
          <Navigation />
          <Router />
          <Toaster />
        </UserProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
