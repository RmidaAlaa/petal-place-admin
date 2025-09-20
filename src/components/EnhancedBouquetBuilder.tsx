import React, { useState, useCallback } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FlowerInventory } from './FlowerInventory';
import { BouquetCanvas } from './BouquetCanvas';
import { Save, Share2, RotateCcw, ShoppingCart, Download, Copy, Palette, Type, Ribbon } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { FlowerItem, BouquetItem } from './BouquetBuilder';

interface RibbonCustomization {
  color: string;
  width: 'narrow' | 'medium' | 'wide';
  style: 'satin' | 'silk' | 'burlap' | 'velvet';
  position: 'top' | 'middle' | 'bottom';
}

interface CardCustomization {
  text: string;
  font: 'elegant' | 'modern' | 'classic' | 'handwritten';
  color: string;
  design: 'simple' | 'floral' | 'vintage' | 'minimalist';
}

interface FlowerCustomization {
  id: string;
  customColor?: string;
  arrangement: 'tight' | 'loose' | 'cascade' | 'dome';
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
    id: 'rose-white-lg',
    name: 'White Rose',
    nameAr: 'وردة بيضاء',
    price: 8,
    color: '#ffffff',
    size: 'large',
    category: 'focal',
    image: '/placeholder.svg',
    stock: 40
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

export const EnhancedBouquetBuilder: React.FC = () => {
  const [flowers] = useState<FlowerItem[]>(INITIAL_FLOWERS);
  const [bouquetItems, setBouquetItems] = useState<BouquetItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [wrapping, setWrapping] = useState<'paper' | 'cellophane' | 'burlap'>('paper');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [bouquetName, setBouquetName] = useState('');
  const [bouquetDescription, setBouquetDescription] = useState('');
  
  // Enhanced customization states
  const [ribbon, setRibbon] = useState<RibbonCustomization>({
    color: '#dc2626',
    width: 'medium',
    style: 'satin',
    position: 'middle'
  });
  
  const [card, setCard] = useState<CardCustomization>({
    text: '',
    font: 'elegant',
    color: '#000000',
    design: 'simple'
  });
  
  const [flowerCustomizations, setFlowerCustomizations] = useState<FlowerCustomization[]>([]);
  const [selectedArrangement, setSelectedArrangement] = useState<'tight' | 'loose' | 'cascade' | 'dome'>('dome');

  const { state: authState } = useAuth();
  const { addItem } = useCart();
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();

  const basePrice = 15;
  const wrappingPrices = { paper: 5, cellophane: 3, burlap: 8 };
  const ribbonPrices = { narrow: 2, medium: 4, wide: 6 };
  const cardPrice = card.text ? 3 : 0;
  
  const totalPrice = bouquetItems.reduce((sum, item) => sum + item.price, 0) + 
                    basePrice + 
                    wrappingPrices[wrapping] + 
                    ribbonPrices[ribbon.width] + 
                    cardPrice;

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && over.id === 'bouquet-canvas') {
      const flower = flowers.find(f => f.id === active.id);
      if (flower && flower.stock > 0) {
        const newBouquetItem: BouquetItem = {
          ...flower,
          canvasId: `${flower.id}-${Date.now()}`,
          x: Math.random() * 300,
          y: Math.random() * 300,
          rotation: 0,
          scale: 1,
        };
        setBouquetItems(prev => [...prev, newBouquetItem]);
        toast.success(`${flower.name} added to bouquet`);
      }
    }
    setActiveId(null);
  }, [flowers]);

  const removeItem = useCallback((canvasId: string) => {
    setBouquetItems(prev => prev.filter(item => item.canvasId !== canvasId));
  }, []);

  const updateItem = useCallback((canvasId: string, updates: Partial<BouquetItem>) => {
    setBouquetItems(prev => prev.map(item => 
      item.canvasId === canvasId ? { ...item, ...updates } : item
    ));
  }, []);

  const clearBouquet = useCallback(() => {
    setBouquetItems([]);
    setRibbon({
      color: '#dc2626',
      width: 'medium',
      style: 'satin',
      position: 'middle'
    });
    setCard({
      text: '',
      font: 'elegant',
      color: '#000000',
      design: 'simple'
    });
    toast.success('Bouquet cleared');
  }, []);

  const addToCart = useCallback(() => {
    if (bouquetItems.length === 0) {
      toast.error('Please add flowers to your bouquet first');
      return;
    }

    const bouquetData = {
      id: `custom-bouquet-${Date.now()}`,
      name: bouquetName || `Custom Bouquet - ${new Date().toLocaleDateString()}`,
      price: totalPrice,
      image: '/placeholder.svg',
      type: 'custom-bouquet' as const,
      customization: {
        flowers: bouquetItems,
        wrapping,
        ribbon,
        card,
        arrangement: selectedArrangement
      }
    };

    addItem(bouquetData);
    toast.success('Custom bouquet added to cart!');
  }, [bouquetItems, totalPrice, bouquetName, wrapping, ribbon, card, selectedArrangement, addItem]);

  const colorOptions = [
    '#dc2626', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', 
    '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#f97316'
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Flower Inventory */}
          <div className="lg:col-span-1">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground">{t('common.availableFlowers')}</CardTitle>
              </CardHeader>
              <CardContent>
                <FlowerInventory flowers={flowers} />
              </CardContent>
            </Card>
          </div>

          {/* Center Panel - Canvas */}
          <div className="lg:col-span-2">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground">{t('common.designBouquet')}</CardTitle>
              </CardHeader>
              <CardContent>
                <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                  <BouquetCanvas
                    bouquetItems={bouquetItems}
                    onRemoveItem={removeItem}
                    setBouquetItems={setBouquetItems}
                  />
                  <DragOverlay>
                    {activeId ? (
                      <div className="w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center border-2 border-primary border-dashed">
                        <span className="text-xs text-primary font-medium">
                          {flowers.find(f => f.id === activeId)?.name}
                        </span>
                      </div>
                    ) : null}
                  </DragOverlay>
                </DndContext>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Customization Options */}
          <div className="lg:col-span-1 space-y-4">
            {/* Customization Tabs */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground">{t('builder.customizeRibbon')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="ribbon" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="ribbon">
                      <Ribbon className="w-4 h-4" />
                    </TabsTrigger>
                    <TabsTrigger value="card">
                      <Type className="w-4 h-4" />
                    </TabsTrigger>
                    <TabsTrigger value="colors">
                      <Palette className="w-4 h-4" />
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="ribbon" className="space-y-4">
                    <div>
                      <Label>Color</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {colorOptions.map((color) => (
                          <button
                            key={color}
                            className={`w-6 h-6 rounded-full border-2 ${
                              ribbon.color === color ? 'border-foreground' : 'border-muted'
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => setRibbon(prev => ({ ...prev, color }))}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label>Width</Label>
                      <Select value={ribbon.width} onValueChange={(width: 'narrow' | 'medium' | 'wide') => 
                        setRibbon(prev => ({ ...prev, width }))
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="narrow">Narrow (+$2)</SelectItem>
                          <SelectItem value="medium">Medium (+$4)</SelectItem>
                          <SelectItem value="wide">Wide (+$6)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Style</Label>
                      <Select value={ribbon.style} onValueChange={(style: 'satin' | 'silk' | 'burlap' | 'velvet') => 
                        setRibbon(prev => ({ ...prev, style }))
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="satin">Satin</SelectItem>
                          <SelectItem value="silk">Silk</SelectItem>
                          <SelectItem value="burlap">Burlap</SelectItem>
                          <SelectItem value="velvet">Velvet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="card" className="space-y-4">
                    <div>
                      <Label>Message</Label>
                      <Textarea
                        placeholder="Write your message..."
                        value={card.text}
                        onChange={(e) => setCard(prev => ({ ...prev, text: e.target.value }))}
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label>Font Style</Label>
                      <Select value={card.font} onValueChange={(font: 'elegant' | 'modern' | 'classic' | 'handwritten') => 
                        setCard(prev => ({ ...prev, font }))
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="elegant">Elegant</SelectItem>
                          <SelectItem value="modern">Modern</SelectItem>
                          <SelectItem value="classic">Classic</SelectItem>
                          <SelectItem value="handwritten">Handwritten</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Design</Label>
                      <Select value={card.design} onValueChange={(design: 'simple' | 'floral' | 'vintage' | 'minimalist') => 
                        setCard(prev => ({ ...prev, design }))
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="simple">Simple</SelectItem>
                          <SelectItem value="floral">Floral</SelectItem>
                          <SelectItem value="vintage">Vintage</SelectItem>
                          <SelectItem value="minimalist">Minimalist</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="colors" className="space-y-4">
                    <div>
                      <Label>Arrangement Style</Label>
                      <Select value={selectedArrangement} onValueChange={(arrangement: 'tight' | 'loose' | 'cascade' | 'dome') => 
                        setSelectedArrangement(arrangement)
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tight">Tight Cluster</SelectItem>
                          <SelectItem value="loose">Loose Natural</SelectItem>
                          <SelectItem value="cascade">Cascading</SelectItem>
                          <SelectItem value="dome">Dome Shape</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Wrapping</Label>
                      <Select value={wrapping} onValueChange={(w: 'paper' | 'cellophane' | 'burlap') => setWrapping(w)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paper">Paper (+$5)</SelectItem>
                          <SelectItem value="cellophane">Cellophane (+$3)</SelectItem>
                          <SelectItem value="burlap">Burlap (+$8)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Price Summary */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground">{t('builder.price')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Base bouquet</span>
                    <span>{formatPrice(basePrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Flowers ({bouquetItems.length})</span>
                    <span>{formatPrice(bouquetItems.reduce((sum, item) => sum + item.price, 0))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wrapping</span>
                    <span>{formatPrice(wrappingPrices[wrapping])}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ribbon</span>
                    <span>{formatPrice(ribbonPrices[ribbon.width])}</span>
                  </div>
                  {cardPrice > 0 && (
                    <div className="flex justify-between">
                      <span>Custom Card</span>
                      <span>{formatPrice(cardPrice)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button 
                onClick={addToCart} 
                className="w-full bg-primary hover:bg-primary/90"
                disabled={bouquetItems.length === 0}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {t('builder.addToCart')}
              </Button>
              
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => setShowSaveDialog(true)}>
                  <Save className="w-4 h-4 mr-1" />
                  {t('builder.save')}
                </Button>
                <Button variant="outline" onClick={clearBouquet}>
                  <RotateCcw className="w-4 h-4 mr-1" />
                  {t('builder.clear')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Custom Bouquet</DialogTitle>
            <DialogDescription>
              Save your beautiful creation to access it later or share with others.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Bouquet Name</Label>
              <Input
                id="name"
                value={bouquetName}
                onChange={(e) => setBouquetName(e.target.value)}
                placeholder="My Beautiful Bouquet"
              />
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={bouquetDescription}
                onChange={(e) => setBouquetDescription(e.target.value)}
                placeholder="Describe your bouquet..."
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                // TODO: Implement save functionality
                toast.success('Bouquet saved successfully!');
                setShowSaveDialog(false);
              }}>
                Save Bouquet
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};