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

interface WrappingOption {
  id: string;
  name: string;
  price: number;
  description: string;
}

interface BaseOption {
  id: string;
  name: string;
  price: number;
  description: string;
}

interface RibbonCustomization {
  color: string;
  width: 'narrow' | 'medium' | 'wide';
  style: 'satin' | 'silk' | 'lace' | 'burlap' | 'organza' | 'velvet';
  bowStyle: 'simple' | 'elegant' | 'floral' | 'classic';
  position: 'top' | 'middle' | 'bottom';
}

interface Accessory {
  id: string;
  name: string;
  type: 'card' | 'charm' | 'plush' | 'balloon' | 'brooch' | 'led';
  price: number;
  description: string;
  color?: string;
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

interface OccasionPreset {
  id: string;
  name: string;
  description: string;
  flowers: string[]; // flower ids
  wrapping: string; // wrapping id
  ribbon: Partial<RibbonCustomization>;
  accessories: string[]; // accessory ids
  base: string; // base id
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

const WRAPPING_OPTIONS: WrappingOption[] = [
  { id: 'kraft', name: 'Kraft Paper', price: 5, description: 'Natural brown kraft paper' },
  { id: 'satin', name: 'Satin Ribbon', price: 8, description: 'Shiny satin wrapping' },
  { id: 'tissue', name: 'Tissue Paper', price: 3, description: 'Delicate tissue wrapping' },
  { id: 'mesh', name: 'Mesh Wrap', price: 6, description: 'Decorative mesh netting' },
  { id: 'lace', name: 'Lace Wrap', price: 7, description: 'Elegant lace covering' },
  { id: 'foil', name: 'Foil Wrap', price: 9, description: 'Metallic foil wrapping' },
  { id: 'transparent', name: 'Transparent Film', price: 4, description: 'Clear protective wrap' },
];

const BASE_OPTIONS: BaseOption[] = [
  { id: 'floral-foam', name: 'Floral Foam', price: 3, description: 'Water-absorbing foam base' },
  { id: 'paper-cone', name: 'Paper Cone', price: 2, description: 'Simple paper cone' },
  { id: 'bouquet-sleeve', name: 'Bouquet Sleeve', price: 4, description: 'Decorative sleeve holder' },
  { id: 'glass-vase', name: 'Glass Vase', price: 15, description: 'Elegant glass vase' },
  { id: 'basket', name: 'Wicker Basket', price: 12, description: 'Natural wicker basket' },
];

const ACCESSORIES: Accessory[] = [
  { id: 'card-simple', name: 'Simple Card', type: 'card', price: 3, description: 'Basic greeting card' },
  { id: 'card-floral', name: 'Floral Card', type: 'card', price: 5, description: 'Floral design card' },
  { id: 'charm-heart', name: 'Heart Charm', type: 'charm', price: 4, description: 'Silver heart charm' },
  { id: 'charm-star', name: 'Star Charm', type: 'charm', price: 4, description: 'Gold star charm' },
  { id: 'plush-bear', name: 'Teddy Bear', type: 'plush', price: 8, description: 'Small plush bear' },
  { id: 'plush-heart', name: 'Heart Plush', type: 'plush', price: 6, description: 'Heart-shaped plush' },
  { id: 'balloon-red', name: 'Red Balloon', type: 'balloon', price: 2, description: 'Red mini balloon' },
  { id: 'balloon-white', name: 'White Balloon', type: 'balloon', price: 2, description: 'White mini balloon' },
  { id: 'brooch-flower', name: 'Flower Brooch', type: 'brooch', price: 5, description: 'Floral brooch pin' },
  { id: 'brooch-butterfly', name: 'Butterfly Brooch', type: 'brooch', price: 5, description: 'Butterfly brooch pin' },
  { id: 'led-string', name: 'LED String Lights', type: 'led', price: 6, description: 'Battery-powered LED lights' },
];

const OCCASION_PRESETS: OccasionPreset[] = [
  {
    id: 'wedding',
    name: 'Wedding',
    description: 'Elegant white and cream flowers with satin ribbon',
    flowers: ['rose-white-lg', 'baby-breath', 'eucalyptus'],
    wrapping: 'satin',
    ribbon: { color: '#ffffff', style: 'satin', bowStyle: 'elegant' },
    accessories: ['card-floral'],
    base: 'bouquet-sleeve'
  },
  {
    id: 'valentines',
    name: "Valentine's Day",
    description: 'Romantic red roses with heart accents',
    flowers: ['rose-red-lg', 'baby-breath'],
    wrapping: 'lace',
    ribbon: { color: '#dc2626', style: 'satin', bowStyle: 'floral' },
    accessories: ['charm-heart', 'card-simple'],
    base: 'paper-cone'
  },
  {
    id: 'new-baby',
    name: 'New Baby',
    description: 'Soft pastels with plush accessories',
    flowers: ['rose-pink-lg', 'baby-breath'],
    wrapping: 'tissue',
    ribbon: { color: '#ec4899', style: 'lace', bowStyle: 'simple' },
    accessories: ['plush-bear', 'card-simple'],
    base: 'basket'
  },
  {
    id: 'birthday',
    name: 'Birthday',
    description: 'Colorful arrangement with balloons',
    flowers: ['rose-pink-lg', 'baby-breath'],
    wrapping: 'foil',
    ribbon: { color: '#f59e0b', style: 'satin', bowStyle: 'classic' },
    accessories: ['balloon-red', 'card-simple'],
    base: 'paper-cone'
  },
  {
    id: 'graduation',
    name: 'Graduation',
    description: 'Professional arrangement with academic touches',
    flowers: ['rose-white-lg', 'eucalyptus'],
    wrapping: 'kraft',
    ribbon: { color: '#3b82f6', style: 'satin', bowStyle: 'simple' },
    accessories: ['card-simple'],
    base: 'bouquet-sleeve'
  },
  {
    id: 'anniversary',
    name: 'Anniversary',
    description: 'Romantic mix with elegant touches',
    flowers: ['rose-red-lg', 'rose-pink-lg', 'baby-breath'],
    wrapping: 'satin',
    ribbon: { color: '#dc2626', style: 'velvet', bowStyle: 'elegant' },
    accessories: ['charm-heart', 'card-floral'],
    base: 'glass-vase'
  },
  {
    id: 'sympathy',
    name: 'Sympathy',
    description: 'Soft whites and greens for comfort',
    flowers: ['rose-white-lg', 'eucalyptus'],
    wrapping: 'tissue',
    ribbon: { color: '#6b7280', style: 'lace', bowStyle: 'simple' },
    accessories: ['card-simple'],
    base: 'paper-cone'
  }
];

export const EnhancedBouquetBuilder: React.FC = () => {
  const [flowers] = useState<FlowerItem[]>(INITIAL_FLOWERS);
  const [bouquetItems, setBouquetItems] = useState<BouquetItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [wrapping, setWrapping] = useState<string>('kraft');
  const [base, setBase] = useState<string>('paper-cone');
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [bouquetName, setBouquetName] = useState('');
  const [bouquetDescription, setBouquetDescription] = useState('');

  // Enhanced customization states
  const [ribbon, setRibbon] = useState<RibbonCustomization>({
    color: '#dc2626',
    width: 'medium',
    style: 'satin',
    bowStyle: 'simple',
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
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const { state: authState } = useAuth();
  const { addItem } = useCart();
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();

  const basePrice = 15;
  const selectedWrapping = WRAPPING_OPTIONS.find(w => w.id === wrapping);
  const selectedBase = BASE_OPTIONS.find(b => b.id === base);
  const ribbonPrices = { narrow: 2, medium: 4, wide: 6 };
  const cardPrice = card.text ? 3 : 0;
  const accessoriesPrice = selectedAccessories.reduce((sum, accId) => {
    const accessory = ACCESSORIES.find(a => a.id === accId);
    return sum + (accessory?.price || 0);
  }, 0);

  const totalPrice = bouquetItems.reduce((sum, item) => sum + item.price, 0) +
                     basePrice +
                     (selectedWrapping?.price || 0) +
                     (selectedBase?.price || 0) +
                     ribbonPrices[ribbon.width] +
                     cardPrice +
                     accessoriesPrice;

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

  const applyPreset = useCallback((preset: OccasionPreset) => {
    // Clear current bouquet
    setBouquetItems([]);
    setSelectedPreset(preset.id);

    // Apply flowers
    const presetFlowers = preset.flowers.map(flowerId => {
      const flower = flowers.find(f => f.id === flowerId);
      if (flower) {
        return {
          ...flower,
          canvasId: `${flower.id}-${Date.now()}-${Math.random()}`,
          x: Math.random() * 300 + 50,
          y: Math.random() * 300 + 50,
          rotation: 0,
          scale: 1,
        };
      }
      return null;
    }).filter(Boolean) as BouquetItem[];

    setBouquetItems(presetFlowers);

    // Apply other settings
    setWrapping(preset.wrapping);
    setBase(preset.base);
    setSelectedAccessories(preset.accessories);

    if (preset.ribbon) {
      setRibbon(prev => ({ ...prev, ...preset.ribbon }));
    }

    toast.success(`Applied ${preset.name} preset`);
  }, [flowers]);

  const clearBouquet = useCallback(() => {
    setBouquetItems([]);
    setWrapping('kraft');
    setBase('paper-cone');
    setSelectedAccessories([]);
    setRibbon({
      color: '#dc2626',
      width: 'medium',
      style: 'satin',
      bowStyle: 'simple',
      position: 'middle'
    });
    setCard({
      text: '',
      font: 'elegant',
      color: '#000000',
      design: 'simple'
    });
    setSelectedPreset(null);
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
        {/* Occasion Presets */}
        <div className="mb-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Occasion Presets</CardTitle>
              <p className="text-sm text-muted-foreground">Choose a preset to auto-fill your bouquet</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                {OCCASION_PRESETS.map((preset) => (
                  <Button
                    key={preset.id}
                    variant={selectedPreset === preset.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => applyPreset(preset)}
                    className="text-xs"
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Sidebar with Categories */}
          <div className="lg:col-span-1">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Bouquet Builder</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="flowers" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="flowers" title="Flowers">🌸</TabsTrigger>
                    <TabsTrigger value="wrapping" title="Wrapping">🎀</TabsTrigger>
                    <TabsTrigger value="ribbons" title="Ribbons">🎗️</TabsTrigger>
                    <TabsTrigger value="accessories" title="Accessories">✨</TabsTrigger>
                  </TabsList>

                  <TabsContent value="flowers" className="mt-4">
                    <FlowerInventory flowers={flowers} />
                  </TabsContent>

                  <TabsContent value="wrapping" className="mt-4 space-y-4">
                    <div>
                      <Label className="text-sm font-semibold">Wrapping Style</Label>
                      <Select value={wrapping} onValueChange={setWrapping}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {WRAPPING_OPTIONS.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.name} (+{formatPrice(option.price)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold">Base</Label>
                      <Select value={base} onValueChange={setBase}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {BASE_OPTIONS.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.name} (+{formatPrice(option.price)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>

                  <TabsContent value="ribbons" className="mt-4 space-y-4">
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
                            title={`Select ${color}`}
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
                      <Select value={ribbon.style} onValueChange={(style: 'satin' | 'silk' | 'lace' | 'burlap' | 'organza' | 'velvet') =>
                        setRibbon(prev => ({ ...prev, style }))
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="satin">Satin</SelectItem>
                          <SelectItem value="silk">Silk</SelectItem>
                          <SelectItem value="lace">Lace</SelectItem>
                          <SelectItem value="burlap">Burlap</SelectItem>
                          <SelectItem value="organza">Organza</SelectItem>
                          <SelectItem value="velvet">Velvet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Bow Style</Label>
                      <Select value={ribbon.bowStyle} onValueChange={(bowStyle: 'simple' | 'elegant' | 'floral' | 'classic') =>
                        setRibbon(prev => ({ ...prev, bowStyle }))
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="simple">Simple</SelectItem>
                          <SelectItem value="elegant">Elegant</SelectItem>
                          <SelectItem value="floral">Floral</SelectItem>
                          <SelectItem value="classic">Classic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>

                  <TabsContent value="accessories" className="mt-4 space-y-4">
                    <div>
                      <Label className="text-sm font-semibold">Cards</Label>
                      <div className="space-y-2">
                        {ACCESSORIES.filter(a => a.type === 'card').map((accessory) => (
                          <div key={accessory.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={accessory.id}
                              checked={selectedAccessories.includes(accessory.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedAccessories(prev => [...prev, accessory.id]);
                                } else {
                                  setSelectedAccessories(prev => prev.filter(id => id !== accessory.id));
                                }
                              }}
                            />
                            <Label htmlFor={accessory.id} className="text-sm">
                              {accessory.name} (+{formatPrice(accessory.price)})
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold">Charms</Label>
                      <div className="space-y-2">
                        {ACCESSORIES.filter(a => a.type === 'charm').map((accessory) => (
                          <div key={accessory.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={accessory.id}
                              checked={selectedAccessories.includes(accessory.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedAccessories(prev => [...prev, accessory.id]);
                                } else {
                                  setSelectedAccessories(prev => prev.filter(id => id !== accessory.id));
                                }
                              }}
                            />
                            <Label htmlFor={accessory.id} className="text-sm">
                              {accessory.name} (+{formatPrice(accessory.price)})
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold">Card Message</Label>
                      <Textarea
                        placeholder="Write your message..."
                        value={card.text}
                        onChange={(e) => setCard(prev => ({ ...prev, text: e.target.value }))}
                        className="mt-2"
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-semibold">Other Accessories</Label>
                      <div className="space-y-2">
                        {ACCESSORIES.filter(a => !['card', 'charm'].includes(a.type)).map((accessory) => (
                          <div key={accessory.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={accessory.id}
                              checked={selectedAccessories.includes(accessory.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedAccessories(prev => [...prev, accessory.id]);
                                } else {
                                  setSelectedAccessories(prev => prev.filter(id => id !== accessory.id));
                                }
                              }}
                            />
                            <Label htmlFor={accessory.id} className="text-sm">
                              {accessory.name} (+{formatPrice(accessory.price)})
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Center Panel - Canvas */}
          <div className="lg:col-span-2">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Bouquet Canvas</CardTitle>
                <p className="text-sm text-muted-foreground">Drag flowers here and arrange them</p>
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

          {/* Right Panel - Price Panel */}
          <div className="lg:col-span-1 space-y-4">
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
                    <span>{formatPrice(selectedWrapping?.price || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Base</span>
                    <span>{formatPrice(selectedBase?.price || 0)}</span>
                  </div>
                  {accessoriesPrice > 0 && (
                    <div className="flex justify-between">
                      <span>Accessories</span>
                      <span>{formatPrice(accessoriesPrice)}</span>
                    </div>
                  )}
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
              <Button onClick={async () => {
                try {
                  const { data: userData } = await (await import('@/integrations/supabase/client')).supabase.auth.getUser();
                  if (!userData.user) {
                    toast.error('Please log in to save your bouquet');
                    return;
                  }
                  
                  const { supabase } = await import('@/integrations/supabase/client');
                  const designData = {
                    bouquetItems: bouquetItems,
                    wrapping: wrapping,
                    base: base,
                    ribbon: ribbon,
                    accessories: selectedAccessories,
                    card: card,
                  };
                  
                  const { error } = await supabase.from('custom_bouquets').insert([{
                    user_id: userData.user.id,
                    name: bouquetName || 'My Bouquet',
                    description: bouquetDescription || null,
                    price: totalPrice,
                    design_data: designData as unknown as import('@/integrations/supabase/types').Json,
                  }]);
                  
                  if (error) throw error;
                  toast.success('Bouquet saved successfully!');
                  setShowSaveDialog(false);
                } catch (err: any) {
                  console.error('Error saving bouquet:', err);
                  toast.error(err.message || 'Failed to save bouquet');
                }
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