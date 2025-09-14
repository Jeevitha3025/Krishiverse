import { Quest, UserQuest } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, Coins, Star, Award, Users } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface QuestCardProps {
  quest: Quest;
  userQuest?: UserQuest;
  userId: string;
  isTeamQuest?: boolean;
}

export default function QuestCard({ quest, userQuest, userId, isTeamQuest }: QuestCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const startQuestMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/user-quests', {
      userId,
      questId: quest.id,
      status: 'in_progress',
      progress: new Array(quest.steps.length).fill(false)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-quests', userId] });
      toast({
        title: "Quest Started!",
        description: `You've started the "${quest.title}" quest.`,
      });
    }
  });

  const completeQuestMutation = useMutation({
    mutationFn: () => apiRequest('POST', `/api/user-quests/${userQuest?.id}/complete`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-quests', userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/user-progress', userId] });
      toast({
        title: "Quest Completed! 🎉",
        description: `You earned ${quest.coinReward} coins and ${quest.xpReward} XP!`,
      });
    }
  });

  const getProgressPercentage = () => {
    if (!userQuest || !userQuest.progress) return 0;
    const completed = userQuest.progress.filter(Boolean).length;
    return Math.round((completed / quest.steps.length) * 100);
  };

  const getDifficultyColor = () => {
    switch (quest.difficulty) {
      case 'easy': return 'bg-success';
      case 'medium': return 'bg-accent';
      case 'high': return 'bg-secondary';
      default: return 'bg-muted';
    }
  };

  const getStatusBadge = () => {
    if (!userQuest) return <Badge className="bg-blue-100 text-blue-800">New</Badge>;
    if (userQuest.status === 'completed') return <Badge className="bg-success text-success-foreground">Completed</Badge>;
    if (userQuest.status === 'in_progress') {
      return <Badge className="bg-accent text-accent-foreground">{getProgressPercentage()}% Complete</Badge>;
    }
    return <Badge className="bg-muted text-muted-foreground">Not Started</Badge>;
  };

  const canComplete = userQuest?.status === 'in_progress' && getProgressPercentage() >= 75;

  return (
    <Card 
      className={`quest-card transition-all hover:shadow-md ${isTeamQuest ? 'border-l-4 border-l-secondary' : ''}`}
      data-testid={`quest-card-${quest.id}`}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center">
            <div className={`w-12 h-12 ${getDifficultyColor()} rounded-lg flex items-center justify-center mr-3`}>
              {isTeamQuest ? (
                <Users className="text-white h-6 w-6" />
              ) : (
                <Star className="text-white h-6 w-6" />
              )}
            </div>
            <div>
              <h3 className="font-semibold" data-testid={`quest-title-${quest.id}`}>{quest.title}</h3>
              <p className="text-sm text-muted-foreground">
                {quest.category} • {quest.difficulty}
                {isTeamQuest && " • Team Quest"}
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>
        
        <p className="text-sm text-muted-foreground mb-4" data-testid={`quest-description-${quest.id}`}>
          {quest.description}
        </p>
        
        {userQuest?.status === 'in_progress' && (
          <>
            <div className="space-y-2 mb-4">
              {quest.steps.map((step, index) => {
                const isCompleted = userQuest.progress?.[index] || false;
                return (
                  <div key={index} className="flex items-center text-sm" data-testid={`quest-step-${index}`}>
                    {isCompleted ? (
                      <CheckCircle className="text-success mr-2 h-4 w-4" />
                    ) : (
                      <Circle className="text-muted-foreground mr-2 h-4 w-4" />
                    )}
                    <span className={isCompleted ? "line-through text-muted-foreground" : ""}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
            
            <Progress value={getProgressPercentage()} className="mb-4" />
          </>
        )}
        
        <div className="flex justify-between items-center">
          <div className="flex space-x-4 text-sm">
            <span className="flex items-center" data-testid={`quest-coin-reward-${quest.id}`}>
              <Coins className="text-accent mr-1 h-4 w-4" />
              {quest.coinReward} coins
            </span>
            <span className="flex items-center" data-testid={`quest-xp-reward-${quest.id}`}>
              <Star className="text-accent mr-1 h-4 w-4" />
              {quest.xpReward} XP
            </span>
            {quest.badgeReward && (
              <span className="flex items-center" data-testid={`quest-badge-reward-${quest.id}`}>
                <Award className="text-secondary mr-1 h-4 w-4" />
                {quest.badgeReward}
              </span>
            )}
          </div>
          
          <div>
            {!userQuest ? (
              <Button
                onClick={() => startQuestMutation.mutate()}
                disabled={startQuestMutation.isPending}
                className="bg-muted text-foreground hover:bg-muted/80"
                data-testid={`button-start-quest-${quest.id}`}
              >
                Start Quest
              </Button>
            ) : userQuest.status === 'completed' ? (
              <Button disabled className="bg-success text-success-foreground">
                Completed ✓
              </Button>
            ) : canComplete ? (
              <Button
                onClick={() => completeQuestMutation.mutate()}
                disabled={completeQuestMutation.isPending}
                className="bg-primary text-primary-foreground"
                data-testid={`button-complete-quest-${quest.id}`}
              >
                I Did It!
              </Button>
            ) : (
              <Button disabled className="bg-muted text-muted-foreground">
                In Progress...
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
