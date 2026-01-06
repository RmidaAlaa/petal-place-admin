import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Maximize, Minimize, Square } from 'lucide-react';

export type BouquetSize = 'small' | 'medium' | 'large';

interface SizeOption {
  id: BouquetSize;
  name: string;
  description: string;
  priceMultiplier: number;
  scaleMultiplier: number;
  icon: React.ReactNode;
}

const SIZE_OPTIONS: SizeOption[] = [
  {
    id: 'small',
    name: 'Small',
    description: '5-8 flowers',
    priceMultiplier: 0.8,
    scaleMultiplier: 0.75,
    icon: <Minimize className="w-5 h-5" />,
  },
  {
    id: 'medium',
    name: 'Medium',
    description: '9-15 flowers',
    priceMultiplier: 1,
    scaleMultiplier: 1,
    icon: <Square className="w-5 h-5" />,
  },
  {
    id: 'large',
    name: 'Large',
    description: '16-25 flowers',
    priceMultiplier: 1.4,
    scaleMultiplier: 1.25,
    icon: <Maximize className="w-5 h-5" />,
  },
];

interface SizeSelectorProps {
  value: BouquetSize;
  onChange: (size: BouquetSize) => void;
}

export const SizeSelector: React.FC<SizeSelectorProps> = ({ value, onChange }) => {
  const { formatPrice } = useCurrency();
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Bouquet Size</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {SIZE_OPTIONS.map((option) => (
            <button
              key={option.id}
              className={cn(
                "relative p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1.5 text-center",
                value === option.id
                  ? "border-primary bg-primary/5"
                  : "border-muted hover:border-primary/50"
              )}
              onClick={() => onChange(option.id)}
            >
              <div className={cn(
                "p-2 rounded-full transition-colors",
                value === option.id ? "bg-primary text-primary-foreground" : "bg-muted"
              )}>
                {option.icon}
              </div>
              <span className="text-sm font-medium">{option.name}</span>
              <span className="text-xs text-muted-foreground">{option.description}</span>
              {option.priceMultiplier !== 1 && (
                <Badge 
                  variant={option.priceMultiplier < 1 ? "secondary" : "default"} 
                  className="text-[10px] mt-1"
                >
                  {option.priceMultiplier < 1 ? '-20%' : '+40%'}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const getSizeMultipliers = (size: BouquetSize) => {
  const option = SIZE_OPTIONS.find(o => o.id === size);
  return {
    priceMultiplier: option?.priceMultiplier || 1,
    scaleMultiplier: option?.scaleMultiplier || 1,
  };
};
