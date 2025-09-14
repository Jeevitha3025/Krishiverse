import { useLocation } from "wouter";
import { useUser } from "@/contexts/user-context";
import { Button } from "@/components/ui/button";
import { t, LanguageCode } from "@/lib/i18n";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sprout } from "lucide-react";
import { useEffect } from "react";

export default function Welcome() {
  const [, setLocation] = useLocation();
  const { user, language, setLanguage } = useUser();

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  return (
    <div className="min-h-screen flex flex-col" data-testid="welcome-screen">
      {/* Language Selection Header */}
      <div className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold" data-testid="app-title">KrishiGrow</h1>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="bg-primary-foreground text-primary w-24" data-testid="language-selector">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="hi">हिंदी</SelectItem>
            <SelectItem value="te">తెలుగు</SelectItem>
            <SelectItem value="ta">தமிழ்</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex-1 flex flex-col justify-center items-center p-6 text-center">
        {/* Agricultural landscape image placeholder */}
        <div className="mb-8">
          <div className="w-full max-w-md h-48 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl shadow-lg flex items-center justify-center">
            <img 
              src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400" 
              alt="Beautiful green farmland with sustainable farming practices" 
              className="rounded-2xl shadow-lg w-full h-full object-cover"
              data-testid="hero-image"
            />
          </div>
        </div>
        
        <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mb-6 animate-pulse-glow" data-testid="main-icon">
          <Sprout className="text-success-foreground h-8 w-8" />
        </div>
        
        <h1 className="text-3xl font-bold text-primary mb-4" data-testid="welcome-title">
          {t("welcome", language as LanguageCode)}
        </h1>
        <p className="text-lg text-muted-foreground mb-2">Grow Sustainably, Earn Rewards</p>
        <p className="text-muted-foreground mb-8 max-w-md">
          Transform your farming with gamified quests, community support, and smart agricultural guidance.
        </p>
        
        <div className="space-y-3 w-full max-w-sm">
          <Button
            onClick={() => setLocation("/onboarding")}
            className="w-full bg-primary text-primary-foreground py-4 px-6 text-lg hover:bg-primary/90"
            size="lg"
            data-testid="button-get-started"
          >
            {t("getStarted", language as LanguageCode)}
          </Button>
          <Button
            onClick={() => setLocation("/dashboard")}
            variant="outline"
            className="w-full py-4 px-6 text-lg border-border hover:bg-muted"
            size="lg"
            data-testid="button-existing-account"
          >
            {t("alreadyHaveAccount", language as LanguageCode)}
          </Button>
        </div>
      </div>
    </div>
  );
}
