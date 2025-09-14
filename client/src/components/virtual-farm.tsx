import { Farm, UserProgress } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wheat, Sprout, Droplets, Recycle, Thermometer, MapPin } from 'lucide-react';

interface VirtualFarmProps {
  farm: Farm;
  progress: UserProgress;
}

export default function VirtualFarm({ farm, progress }: VirtualFarmProps) {
  const getCropIcon = (crop: string) => {
    const lowerCrop = crop.toLowerCase();
    if (lowerCrop.includes('wheat')) return Wheat;
    return Sprout;
  };

  const getSustainabilityColor = (score: number) => {
    if (score >= 80) return 'bg-success';
    if (score >= 60) return 'bg-accent';
    return 'bg-secondary';
  };

  return (
    <Card className="overflow-hidden" data-testid="virtual-farm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">My Virtual Farm</CardTitle>
          <Badge className={`${getSustainabilityColor(progress.sustainabilityScore)} text-white`}>
            Healthy
          </Badge>
        </div>
      </CardHeader>
      
      <div className="farm-gradient h-48 relative">
        <div className="absolute inset-0 p-4 flex flex-col justify-between">
          {/* Crop fields representation */}
          <div className="grid grid-cols-2 gap-2 h-24">
            {farm.primaryCrops.slice(0, 2).map((crop, index) => {
              const CropIcon = getCropIcon(crop);
              return (
                <div
                  key={crop}
                  className={`bg-green-400/30 rounded-lg border-2 border-green-500/50 flex items-center justify-center ${
                    index === 0 ? 'pulse-glow' : ''
                  }`}
                  data-testid={`crop-field-${index}`}
                >
                  <div className="text-center">
                    <CropIcon className="text-green-600 h-6 w-6 mx-auto" />
                    <p className="text-xs mt-1 text-green-700">{crop}</p>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Farm elements based on progress */}
          <div className="flex justify-between items-end">
            <div className="flex space-x-2">
              {progress.badges.includes('Compost Master') && (
                <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center pulse-glow" data-testid="compost-indicator">
                  <Recycle className="text-white h-3 w-3" />
                </div>
              )}
              {progress.badges.includes('Water Saver') && (
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center" data-testid="irrigation-indicator">
                  <Droplets className="text-white h-3 w-3" />
                </div>
              )}
            </div>
            <div className="text-right text-xs">
              {progress.badges.includes('Compost Master') && (
                <p className="text-green-700">🌱 Compost Active</p>
              )}
              {progress.badges.includes('Water Saver') && (
                <p className="text-blue-700">💧 Drip Irrigation</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <CardContent className="p-4 bg-muted/50">
        <div className="flex justify-between text-sm">
          <div className="flex items-center" data-testid="farm-location">
            <MapPin className="h-4 w-4 text-muted-foreground mr-1" />
            <span>{farm.village}, {farm.district}, {farm.state}</span>
          </div>
          <div className="flex items-center" data-testid="weather-info">
            <Thermometer className="h-4 w-4 text-orange-500 mr-1" />
            <span>28°C</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
