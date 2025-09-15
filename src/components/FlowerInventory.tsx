import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FlowerItem } from './BouquetBuilder';
import { cn } from '@/lib/utils';

interface FlowerInventoryProps {
  flowers: FlowerItem[];
}

const DraggableFlower: React.FC<{ flower: FlowerItem }> = ({ flower }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: flower.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

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
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center space-x-3">
          <div 
            className="w-12 h-12 rounded-full flex-shrink-0 border-2 border-white shadow-sm"
            style={{ backgroundColor: flower.color }}
          />
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">{flower.name}</h4>
            <p className="text-xs text-muted-foreground truncate">{flower.nameAr}</p>
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm font-semibold text-primary">
                {flower.price} SAR
              </span>
              <Badge 
                variant={flower.stock > 10 ? "default" : flower.stock > 0 ? "secondary" : "destructive"}
                className="text-xs"
              >
                {flower.stock > 0 ? `${flower.stock} left` : 'Out of stock'}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="flex gap-1 mt-3">
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

export const FlowerInventory: React.FC<FlowerInventoryProps> = ({ flowers }) => {
  const groupedFlowers = flowers.reduce((groups, flower) => {
    if (!groups[flower.category]) {
      groups[flower.category] = [];
    }
    groups[flower.category].push(flower);
    return groups;
  }, {} as Record<string, FlowerItem[]>);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-primary">Flower Inventory</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Drag flowers to the canvas to build your bouquet
        </p>

        {Object.entries(groupedFlowers).map(([category, categoryFlowers]) => (
          <div key={category} className="mb-6 last:mb-0">
            <h3 className="text-lg font-medium capitalize mb-3 text-secondary-foreground">
              {category === 'focal' ? 'Main Flowers' : 
               category === 'filler' ? 'Filler Flowers' : 
               'Greenery & Foliage'}
            </h3>
            
            <div className="space-y-3">
              {categoryFlowers.map((flower) => (
                <DraggableFlower key={flower.id} flower={flower} />
              ))}
            </div>
          </div>
        ))}
      </Card>

      <Card className="p-4">
        <h3 className="font-medium mb-2">💡 Tips</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Start with focal flowers (roses)</li>
          <li>• Add fillers for texture</li>
          <li>• Include greenery for fullness</li>
          <li>• Balance colors and sizes</li>
        </ul>
      </Card>
    </div>
  );
};