import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Leaf, 
  MapPin, 
  Droplets, 
  Recycle, 
  Heart, 
  Truck,
  Award,
  TreeDeciduous,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImpactData {
  carbonFootprint: number; // kg CO2
  waterSaved: number; // liters
  locallySourced: number; // percentage
  recyclablePackaging: boolean;
  fairTradeCertified: boolean;
  farmLocation: string;
  harvestDate: string;
  transportMethod: string;
}

interface ImpactDetailsPanelProps {
  flowerCount: number;
  className?: string;
}

export const ImpactDetailsPanel: React.FC<ImpactDetailsPanelProps> = ({
  flowerCount,
  className,
}) => {
  // Calculate impact based on flower count
  const impact: ImpactData = {
    carbonFootprint: Math.max(0.5, (flowerCount * 0.3)).toFixed(1) as unknown as number,
    waterSaved: flowerCount * 2.5,
    locallySourced: Math.min(100, 60 + flowerCount * 2),
    recyclablePackaging: true,
    fairTradeCertified: true,
    farmLocation: 'Local Partner Farms, Netherlands',
    harvestDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    transportMethod: 'Low-emission delivery',
  };

  const impactItems = [
    {
      icon: <TreeDeciduous className="w-4 h-4 text-green-600" />,
      label: 'Carbon Footprint',
      value: `${impact.carbonFootprint} kg CO₂`,
      description: 'Offset through our tree planting program',
      color: 'bg-green-50 dark:bg-green-950/30',
    },
    {
      icon: <Droplets className="w-4 h-4 text-blue-500" />,
      label: 'Water Efficiency',
      value: `${impact.waterSaved}L saved`,
      description: 'Through sustainable farming practices',
      color: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      icon: <MapPin className="w-4 h-4 text-rose-500" />,
      label: 'Locally Sourced',
      value: `${impact.locallySourced}%`,
      description: 'Supporting local flower farms',
      color: 'bg-rose-50 dark:bg-rose-950/30',
      progress: impact.locallySourced,
    },
  ];

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
        <CardTitle className="text-sm flex items-center gap-2">
          <Globe className="w-4 h-4 text-green-600" />
          Impact Details
          <Badge variant="secondary" className="ml-auto text-[10px] bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
            Sustainability Score: A+
          </Badge>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Your bouquet's environmental & social impact
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-4">
        {/* Impact Metrics */}
        <div className="space-y-3">
          {impactItems.map((item, index) => (
            <div key={index} className={cn('p-3 rounded-lg', item.color)}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <span className="text-sm font-bold">{item.value}</span>
              </div>
              <p className="text-xs text-muted-foreground">{item.description}</p>
              {item.progress && (
                <Progress value={item.progress} className="mt-2 h-1.5" />
              )}
            </div>
          ))}
        </div>

        <Separator />

        {/* Certifications */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Certifications</p>
          <div className="flex flex-wrap gap-2">
            {impact.recyclablePackaging && (
              <Badge variant="outline" className="text-xs gap-1 border-green-300 text-green-700 dark:text-green-400">
                <Recycle className="w-3 h-3" />
                100% Recyclable
              </Badge>
            )}
            {impact.fairTradeCertified && (
              <Badge variant="outline" className="text-xs gap-1 border-amber-300 text-amber-700 dark:text-amber-400">
                <Award className="w-3 h-3" />
                Fair Trade
              </Badge>
            )}
            <Badge variant="outline" className="text-xs gap-1 border-rose-300 text-rose-700 dark:text-rose-400">
              <Heart className="w-3 h-3" />
              Ethically Grown
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Origin Info */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Flower Origin</p>
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">{impact.farmLocation}</p>
              <p className="text-xs text-muted-foreground">Harvested: {impact.harvestDate}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <Truck className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">{impact.transportMethod}</p>
              <p className="text-xs text-muted-foreground">Temperature-controlled transit</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-xs text-center">
            <Leaf className="w-3 h-3 inline-block mr-1 text-green-600" />
            <span className="font-medium">Every purchase plants a tree</span>
            <span className="text-muted-foreground"> - {flowerCount > 0 ? '1' : '0'} tree will be planted with this order</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
