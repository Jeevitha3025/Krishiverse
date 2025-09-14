import { useUser } from "@/contexts/user-context";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import VirtualFarm from "@/components/virtual-farm";
import { Coins, Star, Sprout, Bell, CloudSun, Lightbulb, Target } from "lucide-react";
import { useLocation } from "wouter";
import { t, LanguageCode } from "@/lib/i18n";

export default function Dashboard() {
  const { user, farm, progress, language } = useUser();
  const [, setLocation] = useLocation();

  const { data: userQuests } = useQuery({
    queryKey: ['/api/user-quests', user?.id],
    enabled: !!user?.id,
  });

  const { data: quests } = useQuery({
    queryKey: ['/api/quests'],
  });

  if (!user || !farm || !progress) {
    return (
      <div className="min-h-screen mobile-content flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Please complete your profile setup</p>
          <Button onClick={() => setLocation("/onboarding")} className="mt-4">
            Complete Setup
          </Button>
        </div>
      </div>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return language === 'hi' ? 'सुप्रभात' : 'Good morning';
    if (hour < 17) return language === 'hi' ? 'नमस्कार' : 'Good afternoon';
    return language === 'hi' ? 'शुभ संध्या' : 'Good evening';
  };

  const getActiveQuests = () => {
    if (!userQuests || !quests || !Array.isArray(userQuests) || !Array.isArray(quests)) return [];
    const activeUserQuests = userQuests.filter((uq: any) => uq.status === 'in_progress');
    return activeUserQuests.map((uq: any) => {
      const quest = quests.find((q: any) => q.id === uq.questId);
      return { userQuest: uq, quest };
    }).filter((item: any) => item.quest);
  };

  const activeQuests = getActiveQuests();

  return (
    <div className="min-h-screen mobile-content" data-testid="dashboard-screen">
      {/* Header with Profile */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center" data-testid="user-avatar">
              <span className="font-bold text-accent-foreground">
                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm opacity-90" data-testid="greeting">
                {getGreeting()},
              </p>
              <p className="font-semibold" data-testid="user-name">{user.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="relative text-primary-foreground hover:bg-primary-foreground/10">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full"></span>
            </Button>
          </div>
        </div>
        
        {/* Farmer Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-primary-foreground/10 rounded-lg p-3 text-center" data-testid="coins-stat">
            <Coins className="text-accent mx-auto mb-1 h-5 w-5" />
            <p className="text-2xl font-bold">{progress.totalCoins.toLocaleString()}</p>
            <p className="text-xs opacity-90">{t("coins", language as LanguageCode)}</p>
          </div>
          <div className="bg-primary-foreground/10 rounded-lg p-3 text-center" data-testid="level-stat">
            <Star className="text-accent mx-auto mb-1 h-5 w-5" />
            <p className="text-2xl font-bold">{t("level", language as LanguageCode)} {progress.level}</p>
            <p className="text-xs opacity-90">Eco Farmer</p>
          </div>
          <div className="bg-primary-foreground/10 rounded-lg p-3 text-center" data-testid="sustainability-stat">
            <Sprout className="text-success mx-auto mb-1 h-5 w-5" />
            <p className="text-2xl font-bold">{progress.sustainabilityScore}%</p>
            <p className="text-xs opacity-90">{t("sustainability", language as LanguageCode)}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Virtual Farm */}
        <VirtualFarm farm={farm} progress={progress} />

        {/* Active Quests Preview */}
        <Card data-testid="active-quests-card">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">{t("todaysQuests", language as LanguageCode)}</CardTitle>
              <Button
                variant="ghost"
                onClick={() => setLocation("/quests")}
                className="text-primary text-sm font-medium"
                data-testid="button-view-all-quests"
              >
                {t("viewAll", language as LanguageCode)}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeQuests.length > 0 ? (
              activeQuests.slice(0, 2).map(({ userQuest, quest }: any, index: number) => {
                const progressPercentage = userQuest.progress ? 
                  Math.round((userQuest.progress.filter(Boolean).length / quest.steps.length) * 100) : 0;
                
                return (
                  <div key={userQuest.id} className="flex items-center p-3 bg-muted/50 rounded-lg" data-testid={`active-quest-${index}`}>
                    <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center mr-3">
                      <Target className="text-accent-foreground h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{quest.title}</p>
                      <p className="text-sm text-muted-foreground">Reward: {quest.coinReward} coins, +{quest.xpReward} XP</p>
                    </div>
                    <div className="w-16 h-2 bg-border rounded-full">
                      <div 
                        className="h-2 bg-success rounded-full transition-all duration-300" 
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center p-6">
                <Target className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-3">No active quests</p>
                <Button onClick={() => setLocation("/quests")} data-testid="button-start-quests">
                  Start Your First Quest
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weather & Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card data-testid="weather-alert-card">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3 flex items-center">
                <CloudSun className="text-orange-500 mr-2 h-5 w-5" />
                {t("weatherAlert", language as LanguageCode)}
              </h4>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-sm text-orange-800">
                  🌧️ Light rain expected in 2 days. Perfect for post-harvest activities!
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card data-testid="quick-tip-card">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3 flex items-center">
                <Lightbulb className="text-accent mr-2 h-5 w-5" />
                {t("quickTip", language as LanguageCode)}
              </h4>
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
                <p className="text-sm text-accent-foreground">
                  Apply neem oil spray in the evening for better pest control effectiveness.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
