import React, { useState, useCallback } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FlowerInventory } from './FlowerInventory';
import { BouquetCanvas } from './BouquetCanvas';
import { Save, Share2, RotateCcw, ShoppingCart, Download, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

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

export interface WrappingOption {
  id: string;
  name: string;
  price: number;
  description: string;
  color: string;
}

export interface BaseOption {
  id: string;
  name: string;
  price: number;
  description: string;
  color: string;
}

export interface RibbonOption {
  id: string;
  name: string;
  price: number;
  description: string;
  color: string;
  width: string;
  bowStyle: string;
}

export interface AccessoryOption {
  id: string;
  name: string;
  price: number;
  description: string;
  type: 'card' | 'charm' | 'plush' | 'balloon' | 'brooch' | 'light';
}

export interface OccasionPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  flowers: { id: string; quantity: number }[];
  wrapping: string;
  base: string;
  ribbon: string;
  accessories: string[];
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
  const [selectedWrapping, setSelectedWrapping] = useState<string>('kraft-paper');
  const [selectedBase, setSelectedBase] = useState<string>('floral-foam');
  const [selectedRibbon, setSelectedRibbon] = useState<string>('satin-red');
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [bouquetName, setBouquetName] = useState('');
  const [bouquetDescription, setBouquetDescription] = useState('');
  const { state: authState } = useAuth();
  const { addItem } = useCart();

  const occasionPresets: OccasionPreset[] = [
    {
      id: 'wedding',
      name: 'Wedding',
      description: 'Elegant white and cream flowers for your special day',
      icon: '💒',
      flowers: [
        { id: 'rose-pink-lg', quantity: 3 },
        { id: 'baby-breath', quantity: 2 },
        { id: 'eucalyptus', quantity: 1 }
      ],
      wrapping: 'lace-paper',
      base: 'glass-vase',
      ribbon: 'satin-white',
      accessories: ['greeting-card']
    },
    {
      id: 'valentines',
      name: "Valentine's Day",
      description: 'Romantic red roses and heart-themed accessories',
      icon: '💕',
      flowers: [
        { id: 'rose-red-lg', quantity: 5 },
        { id: 'baby-breath', quantity: 1 }
      ],
      wrapping: 'satin-paper',
      base: 'floral-foam',
      ribbon: 'satin-red',
      accessories: ['heart-charm', 'balloon-heart']
    },
    {
      id: 'new-baby',
      name: 'New Baby',
      description: 'Soft pastels and gentle flowers for the newborn',
      icon: '👶',
      flowers: [
        { id: 'rose-pink-lg', quantity: 2 },
        { id: 'baby-breath', quantity: 3 }
      ],
      wrapping: 'tissue-paper',
      base: 'basket',
      ribbon: 'lace-ivory',
      accessories: ['teddy-bear']
    },
    {
      id: 'birthday',
      name: 'Birthday',
      description: 'Colorful and celebratory flowers for birthdays',
      icon: '🎂',
      flowers: [
        { id: 'rose-pink-lg', quantity: 3 },
        { id: 'baby-breath', quantity: 2 }
      ],
      wrapping: 'kraft-paper',
      base: 'floral-foam',
      ribbon: 'satin-gold',
      accessories: ['greeting-card']
    },
    {
      id: 'graduation',
      name: 'Graduation',
      description: 'Congratulations with elegant and sophisticated blooms',
      icon: '🎓',
      flowers: [
        { id: 'rose-pink-lg', quantity: 3 },
        { id: 'eucalyptus', quantity: 2 }
      ],
      wrapping: 'foil-wrap',
      base: 'paper-cone',
      ribbon: 'organza-silver',
      accessories: ['crystal-brooch']
    },
    {
      id: 'anniversary',
      name: 'Anniversary',
      description: 'Romantic and timeless flowers for your anniversary',
      icon: '💍',
      flowers: [
        { id: 'rose-red-lg', quantity: 4 },
        { id: 'baby-breath', quantity: 1 }
      ],
      wrapping: 'satin-paper',
      base: 'glass-vase',
      ribbon: 'velvet-black',
      accessories: ['greeting-card']
    },
    {
      id: 'sympathy',
      name: 'Sympathy',
      description: 'Thoughtful and comforting flowers for difficult times',
      icon: '🌹',
      flowers: [
        { id: 'eucalyptus', quantity: 3 },
        { id: 'baby-breath', quantity: 2 }
      ],
      wrapping: 'kraft-paper',
      base: 'basket',
      ribbon: 'lace-ivory',
      accessories: ['greeting-card']
    }
  ];

  const basePrice = 15; // Base bouquet price

  const wrappingOptions: WrappingOption[] = [
    { id: 'kraft-paper', name: 'Kraft Paper', price: 5, description: 'Natural brown paper', color: '#8B4513' },
    { id: 'satin-paper', name: 'Satin Paper', price: 8, description: 'Shiny smooth finish', color: '#E6E6FA' },
    { id: 'tissue-paper', name: 'Tissue Paper', price: 3, description: 'Light and delicate', color: '#FFB6C1' },
    { id: 'mesh-wrap', name: 'Mesh Wrap', price: 6, description: 'Decorative mesh netting', color: '#F0F8FF' },
    { id: 'lace-paper', name: 'Lace Paper', price: 10, description: 'Elegant lace design', color: '#FFFACD' },
    { id: 'foil-wrap', name: 'Foil Wrap', price: 12, description: 'Metallic foil finish', color: '#FFD700' },
    { id: 'transparent-cellophane', name: 'Transparent Cellophane', price: 4, description: 'Clear protective wrap', color: '#F8F8FF' },
  ];

  const baseOptions: BaseOption[] = [
    { id: 'floral-foam', name: 'Floral Foam', price: 8, description: 'Standard foam base', color: '#90EE90' },
    { id: 'paper-cone', name: 'Paper Cone', price: 5, description: 'Classic paper cone', color: '#F5DEB3' },
    { id: 'bouquet-sleeve', name: 'Bouquet Sleeve', price: 6, description: 'Decorative sleeve', color: '#E6E6FA' },
    { id: 'glass-vase', name: 'Glass Vase', price: 25, description: 'Elegant glass vase', color: '#F0F8FF' },
    { id: 'basket', name: 'Basket', price: 20, description: 'Woven basket base', color: '#DEB887' },
  ];

  const ribbonOptions: RibbonOption[] = [
    { id: 'satin-red', name: 'Satin Red', price: 4, description: 'Classic red satin', color: '#DC143C', width: '1 inch', bowStyle: 'Classic' },
    { id: 'satin-white', name: 'Satin White', price: 4, description: 'Pure white satin', color: '#FFFFFF', width: '1 inch', bowStyle: 'Classic' },
    { id: 'satin-gold', name: 'Satin Gold', price: 6, description: 'Metallic gold', color: '#FFD700', width: '1 inch', bowStyle: 'Classic' },
    { id: 'silk-pink', name: 'Silk Pink', price: 8, description: 'Luxury silk ribbon', color: '#FFB6C1', width: '1.5 inch', bowStyle: 'Floral' },
    { id: 'lace-ivory', name: 'Lace Ivory', price: 10, description: 'Delicate lace ribbon', color: '#FFFFF0', width: '2 inch', bowStyle: 'Elegant' },
    { id: 'organza-silver', name: 'Organza Silver', price: 7, description: 'Sheer organza', color: '#C0C0C0', width: '1 inch', bowStyle: 'Modern' },
    { id: 'velvet-black', name: 'Velvet Black', price: 9, description: 'Rich velvet ribbon', color: '#000000', width: '1.5 inch', bowStyle: 'Classic' },
  ];

  const accessoryOptions: AccessoryOption[] = [
    { id: 'greeting-card', name: 'Greeting Card', price: 3, description: 'Personalized message card', type: 'card' },
    { id: 'heart-charm', name: 'Heart Charm', price: 5, description: 'Silver heart charm', type: 'charm' },
    { id: 'teddy-bear', name: 'Teddy Bear', price: 15, description: 'Small plush teddy bear', type: 'plush' },
    { id: 'balloon-heart', name: 'Heart Balloon', price: 8, description: 'Red heart balloon', type: 'balloon' },
    { id: 'crystal-brooch', name: 'Crystal Brooch', price: 12, description: 'Elegant crystal brooch', type: 'brooch' },
    { id: 'led-lights', name: 'LED Lights', price: 10, description: 'Battery-powered LED string', type: 'light' },
  ];

  const selectedWrappingOption = wrappingOptions.find(w => w.id === selectedWrapping);
  const selectedBaseOption = baseOptions.find(b => b.id === selectedBase);
  const selectedRibbonOption = ribbonOptions.find(r => r.id === selectedRibbon);
  const selectedAccessoryOptions = accessoryOptions.filter(a => selectedAccessories.includes(a.id));

  const totalPrice = bouquetItems.reduce((sum, item) => sum + item.price, basePrice) +
    (selectedWrappingOption?.price || 0) +
    (selectedBaseOption?.price || 0) +
    (selectedRibbonOption?.price || 0) +
    selectedAccessoryOptions.reduce((sum, acc) => sum + acc.price, 0);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over, delta } = event;
    setActiveId(null);

    if (over && over.id === 'bouquet-canvas') {
      // Check if it's a flower from inventory
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

    // Handle repositioning of existing canvas items
    if (active.id.toString().startsWith('canvas-')) {
      const canvasId = active.id.toString().replace('canvas-', '');
      const item = bouquetItems.find(item => item.canvasId === canvasId);
      if (item && delta) {
        setBouquetItems(prev =>
          prev.map(bouquetItem =>
            bouquetItem.canvasId === canvasId
              ? {
                  ...bouquetItem,
                  x: bouquetItem.x + delta.x,
                  y: bouquetItem.y + delta.y,
                }
              : bouquetItem
          )
        );
      }
    }
  }, [flowers, bouquetItems]);

  const removeItem = useCallback((canvasId: string) => {
    setBouquetItems(prev => prev.filter(item => item.canvasId !== canvasId));
    toast.info('Flower removed from bouquet');
  }, []);

  const clearBouquet = useCallback(() => {
    setBouquetItems([]);
    setSelectedPreset(null);
    toast.info('Bouquet cleared');
  }, []);

  const applyPreset = useCallback((preset: OccasionPreset) => {
    // Clear current bouquet
    setBouquetItems([]);

    // Apply preset flowers
    const newItems: BouquetItem[] = [];
    preset.flowers.forEach((flowerConfig, index) => {
      const flower = flowers.find(f => f.id === flowerConfig.id);
      if (flower) {
        for (let i = 0; i < flowerConfig.quantity; i++) {
          newItems.push({
            ...flower,
            canvasId: `${flower.id}-${Date.now()}-${index}-${i}`,
            x: 100 + (index * 60) + (i * 20),
            y: 150 + (i * 30),
            rotation: Math.random() * 20 - 10, // Slight random rotation
            scale: 1
          });
        }
      }
    });

    setBouquetItems(newItems);
    setSelectedWrapping(preset.wrapping);
    setSelectedBase(preset.base);
    setSelectedRibbon(preset.ribbon);
    setSelectedAccessories(preset.accessories);
    setSelectedPreset(preset.id);

    toast.success(`Applied ${preset.name} preset!`);
  }, [flowers]);

  const saveBouquet = useCallback(() => {
    if (!authState.isAuthenticated) {
      toast.error('Please sign in to save bouquets');
      return;
    }
    setShowSaveDialog(true);
  }, [authState.isAuthenticated]);

  const handleSaveBouquet = useCallback(async () => {
    if (!bouquetName.trim()) {
      toast.error('Please enter a bouquet name');
      return;
    }

    try {
      // In a real app, this would save to the backend
      const bouquetData = {
        name: bouquetName,
        description: bouquetDescription,
        flowers: bouquetItems,
        wrapping: selectedWrapping,
        base: selectedBase,
        ribbon: selectedRibbon,
        accessories: selectedAccessories,
        totalPrice: totalPrice
      };

      // For now, save to localStorage
      const savedBouquets = JSON.parse(localStorage.getItem('savedBouquets') || '[]');
      savedBouquets.push({
        id: Date.now().toString(),
        ...bouquetData,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('savedBouquets', JSON.stringify(savedBouquets));

      toast.success('Bouquet saved successfully!');
      setShowSaveDialog(false);
      setBouquetName('');
      setBouquetDescription('');
    } catch (error) {
      toast.error('Failed to save bouquet');
    }
  }, [bouquetName, bouquetDescription, bouquetItems, selectedWrapping, selectedBase, selectedRibbon, selectedAccessories, totalPrice]);

  const shareBouquet = useCallback(() => {
    if (bouquetItems.length === 0) {
      toast.error('Please add flowers to your bouquet first');
      return;
    }

    // Create a shareable link with bouquet data
    const bouquetData = {
      flowers: bouquetItems.map(item => ({
        id: item.id,
        name: item.name,
        color: item.color,
        x: item.x,
        y: item.y,
        rotation: item.rotation,
        scale: item.scale
      })),
      wrapping: selectedWrapping,
      base: selectedBase,
      ribbon: selectedRibbon,
      accessories: selectedAccessories,
      totalPrice: totalPrice
    };

    const shareUrl = `${window.location.origin}/builder?data=${encodeURIComponent(JSON.stringify(bouquetData))}`;

    navigator.clipboard.writeText(shareUrl);
    toast.success('Bouquet link copied to clipboard!');
  }, [bouquetItems, selectedWrapping, selectedBase, selectedRibbon, selectedAccessories, totalPrice]);

  const addToCart = useCallback(() => {
    if (bouquetItems.length === 0) {
      toast.error('Please add flowers to your bouquet first');
      return;
    }

    const bouquetName = `Custom Bouquet - ${bouquetItems.length} flowers`;
    
    addItem({
      id: `bouquet-${Date.now()}`,
      name: bouquetName,
      price: totalPrice,
      image: '/placeholder.svg',
      type: 'bouquet',
      vendor: 'Custom Creation',
      category: 'Custom Bouquets',
    });

    toast.success(`Custom bouquet added to cart - ${totalPrice} SAR`);
  }, [bouquetItems.length, totalPrice, addItem]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage/20 to-cream">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">Create Your Perfect Bouquet</h1>
          <p className="text-muted-foreground">Drag flowers to the canvas to build your custom arrangement</p>
        </div>

        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          {/* Occasion Presets */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-primary">Choose an Occasion</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
              {occasionPresets.map((preset) => (
                <Card
                  key={preset.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedPreset === preset.id ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  onClick={() => applyPreset(preset)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl mb-2">{preset.icon}</div>
                    <h3 className="font-semibold text-sm mb-1">{preset.name}</h3>
                    <p className="text-xs text-muted-foreground">{preset.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            {selectedPreset && (
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPreset(null)}
                >
                  Clear Preset Selection
                </Button>
              </div>
            )}
          </div>

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

                  {selectedWrappingOption && (
                    <div className="flex justify-between text-sm">
                      <span>Wrapping: {selectedWrappingOption.name}</span>
                      <span>{selectedWrappingOption.price} SAR</span>
                    </div>
                  )}

                  {selectedBaseOption && (
                    <div className="flex justify-between text-sm">
                      <span>Base: {selectedBaseOption.name}</span>
                      <span>{selectedBaseOption.price} SAR</span>
                    </div>
                  )}

                  {selectedRibbonOption && (
                    <div className="flex justify-between text-sm">
                      <span>Ribbon: {selectedRibbonOption.name}</span>
                      <span>{selectedRibbonOption.price} SAR</span>
                    </div>
                  )}

                  {selectedAccessoryOptions.map((acc) => (
                    <div key={acc.id} className="flex justify-between text-sm">
                      <span>Accessory: {acc.name}</span>
                      <span>{acc.price} SAR</span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex justify-between font-semibold text-lg mt-4">
                  <span>Total</span>
                  <span>{totalPrice} SAR</span>
                </div>
              </Card>

              {/* Wrapping Options */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Wrapping Paper</h3>
                <div className="grid grid-cols-1 gap-3">
                  {wrappingOptions.map((option) => (
                    <div key={option.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                      <input
                        type="radio"
                        id={option.id}
                        name="wrapping"
                        value={option.id}
                        checked={selectedWrapping === option.id}
                        onChange={(e) => setSelectedWrapping(option.id)}
                        className="text-primary"
                      />
                      <div
                        className="w-6 h-6 rounded border-2 border-gray-300"
                        style={{ backgroundColor: option.color }}
                      />
                      <div className="flex-1">
                        <label htmlFor={option.id} className="font-medium cursor-pointer">
                          {option.name}
                        </label>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                      <span className="font-semibold">{option.price} SAR</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Base Options */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Base & Container</h3>
                <div className="grid grid-cols-1 gap-3">
                  {baseOptions.map((option) => (
                    <div key={option.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                      <input
                        type="radio"
                        id={option.id}
                        name="base"
                        value={option.id}
                        checked={selectedBase === option.id}
                        onChange={(e) => setSelectedBase(option.id)}
                        className="text-primary"
                      />
                      <div
                        className="w-6 h-6 rounded border-2 border-gray-300"
                        style={{ backgroundColor: option.color }}
                      />
                      <div className="flex-1">
                        <label htmlFor={option.id} className="font-medium cursor-pointer">
                          {option.name}
                        </label>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                      <span className="font-semibold">{option.price} SAR</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Ribbon Options */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Ribbon & Bow</h3>
                <div className="grid grid-cols-1 gap-3">
                  {ribbonOptions.map((option) => (
                    <div key={option.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                      <input
                        type="radio"
                        id={option.id}
                        name="ribbon"
                        value={option.id}
                        checked={selectedRibbon === option.id}
                        onChange={(e) => setSelectedRibbon(option.id)}
                        className="text-primary"
                      />
                      <div
                        className="w-6 h-6 rounded border-2 border-gray-300"
                        style={{ backgroundColor: option.color }}
                      />
                      <div className="flex-1">
                        <label htmlFor={option.id} className="font-medium cursor-pointer">
                          {option.name}
                        </label>
                        <p className="text-sm text-muted-foreground">
                          {option.description} • {option.width} • {option.bowStyle} bow
                        </p>
                      </div>
                      <span className="font-semibold">{option.price} SAR</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Accessories */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Accessories</h3>
                <div className="grid grid-cols-1 gap-3">
                  {accessoryOptions.map((option) => (
                    <div key={option.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                      <input
                        type="checkbox"
                        id={option.id}
                        checked={selectedAccessories.includes(option.id)}
                        onChange={(e) => {
                          if (selectedAccessories.includes(option.id)) {
                            setSelectedAccessories(prev => prev.filter(id => id !== option.id));
                          } else {
                            setSelectedAccessories(prev => [...prev, option.id]);
                          }
                        }}
                        className="text-primary"
                      />
                      <div className="flex-1">
                        <label htmlFor={option.id} className="font-medium cursor-pointer">
                          {option.name}
                        </label>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                      <span className="font-semibold">{option.price} SAR</span>
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
              activeId.startsWith('canvas-') ? (
                // Canvas item being repositioned
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                  <div
                    className="w-12 h-12 rounded-full"
                    style={{
                      backgroundColor: bouquetItems.find(item => `canvas-${item.canvasId}` === activeId)?.color || '#gray'
                    }}
                  />
                </div>
              ) : (
                // Flower from inventory
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                  <div
                    className="w-12 h-12 rounded-full"
                    style={{
                      backgroundColor: flowers.find(f => f.id === activeId)?.color || '#gray'
                    }}
                  />
                </div>
              )
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Save Bouquet Dialog */}
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Save Bouquet</DialogTitle>
              <DialogDescription>
                Give your bouquet a name and description to save it for later
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bouquetName">Bouquet Name</Label>
                <Input
                  id="bouquetName"
                  value={bouquetName}
                  onChange={(e) => setBouquetName(e.target.value)}
                  placeholder="Enter bouquet name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bouquetDescription">Description (Optional)</Label>
                <Textarea
                  id="bouquetDescription"
                  value={bouquetDescription}
                  onChange={(e) => setBouquetDescription(e.target.value)}
                  placeholder="Describe your bouquet..."
                  rows={3}
                />
              </div>

              <div className="bg-muted p-3 rounded-lg">
                <div className="text-sm text-muted-foreground">
                  <p><strong>Flowers:</strong> {bouquetItems.length}</p>
                  <p><strong>Wrapping:</strong> {selectedWrappingOption?.name}</p>
                  <p><strong>Base:</strong> {selectedBaseOption?.name}</p>
                  <p><strong>Ribbon:</strong> {selectedRibbonOption?.name}</p>
                  {selectedAccessoryOptions.length > 0 && (
                    <p><strong>Accessories:</strong> {selectedAccessoryOptions.length}</p>
                  )}
                  <p><strong>Total Price:</strong> {totalPrice} SAR</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowSaveDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveBouquet}
                  className="flex-1"
                >
                  Save Bouquet
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};