import { useUser } from "@/contexts/user-context";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown, Bot, ThumbsUp, Lightbulb, Bell } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// --- LIVE MARKET DATA (Simulated for Prototype) ---
const DEFAULT_MARKET_PRICES = [
  { id: 1, crop: "Wheat", variety: "Lokwan", price: 2850, unit: "quintal", trend: "up", change: "+2.4" },
  { id: 2, crop: "Cotton", variety: "Long Staple", price: 7200, unit: "quintal", trend: "down", change: "-1.2" },
  { id: 3, crop: "Soybean", variety: "Yellow", price: 4600, unit: "quintal", trend: "up", change: "+4.1" },
  { id: 4, crop: "Tomato", variety: "Local", price: 1800, unit: "quintal", trend: "stable", change: "0.0" },
  { id: 5, crop: "Maize", variety: "Hybrid", price: 2200, unit: "quintal", trend: "up", change: "+1.5" },
];

export default function Market() {
  const { user, farm } = useUser();
  const { toast } = useToast();
  const [selectedMandi, setSelectedMandi] = useState("wardha");
  
  // State for our interactive Price Alert form
  const [alertCrop, setAlertCrop] = useState("");
  const [alertPrice, setAlertPrice] = useState("");

  // Fetching our "Live" Market Data
  const { data: marketPrices, isLoading } = useQuery({
    queryKey: ['market-prices', selectedMandi], // Refetches if Mandi changes
    queryFn: async () => {
      // Simulating network delay for realism
      await new Promise(resolve => setTimeout(resolve, 800));
      return DEFAULT_MARKET_PRICES;
    }
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
        <p className="text-muted-foreground text-green-700 font-medium">Fetching live Mandi prices...</p>
      </div>
    );
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <ArrowUp className="text-success h-3 w-3" />;
      case "down": return <ArrowDown className="text-destructive h-3 w-3" />;
      default: return <Minus className="text-muted-foreground h-3 w-3" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up": return "text-success";
      case "down": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  // Interactive Function: Set an Alert
  const handleSetAlert = () => {
    if (!alertCrop || !alertPrice) {
      toast({
        title: "Missing Information",
        description: "Please select a crop and enter a target price.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Alert Created! 🔔",
      description: `We will notify you when ${alertCrop} hits ₹${alertPrice}.`,
    });
    
    // Clear the form
    setAlertCrop("");
    setAlertPrice("");
  };

  // Interactive Function: Accept AI Challenge
  const handleAcceptChallenge = () => {
    toast({
      title: "Challenge Accepted! 🚀",
      description: "Tomato cultivation added to your seasonal plan.",
    });
  };

  return (
    <div className="min-h-screen mobile-content bg-slate-50" data-testid="market-screen">
      <div className="bg-green-800 text-white p-4 shadow-md">
        <h1 className="text-xl font-bold flex items-center">
          <TrendingUp className="mr-3 h-6 w-6" />
          Market Oracle
        </h1>
        <p className="text-sm opacity-90 mt-1">Real-time prices & AI recommendations</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Market Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.isArray(marketPrices) && marketPrices.slice(0, 4).map((price: any, index: number) => {
            return (
              <Card key={price.id} className="text-center border-none shadow-sm" data-testid={`price-card-${index}`}>
                <CardContent className="p-3">
                  <TrendingUp className="text-green-600 mx-auto mb-2 h-6 w-6" />
                  <p className="text-xl font-bold text-slate-800" data-testid={`price-${price.crop.toLowerCase()}`}>
                    ₹{price.price.toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-500 font-medium">{price.crop}</p>
                  <p className="text-xs text-slate-400">per {price.unit}</p>
                  <div className="flex items-center justify-center mt-2 bg-slate-50 rounded py-1">
                    {getTrendIcon(price.trend)}
                    <span className={`text-xs ml-1 font-bold ${getTrendColor(price.trend)}`}>
                      {price.change}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Local Mandi Prices */}
        <Card className="border-none shadow-md" data-testid="mandi-prices">
          <CardHeader className="bg-white border-b border-slate-100 pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Local Mandi Prices</CardTitle>
              <Select value={selectedMandi} onValueChange={setSelectedMandi}>
                <SelectTrigger className="w-36 bg-slate-50 border-none shadow-sm" data-testid="mandi-selector">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wardha">Wardha Mandi</SelectItem>
                  <SelectItem value="nagpur">Nagpur Mandi</SelectItem>
                  <SelectItem value="akola">Akola Mandi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {Array.isArray(marketPrices) && marketPrices.map((price: any, index: number) => (
                <div key={price.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors" data-testid={`mandi-price-${index}`}>
                  <div className="flex items-center">
                    {price.trend === 'down' ? 
                      <TrendingDown className="text-red-500 mr-3 h-5 w-5" /> : 
                      <TrendingUp className="text-green-500 mr-3 h-5 w-5" />
                    }
                    <div>
                      <p className="font-bold text-slate-800">{price.crop}</p>
                      <p className="text-xs text-slate-500">{price.variety || 'Standard quality'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-800">₹{price.price.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">/{price.unit}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Card className="border-none shadow-md" data-testid="ai-recommendations">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-900">
              <Bot className="text-blue-600 mr-2 h-6 w-6" />
              AI Crop Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-bold text-green-800 flex items-center">
                    <ThumbsUp className="mr-2 h-5 w-5" />
                    High Profit Opportunity
                  </h4>
                  <p className="text-xs text-green-600 font-medium uppercase tracking-wider mt-1">Next Season Forecast</p>
                </div>
                <Badge className="bg-green-600 text-white border-none shadow-sm">+35% Profit</Badge>
              </div>
              
              <p className="text-sm mb-3 text-slate-700">
                <span className="font-bold text-slate-900">Tomato cultivation</span> is predicted to be highly profitable in your region. 
                Market demand is expected to increase by 40% in the next 3 months.
              </p>
              
              <div className="grid grid-cols-2 gap-4 text-sm mb-4 bg-white p-3 rounded border border-green-50">
                <div>
                  <p className="text-slate-500 text-xs">Expected Yield</p>
                  <p className="font-bold text-slate-800">25-30 tons/acre</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Forecast Price</p>
                  <p className="font-bold text-slate-800">₹15-18/kg</p>
                </div>
              </div>
              
              <Button 
                onClick={handleAcceptChallenge}
                className="bg-green-700 text-white hover:bg-green-800 shadow-sm w-full"
                data-testid="button-accept-challenge"
              >
                Accept AI Challenge (+150 XP)
              </Button>
            </div>
            
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-bold text-orange-800 flex items-center">
                    <Lightbulb className="mr-2 h-5 w-5" />
                    Smart Diversification
                  </h4>
                  <p className="text-xs text-orange-600 font-medium uppercase tracking-wider mt-1">Risk Management</p>
                </div>
              </div>
              
              <p className="text-sm mb-3 text-slate-700">
                Consider growing <span className="font-bold text-slate-900">Green Gram</span> alongside your main crop. 
                It fixes nitrogen, reduces soil preparation costs, and provides steady secondary income.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Price Alerts */}
        <Card className="border-none shadow-md bg-blue-50/30" data-testid="price-alerts">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-900">
              <Bell className="text-blue-600 mr-2 h-5 w-5" />
              Smart Price Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white border border-green-200 rounded-lg shadow-sm">
                <div>
                  <p className="font-bold text-green-700">Wheat Target Reached!</p>
                  <p className="text-xs text-slate-500">₹2,850/quintal - Your target price hit today</p>
                </div>
                <Button 
                  className="bg-green-600 text-white hover:bg-green-700 h-8 text-xs"
                  data-testid="button-sell-now"
                >
                  Sell Now
                </Button>
              </div>
              
              <div className="p-4 bg-white border border-slate-100 shadow-sm rounded-lg mt-4">
                <p className="font-bold text-slate-800 mb-3">Set New Alert</p>
                <div className="flex flex-col space-y-3">
                  <div className="flex space-x-2">
                    <Select value={alertCrop} onValueChange={setAlertCrop}>
                      <SelectTrigger className="flex-1 bg-slate-50" data-testid="select-crop-alert">
                        <SelectValue placeholder="Select Crop" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cotton">Cotton</SelectItem>
                        <SelectItem value="Soybean">Soybean</SelectItem>
                        <SelectItem value="Maize">Maize</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input 
                      type="number" 
                      value={alertPrice}
                      onChange={(e) => setAlertPrice(e.target.value)}
                      placeholder="Target ₹" 
                      className="w-28 bg-slate-50"
                      data-testid="input-target-price"
                    />
                  </div>
                  <Button 
                    onClick={handleSetAlert}
                    className="bg-blue-600 text-white hover:bg-blue-700 w-full"
                    data-testid="button-set-alert"
                  >
                    Set Alert Notification
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}