import React from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Heart, Star, Gift, Sun, Leaf, Crown, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/contexts/CurrencyContext';

export interface QuickTemplate {
  id: string;
  name: string;
  icon: React.ReactNode;
  preview: string;
  description: string;
  flowerCount: number;
  basePrice: number;
  popular?: boolean;
  new?: boolean;
}

const QUICK_TEMPLATES: QuickTemplate[] = [
  {
    id: 'romantic-roses',
    name: 'Romantic Roses',
    icon: <Heart className="w-5 h-5 text-rose-500" />,
    preview: '🌹🌹🌹',
    description: 'Classic red roses with baby\'s breath',
    flowerCount: 12,
    basePrice: 65,
    popular: true,
  },
  {
    id: 'spring-garden',
    name: 'Spring Garden',
    icon: <Sun className="w-5 h-5 text-yellow-500" />,
    preview: '🌷🌻🌸',
    description: 'Colorful mix of seasonal blooms',
    flowerCount: 15,
    basePrice: 55,
    new: true,
  },
  {
    id: 'elegant-whites',
    name: 'Elegant Whites',
    icon: <Crown className="w-5 h-5 text-gray-400" />,
    preview: '🤍🤍🤍',
    description: 'Pristine white roses and lilies',
    flowerCount: 10,
    basePrice: 75,
  },
  {
    id: 'tropical-paradise',
    name: 'Tropical Paradise',
    icon: <Leaf className="w-5 h-5 text-green-500" />,
    preview: '🌺🌴🌸',
    description: 'Exotic orchids and tropical flowers',
    flowerCount: 8,
    basePrice: 85,
  },
  {
    id: 'birthday-blast',
    name: 'Birthday Blast',
    icon: <Gift className="w-5 h-5 text-purple-500" />,
    preview: '🎉🌸🌼',
    description: 'Vibrant celebration bouquet',
    flowerCount: 14,
    basePrice: 60,
    popular: true,
  },
  {
    id: 'sympathy-peace',
    name: 'Peaceful Sympathy',
    icon: <Star className="w-5 h-5 text-blue-400" />,
    preview: '🕊️💐🤍',
    description: 'Gentle whites and soft pastels',
    flowerCount: 12,
    basePrice: 70,
  },
  {
    id: 'wild-meadow',
    name: 'Wild Meadow',
    icon: <Zap className="w-5 h-5 text-orange-500" />,
    preview: '🌻🌾💐',
    description: 'Rustic wildflowers arrangement',
    flowerCount: 18,
    basePrice: 50,
    new: true,
  },
];

interface QuickStartTemplateBarProps {
  onSelectTemplate: (template: QuickTemplate) => void;
  selectedTemplateId?: string | null;
  className?: string;
}

export const QuickStartTemplateBar: React.FC<QuickStartTemplateBarProps> = ({
  onSelectTemplate,
  selectedTemplateId,
  className,
}) => {
  const { formatPrice } = useCurrency();

  return (
    <div className={cn('bg-card border-b', className)}>
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Quick Start Templates</h3>
          <span className="text-xs text-muted-foreground">One-tap bouquet generation</span>
        </div>
        
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-3 pb-2">
            {QUICK_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => onSelectTemplate(template)}
                className={cn(
                  'flex-shrink-0 w-32 sm:w-40 p-3 rounded-xl border-2 transition-all duration-200 text-left',
                  'hover:shadow-md hover:border-primary/50 hover:scale-[1.02]',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                  selectedTemplateId === template.id
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-border bg-card'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 rounded-lg bg-muted">
                    {template.icon}
                  </div>
                  <div className="flex gap-1">
                    {template.popular && (
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-primary/10 text-primary">
                        Popular
                      </Badge>
                    )}
                    {template.new && (
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                        New
                      </Badge>
                    )}
                  </div>
                </div>
                
                <p className="text-sm font-medium truncate">{template.name}</p>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{template.description}</p>
                
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                  <span className="text-[10px] text-muted-foreground">{template.flowerCount} flowers</span>
                  <span className="text-xs font-semibold text-primary">{formatPrice(template.basePrice)}</span>
                </div>
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
};

export { QUICK_TEMPLATES };
