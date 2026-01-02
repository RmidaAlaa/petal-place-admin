import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/contexts/CurrencyContext';

export interface FlowerData {
  id: string;
  name: string;
  nameAr?: string;
  price: number;
  color: string;
  image: string;
  category: string;
  size: 'small' | 'medium' | 'large';
  stock: number;
}

interface FlowerCardProps {
  flower: FlowerData;
  compact?: boolean;
}

export const FlowerCard: React.FC<FlowerCardProps> = ({ flower, compact = false }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: flower.id,
    data: { flower },
  });
  const { formatPrice } = useCurrency();

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  if (compact) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className={cn(
          "cursor-grab active:cursor-grabbing transition-all",
          isDragging && "opacity-50 scale-105"
        )}
      >
        <div className="relative group bg-card rounded-xl p-2 border hover:border-primary/50 hover:shadow-lg transition-all">
          <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-2">
            <img
              src={flower.image}
              alt={flower.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
            <div 
              className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: flower.color }}
            />
          </div>
          <p className="text-xs font-medium truncate">{flower.name}</p>
          <p className="text-xs text-primary font-semibold">{formatPrice(flower.price)}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50"
      )}
    >
      <Card className="p-3 hover:shadow-lg transition-all group hover:border-primary/50">
        <div className="flex items-center gap-3">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={flower.image}
              alt={flower.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
            <div 
              className="absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: flower.color }}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">{flower.name}</h4>
            {flower.nameAr && (
              <p className="text-xs text-muted-foreground truncate">{flower.nameAr}</p>
            )}
            
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-bold text-primary">
                {formatPrice(flower.price)}
              </span>
              <Badge 
                variant={flower.stock > 10 ? "default" : flower.stock > 0 ? "secondary" : "destructive"}
                className="text-xs"
              >
                {flower.stock > 0 ? `${flower.stock}` : 'Out'}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex gap-1 mt-2">
          <Badge variant="outline" className="text-xs capitalize">
            {flower.category}
          </Badge>
          <Badge variant="outline" className="text-xs capitalize">
            {flower.size}
          </Badge>
        </div>
      </Card>
    </div>
  );
};
