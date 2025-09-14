import { useUser } from "@/contexts/user-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  User, 
  MapPin, 
  Sprout, 
  Droplets, 
  Languages, 
  Bell, 
  Volume2, 
  HelpCircle,
  LogOut,
  Coins,
  Star,
  Award,
  Users,
  GraduationCap,
  Trophy,
  Recycle
} from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { speakText } from "@/lib/i18n";

export default function Profile() {
  const { user, farm, progress, language, setLanguage, logout } = useUser();
  const [, setLocation] = useLocation();
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

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

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const handleSpeak = (text: string) => {
    if (soundEnabled) {
      speakText(text, language as any);
    }
  };

  const badgeConfig = [
    { key: "Eco Leader", icon: Sprout, color: "bg-success/10 text-success" },
    { key: "Water Saver", icon: Droplets, color: "bg-primary/10 text-primary" },
    { key: "Compost Master", icon: Recycle, color: "bg-accent/10 text-accent" },
    { key: "Community Helper", icon: Users, color: "bg-secondary/10 text-secondary" },
    { key: "Knowledge Seeker", icon: GraduationCap, color: "bg-purple-100 text-purple-600" },
    { key: "Top Performer", icon: Trophy, color: "bg-muted text-muted-foreground opacity-50" },
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen mobile-content" data-testid="profile-screen">
      <div className="bg-primary text-primary-foreground p-4">
        <h1 className="text-xl font-bold flex items-center">
          <User className="mr-3 h-6 w-6" />
          My Profile
        </h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Profile Header */}
        <Card data-testid="profile-header">
          <CardContent className="p-6 text-center">
            <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center mx-auto mb-4" data-testid="profile-avatar">
              <span className="text-3xl font-bold text-accent-foreground">
                {getInitials(user.name)}
              </span>
            </div>
            <h2 className="text-2xl font-bold" data-testid="profile-name">{user.name}</h2>
            <p className="text-muted-foreground">Sustainable Farmer • Level {progress.level}</p>
            <div className="flex justify-center space-x-4 mt-4">
              <div className="text-center" data-testid="profile-coins">
                <p className="text-2xl font-bold text-accent">{progress.totalCoins.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Coins</p>
              </div>
              <div className="text-center" data-testid="profile-quests">
                <p className="text-2xl font-bold text-success">{progress.completedQuests}</p>
                <p className="text-sm text-muted-foreground">Quests Done</p>
              </div>
              <div className="text-center" data-testid="profile-badges">
                <p className="text-2xl font-bold text-secondary">{progress.badges.length}</p>
                <p className="text-sm text-muted-foreground">Badges</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() => handleSpeak(`${user.name}, Level ${progress.level} farmer with ${progress.totalCoins} coins and ${progress.badges.length} badges`)}
              className="mt-2"
              data-testid="button-speak-stats"
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Farm Details */}
        <Card data-testid="farm-details">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              Farm Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Location</span>
              <span data-testid="farm-location">
                {farm.village}, {farm.district}, {farm.state}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Farm Size</span>
              <span data-testid="farm-size">{farm.farmSize}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Primary Crops</span>
              <span data-testid="farm-crops">{farm.primaryCrops.join(", ")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Soil Type</span>
              <span data-testid="farm-soil">{farm.soilType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Water Source</span>
              <span data-testid="farm-water">{farm.waterSource}</span>
            </div>
          </CardContent>
        </Card>

        {/* Achievements & Badges */}
        <Card data-testid="achievements-badges">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="mr-2 h-5 w-5" />
              Badges & Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {badgeConfig.map((badge) => {
                const Icon = badge.icon;
                const hasEarned = progress.badges.includes(badge.key);
                return (
                  <div
                    key={badge.key}
                    className={`text-center p-3 rounded-lg ${hasEarned ? badge.color : 'bg-muted opacity-50'}`}
                    data-testid={`badge-${badge.key.toLowerCase().replace(' ', '-')}`}
                  >
                    <Icon className={`mx-auto mb-2 h-8 w-8 ${hasEarned ? '' : 'text-muted-foreground'}`} />
                    <p className="text-xs font-medium">{badge.key}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card data-testid="settings-preferences">
          <CardHeader>
            <CardTitle>Settings & Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Language Setting */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Languages className="text-muted-foreground mr-3 h-5 w-5" />
                <span>Language</span>
              </div>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-32" data-testid="language-select">
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

            {/* Notifications Setting */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="text-muted-foreground mr-3 h-5 w-5" />
                <Label htmlFor="notifications">Notifications</Label>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
                data-testid="notifications-toggle"
              />
            </div>

            {/* Audio Setting */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Volume2 className="text-muted-foreground mr-3 h-5 w-5" />
                <Label htmlFor="audio">Audio Guidance</Label>
              </div>
              <Switch
                id="audio"
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
                data-testid="audio-toggle"
              />
            </div>

            {/* Help & Support */}
            <Button
              variant="ghost"
              className="w-full justify-start p-3 h-auto"
              data-testid="button-help-support"
            >
              <HelpCircle className="text-muted-foreground mr-3 h-5 w-5" />
              <div className="text-left">
                <p className="font-medium">Help & Support</p>
                <p className="text-xs text-muted-foreground">Get assistance and FAQ</p>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Button
          variant="destructive"
          onClick={handleLogout}
          className="w-full"
          data-testid="button-logout"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>

        {/* App Version */}
        <div className="text-center text-muted-foreground text-sm py-4" data-testid="app-version">
          <p>KrishiGrow Version 1.0.0</p>
          <p>Made with 💚 for Indian Farmers</p>
        </div>
      </div>
    </div>
  );
}
