import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Leaf, Sun, Snowflake, Cloud } from 'lucide-react';
import { FlowerData } from './FlowerCard';
import { cn } from '@/lib/utils';

type Season = 'spring' | 'summer' | 'fall' | 'winter';

interface SeasonInfo {
  name: string;
  icon: React.ReactNode;
  months: number[];
  colors: string[];
  description: string;
}

const SEASONS: Record<Season, SeasonInfo> = {
  spring: {
    name: 'Spring',
    icon: <Cloud className="w-4 h-4" />,
    months: [3, 4, 5],
    colors: ['pink', 'purple', 'yellow', 'white'],
    description: 'Fresh tulips, daffodils & cherry blossoms',
  },
  summer: {
    name: 'Summer',
    icon: <Sun className="w-4 h-4" />,
    months: [6, 7, 8],
    colors: ['yellow', 'orange', 'red', 'pink'],
    description: 'Vibrant sunflowers, roses & dahlias',
  },
  fall: {
    name: 'Fall',
    icon: <Leaf className="w-4 h-4" />,
    months: [9, 10, 11],
    colors: ['orange', 'red', 'purple', 'cream'],
    description: 'Rich chrysanthemums & marigolds',
  },
  winter: {
    name: 'Winter',
    icon: <Snowflake className="w-4 h-4" />,
    months: [12, 1, 2],
    colors: ['white', 'red', 'green', 'cream'],
    description: 'Elegant roses, amaryllis & evergreens',
  },
};

// Seasonal flower availability
const SEASONAL_FLOWERS: Record<Season, string[]> = {
  spring: ['tulip', 'peony', 'daffodil', 'hyacinth', 'lilac', 'iris'],
  summer: ['sunflower', 'rose', 'lily', 'dahlia', 'zinnia', 'hydrangea'],
  fall: ['chrysanthemum', 'marigold', 'aster', 'rose', 'carnation'],
  winter: ['rose', 'amaryllis', 'poinsettia', 'holly', 'eucalyptus', 'pine'],
};

const getCurrentSeason = (): Season => {
  const month = new Date().getMonth() + 1;
  if ([3, 4, 5].includes(month)) return 'spring';
  if ([6, 7, 8].includes(month)) return 'summer';
  if ([9, 10, 11].includes(month)) return 'fall';
  return 'winter';
};

interface SeasonalRecommendationsProps {
  flowers: FlowerData[];
  onFlowerClick?: (flower: FlowerData) => void;
}

export const SeasonalRecommendations: React.FC<SeasonalRecommendationsProps> = ({
  flowers,
  onFlowerClick,
}) => {
  const currentSeason = getCurrentSeason();
  const seasonInfo = SEASONS[currentSeason];
  const seasonalFlowerNames = SEASONAL_FLOWERS[currentSeason];

  const recommendedFlowers = useMemo(() => {
    // Filter flowers that match the current season
    const seasonal = flowers.filter((flower) => {
      const nameLower = flower.name.toLowerCase();
      return seasonalFlowerNames.some((sf) => nameLower.includes(sf));
    });

    // If not enough seasonal matches, add flowers with matching colors
    if (seasonal.length < 4) {
      const colorMatched = flowers.filter((flower) => {
        const colorLower = flower.color.toLowerCase();
        return seasonInfo.colors.some((c) => colorLower.includes(c));
      });
      
      const combined = [...seasonal, ...colorMatched.filter(f => !seasonal.includes(f))];
      return combined.slice(0, 6);
    }

    return seasonal.slice(0, 6);
  }, [flowers, seasonalFlowerNames, seasonInfo.colors]);

  if (recommendedFlowers.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            {seasonInfo.icon}
            {seasonInfo.name} Picks
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            In Season
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{seasonInfo.description}</p>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-thin">
          {recommendedFlowers.map((flower) => (
            <button
              key={flower.id}
              onClick={() => onFlowerClick?.(flower)}
              className={cn(
                "flex-shrink-0 w-16 sm:w-20 p-2 rounded-lg border-2 transition-all",
                "border-muted hover:border-primary/50 hover:scale-105",
                "flex flex-col items-center gap-1"
              )}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
                <img
                  src={flower.image}
                  alt={flower.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.backgroundColor = flower.color;
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <span className="text-[10px] sm:text-xs font-medium text-center line-clamp-1">
                {flower.name.split(' ').slice(-1)[0]}
              </span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
