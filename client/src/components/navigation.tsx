import { useLocation } from "wouter";
import { useUser } from "@/contexts/user-context";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Target, 
  Trophy, 
  TrendingUp, 
  User, 
  FileText,
  Sprout,
  Volume2
} from "lucide-react";
import { t, speakText, LanguageCode } from "@/lib/i18n";

export default function Navigation() {
  const [location, setLocation] = useLocation();
  const { user, language, setLanguage } = useUser();

  if (!user && location !== "/" && location !== "/onboarding") {
    return null;
  }

  const navItems = [
    { path: "/dashboard", icon: Home, label: t("dashboard", language as LanguageCode) },
    { path: "/quests", icon: Target, label: t("quests", language as LanguageCode) },
    { path: "/leaderboard", icon: Trophy, label: t("community", language as LanguageCode) },
    { path: "/market", icon: TrendingUp, label: t("market", language as LanguageCode) },
    { path: "/profile", icon: User, label: t("profile", language as LanguageCode) },
  ];

  const desktopNavItems = [
    ...navItems.slice(0, 2),
    { path: "/schemes", icon: FileText, label: "Govt Schemes" },
    ...navItems.slice(2),
  ];

  const handleSpeak = (text: string) => {
    speakText(text, language as LanguageCode);
  };

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden mobile-bottom-nav bg-card border-t border-border" data-testid="mobile-navigation">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <Button
                key={item.path}
                variant="ghost"
                size="sm"
                onClick={() => setLocation(item.path)}
                className={`flex flex-col items-center p-2 h-auto space-y-1 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
                data-testid={`nav-${item.path.slice(1)}`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed left-0 top-0 h-full w-64 bg-card border-r border-border z-50" data-testid="desktop-sidebar">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Sprout className="text-primary-foreground h-6 w-6" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-primary">KrishiGrow</h1>
              <p className="text-xs text-muted-foreground">{t("sustainableFarming", language as LanguageCode)}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSpeak("KrishiGrow - Sustainable Farming Platform")}
              className="ml-auto"
              data-testid="speak-title"
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="mb-6">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background"
              data-testid="language-selector"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="te">తెలుగు</option>
              <option value="ta">தமிழ்</option>
            </select>
          </div>

          <nav className="space-y-2">
            {desktopNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "secondary" : "ghost"}
                  onClick={() => setLocation(item.path)}
                  className="w-full justify-start"
                  data-testid={`nav-${item.path.slice(1)}`}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
