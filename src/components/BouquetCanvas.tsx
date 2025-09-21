import React, { useCallback } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BouquetItem } from './BouquetBuilder';
import { X, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BouquetCanvasProps {
  bouquetItems: BouquetItem[];
  onRemoveItem: (canvasId: string) => void;
  setBouquetItems: React.Dispatch<React.SetStateAction<BouquetItem[]>>;
}

const FlowerElement: React.FC<{
  item: BouquetItem;
  onRemove: () => void;
  onUpdate: (updates: Partial<BouquetItem>) => void;
}> = ({ item, onRemove, onUpdate }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `canvas-${item.canvasId}`,
    data: {
      type: 'canvas-item',
      item,
    },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0) rotate(${item.rotation}deg) scale(${item.scale})`,
  } : {
    transform: `rotate(${item.rotation}deg) scale(${item.scale})`,
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "absolute group cursor-move select-none",
        isDragging && "z-50"
      )}
      style={{
        left: item.x,
        top: item.y,
        transformOrigin: 'center',
        ...style,
      }}
      {...listeners}
      {...attributes}
    >
      {/* Flower representation */}
      <div 
        className="w-16 h-16 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
        style={{ backgroundColor: item.color }}
      >
        <span className="text-white text-xs font-bold">
          {item.name.substring(0, 2).toUpperCase()}
        </span>
      </div>

      {/* Controls (visible on hover) */}
      <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="sm"
          variant="destructive"
          className="h-6 w-6 p-0 rounded-full"
          onClick={onRemove}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      {/* Rotation controls */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            className="h-6 w-6 p-0"
            onClick={() => onUpdate({ rotation: item.rotation - 15 })}
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-6 w-6 p-0"
            onClick={() => onUpdate({ scale: Math.max(0.5, item.scale - 0.1) })}
          >
            <ZoomOut className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-6 w-6 p-0"
            onClick={() => onUpdate({ scale: Math.min(2, item.scale + 0.1) })}
          >
            <ZoomIn className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Flower info tooltip */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <div className="bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          {item.name} - {item.price} SAR
        </div>
      </div>
    </div>
  );
};

export const BouquetCanvas: React.FC<BouquetCanvasProps> = ({
  bouquetItems,
  onRemoveItem,
  setBouquetItems,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'bouquet-canvas',
  });

  const updateItem = useCallback((canvasId: string, updates: Partial<BouquetItem>) => {
    setBouquetItems(prev => 
      prev.map(item => 
        item.canvasId === canvasId 
          ? { ...item, ...updates }
          : item
      )
    );
  }, [setBouquetItems]);

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-primary">Bouquet Canvas</h2>
        <p className="text-sm text-muted-foreground">
          Drop flowers here and arrange them to create your bouquet
        </p>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "relative bg-gradient-to-br from-cream/50 to-sage/30 border-2 border-dashed rounded-lg",
          "min-h-[500px] overflow-hidden transition-colors",
          isOver ? "border-primary bg-primary/5" : "border-muted",
          bouquetItems.length === 0 && "flex items-center justify-center"
        )}
      >
        {bouquetItems.length === 0 ? (
          <div className="text-center text-muted-foreground">
            <div className="text-4xl mb-4">🌸</div>
            <p className="text-lg font-medium">Drop flowers here to start building</p>
            <p className="text-sm">Drag flowers from the inventory panel</p>
          </div>
        ) : (
          <>
            {/* Background pattern/guides */}
            <div className="absolute inset-0 opacity-10">
              <svg width="100%" height="100%">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* Render flowers */}
            {bouquetItems.map((item) => (
              <FlowerElement
                key={item.canvasId}
                item={item}
                onRemove={() => onRemoveItem(item.canvasId)}
                onUpdate={(updates) => updateItem(item.canvasId, updates)}
              />
            ))}
          </>
        )}
      </div>

      {bouquetItems.length > 0 && (
        <div className="mt-4 text-sm text-muted-foreground">
          <p>💡 Click and drag flowers to reposition • Hover for rotation and scaling controls</p>
        </div>
      )}
    </Card>
  );
};