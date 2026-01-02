import React, { useState, useCallback, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, pointerWithin } from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { FlowerCard, FlowerData } from './FlowerCard';
import { VisualBouquetCanvas, CanvasFlower } from './VisualBouquetCanvas';
import { SavedDesignsPanel } from './SavedDesignsPanel';
import { useBouquetFlowers } from '@/hooks/useBouquetFlowers';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Save, RotateCcw, ShoppingCart, Undo, Redo, Grid, Flower2,
  Ribbon, Package, Palette, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

interface HistoryState {
  items: CanvasFlower[];
  timestamp: number;
}

const WRAPPING_OPTIONS = [
  { id: 'paper', name: 'Kraft Paper', price: 5, color: '#d4a574' },
  { id: 'cellophane', name: 'Clear Cellophane', price: 3, color: '#e0e0e0' },
  { id: 'burlap', name: 'Burlap Wrap', price: 8, color: '#a67c52' },
  { id: 'fabric', name: 'Fabric Wrap', price: 10, color: '#f8b4c4' },
] as const;

const RIBBON_COLORS = [
  { name: 'Red', color: '#dc2626' },
  { name: 'Pink', color: '#ec4899' },
  { name: 'White', color: '#f5f5f5' },
  { name: 'Gold', color: '#d4af37' },
  { name: 'Navy', color: '#1e3a5f' },
  { name: 'Purple', color: '#7c3aed' },
  { name: 'Green', color: '#16a34a' },
  { name: 'Black', color: '#1f2937' },
];

const OCCASION_PRESETS = [
  { id: 'romantic', name: 'Romantic', icon: '💕', description: 'Red roses & pink accents' },
  { id: 'birthday', name: 'Birthday', icon: '🎂', description: 'Colorful & cheerful mix' },
  { id: 'sympathy', name: 'Sympathy', icon: '🕊️', description: 'White & soft tones' },
  { id: 'congratulations', name: 'Congrats', icon: '🎉', description: 'Bright & celebratory' },
];

export const ImprovedBouquetBuilder: React.FC = () => {
  const { flowers, loading: flowersLoading } = useBouquetFlowers();
  const { state: authState } = useAuth();
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();

  // Canvas state
  const [canvasItems, setCanvasItems] = useState<CanvasFlower[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(false);

  // Customization state
  const [wrapping, setWrapping] = useState<'paper' | 'cellophane' | 'burlap' | 'fabric'>('paper');
  const [ribbonColor, setRibbonColor] = useState('#dc2626');
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null);

  // Save dialog state
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [bouquetName, setBouquetName] = useState('');
  const [bouquetDescription, setBouquetDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // History for undo/redo
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Price calculation
  const basePrice = 15;
  const wrappingPrice = WRAPPING_OPTIONS.find(w => w.id === wrapping)?.price || 0;
  const flowersPrice = canvasItems.reduce((sum, item) => sum + item.price, 0);
  const totalPrice = basePrice + wrappingPrice + flowersPrice;

  // Save to history
  const saveToHistory = useCallback((items: CanvasFlower[]) => {
    const newState: HistoryState = { items: [...items], timestamp: Date.now() };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    if (newHistory.length > 30) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setCanvasItems(history[historyIndex - 1].items);
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setCanvasItems(history[historyIndex + 1].items);
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex]);

  // Drag handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over?.id === 'bouquet-canvas') {
      // Check if it's a canvas item being repositioned
      if (String(active.id).startsWith('canvas-')) {
        const canvasId = String(active.id).replace('canvas-', '');
        const delta = event.delta;
        
        setCanvasItems(prev => {
          const newItems = prev.map(item => 
            item.canvasId === canvasId 
              ? { ...item, x: item.x + delta.x, y: item.y + delta.y }
              : item
          );
          saveToHistory(newItems);
          return newItems;
        });
      } else {
        // Adding new flower from inventory
        const flower = flowers.find(f => f.id === active.id);
        if (flower && flower.stock > 0) {
          const canvasCenter = { x: 120, y: 120 };
          const offset = canvasItems.length * 15;
          
          const newItem: CanvasFlower = {
            ...flower,
            canvasId: `${flower.id}-${Date.now()}`,
            x: canvasCenter.x + (Math.random() - 0.5) * 80 + offset % 60,
            y: canvasCenter.y + (Math.random() - 0.5) * 80 + offset % 40,
            rotation: Math.random() * 30 - 15,
            scale: 1,
            zIndex: canvasItems.length,
          };
          
          setCanvasItems(prev => {
            const newItems = [...prev, newItem];
            saveToHistory(newItems);
            return newItems;
          });
          toast.success(`${flower.name} added!`);
        }
      }
    }
    
    setActiveId(null);
  }, [flowers, canvasItems, saveToHistory]);

  const updateItem = useCallback((canvasId: string, updates: Partial<CanvasFlower>) => {
    setCanvasItems(prev => {
      const newItems = prev.map(item => 
        item.canvasId === canvasId ? { ...item, ...updates } : item
      );
      return newItems;
    });
  }, []);

  const removeItem = useCallback((canvasId: string) => {
    setCanvasItems(prev => {
      const newItems = prev.filter(item => item.canvasId !== canvasId);
      saveToHistory(newItems);
      return newItems;
    });
    setSelectedItem(null);
  }, [saveToHistory]);

  const clearBouquet = useCallback(() => {
    setCanvasItems([]);
    setSelectedItem(null);
    saveToHistory([]);
    toast.success('Bouquet cleared');
  }, [saveToHistory]);

  // Load design from saved
  const loadDesign = useCallback((designData: any) => {
    if (designData?.items) {
      setCanvasItems(designData.items);
      saveToHistory(designData.items);
    }
    if (designData?.wrapping) setWrapping(designData.wrapping);
    if (designData?.ribbonColor) setRibbonColor(designData.ribbonColor);
    toast.success('Design loaded!');
  }, [saveToHistory]);

  // Save bouquet to Supabase
  const saveBouquet = async () => {
    if (!authState.user) {
      toast.error('Please sign in to save your bouquet');
      return;
    }

    if (!bouquetName.trim()) {
      toast.error('Please enter a name for your bouquet');
      return;
    }

    if (canvasItems.length === 0) {
      toast.error('Please add flowers to your bouquet');
      return;
    }

    setIsSaving(true);
    
    try {
      const designData = {
        items: canvasItems,
        wrapping,
        ribbonColor,
        occasion: selectedOccasion,
      };

      const { error } = await supabase
        .from('custom_bouquets')
        .insert({
          user_id: authState.user.id,
          name: bouquetName.trim(),
          description: bouquetDescription.trim() || null,
          price: totalPrice,
          design_data: designData as unknown as import('@/integrations/supabase/types').Json,
          is_public: isPublic,
          occasion: selectedOccasion,
        });

      if (error) throw error;
      
      toast.success('Bouquet saved successfully!');
      setShowSaveDialog(false);
      setBouquetName('');
      setBouquetDescription('');
    } catch (error) {
      console.error('Error saving bouquet:', error);
      toast.error('Failed to save bouquet');
    } finally {
      setIsSaving(false);
    }
  };

  // Add to cart
  const addToCart = useCallback(() => {
    if (canvasItems.length === 0) {
      toast.error('Please add flowers to your bouquet');
      return;
    }

    const bouquetData = {
      id: `custom-bouquet-${Date.now()}`,
      name: bouquetName || `Custom Bouquet - ${new Date().toLocaleDateString()}`,
      price: totalPrice,
      image: '/placeholder.svg',
      type: 'custom-bouquet' as const,
      customization: {
        flowers: canvasItems,
        wrapping,
        ribbonColor,
        occasion: selectedOccasion,
      }
    };

    addItem(bouquetData);
    toast.success('Added to cart!');
  }, [canvasItems, totalPrice, bouquetName, wrapping, ribbonColor, selectedOccasion, addItem]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
        if (e.key === 'z' && e.shiftKey) { e.preventDefault(); redo(); }
        if (e.key === 'y') { e.preventDefault(); redo(); }
      }
      if (selectedItem && (e.key === 'Delete' || e.key === 'Backspace')) {
        removeItem(selectedItem);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, undo, redo, removeItem]);

  const activeFlower = activeId ? flowers.find(f => f.id === activeId) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Flower2 className="w-7 h-7 text-primary" />
            Bouquet Builder
          </h1>
          <p className="text-muted-foreground mt-1">Create your perfect custom bouquet</p>
        </div>

        {/* Toolbar */}
        <Card className="mb-6">
          <CardContent className="p-3 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={undo} disabled={historyIndex <= 0}>
                <Undo className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1}>
                <Redo className="w-4 h-4" />
              </Button>
              <Separator orientation="vertical" className="h-6 mx-2" />
              <Button
                variant={showGrid ? "secondary" : "outline"}
                size="sm"
                onClick={() => setShowGrid(!showGrid)}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={clearBouquet}>
                <RotateCcw className="w-4 h-4 mr-1" />
                Clear
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-base px-3 py-1">
                {formatPrice(totalPrice)}
              </Badge>
              <Button variant="outline" size="sm" onClick={() => setShowSaveDialog(true)}>
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
              <Button size="sm" onClick={addToCart} disabled={canvasItems.length === 0}>
                <ShoppingCart className="w-4 h-4 mr-1" />
                Add to Cart
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <DndContext 
          onDragStart={handleDragStart} 
          onDragEnd={handleDragEnd}
          collisionDetection={pointerWithin}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Panel - Flower Inventory */}
            <div className="lg:col-span-3 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Flowers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {flowersLoading ? (
                    <div className="grid grid-cols-2 gap-2">
                      {[1, 2, 3, 4].map(i => (
                        <Skeleton key={i} className="h-24 w-full rounded-lg" />
                      ))}
                    </div>
                  ) : (
                    <ScrollArea className="h-[400px] pr-2">
                      <div className="grid grid-cols-2 gap-2">
                        {flowers.map((flower) => (
                          <FlowerCard key={flower.id} flower={flower} compact />
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>

              {/* Saved Designs */}
              <SavedDesignsPanel onLoadDesign={loadDesign} />
            </div>

            {/* Center - Canvas */}
            <div className="lg:col-span-6">
              <Card className="h-full">
                <CardContent className="p-6 flex items-center justify-center min-h-[500px]">
                  <VisualBouquetCanvas
                    items={canvasItems}
                    selectedItem={selectedItem}
                    onItemSelect={setSelectedItem}
                    onItemUpdate={updateItem}
                    onItemRemove={removeItem}
                    showGrid={showGrid}
                    wrapping={wrapping}
                    ribbonColor={ribbonColor}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Customization */}
            <div className="lg:col-span-3 space-y-4">
              {/* Occasion Presets */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Quick Start</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {OCCASION_PRESETS.map((preset) => (
                      <Button
                        key={preset.id}
                        variant={selectedOccasion === preset.id ? "default" : "outline"}
                        size="sm"
                        className="h-auto py-2 flex-col"
                        onClick={() => setSelectedOccasion(preset.id)}
                      >
                        <span className="text-lg mb-1">{preset.icon}</span>
                        <span className="text-xs">{preset.name}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Customization Tabs */}
              <Card>
                <CardContent className="pt-4">
                  <Tabs defaultValue="wrapping">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="wrapping" className="text-xs">
                        <Package className="w-3 h-3 mr-1" />
                        Wrap
                      </TabsTrigger>
                      <TabsTrigger value="ribbon" className="text-xs">
                        <Ribbon className="w-3 h-3 mr-1" />
                        Ribbon
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="wrapping" className="space-y-3 mt-4">
                      {WRAPPING_OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          className={`w-full p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                            wrapping === option.id 
                              ? 'border-primary bg-primary/5' 
                              : 'border-muted hover:border-primary/50'
                          }`}
                          onClick={() => setWrapping(option.id as any)}
                        >
                          <div 
                            className="w-8 h-8 rounded-full border"
                            style={{ backgroundColor: option.color }}
                          />
                          <div className="text-left flex-1">
                            <p className="text-sm font-medium">{option.name}</p>
                            <p className="text-xs text-muted-foreground">+{formatPrice(option.price)}</p>
                          </div>
                        </button>
                      ))}
                    </TabsContent>

                    <TabsContent value="ribbon" className="mt-4">
                      <Label className="text-xs text-muted-foreground">Select Color</Label>
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {RIBBON_COLORS.map((option) => (
                          <button
                            key={option.color}
                            className={`w-full aspect-square rounded-full border-2 transition-all ${
                              ribbonColor === option.color 
                                ? 'border-foreground scale-110' 
                                : 'border-transparent hover:scale-105'
                            }`}
                            style={{ backgroundColor: option.color }}
                            onClick={() => setRibbonColor(option.color)}
                            title={option.name}
                          />
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Price Summary */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base</span>
                    <span>{formatPrice(basePrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Flowers ({canvasItems.length})</span>
                    <span>{formatPrice(flowersPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Wrapping</span>
                    <span>{formatPrice(wrappingPrice)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(totalPrice)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeFlower && (
              <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-2xl opacity-80">
                <img
                  src={activeFlower.image}
                  alt={activeFlower.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>

        {/* Save Dialog */}
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Your Bouquet</DialogTitle>
              <DialogDescription>
                Give your creation a name to save it to your account
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Bouquet Name *</Label>
                <Input
                  id="name"
                  value={bouquetName}
                  onChange={(e) => setBouquetName(e.target.value)}
                  placeholder="My Beautiful Bouquet"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={bouquetDescription}
                  onChange={(e) => setBouquetDescription(e.target.value)}
                  placeholder="Add notes about your design..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="public">Make Public</Label>
                  <p className="text-xs text-muted-foreground">Allow others to see this design</p>
                </div>
                <Switch
                  id="public"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </Button>
              <Button onClick={saveBouquet} disabled={isSaving || !bouquetName.trim()}>
                {isSaving ? 'Saving...' : 'Save Bouquet'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
