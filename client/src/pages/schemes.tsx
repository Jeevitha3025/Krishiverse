import { useUser } from "@/contexts/user-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, Star, CheckCircle, Circle, Clock, Phone, MessageCircle, Tag, Coins } from "lucide-react";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Schemes() {
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("available");

  const { data: schemes, isLoading: schemesLoading } = useQuery({
    queryKey: ['/api/schemes'],
  });

  const { data: userSchemes, isLoading: userSchemesLoading } = useQuery({
    queryKey: ['/api/user-schemes', user?.id],
    enabled: !!user?.id,
  });

  const applyForSchemeMutation = useMutation({
    mutationFn: (schemeId: string) => apiRequest('POST', '/api/user-schemes', {
      userId: user?.id,
      schemeId,
      status: 'in_progress',
      applicationData: {},
      appliedAt: new Date()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-schemes', user?.id] });
      toast({
        title: "Application Started!",
        description: "You've started the application process for this scheme.",
      });
    }
  });

  if (!user) {
    return (
      <div className="min-h-screen mobile-content flex items-center justify-center">
        <p className="text-muted-foreground">Please log in to view schemes</p>
      </div>
    );
  }

  if (schemesLoading || userSchemesLoading) {
    return (
      <div className="min-h-screen mobile-content flex items-center justify-center">
        <p className="text-muted-foreground">Loading schemes...</p>
      </div>
    );
  }

  const tabs = [
    { id: "available", label: "Available" },
    { id: "in_progress", label: "In Progress" },
    { id: "approved", label: "Approved" },
  ];

  const getUserScheme = (schemeId: string) => {
    return Array.isArray(userSchemes) ? userSchemes.find((us: any) => us.schemeId === schemeId) : undefined;
  };

  const getFilteredSchemes = () => {
    if (!Array.isArray(schemes)) return [];
    
    return schemes.filter((scheme: any) => {
      const userScheme = getUserScheme(scheme.id);
      
      switch (selectedTab) {
        case "available":
          return !userScheme || userScheme.status === 'not_started';
        case "in_progress":
          return userScheme && userScheme.status === 'in_progress';
        case "approved":
          return userScheme && userScheme.status === 'approved';
        default:
          return true;
      }
    });
  };

  const getSchemeProgress = (scheme: any, userScheme: any) => {
    if (!userScheme || userScheme.status !== 'in_progress') return 0;
    // Simple progress calculation based on steps completed
    return Math.floor(Math.random() * 80) + 20; // Placeholder calculation
  };

  const getStatusBadge = (scheme: any, userScheme: any) => {
    if (!userScheme) {
      return <Badge className="bg-primary/10 text-primary">New</Badge>;
    }
    
    switch (userScheme.status) {
      case 'in_progress':
        const progress = getSchemeProgress(scheme, userScheme);
        return <Badge className="bg-accent/10 text-accent">{progress}% Complete</Badge>;
      case 'approved':
        return <Badge className="bg-success text-success-foreground">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive text-destructive-foreground">Rejected</Badge>;
      default:
        return <Badge className="bg-muted text-muted-foreground">Not Started</Badge>;
    }
  };

  const filteredSchemes = getFilteredSchemes();

  return (
    <div className="min-h-screen mobile-content" data-testid="schemes-screen">
      <div className="bg-primary text-primary-foreground p-4">
        <h1 className="text-xl font-bold flex items-center">
          <FileText className="mr-3 h-6 w-6" />
          Government Schemes
        </h1>
        <p className="text-sm opacity-90 mt-1">Quest-based application support</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Scheme Categories */}
        <div className="flex space-x-3 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={selectedTab === tab.id ? "default" : "secondary"}
              onClick={() => setSelectedTab(tab.id)}
              className="whitespace-nowrap"
              data-testid={`tab-${tab.id}`}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Schemes List */}
        <div className="space-y-4">
          {filteredSchemes.map((scheme: any) => {
            const userScheme = getUserScheme(scheme.id);
            const progress = getSchemeProgress(scheme, userScheme);
            
            return (
              <Card key={scheme.id} className="scheme-card" data-testid={`scheme-card-${scheme.id}`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-lg" data-testid={`scheme-name-${scheme.id}`}>
                        {scheme.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">{scheme.category}</p>
                    </div>
                    {getStatusBadge(scheme, userScheme)}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4" data-testid={`scheme-description-${scheme.id}`}>
                    {scheme.description}
                  </p>
                  
                  <div className="mb-4">
                    <p className="font-medium text-sm mb-2">Benefits:</p>
                    <p className="text-sm text-muted-foreground">{scheme.benefits}</p>
                  </div>
                  
                  {userScheme?.status === 'in_progress' && (
                    <>
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Application Progress</span>
                          <span data-testid={`scheme-progress-${scheme.id}`}>
                            {Math.floor(progress / (100 / scheme.applicationSteps.length))} of {scheme.applicationSteps.length} steps completed
                          </span>
                        </div>
                        <Progress value={progress} className="mb-4" />
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        {scheme.applicationSteps.map((step: string, index: number) => {
                          const isCompleted = index < Math.floor(progress / (100 / scheme.applicationSteps.length));
                          const isCurrent = index === Math.floor(progress / (100 / scheme.applicationSteps.length));
                          
                          return (
                            <div key={index} className="flex items-center text-sm" data-testid={`scheme-step-${index}`}>
                              {isCompleted ? (
                                <CheckCircle className="text-success mr-2 h-4 w-4" />
                              ) : isCurrent ? (
                                <Clock className="text-accent mr-2 h-4 w-4" />
                              ) : (
                                <Circle className="text-muted-foreground mr-2 h-4 w-4" />
                              )}
                              <span className={`${isCompleted ? 'line-through text-muted-foreground' : isCurrent ? 'font-medium text-accent' : ''}`}>
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-4 text-sm">
                      <span className="flex items-center" data-testid={`scheme-coin-reward-${scheme.id}`}>
                        <Coins className="text-accent mr-1 h-4 w-4" />
                        200 coins reward
                      </span>
                      <span className="flex items-center">
                        <Tag className="text-primary mr-1 h-4 w-4" />
                        Scheme Certified Badge
                      </span>
                    </div>
                    
                    <div>
                      {!userScheme ? (
                        <Button
                          onClick={() => applyForSchemeMutation.mutate(scheme.id)}
                          disabled={applyForSchemeMutation.isPending}
                          className="bg-primary text-primary-foreground"
                          data-testid={`button-start-application-${scheme.id}`}
                        >
                          Start Application
                        </Button>
                      ) : userScheme.status === 'approved' ? (
                        <Button disabled className="bg-success text-success-foreground">
                          Approved ✓
                        </Button>
                      ) : userScheme.status === 'in_progress' ? (
                        <Button
                          className="bg-accent text-accent-foreground"
                          data-testid={`button-continue-application-${scheme.id}`}
                        >
                          Continue Quest
                        </Button>
                      ) : (
                        <Button disabled className="bg-muted text-muted-foreground">
                          Processing...
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          {filteredSchemes.length === 0 && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">No schemes found</p>
              <p className="text-sm text-muted-foreground">
                {selectedTab === "available" 
                  ? "All available schemes have been applied for" 
                  : `No schemes in ${selectedTab.replace('_', ' ')} status`
                }
              </p>
            </div>
          )}
        </div>

        {/* Help & Support */}
        <Card data-testid="help-support-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="text-primary mr-2 h-5 w-5" />
              Need Help?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="flex items-center p-3 h-auto justify-start"
                data-testid="button-call-support"
              >
                <Phone className="text-success mr-3 h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">Call Support</p>
                  <p className="text-xs text-muted-foreground">1800-XXX-XXXX</p>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center p-3 h-auto justify-start"
                data-testid="button-chat-support"
              >
                <MessageCircle className="text-primary mr-3 h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">Chat Support</p>
                  <p className="text-xs text-muted-foreground">Get instant help</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
