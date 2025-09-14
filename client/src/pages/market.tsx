import { useUser } from "@/contexts/user-context";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown, Bot, ThumbsUp, Lightbulb, Bell } from "lucide-react";
import { useState } from "react";

export default function Market() {
  const { user, farm } = useUser();
  const [selectedMandi, setSelectedMandi] = useState("wardha");

  const { data: marketPrices, isLoading } = useQuery({
    queryKey: ['/api/market-prices', farm?.district],
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
        <p className="text-muted-foreground">Loading market data...</p>
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

  const getTrendPercentage = () => {
    // Mock percentage for demo
    return (Math.random() * 10 - 5).toFixed(1);
  };

  return (
    <div className="min-h-screen mobile-content" data-testid="market-screen">
      <div className="bg-primary text-primary-foreground p-4">
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
            const trendPercentage = getTrendPercentage();
            return (
              <Card key={price.id} className="text-center" data-testid={`price-card-${index}`}>
                <CardContent className="p-3">
                  <TrendingUp className="text-accent mx-auto mb-2 h-6 w-6" />
                  <p className="text-xl font-bold" data-testid={`price-${price.crop.toLowerCase()}`}>
                    ₹{price.price.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">{price.crop}/{price.unit}</p>
                  <div className="flex items-center justify-center mt-1">
                    {getTrendIcon(price.trend)}
                    <span className={`text-xs ml-1 ${getTrendColor(price.trend)}`}>
                      {parseFloat(trendPercentage) > 0 ? '+' : ''}{trendPercentage}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          }) || []}
        </div>

        {/* AI Recommendations */}
        <Card data-testid="ai-recommendations">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bot className="text-primary mr-2 h-6 w-6" />
              AI Crop Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gradient-to-r from-success/10 to-success/5 border border-success/20 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-success flex items-center">
                    <ThumbsUp className="mr-2 h-5 w-5" />
                    High Profit Opportunity
                  </h4>
                  <p className="text-sm text-muted-foreground">Next Season Recommendation</p>
                </div>
                <Badge className="bg-success text-success-foreground">+35% Profit</Badge>
              </div>
              
              <p className="text-sm mb-3">
                <span className="font-medium">Tomato cultivation</span> is predicted to be highly profitable in your region. 
                Market demand is expected to increase by 40% in the next 3 months.
              </p>
              
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <p className="text-muted-foreground">Expected Yield</p>
                  <p className="font-semibold">25-30 tons/acre</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Market Price</p>
                  <p className="font-semibold">₹15-18/kg</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Investment</p>
                  <p className="font-semibold">₹45,000/acre</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Profit Margin</p>
                  <p className="font-semibold text-success">35-40%</p>
                </div>
              </div>
              
              <Button 
                className="bg-success text-success-foreground hover:bg-success/90"
                data-testid="button-accept-challenge"
              >
                Accept Challenge (150 XP)
              </Button>
            </div>
            
            <div className="bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-accent flex items-center">
                    <Lightbulb className="mr-2 h-5 w-5" />
                    Smart Diversification
                  </h4>
                  <p className="text-sm text-muted-foreground">Risk Management Strategy</p>
                </div>
                <Badge className="bg-accent text-accent-foreground">Balanced Risk</Badge>
              </div>
              
              <p className="text-sm mb-3">
                Consider growing <span className="font-medium">Green Gram</span> alongside your main crop. 
                It fixes nitrogen, reduces soil preparation costs, and provides steady income.
              </p>
              
              <Button 
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                data-testid="button-learn-more"
              >
                Learn More (25 XP)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Local Mandi Prices */}
        <Card data-testid="mandi-prices">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Local Mandi Prices</CardTitle>
              <Select value={selectedMandi} onValueChange={setSelectedMandi}>
                <SelectTrigger className="w-36" data-testid="mandi-selector">
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
            <div className="divide-y divide-border">
              {Array.isArray(marketPrices) && marketPrices.map((price: any, index: number) => (
                <div key={price.id} className="p-4 flex justify-between items-center" data-testid={`mandi-price-${index}`}>
                  <div className="flex items-center">
                    <TrendingUp className="text-success mr-3 h-5 w-5" />
                    <div>
                      <p className="font-semibold">{price.crop}</p>
                      <p className="text-sm text-muted-foreground">{price.variety || 'Standard quality'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">₹{price.price.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">/{price.unit}</p>
                  </div>
                </div>
              )) || []}
              
              {(!Array.isArray(marketPrices) || marketPrices.length === 0) && (
                <div className="p-8 text-center">
                  <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No market data available</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Market prices will be updated soon
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Price Alerts */}
        <Card data-testid="price-alerts">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="text-accent mr-2 h-5 w-5" />
              Price Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-success/5 border border-success/20 rounded-lg">
                <div>
                  <p className="font-semibold text-success">Wheat Target Reached!</p>
                  <p className="text-sm text-muted-foreground">₹2,350/quintal - Your target price</p>
                </div>
                <Button 
                  className="bg-success text-success-foreground"
                  data-testid="button-sell-now"
                >
                  Sell Now
                </Button>
              </div>
              
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="font-semibold mb-3">Set New Alert</p>
                <div className="flex items-center space-x-2">
                  <Select>
                    <SelectTrigger className="flex-1" data-testid="select-crop-alert">
                      <SelectValue placeholder="Select Crop" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maize">Maize</SelectItem>
                      <SelectItem value="cotton">Cotton</SelectItem>
                      <SelectItem value="soybean">Soybean</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input 
                    type="number" 
                    placeholder="Target price" 
                    className="w-28"
                    data-testid="input-target-price"
                  />
                  <Button 
                    className="bg-primary text-primary-foreground"
                    data-testid="button-set-alert"
                  >
                    Set Alert
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
