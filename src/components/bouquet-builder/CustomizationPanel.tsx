import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Package, Ribbon, Palette, Sparkles, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/contexts/CurrencyContext';

export type WrapType = 'kraft' | 'cellophane' | 'burlap' | 'fabric' | 'mesh' | 'none';

interface WrapOption {
  id: WrapType;
  name: string;
  color: string;
  price: number;
  texture?: string;
}

const WRAP_OPTIONS: WrapOption[] = [
  { id: 'kraft', name: 'Kraft Paper', color: '#d4a574', price: 5 },
  { id: 'cellophane', name: 'Clear Cellophane', color: 'transparent', price: 3 },
  { id: 'burlap', name: 'Burlap Wrap', color: '#a67c52', price: 8 },
  { id: 'fabric', name: 'Fabric Wrap', color: '#f8b4c4', price: 10 },
  { id: 'mesh', name: 'Decorative Mesh', color: '#e8d5b7', price: 6 },
  { id: 'none', name: 'No Wrap', color: '#f5f5f5', price: 0 },
];

const WRAP_COLORS = [
  { name: 'Natural', color: '#d4a574' },
  { name: 'White', color: '#f5f5f5' },
  { name: 'Pink', color: '#f8b4c4' },
  { name: 'Sage', color: '#9caf88' },
  { name: 'Navy', color: '#1e3a5f' },
  { name: 'Black', color: '#1f2937' },
  { name: 'Gold', color: '#d4af37' },
  { name: 'Burgundy', color: '#722f37' },
];

type RibbonShape = 'classic' | 'bow' | 'cascade' | 'minimal' | 'double' | 'none';

const RIBBON_SHAPES: { id: RibbonShape; name: string; icon: string }[] = [
  { id: 'classic', name: 'Classic Tie', icon: '🎀' },
  { id: 'bow', name: 'Full Bow', icon: '🎁' },
  { id: 'cascade', name: 'Cascade', icon: '🌊' },
  { id: 'minimal', name: 'Minimal', icon: '➖' },
  { id: 'double', name: 'Double Bow', icon: '✨' },
  { id: 'none', name: 'None', icon: '❌' },
];

const RIBBON_COLORS = [
  { name: 'Red', color: '#dc2626' },
  { name: 'Pink', color: '#ec4899' },
  { name: 'White', color: '#f5f5f5' },
  { name: 'Gold', color: '#d4af37' },
  { name: 'Navy', color: '#1e3a5f' },
  { name: 'Purple', color: '#7c3aed' },
  { name: 'Green', color: '#16a34a' },
  { name: 'Black', color: '#1f2937' },
  { name: 'Rose Gold', color: '#e8b4b4' },
  { name: 'Silver', color: '#c0c0c0' },
];

export interface CustomizationData {
  wrapType: WrapType;
  wrapColor: string;
  ribbonShape: RibbonShape;
  ribbonColor: string;
  ribbonWidth: number;
}

interface CustomizationPanelProps {
  value: CustomizationData;
  onChange: (data: CustomizationData) => void;
  className?: string;
}

export const CustomizationPanel: React.FC<CustomizationPanelProps> = ({
  value,
  onChange,
  className,
}) => {
  const { formatPrice } = useCurrency();

  const updateField = <K extends keyof CustomizationData>(field: K, newValue: CustomizationData[K]) => {
    onChange({ ...value, [field]: newValue });
  };

  const wrapPrice = WRAP_OPTIONS.find(w => w.id === value.wrapType)?.price || 0;

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Customization
          <Badge variant="secondary" className="ml-auto text-[10px]">
            +{formatPrice(wrapPrice)}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-2">
        <Tabs defaultValue="wrap" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-9">
            <TabsTrigger value="wrap" className="text-xs gap-1.5">
              <Package className="w-3 h-3" />
              Wrap
            </TabsTrigger>
            <TabsTrigger value="ribbon" className="text-xs gap-1.5">
              <Ribbon className="w-3 h-3" />
              Ribbon
            </TabsTrigger>
            <TabsTrigger value="colors" className="text-xs gap-1.5">
              <Palette className="w-3 h-3" />
              Colors
            </TabsTrigger>
          </TabsList>

          {/* Wrap Type */}
          <TabsContent value="wrap" className="mt-3 space-y-3">
            <Label className="text-xs text-muted-foreground">Wrapping Style</Label>
            <ScrollArea className="h-36">
              <div className="grid grid-cols-2 gap-2 pr-2">
                {WRAP_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    className={cn(
                      'p-2.5 rounded-lg border-2 transition-all text-left',
                      'hover:border-primary/50',
                      value.wrapType === option.id
                        ? 'border-primary bg-primary/5'
                        : 'border-muted'
                    )}
                    onClick={() => updateField('wrapType', option.id)}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full border flex-shrink-0',
                          option.id === 'cellophane' && 'bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(0,0,0,0.05)_2px,rgba(0,0,0,0.05)_4px)]'
                        )}
                        style={{ backgroundColor: option.color }}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{option.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {option.price === 0 ? 'Free' : `+${formatPrice(option.price)}`}
                        </p>
                      </div>
                    </div>
                    {value.wrapType === option.id && (
                      <Check className="absolute top-1.5 right-1.5 w-3.5 h-3.5 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Ribbon Shape */}
          <TabsContent value="ribbon" className="mt-3 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Ribbon Shape</Label>
              <div className="grid grid-cols-3 gap-2">
                {RIBBON_SHAPES.map((shape) => (
                  <button
                    key={shape.id}
                    className={cn(
                      'p-2 rounded-lg border-2 transition-all flex flex-col items-center gap-1',
                      value.ribbonShape === shape.id
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-primary/50'
                    )}
                    onClick={() => updateField('ribbonShape', shape.id)}
                  >
                    <span className="text-lg">{shape.icon}</span>
                    <span className="text-[10px] font-medium">{shape.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Ribbon Width</Label>
              <div className="px-1">
                <Slider
                  value={[value.ribbonWidth]}
                  onValueChange={([val]) => updateField('ribbonWidth', val)}
                  min={1}
                  max={5}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                  <span>Thin</span>
                  <span>Wide</span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Colors */}
          <TabsContent value="colors" className="mt-3 space-y-4">
            {/* Wrap Color */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Wrap Color</Label>
              <div className="grid grid-cols-4 gap-2">
                {WRAP_COLORS.map((option) => (
                  <button
                    key={option.color}
                    className={cn(
                      'aspect-square rounded-full border-2 transition-all',
                      value.wrapColor === option.color
                        ? 'border-foreground scale-110 ring-2 ring-primary/30'
                        : 'border-transparent hover:scale-105'
                    )}
                    style={{ backgroundColor: option.color }}
                    onClick={() => updateField('wrapColor', option.color)}
                    title={option.name}
                  />
                ))}
              </div>
            </div>

            {/* Ribbon Color */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Ribbon Color</Label>
              <div className="grid grid-cols-5 gap-2">
                {RIBBON_COLORS.map((option) => (
                  <button
                    key={option.color}
                    className={cn(
                      'aspect-square rounded-full border-2 transition-all',
                      value.ribbonColor === option.color
                        ? 'border-foreground scale-110 ring-2 ring-primary/30'
                        : 'border-transparent hover:scale-105'
                    )}
                    style={{ backgroundColor: option.color }}
                    onClick={() => updateField('ribbonColor', option.color)}
                    title={option.name}
                  />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export { WRAP_OPTIONS, RIBBON_SHAPES, RIBBON_COLORS };
