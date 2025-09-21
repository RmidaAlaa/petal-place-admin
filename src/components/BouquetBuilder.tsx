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
import { useDraggable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

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
      <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50">
        <div
          className="w-10 h-10 rounded-full flex-shrink-0 border-2 border-white shadow-sm"
          style={{ backgroundColor: flower.color }}
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{flower.name}</h4>
          <p className="text-xs text-muted-foreground truncate">{flower.nameAr}</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm font-semibold text-primary">
              {flower.price} SAR
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

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
    { id: 'satin-pink', name: 'Satin Pink', price: 4, description: 'Soft pink satin', color: '#FFB6C1', width: '1 inch', bowStyle: 'Classic' },
    { id: 'satin-blue', name: 'Satin Blue', price: 4, description: 'Gentle blue satin', color: '#87CEEB', width: '1 inch', bowStyle: 'Classic' },
    { id: 'satin-gold', name: 'Satin Gold', price: 6, description: 'Metallic gold', color: '#FFD700', width: '1 inch', bowStyle: 'Classic' },
    { id: 'satin-silver', name: 'Satin Silver', price: 6, description: 'Metallic silver', color: '#C0C0C0', width: '1 inch', bowStyle: 'Classic' },
    { id: 'satin-rose-gold', name: 'Satin Rose Gold', price: 7, description: 'Metallic rose gold', color: '#E0BFB8', width: '1 inch', bowStyle: 'Classic' },
    { id: 'silk-pink', name: 'Silk Pink', price: 8, description: 'Luxury silk ribbon', color: '#FFB6C1', width: '1.5 inch', bowStyle: 'Floral' },
    { id: 'silk-ivory', name: 'Silk Ivory', price: 8, description: 'Luxury silk ribbon', color: '#FFFFF0', width: '1.5 inch', bowStyle: 'Floral' },
    { id: 'lace-ivory', name: 'Lace Ivory', price: 10, description: 'Delicate lace ribbon', color: '#FFFFF0', width: '2 inch', bowStyle: 'Elegant' },
    { id: 'lace-white', name: 'Lace White', price: 10, description: 'Delicate lace ribbon', color: '#FFFFFF', width: '2 inch', bowStyle: 'Elegant' },
    { id: 'burlap-natural', name: 'Burlap Natural', price: 5, description: 'Rustic burlap ribbon', color: '#DEB887', width: '1.5 inch', bowStyle: 'Rustic' },
    { id: 'burlap-jute', name: 'Burlap Jute', price: 5, description: 'Natural jute burlap', color: '#D2B48C', width: '1.5 inch', bowStyle: 'Rustic' },
    { id: 'organza-silver', name: 'Organza Silver', price: 7, description: 'Sheer organza', color: '#C0C0C0', width: '1 inch', bowStyle: 'Modern' },
    { id: 'organza-gold', name: 'Organza Gold', price: 7, description: 'Sheer organza', color: '#FFD700', width: '1 inch', bowStyle: 'Modern' },
    { id: 'organza-white', name: 'Organza White', price: 7, description: 'Sheer organza', color: '#FFFFFF', width: '1 inch', bowStyle: 'Modern' },
    { id: 'velvet-black', name: 'Velvet Black', price: 9, description: 'Rich velvet ribbon', color: '#000000', width: '1.5 inch', bowStyle: 'Classic' },
    { id: 'velvet-red', name: 'Velvet Red', price: 9, description: 'Rich velvet ribbon', color: '#DC143C', width: '1.5 inch', bowStyle: 'Classic' },
    { id: 'velvet-navy', name: 'Velvet Navy', price: 9, description: 'Rich velvet ribbon', color: '#000080', width: '1.5 inch', bowStyle: 'Classic' },
  ];

  const accessoryOptions: AccessoryOption[] = [
    { id: 'greeting-card', name: 'Greeting Card', price: 3, description: 'Personalized message card', type: 'card' },
    { id: 'wedding-card', name: 'Wedding Card', price: 5, description: 'Elegant wedding message card', type: 'card' },
    { id: 'birthday-card', name: 'Birthday Card', price: 4, description: 'Festive birthday card', type: 'card' },
    { id: 'heart-charm', name: 'Heart Charm', price: 5, description: 'Silver heart charm', type: 'charm' },
    { id: 'butterfly-charm', name: 'Butterfly Charm', price: 6, description: 'Delicate butterfly charm', type: 'charm' },
    { id: 'star-charm', name: 'Star Charm', price: 5, description: 'Shining star charm', type: 'charm' },
    { id: 'teddy-bear', name: 'Teddy Bear', price: 15, description: 'Small plush teddy bear', type: 'plush' },
    { id: 'bunny-rabbit', name: 'Bunny Rabbit', price: 12, description: 'Cute plush bunny rabbit', type: 'plush' },
    { id: 'koala-bear', name: 'Koala Bear', price: 14, description: 'Adorable plush koala', type: 'plush' },
    { id: 'balloon-heart', name: 'Heart Balloon', price: 8, description: 'Red heart balloon', type: 'balloon' },
    { id: 'balloon-star', name: 'Star Balloon', price: 7, description: 'Gold star balloon', type: 'balloon' },
    { id: 'balloon-circle', name: 'Circle Balloon', price: 6, description: 'Colorful circle balloon', type: 'balloon' },
    { id: 'crystal-brooch', name: 'Crystal Brooch', price: 12, description: 'Elegant crystal brooch', type: 'brooch' },
    { id: 'pearl-brooch', name: 'Pearl Brooch', price: 15, description: 'Classic pearl brooch', type: 'brooch' },
    { id: 'flower-brooch', name: 'Flower Brooch', price: 10, description: 'Delicate flower brooch', type: 'brooch' },
    { id: 'led-lights', name: 'LED Lights', price: 10, description: 'Battery-powered LED string', type: 'light' },
    { id: 'fairy-lights', name: 'Fairy Lights', price: 12, description: 'Warm fairy light string', type: 'light' },
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
        // Position flowers within the circular canvas (radius of 192px, center at 192px)
        const canvasRadius = 192;
        const canvasCenter = 192;
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.random() * (canvasRadius - 60) + 30; // Keep flowers away from edges

        const newItem: BouquetItem = {
          ...flower,
          canvasId: `${flower.id}-${Date.now()}`,
          x: canvasCenter + Math.cos(angle) * distance - 24, // -24 to center the flower element
          y: canvasCenter + Math.sin(angle) * distance - 24, // -24 to center the flower element
          rotation: Math.random() * 40 - 20, // Random rotation between -20 and +20 degrees
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
    const canvasRadius = 192;
    const canvasCenter = 192;

    preset.flowers.forEach((flowerConfig, index) => {
      const flower = flowers.find(f => f.id === flowerConfig.id);
      if (flower) {
        for (let i = 0; i < flowerConfig.quantity; i++) {
          // Position flowers in a circular pattern for presets
          const baseAngle = (index * 60 + i * 30) * (Math.PI / 180); // Convert to radians
          const distance = 60 + (index * 20) + (i * 15); // Vary distance based on index and quantity

          newItems.push({
            ...flower,
            canvasId: `${flower.id}-${Date.now()}-${index}-${i}`,
            x: canvasCenter + Math.cos(baseAngle) * distance - 24,
            y: canvasCenter + Math.sin(baseAngle) * distance - 24,
            rotation: Math.random() * 40 - 20, // Random rotation between -20 and +20 degrees
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
          {/* Main Layout - Three Column Design */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
            {/* Left Sidebar - Flowers */}
            <div className="lg:col-span-3">
              <Card className="h-full">
                <CardContent className="p-4">
                  <div className="space-y-6">
                    {/* Flowers Section */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-primary">FLOWERS</h3>
                      <div className="space-y-3">
                        {flowers.slice(0, 3).map((flower) => (
                          <DraggableFlower key={flower.id} flower={flower} />
                        ))}
                      </div>
                    </div>

                    {/* Binding Point Section */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-primary">BINDING POINT</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'bind1', name: 'Pearl Pin', color: '#E5E7EB' },
                          { id: 'bind2', name: 'Gold Pin', color: '#F59E0B' },
                          { id: 'bind3', name: 'Silver Pin', color: '#9CA3AF' },
                          { id: 'bind4', name: 'Rose Pin', color: '#EF4444' },
                          { id: 'bind5', name: 'Crystal Pin', color: '#D1D5DB' },
                          { id: 'bind6', name: 'Butterfly Pin', color: '#8B5CF6' },
                          { id: 'bind7', name: 'Heart Pin', color: '#EC4899' },
                          { id: 'bind8', name: 'Star Pin', color: '#F59E0B' },
                          { id: 'bind9', name: 'Flower Pin', color: '#10B981' },
                        ].map((binding) => (
                          <div
                            key={binding.id}
                            className="w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer hover:border-primary transition-colors flex items-center justify-center"
                            style={{ backgroundColor: binding.color }}
                            title={binding.name}
                          >
                            <div className="w-3 h-3 bg-white rounded-full opacity-60" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Center Canvas */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center">
              <div className="relative">
                <BouquetCanvas
                  bouquetItems={bouquetItems}
                  onRemoveItem={removeItem}
                  setBouquetItems={setBouquetItems}
                />

                {/* Action Buttons at Bottom */}
                <div className="flex gap-4 mt-6">
                  <Button variant="outline" size="lg">
                    <Save className="mr-2 h-4 w-4" />
                    SAVE DESIGN
                  </Button>
                  <Button size="lg" className="bg-primary hover:bg-primary/90">
                    ORDER NOW
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Sidebar - Accessories */}
            <div className="lg:col-span-3">
              <Card className="h-full">
                <CardContent className="p-4">
                  <div className="space-y-6">
                    {/* Ribbon Section */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-primary">RIBBON</h3>
                      <div className="space-y-3">
                        {ribbonOptions.slice(0, 4).map((ribbon) => (
                          <div
                            key={ribbon.id}
                            className="flex items-center space-x-3 p-2 border rounded-lg hover:bg-muted/50 cursor-pointer"
                            onClick={() => setSelectedRibbon(ribbon.id)}
                          >
                            <div
                              className="w-6 h-6 rounded border-2 border-gray-300"
                              style={{ backgroundColor: ribbon.color }}
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{ribbon.name}</p>
                              <p className="text-xs text-muted-foreground">{ribbon.width}</p>
                            </div>
                            <span className="text-sm font-semibold">{ribbon.price} SAR</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Holder Section */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-primary">HOLDER</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {baseOptions.slice(0, 4).map((holder) => (
                          <div
                            key={holder.id}
                            className="flex flex-col items-center p-2 border rounded-lg hover:bg-muted/50 cursor-pointer"
                            onClick={() => setSelectedBase(holder.id)}
                          >
                            <div
                              className="w-12 h-8 rounded border-2 border-gray-300 mb-2"
                              style={{ backgroundColor: holder.color }}
                            />
                            <p className="text-xs text-center">{holder.name}</p>
                            <span className="text-xs font-semibold">{holder.price} SAR</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Wrapper Section */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 text-primary">WRAPPER</h3>
                      <div className="space-y-3">
                        {wrappingOptions.slice(0, 4).map((wrapper) => (
                          <div
                            key={wrapper.id}
                            className="flex items-center space-x-3 p-2 border rounded-lg hover:bg-muted/50 cursor-pointer"
                            onClick={() => setSelectedWrapping(wrapper.id)}
                          >
                            <div
                              className="w-8 h-8 rounded border-2 border-gray-300"
                              style={{ backgroundColor: wrapper.color }}
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{wrapper.name}</p>
                              <p className="text-xs text-muted-foreground">{wrapper.description}</p>
                            </div>
                            <span className="text-sm font-semibold">{wrapper.price} SAR</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <DragOverlay>
            {activeId ? (
              activeId.startsWith('canvas-') ? (
                // Canvas item being repositioned
                <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center">
                  <div
                    className="w-10 h-10 rounded-full"
                    style={{
                      backgroundColor: bouquetItems.find(item => `canvas-${item.canvasId}` === activeId)?.color || '#gray'
                    }}
                  />
                </div>
              ) : (
                // Flower from inventory
                <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center">
                  <div
                    className="w-10 h-10 rounded-full"
                    style={{
                      backgroundColor: flowers.find(f => f.id === activeId)?.color || '#gray'
                    }}
                  />
                </div>
              )
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};