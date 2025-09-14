import { useState } from "react";
import { useUser } from "@/contexts/user-context";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import QuestCard from "@/components/quest-card";
import { Target, Gamepad2, Brain, Sprout } from "lucide-react";

export default function Quests() {
  const { user } = useUser();
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: quests, isLoading: questsLoading } = useQuery({
    queryKey: ['/api/quests'],
  });

  const { data: userQuests, isLoading: userQuestsLoading } = useQuery({
    queryKey: ['/api/user-quests', user?.id],
    enabled: !!user?.id,
  });

  if (!user) {
    return (
      <div className="min-h-screen mobile-content flex items-center justify-center">
        <p className="text-muted-foreground">Please log in to view quests</p>
      </div>
    );
  }

  if (questsLoading || userQuestsLoading) {
    return (
      <div className="min-h-screen mobile-content flex items-center justify-center">
        <p className="text-muted-foreground">Loading quests...</p>
      </div>
    );
  }

  const categories = [
    { id: "all", label: "All Quests" },
    { id: "Soil Health", label: "Soil Health" },
    { id: "Water Management", label: "Water Management" },
    { id: "Pest Control", label: "Pest Control" },
  ];

  const filteredQuests = Array.isArray(quests) ? quests.filter((quest: any) => 
    selectedCategory === "all" || quest.category === selectedCategory
  ) : [];

  const getUserQuest = (questId: string) => {
    return Array.isArray(userQuests) ? userQuests.find((uq: any) => uq.questId === questId) : undefined;
  };

  return (
    <div className="min-h-screen mobile-content" data-testid="quests-screen">
      <div className="bg-primary text-primary-foreground p-4">
        <h1 className="text-xl font-bold flex items-center">
          <Target className="mr-3 h-6 w-6" />
          Sustainable Quests
        </h1>
        <p className="text-sm opacity-90 mt-1">Complete tasks to earn rewards and improve your farm</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Quest Categories */}
        <div className="flex space-x-3 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "secondary"}
              onClick={() => setSelectedCategory(category.id)}
              className="whitespace-nowrap"
              data-testid={`category-${category.id}`}
            >
              {category.label}
            </Button>
          ))}
        </div>

        {/* Quest List */}
        <div className="space-y-4">
          {filteredQuests.map((quest: any) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              userQuest={getUserQuest(quest.id)}
              userId={user.id}
            />
          ))}
        </div>

        {/* Mini-Games Section */}
        <Card data-testid="mini-games-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Gamepad2 className="text-primary mr-3 h-6 w-6" />
              Knowledge Games
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                <div className="flex items-center mb-2">
                  <Brain className="mr-3 h-6 w-6" />
                  <div>
                    <h4 className="font-semibold">Pest Detective</h4>
                    <p className="text-xs opacity-90">Identify crop pests</p>
                  </div>
                </div>
                <p className="text-xs mb-3 opacity-80">Match pest images with correct organic treatments</p>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="bg-white/20 text-white hover:bg-white/30"
                  data-testid="button-pest-detective"
                >
                  Play & Earn 25 XP
                </Button>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                <div className="flex items-center mb-2">
                  <Sprout className="mr-3 h-6 w-6" />
                  <div>
                    <h4 className="font-semibold">Crop Rotation Quiz</h4>
                    <p className="text-xs opacity-90">Plan your seasons</p>
                  </div>
                </div>
                <p className="text-xs mb-3 opacity-80">Test your knowledge of sustainable crop rotation</p>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="bg-white/20 text-white hover:bg-white/30"
                  data-testid="button-crop-rotation"
                >
                  Play & Earn 25 XP
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
