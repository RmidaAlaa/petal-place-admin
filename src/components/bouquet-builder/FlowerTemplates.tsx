import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Sparkles, Heart, Star, Gift, Flower2 } from 'lucide-react';

// Define our own template arrangement type that's independent of CanvasFlower
export interface TemplateArrangement {
  id: string;
  flowerId: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  zIndex: number;
}

export interface FlowerTemplate {
  id: string;
  name: string;
  description: string;
  category: 'romantic' | 'elegant' | 'vibrant' | 'minimal' | 'seasonal';
  icon: React.ReactNode;
  arrangement: TemplateArrangement[];
  basePrice: number;
  popular?: boolean;
}

interface FlowerTemplatesProps {
  onSelectTemplate: (template: FlowerTemplate) => void;
  className?: string;
}

const FLOWER_TEMPLATES: FlowerTemplate[] = [
  {
    id: 'romantic-roses',
    name: 'Romantic Roses',
    description: 'Classic red roses arranged in a heart pattern',
    category: 'romantic',
    icon: <Heart className="h-4 w-4 text-red-500" />,
    basePrice: 75,
    popular: true,
    arrangement: [
      { id: 'r1', flowerId: 'red-rose', x: 50, y: 30, rotation: 0, scale: 1.2, zIndex: 5 },
      { id: 'r2', flowerId: 'red-rose', x: 35, y: 40, rotation: -15, scale: 1.1, zIndex: 4 },
      { id: 'r3', flowerId: 'red-rose', x: 65, y: 40, rotation: 15, scale: 1.1, zIndex: 4 },
      { id: 'r4', flowerId: 'red-rose', x: 25, y: 55, rotation: -25, scale: 1.0, zIndex: 3 },
      { id: 'r5', flowerId: 'red-rose', x: 75, y: 55, rotation: 25, scale: 1.0, zIndex: 3 },
      { id: 'r6', flowerId: 'pink-rose', x: 40, y: 65, rotation: -10, scale: 0.9, zIndex: 2 },
      { id: 'r7', flowerId: 'pink-rose', x: 60, y: 65, rotation: 10, scale: 0.9, zIndex: 2 },
      { id: 'r8', flowerId: 'babys-breath', x: 30, y: 75, rotation: 0, scale: 0.8, zIndex: 1 },
      { id: 'r9', flowerId: 'babys-breath', x: 70, y: 75, rotation: 0, scale: 0.8, zIndex: 1 },
    ],
  },
  {
    id: 'elegant-whites',
    name: 'Elegant Whites',
    description: 'Sophisticated white roses with eucalyptus',
    category: 'elegant',
    icon: <Star className="h-4 w-4 text-amber-500" />,
    basePrice: 85,
    popular: true,
    arrangement: [
      { id: 'e1', flowerId: 'white-rose', x: 50, y: 25, rotation: 0, scale: 1.3, zIndex: 6 },
      { id: 'e2', flowerId: 'white-rose', x: 35, y: 35, rotation: -20, scale: 1.2, zIndex: 5 },
      { id: 'e3', flowerId: 'white-rose', x: 65, y: 35, rotation: 20, scale: 1.2, zIndex: 5 },
      { id: 'e4', flowerId: 'peony', x: 50, y: 50, rotation: 0, scale: 1.1, zIndex: 4 },
      { id: 'e5', flowerId: 'eucalyptus', x: 25, y: 45, rotation: -30, scale: 0.9, zIndex: 3 },
      { id: 'e6', flowerId: 'eucalyptus', x: 75, y: 45, rotation: 30, scale: 0.9, zIndex: 3 },
      { id: 'e7', flowerId: 'eucalyptus', x: 20, y: 70, rotation: -45, scale: 0.85, zIndex: 2 },
      { id: 'e8', flowerId: 'eucalyptus', x: 80, y: 70, rotation: 45, scale: 0.85, zIndex: 2 },
    ],
  },
  {
    id: 'vibrant-sunset',
    name: 'Vibrant Sunset',
    description: 'Warm oranges, yellows and reds for energy',
    category: 'vibrant',
    icon: <Sparkles className="h-4 w-4 text-orange-500" />,
    basePrice: 65,
    arrangement: [
      { id: 'v1', flowerId: 'sunflower', x: 50, y: 25, rotation: 0, scale: 1.4, zIndex: 6 },
      { id: 'v2', flowerId: 'orange-lily', x: 30, y: 40, rotation: -15, scale: 1.1, zIndex: 5 },
      { id: 'v3', flowerId: 'orange-lily', x: 70, y: 40, rotation: 15, scale: 1.1, zIndex: 5 },
      { id: 'v4', flowerId: 'red-rose', x: 45, y: 55, rotation: -5, scale: 1.0, zIndex: 4 },
      { id: 'v5', flowerId: 'red-rose', x: 55, y: 55, rotation: 5, scale: 1.0, zIndex: 4 },
      { id: 'v6', flowerId: 'sunflower', x: 25, y: 65, rotation: -20, scale: 0.9, zIndex: 3 },
      { id: 'v7', flowerId: 'sunflower', x: 75, y: 65, rotation: 20, scale: 0.9, zIndex: 3 },
    ],
  },
  {
    id: 'minimal-lavender',
    name: 'Minimal Lavender',
    description: 'Simple and calming lavender arrangement',
    category: 'minimal',
    icon: <Flower2 className="h-4 w-4 text-purple-500" />,
    basePrice: 45,
    arrangement: [
      { id: 'm1', flowerId: 'lavender', x: 45, y: 30, rotation: -5, scale: 1.0, zIndex: 3 },
      { id: 'm2', flowerId: 'lavender', x: 55, y: 30, rotation: 5, scale: 1.0, zIndex: 3 },
      { id: 'm3', flowerId: 'lavender', x: 50, y: 45, rotation: 0, scale: 1.1, zIndex: 4 },
      { id: 'm4', flowerId: 'eucalyptus', x: 35, y: 55, rotation: -20, scale: 0.9, zIndex: 2 },
      { id: 'm5', flowerId: 'eucalyptus', x: 65, y: 55, rotation: 20, scale: 0.9, zIndex: 2 },
      { id: 'm6', flowerId: 'babys-breath', x: 50, y: 70, rotation: 0, scale: 0.8, zIndex: 1 },
    ],
  },
  {
    id: 'spring-garden',
    name: 'Spring Garden',
    description: 'Fresh tulips and mixed spring flowers',
    category: 'seasonal',
    icon: <Gift className="h-4 w-4 text-green-500" />,
    basePrice: 70,
    popular: true,
    arrangement: [
      { id: 's1', flowerId: 'purple-tulip', x: 50, y: 25, rotation: 0, scale: 1.2, zIndex: 6 },
      { id: 's2', flowerId: 'purple-tulip', x: 35, y: 35, rotation: -10, scale: 1.1, zIndex: 5 },
      { id: 's3', flowerId: 'purple-tulip', x: 65, y: 35, rotation: 10, scale: 1.1, zIndex: 5 },
      { id: 's4', flowerId: 'pink-rose', x: 45, y: 50, rotation: -5, scale: 1.0, zIndex: 4 },
      { id: 's5', flowerId: 'pink-rose', x: 55, y: 50, rotation: 5, scale: 1.0, zIndex: 4 },
      { id: 's6', flowerId: 'babys-breath', x: 30, y: 60, rotation: -15, scale: 0.85, zIndex: 3 },
      { id: 's7', flowerId: 'babys-breath', x: 70, y: 60, rotation: 15, scale: 0.85, zIndex: 3 },
      { id: 's8', flowerId: 'eucalyptus', x: 25, y: 75, rotation: -25, scale: 0.8, zIndex: 2 },
      { id: 's9', flowerId: 'eucalyptus', x: 75, y: 75, rotation: 25, scale: 0.8, zIndex: 2 },
    ],
  },
  {
    id: 'peony-paradise',
    name: 'Peony Paradise',
    description: 'Lush peonies with delicate accents',
    category: 'elegant',
    icon: <Star className="h-4 w-4 text-pink-500" />,
    basePrice: 95,
    arrangement: [
      { id: 'p1', flowerId: 'peony', x: 50, y: 30, rotation: 0, scale: 1.4, zIndex: 6 },
      { id: 'p2', flowerId: 'peony', x: 30, y: 45, rotation: -15, scale: 1.2, zIndex: 5 },
      { id: 'p3', flowerId: 'peony', x: 70, y: 45, rotation: 15, scale: 1.2, zIndex: 5 },
      { id: 'p4', flowerId: 'pink-rose', x: 50, y: 60, rotation: 0, scale: 1.0, zIndex: 4 },
      { id: 'p5', flowerId: 'babys-breath', x: 25, y: 55, rotation: -20, scale: 0.8, zIndex: 3 },
      { id: 'p6', flowerId: 'babys-breath', x: 75, y: 55, rotation: 20, scale: 0.8, zIndex: 3 },
      { id: 'p7', flowerId: 'eucalyptus', x: 20, y: 70, rotation: -30, scale: 0.75, zIndex: 2 },
      { id: 'p8', flowerId: 'eucalyptus', x: 80, y: 70, rotation: 30, scale: 0.75, zIndex: 2 },
    ],
  },
];

const CATEGORY_COLORS: Record<FlowerTemplate['category'], string> = {
  romantic: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  elegant: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  vibrant: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  minimal: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  seasonal: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
};

export const FlowerTemplates: React.FC<FlowerTemplatesProps> = ({
  onSelectTemplate,
  className = '',
}) => {
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Quick Start Templates
        </h3>
      </div>
      
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-3 pb-2">
          {FLOWER_TEMPLATES.map((template) => (
            <Card
              key={template.id}
              className="flex-shrink-0 w-44 cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary/50 group"
              onClick={() => onSelectTemplate(template)}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  {template.icon}
                  <span className="font-medium text-sm truncate">{template.name}</span>
                </div>
                
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2 h-8">
                  {template.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <Badge className={`text-xs ${CATEGORY_COLORS[template.category]}`}>
                    {template.category}
                  </Badge>
                  {template.popular && (
                    <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                      Popular
                    </Badge>
                  )}
                </div>
                
                <div className="mt-2 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Base price</span>
                    <span className="font-semibold text-sm text-primary">${template.basePrice}</span>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Use Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export { FLOWER_TEMPLATES };
export default FlowerTemplates;
