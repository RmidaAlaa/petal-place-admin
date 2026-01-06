import React, { useCallback } from 'react';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { X, RotateCcw, RotateCw, ZoomIn, ZoomOut, Move } from 'lucide-react';
import { FlowerData } from './FlowerCard';

export interface CanvasFlower extends FlowerData {
  canvasId: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  zIndex: number;
}

interface CanvasFlowerItemProps {
  item: CanvasFlower;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onUpdate: (updates: Partial<CanvasFlower>) => void;
}

const CanvasFlowerItem: React.FC<CanvasFlowerItemProps> = ({
  item,
  isSelected,
  onSelect,
  onRemove,
  onUpdate,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `canvas-${item.canvasId}`,
    data: { type: 'canvas-item', item },
  });

  const style = {
    left: item.x,
    top: item.y,
    transform: transform 
      ? `translate3d(${transform.x}px, ${transform.y}px, 0) rotate(${item.rotation}deg) scale(${item.scale})`
      : `rotate(${item.rotation}deg) scale(${item.scale})`,
    zIndex: isDragging ? 1000 : item.zIndex,
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "absolute group cursor-move select-none transition-shadow",
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background rounded-full",
        isDragging && "opacity-75"
      )}
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      {...listeners}
      {...attributes}
    >
      {/* Flower image with shadow and depth effect */}
      <div className="relative">
        <div 
          className="w-16 h-16 rounded-full overflow-hidden border-3 border-white shadow-xl"
          style={{
            boxShadow: '0 8px 25px -5px rgba(0,0,0,0.3), 0 4px 10px -5px rgba(0,0,0,0.2)',
          }}
        >
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).parentElement!.style.backgroundColor = item.color;
            }}
          />
          {/* Fallback color overlay */}
          <div 
            className="absolute inset-0 opacity-0"
            style={{ backgroundColor: item.color }}
          />
        </div>
        
        {/* Depth shadow underneath */}
        <div 
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-3 rounded-full bg-black/20 blur-sm"
        />
      </div>

      {/* Hover controls */}
      <div className={cn(
        "absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity",
        isSelected && "opacity-100"
      )}>
        <Button
          size="sm"
          variant="destructive"
          className="h-5 w-5 p-0 rounded-full shadow-lg"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      {/* Quick action buttons */}
      {isSelected && (
        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 flex gap-1 bg-background/95 backdrop-blur-sm p-1 rounded-lg shadow-lg border">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onUpdate({ rotation: item.rotation - 15 });
            }}
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onUpdate({ rotation: item.rotation + 15 });
            }}
          >
            <RotateCw className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onUpdate({ scale: Math.max(0.5, item.scale - 0.1) });
            }}
          >
            <ZoomOut className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onUpdate({ scale: Math.min(2, item.scale + 0.1) });
            }}
          >
            <ZoomIn className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Flower name tooltip */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
        <div className="bg-foreground text-background text-xs px-2 py-1 rounded-md whitespace-nowrap shadow-lg">
          {item.name}
        </div>
      </div>
    </div>
  );
};

interface VisualBouquetCanvasProps {
  items: CanvasFlower[];
  selectedItem: string | null;
  onItemSelect: (id: string | null) => void;
  onItemUpdate: (canvasId: string, updates: Partial<CanvasFlower>) => void;
  onItemRemove: (canvasId: string) => void;
  showGrid?: boolean;
  wrapping: 'paper' | 'cellophane' | 'burlap' | 'fabric';
  ribbonColor: string;
  sizeScale?: number;
}

export const VisualBouquetCanvas: React.FC<VisualBouquetCanvasProps> = ({
  items,
  selectedItem,
  onItemSelect,
  onItemUpdate,
  onItemRemove,
  showGrid = false,
  wrapping,
  ribbonColor,
  sizeScale = 1,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: 'bouquet-canvas' });

  const wrappingStyles = {
    paper: 'from-amber-50 to-amber-100 border-amber-200',
    cellophane: 'from-transparent to-white/30 border-gray-200',
    burlap: 'from-amber-100 to-amber-200 border-amber-300',
    fabric: 'from-rose-50 to-rose-100 border-rose-200',
  };

  const handleCanvasClick = useCallback(() => {
    onItemSelect(null);
  }, [onItemSelect]);

  return (
    <div className="flex flex-col items-center w-full">
      {/* Main Canvas */}
      <div
        ref={setNodeRef}
        className={cn(
          "relative rounded-full transition-all duration-300",
          "w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96",
          isOver && "ring-4 ring-primary/50"
        )}
        style={{
          transform: `scale(${sizeScale})`,
          transformOrigin: 'center center',
        }}
        onClick={handleCanvasClick}
      >
        {/* Outer wrapping layer */}
        <div 
          className={cn(
            "absolute inset-0 rounded-full bg-gradient-to-br border-4",
            wrappingStyles[wrapping]
          )}
          style={{
            boxShadow: '0 20px 60px -15px rgba(0,0,0,0.25), inset 0 2px 20px rgba(255,255,255,0.5)',
          }}
        />

        {/* Inner bouquet area */}
        <div 
          className="absolute inset-6 rounded-full bg-gradient-to-br from-green-50 to-green-100/50 overflow-hidden"
          style={{
            boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.1)',
          }}
        >
          {/* Grid overlay */}
          {showGrid && (
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: 'radial-gradient(circle, #64748b 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />
          )}

          {/* Empty state */}
          {items.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-muted-foreground/60 px-8">
                <Move className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-lg font-medium">Your Bouquet</p>
                <p className="text-sm mt-1">Drag flowers here to create your arrangement</p>
              </div>
            </div>
          )}

          {/* Flowers */}
          {items
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((item) => (
              <CanvasFlowerItem
                key={item.canvasId}
                item={item}
                isSelected={selectedItem === item.canvasId}
                onSelect={() => onItemSelect(item.canvasId)}
                onRemove={() => onItemRemove(item.canvasId)}
                onUpdate={(updates) => onItemUpdate(item.canvasId, updates)}
              />
            ))}
        </div>

        {/* Ribbon decoration */}
        <div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 w-24 h-8 rounded-full flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${ribbonColor}dd, ${ribbonColor})`,
            boxShadow: '0 4px 12px -2px rgba(0,0,0,0.2)',
          }}
        >
          <div className="text-white text-xs font-medium opacity-80">✨</div>
        </div>

        {/* Bow on top of ribbon */}
        <div 
          className="absolute bottom-14 left-1/2 -translate-x-1/2"
          style={{ color: ribbonColor }}
        >
          <svg width="40" height="24" viewBox="0 0 40 24" fill="currentColor">
            <ellipse cx="10" cy="12" rx="9" ry="10" opacity="0.9"/>
            <ellipse cx="30" cy="12" rx="9" ry="10" opacity="0.9"/>
            <circle cx="20" cy="12" r="4"/>
          </svg>
        </div>
      </div>

      {/* Helper text */}
      {items.length > 0 && (
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            💡 Click flower to select • Drag to reposition • Use controls to adjust
          </p>
        </div>
      )}
    </div>
  );
};
