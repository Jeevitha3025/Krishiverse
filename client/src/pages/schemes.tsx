import { useUser } from "@/contexts/user-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "../firebaseConfig"; // 👈 Import Firestore
import { collection, doc, setDoc, getDocs } from "firebase/firestore"; // 👈 Firestore tools
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, Star, CheckCircle, Circle, Clock, Phone, MessageCircle, Tag, Coins } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// --- DEFAULT SCHEMES (Real-world Indian Schemes) ---
const DEFAULT_SCHEMES = [
  {
    id: "s1",
    name: "PM-KISAN Samman Nidhi",
    category: "Financial Support",
    description: "Direct income support of ₹6,000 per year for farmer families.",
    benefits: "₹2,000 paid in 3 equal installments directly to bank account.",
    applicationSteps: ["Verify Aadhaar", "Link Bank Account", "Submit Land Records"]
  },
  {
    id: "s2",
    name: "Soil Health Card Scheme",
    category: "Farm Management",
    description: "Get a detailed report on your soil's nutrient status and fertilizer recommendations.",
    benefits: "Free soil testing and personalized crop advice.",
    applicationSteps: ["Locate Nearest Testing Center", "Submit Soil Sample", "Receive Digital Card"]
  },
  {
    id: "s3",
    name: "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)",
    category: "Water Management",
    description: "Subsidy for installing micro-irrigation systems like drip and sprinkler.",
    benefits: "Up to 55% subsidy for small/marginal farmers.",
    applicationSteps: ["Get Quotation", "Submit Application", "Field Inspection", "Installation"]
  }
];

export default function Schemes() {
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("available");

  // 1. Fetch Schemes
  const { data: schemes, isLoading: schemesLoading } = useQuery({
    queryKey: ['schemes'],
    queryFn: async () => DEFAULT_SCHEMES
  });

  // 2. Fetch User's Applied Schemes from FIRESTORE
  const { data: userSchemes, isLoading: userSchemesLoading } = useQuery({
    queryKey: ['user-schemes', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      try {
        const schemesRef = collection(db, `users/${user!.id}/appliedSchemes`);
        const snapshot = await getDocs(schemesRef);
        if (snapshot.empty) return [];
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        console.error("Error fetching user schemes:", error);
        return [];
      }
    }
  });

  // 3. START APPLICATION (Save to Firestore)
  const applyForSchemeMutation = useMutation({
    mutationFn: async (schemeId: string) => {
      const schemeRef = doc(db, `users/${user!.id}/appliedSchemes`, schemeId);
      await setDoc(schemeRef, {
        schemeId,
        status: 'in_progress',
        progress: 25, // Start at 25% complete
        appliedAt: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-schemes', user?.id] });
      toast({
        title: "Application Started!",
        description: "You've started the application process. Check the 'In Progress' tab.",
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
        <p className="text-muted-foreground text-green-700 font-medium">Loading schemes...</p>
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

  const getSchemeProgress = (userScheme: any) => {
    if (!userScheme || userScheme.status !== 'in_progress') return 0;
    return userScheme.progress || 25; 
  };

  const getStatusBadge = (userScheme: any) => {
    if (!userScheme) {
      return <Badge className="bg-blue-100 text-blue-700 border-none">New</Badge>;
    }
    
    switch (userScheme.status) {
      case 'in_progress':
        return <Badge className="bg-orange-100 text-orange-700 border-none">{userScheme.progress}% Complete</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-700 border-none">Approved</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-500 border-none">Not Started</Badge>;
    }
  };

  const filteredSchemes = getFilteredSchemes();

  return (
    <div className="min-h-screen mobile-content bg-slate-50" data-testid="schemes-screen">
      <div className="bg-green-800 text-white p-4 shadow-md">
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
              variant={selectedTab === tab.id ? "default" : "outline"}
              onClick={() => setSelectedTab(tab.id)}
              className={`whitespace-nowrap ${selectedTab === tab.id ? 'bg-green-700 hover:bg-green-800 text-white' : 'bg-white'}`}
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
            const progress = getSchemeProgress(userScheme);
            
            return (
              <Card key={scheme.id} className="scheme-card border-none shadow-md overflow-hidden" data-testid={`scheme-card-${scheme.id}`}>
                {/* Decorative top border */}
                <div className="h-2 w-full bg-gradient-to-r from-orange-400 to-green-500"></div>
                
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-lg text-slate-800" data-testid={`scheme-name-${scheme.id}`}>
                        {scheme.name}
                      </h4>
                      <p className="text-xs font-semibold text-green-700 tracking-wider uppercase mt-1">{scheme.category}</p>
                    </div>
                    {getStatusBadge(userScheme)}
                  </div>
                  
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed" data-testid={`scheme-description-${scheme.id}`}>
                    {scheme.description}
                  </p>
                  
                  <div className="mb-4 bg-orange-50 p-3 rounded-lg border border-orange-100">
                    <p className="font-semibold text-sm mb-1 flex items-center text-orange-800">
                      <Star className="h-4 w-4 mr-2" /> Benefits
                    </p>
                    <p className="text-sm text-orange-700">{scheme.benefits}</p>
                  </div>
                  
                  {userScheme?.status === 'in_progress' && (
                    <>
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2 font-medium">
                          <span className="text-slate-700">Application Progress</span>
                          <span className="text-orange-600" data-testid={`scheme-progress-${scheme.id}`}>
                            Step 1 of {scheme.applicationSteps.length}
                          </span>
                        </div>
                        <Progress value={progress} className="mb-4 h-2 bg-slate-200" />
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        {scheme.applicationSteps.map((step: string, index: number) => {
                          const isCompleted = index === 0; // Fake progress for demo
                          const isCurrent = index === 1;
                          
                          return (
                            <div key={index} className="flex items-center text-sm p-2 rounded bg-slate-50" data-testid={`scheme-step-${index}`}>
                              {isCompleted ? (
                                <CheckCircle className="text-green-600 mr-3 h-5 w-5" />
                              ) : isCurrent ? (
                                <Clock className="text-orange-500 mr-3 h-5 w-5" />
                              ) : (
                                <Circle className="text-slate-300 mr-3 h-5 w-5" />
                              )}
                              <span className={`${isCompleted ? 'line-through text-slate-400' : isCurrent ? 'font-semibold text-orange-700' : 'text-slate-600'}`}>
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                  
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100">
                    <div className="flex space-x-4 text-sm font-medium">
                      <span className="flex items-center text-orange-600" data-testid={`scheme-coin-reward-${scheme.id}`}>
                        <Coins className="mr-1 h-4 w-4" />
                        200 Coins
                      </span>
                    </div>
                    
                    <div>
                      {!userScheme ? (
                        <Button
                          onClick={() => applyForSchemeMutation.mutate(scheme.id)}
                          disabled={applyForSchemeMutation.isPending}
                          className="bg-green-700 text-white hover:bg-green-800 shadow-sm"
                          data-testid={`button-start-application-${scheme.id}`}
                        >
                          Start Application
                        </Button>
                      ) : userScheme.status === 'approved' ? (
                        <Button disabled className="bg-green-50 text-green-700 border-none">
                          Approved ✓
                        </Button>
                      ) : userScheme.status === 'in_progress' ? (
                        <Button
                          className="bg-orange-100 text-orange-800 hover:bg-orange-200 border-none shadow-sm"
                          data-testid={`button-continue-application-${scheme.id}`}
                        >
                          Continue Quest
                        </Button>
                      ) : (
                        <Button disabled className="bg-slate-100 text-slate-500 border-none">
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
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-slate-100">
              <FileText className="mx-auto h-12 w-12 text-slate-300 mb-4" />
              <p className="text-slate-600 font-medium mb-1">No schemes found</p>
              <p className="text-sm text-slate-500">
                {selectedTab === "available" 
                  ? "You have applied for all available schemes!" 
                  : `No schemes currently in ${selectedTab.replace('_', ' ')} status.`
                }
              </p>
            </div>
          )}
        </div>

        {/* Help & Support */}
        <Card className="border-none shadow-sm bg-blue-50/50" data-testid="help-support-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg text-blue-900">
              <MessageCircle className="text-blue-600 mr-2 h-5 w-5" />
              Need Application Help?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="flex items-center p-3 h-auto justify-start bg-white border-blue-100 hover:bg-blue-50"
                data-testid="button-call-support"
              >
                <Phone className="text-green-600 mr-3 h-5 w-5" />
                <div className="text-left">
                  <p className="font-semibold text-slate-800">Call Support</p>
                  <p className="text-xs text-slate-500">1800-180-1551 (Kisan Call Center)</p>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center p-3 h-auto justify-start bg-white border-blue-100 hover:bg-blue-50"
                data-testid="button-chat-support"
              >
                <MessageCircle className="text-blue-600 mr-3 h-5 w-5" />
                <div className="text-left">
                  <p className="font-semibold text-slate-800">Chat with KrishiBot</p>
                  <p className="text-xs text-slate-500">Get instant AI assistance</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}