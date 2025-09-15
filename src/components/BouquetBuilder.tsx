import React, { useState, useCallback } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FlowerInventory } from './FlowerInventory';
import { BouquetCanvas } from './BouquetCanvas';
import { Save, Share2, RotateCcw, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

export interface FlowerItem {
  id: string;
  name: string;
  nameAr: string;
  price: number;
  color: string;
  size: 'small' | 'medium' | 'large';
  category: 'focal' | 'filler' | 'greenery';
  image: string;
  stock: number;
}

export interface BouquetItem extends FlowerItem {
  canvasId: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

const INITIAL_FLOWERS: FlowerItem[] = [
  {
    id: 'rose-red-lg',
    name: 'Red Rose',
    nameAr: 'وردة حمراء',
    price: 8,
    color: '#dc2626',
    size: 'large',
    category: 'focal',
    image: '/placeholder.svg',
    stock: 50
  },
  {
    id: 'rose-pink-lg',
    name: 'Pink Rose',
    nameAr: 'وردة وردية',
    price: 8,
    color: '#ec4899',
    size: 'large',
    category: 'focal',
    image: '/placeholder.svg',
    stock: 30
  },
  {
    id: 'baby-breath',
    name: "Baby's Breath",
    nameAr: 'نفس الطفل',
    price: 5,
    color: '#ffffff',
    size: 'small',
    category: 'filler',
    image: '/placeholder.svg',
    stock: 100
  },
  {
    id: 'eucalyptus',
    name: 'Eucalyptus',
    nameAr: 'كافور',
    price: 3,
    color: '#22c55e',
    size: 'medium',
    category: 'greenery',
    image: '/placeholder.svg',
    stock: 40
  }
];

export const BouquetBuilder: React.FC = () => {
  const [flowers] = useState<FlowerItem[]>(INITIAL_FLOWERS);
  const [bouquetItems, setBouquetItems] = useState<BouquetItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [wrapping, setWrapping] = useState<'paper' | 'cellophane' | 'burlap'>('paper');

  const basePrice = 15; // Base bouquet price
  const wrappingPrices = { paper: 5, cellophane: 3, burlap: 8 };
  
  const totalPrice = bouquetItems.reduce((sum, item) => sum + item.price, basePrice + wrappingPrices[wrapping]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && over.id === 'bouquet-canvas') {
      const flower = flowers.find(f => f.id === active.id);
      if (flower && flower.stock > 0) {
        const newItem: BouquetItem = {
          ...flower,
          canvasId: `${flower.id}-${Date.now()}`,
          x: Math.random() * 300 + 50,
          y: Math.random() * 300 + 50,
          rotation: 0,
          scale: 1
        };
        setBouquetItems(prev => [...prev, newItem]);
        toast.success(`Added ${flower.name} to bouquet`);
      }
    }
  }, [flowers]);

  const removeItem = useCallback((canvasId: string) => {
    setBouquetItems(prev => prev.filter(item => item.canvasId !== canvasId));
    toast.info('Flower removed from bouquet');
  }, []);

  const clearBouquet = useCallback(() => {
    setBouquetItems([]);
    toast.info('Bouquet cleared');
  }, []);

  const saveBouquet = useCallback(() => {
    // TODO: Implement save to account
    toast.success('Bouquet saved to your account');
  }, []);

  const shareBouquet = useCallback(() => {
    // TODO: Implement sharing functionality
    navigator.clipboard.writeText(window.location.href);
    toast.success('Bouquet link copied to clipboard');
  }, []);

  const addToCart = useCallback(() => {
    if (bouquetItems.length === 0) {
      toast.error('Please add flowers to your bouquet first');
      return;
    }
    // TODO: Implement add to cart
    toast.success(`Bouquet added to cart - ${totalPrice} SAR`);
  }, [bouquetItems.length, totalPrice]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage/20 to-cream">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">Create Your Perfect Bouquet</h1>
          <p className="text-muted-foreground">Drag flowers to the canvas to build your custom arrangement</p>
        </div>

        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Flower Inventory */}
            <div className="lg:col-span-1">
              <FlowerInventory flowers={flowers} />
            </div>

            {/* Canvas Area */}
            <div className="lg:col-span-2">
              <BouquetCanvas 
                bouquetItems={bouquetItems}
                onRemoveItem={removeItem}
                setBouquetItems={setBouquetItems}
              />
            </div>

            {/* Pricing & Controls */}
            <div className="lg:col-span-1 space-y-6">
              {/* Price Summary */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Price Summary</h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Base bouquet</span>
                    <span>{basePrice} SAR</span>
                  </div>
                  
                  {bouquetItems.map((item) => (
                    <div key={item.canvasId} className="flex justify-between text-sm">
                      <span>{item.name}</span>
                      <span>{item.price} SAR</span>
                    </div>
                  ))}
                  
                  <div className="flex justify-between">
                    <span>Wrapping ({wrapping})</span>
                    <span>{wrappingPrices[wrapping]} SAR</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-semibold text-lg mt-4">
                  <span>Total</span>
                  <span>{totalPrice} SAR</span>
                </div>
              </Card>

              {/* Wrapping Options */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Wrapping Style</h3>
                <div className="space-y-2">
                  {Object.entries(wrappingPrices).map(([type, price]) => (
                    <div key={type} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={type}
                        name="wrapping"
                        value={type}
                        checked={wrapping === type}
                        onChange={(e) => setWrapping(e.target.value as typeof wrapping)}
                        className="text-primary"
                      />
                      <label htmlFor={type} className="flex-1 capitalize">
                        {type}
                      </label>
                      <span>{price} SAR</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button onClick={addToCart} className="w-full" size="lg">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart - {totalPrice} SAR
                </Button>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={saveBouquet} variant="outline">
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                  <Button onClick={shareBouquet} variant="outline">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
                
                <Button onClick={clearBouquet} variant="destructive" className="w-full">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Clear Bouquet
                </Button>
              </div>

              {/* Bouquet Stats */}
              {bouquetItems.length > 0 && (
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Bouquet Stats</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Total flowers:</span>
                      <Badge variant="secondary">{bouquetItems.length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Focal flowers:</span>
                      <Badge variant="secondary">
                        {bouquetItems.filter(item => item.category === 'focal').length}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Fillers:</span>
                      <Badge variant="secondary">
                        {bouquetItems.filter(item => item.category === 'filler').length}
                      </Badge>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>

          <DragOverlay>
            {activeId ? (
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                <div 
                  className="w-12 h-12 rounded-full"
                  style={{ 
                    backgroundColor: flowers.find(f => f.id === activeId)?.color || '#gray'
                  }}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};