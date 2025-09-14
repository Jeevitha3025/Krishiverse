import { useUser } from "@/contexts/user-context";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Star, Award } from "lucide-react";
import { useState } from "react";

export default function Leaderboard() {
  const { user, farm } = useUser();
  const [selectedScope, setSelectedScope] = useState("panchayat");

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['/api/leaderboard', selectedScope === "panchayat" ? farm?.gramPanchayat : farm?.district],
  });

  if (!user || !farm) {
    return (
      <div className="min-h-screen mobile-content flex items-center justify-center">
        <p className="text-muted-foreground">Please complete your profile setup</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen mobile-content flex items-center justify-center">
        <p className="text-muted-foreground">Loading leaderboard...</p>
      </div>
    );
  }

  const scopes = [
    { id: "panchayat", label: "My Panchayat" },
    { id: "district", label: "District" },
    { id: "state", label: "State" },
  ];

  const topThree = Array.isArray(leaderboard) ? leaderboard.slice(0, 3) : [];
  const remaining = Array.isArray(leaderboard) ? leaderboard.slice(3) : [];

  const getPodiumHeight = (position: number) => {
    switch (position) {
      case 0: return "h-24"; // 1st place
      case 1: return "h-20"; // 2nd place  
      case 2: return "h-20"; // 3rd place
      default: return "h-16";
    }
  };

  const getPodiumColor = (position: number) => {
    switch (position) {
      case 0: return "bg-accent border-accent";
      case 1: return "bg-gray-100 border-gray-400";
      case 2: return "bg-orange-100 border-orange-400";
      default: return "bg-muted";
    }
  };

  const getPositionBadgeColor = (position: number) => {
    switch (position) {
      case 0: return "bg-accent text-accent-foreground";
      case 1: return "bg-gray-400 text-white";
      case 2: return "bg-orange-400 text-white";
      default: return "bg-muted";
    }
  };

  return (
    <div className="min-h-screen mobile-content" data-testid="leaderboard-screen">
      <div className="bg-primary text-primary-foreground p-4">
        <h1 className="text-xl font-bold flex items-center">
          <Trophy className="mr-3 h-6 w-6" />
          Community Leaderboard
        </h1>
        <p className="text-sm opacity-90 mt-1" data-testid="location-info">
          {farm.district} District • {farm.state}
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Leaderboard Scope Tabs */}
        <div className="flex space-x-3 overflow-x-auto pb-2">
          {scopes.map((scope) => (
            <Button
              key={scope.id}
              variant={selectedScope === scope.id ? "default" : "secondary"}
              onClick={() => setSelectedScope(scope.id)}
              className="whitespace-nowrap"
              data-testid={`scope-${scope.id}`}
            >
              {scope.label}
            </Button>
          ))}
        </div>

        {/* Top 3 Winners Podium */}
        {topThree.length > 0 && (
          <Card data-testid="top-three-podium">
            <CardHeader>
              <CardTitle className="text-center">🏆 This Month's Champions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center items-end space-x-4 mb-6">
                {topThree.map((entry: any, index: number) => {
                  const isCurrentUser = entry.user.id === user.id;
                  const initials = entry.user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
                  
                  return (
                    <div key={entry.user.id} className="text-center" data-testid={`podium-position-${index + 1}`}>
                      <div className={`w-16 h-16 ${getPodiumColor(index).split(' ')[0].replace('bg-', 'bg-')} rounded-full flex items-center justify-center mb-2 mx-auto ${isCurrentUser ? 'animate-pulse-glow' : ''}`}>
                        <span className="font-bold text-white">{initials}</span>
                      </div>
                      <div className={`${getPodiumColor(index)} rounded-lg p-3 ${getPodiumHeight(index)} flex flex-col justify-center border-2`}>
                        <p className={`font-semibold text-sm ${index === 0 ? 'text-accent-foreground' : 'text-gray-700'}`}>
                          {entry.user.name}
                          {isCurrentUser && " (You)"}
                        </p>
                        <p className={`text-xs ${index === 0 ? 'text-accent font-medium' : 'text-muted-foreground'}`}>
                          {entry.progress.sustainabilityScore} pts
                        </p>
                        <div className={`w-6 h-6 ${getPositionBadgeColor(index)} rounded-full flex items-center justify-center text-xs font-bold mx-auto mt-1`}>
                          {index + 1}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Full Leaderboard */}
        <Card data-testid="full-leaderboard">
          <CardHeader>
            <CardTitle>Sustainability Rankings</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {Array.isArray(leaderboard) && leaderboard.map((entry: any, index: number) => {
                const isCurrentUser = entry.user.id === user.id;
                const initials = entry.user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
                const position = index + 1;
                
                return (
                  <div 
                    key={entry.user.id} 
                    className={`p-4 flex items-center justify-between ${isCurrentUser ? 'bg-accent/5' : ''}`}
                    data-testid={`leaderboard-entry-${position}`}
                  >
                    <div className="flex items-center">
                      <span className={`w-8 h-8 ${getPositionBadgeColor(index)} rounded-full flex items-center justify-center text-sm font-bold mr-3`}>
                        {position}
                      </span>
                      <div className="flex items-center">
                        <div className={`w-10 h-10 ${index < 3 ? getPodiumColor(index).split(' ')[0] : 'bg-muted'} rounded-full flex items-center justify-center mr-3`}>
                          <span className="font-semibold text-foreground">{initials}</span>
                        </div>
                        <div>
                          <p className="font-semibold">
                            {entry.user.name}
                            {isCurrentUser && " (You)"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {farm.village} Village
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg" data-testid={`score-${position}`}>
                        {entry.progress.sustainabilityScore}
                      </p>
                      <div className="flex space-x-1">
                        {entry.progress.badges.length > 0 && (
                          <Badge className="text-xs bg-success text-success-foreground">
                            🌱 {entry.progress.badges[0]}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }) || []}
              
              {(!Array.isArray(leaderboard) || leaderboard.length === 0) && (
                <div className="p-8 text-center">
                  <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No leaderboard data available yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Complete quests to appear on the leaderboard
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Community Feed */}
        <Card data-testid="community-feed">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-3 h-5 w-5" />
              Community Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
                <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center">
                  <span className="font-semibold text-success-foreground text-sm">AS</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-semibold">Arjun Sharma</span> completed the 
                    <span className="text-primary font-medium"> "Organic Pest Control"</span> quest!
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-muted-foreground">2 hours ago</span>
                    <Badge className="text-xs bg-success/10 text-success">+150 coins</Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                  <span className="font-semibold text-accent-foreground text-sm">SK</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-semibold">Sunita Kumari</span> earned the 
                    <span className="text-secondary font-medium"> "Water Conservation Champion"</span> badge!
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-muted-foreground">5 hours ago</span>
                    <Badge className="text-xs bg-accent/10 text-accent">🏆 Badge</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
