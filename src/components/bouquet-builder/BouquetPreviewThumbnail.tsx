import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CanvasFlower } from './VisualBouquetCanvas';
import { Eye } from 'lucide-react';

interface BouquetPreviewThumbnailProps {
  items: CanvasFlower[];
  wrapping: 'paper' | 'cellophane' | 'burlap' | 'fabric';
  ribbonColor: string;
  className?: string;
}

const WRAPPING_COLORS = {
  paper: '#d4a574',
  cellophane: '#e0e0e0',
  burlap: '#a67c52',
  fabric: '#f8b4c4',
};

export const BouquetPreviewThumbnail: React.FC<BouquetPreviewThumbnailProps> = ({
  items,
  wrapping,
  ribbonColor,
  className,
}) => {
  // Calculate positions scaled down for thumbnail
  const scaledItems = useMemo(() => {
    if (items.length === 0) return [];
    
    // Find bounds
    const minX = Math.min(...items.map(i => i.x), 0);
    const maxX = Math.max(...items.map(i => i.x), 200);
    const minY = Math.min(...items.map(i => i.y), 0);
    const maxY = Math.max(...items.map(i => i.y), 200);
    
    const width = maxX - minX + 60;
    const height = maxY - minY + 60;
    const scale = Math.min(80 / width, 80 / height, 0.4);
    
    return items.map(item => ({
      ...item,
      scaledX: (item.x - minX) * scale + 10,
      scaledY: (item.y - minY) * scale + 10,
      scaledSize: Math.max(12, 16 * item.scale * scale),
    }));
  }, [items]);

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Eye className="w-3.5 h-3.5" />
          Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        <div
          className="relative w-24 h-24 rounded-full border-4"
          style={{
            backgroundColor: WRAPPING_COLORS[wrapping],
            borderColor: `${WRAPPING_COLORS[wrapping]}dd`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          {/* Inner area */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-green-50 to-green-100/50 overflow-hidden">
            {items.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-[10px] text-muted-foreground text-center px-2">
                  Add flowers
                </span>
              </div>
            ) : (
              scaledItems.map((item) => (
                <div
                  key={item.canvasId}
                  className="absolute rounded-full overflow-hidden border border-white shadow-sm"
                  style={{
                    left: item.scaledX,
                    top: item.scaledY,
                    width: item.scaledSize,
                    height: item.scaledSize,
                    transform: `rotate(${item.rotation}deg)`,
                    zIndex: item.zIndex,
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const el = e.target as HTMLImageElement;
                      el.style.display = 'none';
                      el.parentElement!.style.backgroundColor = item.color;
                    }}
                  />
                </div>
              ))
            )}
          </div>

          {/* Ribbon */}
          <div
            className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-2 rounded-full"
            style={{
              background: `linear-gradient(135deg, ${ribbonColor}dd, ${ribbonColor})`,
            }}
          />
        </div>
      </CardContent>
      
      {/* Stats */}
      {items.length > 0 && (
        <div className="px-4 pb-3">
          <div className="text-center text-xs text-muted-foreground">
            {items.length} flower{items.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </Card>
  );
};
