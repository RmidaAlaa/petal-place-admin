import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Shuffle, Search, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/contexts/CurrencyContext';
import { FlowerData } from './FlowerCard';
import { CanvasFlower } from './VisualBouquetCanvas';

interface FlowerSwapMenuProps {
  selectedFlower: CanvasFlower | null;
  availableFlowers: FlowerData[];
  onSwap: (newFlower: FlowerData) => void;
  onClose: () => void;
  isOpen: boolean;
  position?: { x: number; y: number };
}

export const FlowerSwapMenu: React.FC<FlowerSwapMenuProps> = ({
  selectedFlower,
  availableFlowers,
  onSwap,
  onClose,
  isOpen,
  position,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { formatPrice } = useCurrency();

  const categories = ['all', 'focal', 'filler', 'greenery'];
  
  const filteredFlowers = availableFlowers.filter(flower => {
    const matchesSearch = flower.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          flower.color.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || selectedCategory === 'all' || flower.category === selectedCategory;
    return matchesSearch && matchesCategory && flower.stock > 0;
  });

  if (!isOpen || !selectedFlower) return null;

  return (
    <div 
      className="absolute z-50 animate-scale-in"
      style={{
        left: position?.x ?? '50%',
        top: position?.y ?? '50%',
        transform: 'translate(-50%, -50%)',
      }}
    >
      <Card className="w-72 sm:w-80 shadow-2xl border-2">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm flex items-center gap-2">
              <Shuffle className="w-4 h-4 text-primary" />
              Swap Flower
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Replace "{selectedFlower.name}"
            </p>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search flowers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-1.5 flex-wrap">
            {categories.map((cat) => (
              <Badge
                key={cat}
                variant={selectedCategory === cat || (!selectedCategory && cat === 'all') ? 'default' : 'outline'}
                className="cursor-pointer text-xs capitalize hover:bg-primary/10"
                onClick={() => setSelectedCategory(cat === 'all' ? null : cat)}
              >
                {cat}
              </Badge>
            ))}
          </div>

          {/* Flower List */}
          <ScrollArea className="h-48">
            <div className="space-y-1.5 pr-2">
              {filteredFlowers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No flowers found
                </p>
              ) : (
                filteredFlowers.map((flower) => (
                  <button
                    key={flower.id}
                    className={cn(
                      'w-full p-2 rounded-lg border flex items-center gap-3 transition-all',
                      'hover:border-primary hover:bg-primary/5',
                      flower.id === selectedFlower.id && 'border-primary bg-primary/10'
                    )}
                    onClick={() => {
                      onSwap(flower);
                      onClose();
                    }}
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={flower.image}
                        alt={flower.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-medium truncate">{flower.name}</p>
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-3 h-3 rounded-full border"
                          style={{ backgroundColor: flower.color }}
                        />
                        <span className="text-xs text-muted-foreground capitalize">{flower.category}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-primary">{formatPrice(flower.price)}</p>
                      <p className="text-[10px] text-muted-foreground">{flower.stock} left</p>
                    </div>
                    {flower.id === selectedFlower.id && (
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
