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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { FlowerCard, FlowerData } from './FlowerCard';
import { VisualBouquetCanvas, CanvasFlower } from './VisualBouquetCanvas';
import { SavedDesignsPanel } from './SavedDesignsPanel';
import { BouquetExport } from './BouquetExport';
import { GiftMessageCard, GiftCardData } from './GiftMessageCard';
import { SizeSelector, BouquetSize, getSizeMultipliers } from './SizeSelector';
import { DeliveryScheduler, DeliverySchedule } from './DeliveryScheduler';
import { SeasonalRecommendations } from './SeasonalRecommendations';
import { BouquetPreviewThumbnail } from './BouquetPreviewThumbnail';
import { BouquetShare } from './BouquetShare';
import { Bouquet3DPreview } from './Bouquet3DPreview';
import { FlowerTemplates, FlowerTemplate } from './FlowerTemplates';
import { OCCASION_PRESETS } from './occasionPresets';
import { useBouquetFlowers } from '@/hooks/useBouquetFlowers';
import { getBouquetSlot } from './bouquetLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Save, RotateCcw, ShoppingCart, Undo, Redo, Grid, Flower2,
  Ribbon, Package, Sparkles, Download, Box, Layout
} from 'lucide-react';
import { toast } from 'sonner';

// View mode type for 2D/3D toggle
type ViewMode = '2d' | '3d';

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
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');

  // Customization state
  const [wrapping, setWrapping] = useState<'paper' | 'cellophane' | 'burlap' | 'fabric'>('paper');
  const [ribbonColor, setRibbonColor] = useState('#dc2626');
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null);
  const [bouquetSize, setBouquetSize] = useState<BouquetSize>('medium');
  const [deliverySchedule, setDeliverySchedule] = useState<DeliverySchedule>({
    date: null,
    timeSlot: null,
  });
  const [giftCard, setGiftCard] = useState<GiftCardData>({
    enabled: false,
    style: 'elegant',
    recipientName: '',
    senderName: '',
    message: '',
  });

  // Save dialog state
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
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
  const giftCardPrice = giftCard.enabled ? (giftCard.style === 'classic' ? 2 : 3) : 0;
  const { priceMultiplier, scaleMultiplier } = getSizeMultipliers(bouquetSize);
  const subtotal = basePrice + wrappingPrice + flowersPrice + giftCardPrice;
  const totalPrice = Number((subtotal * priceMultiplier).toFixed(2));

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
        // Adding new flower from inventory — bouquet puzzle placement
        const flower = flowers.find(f => f.id === active.id);
        if (flower && flower.stock > 0) {
          // Bouquet spiral layout: center first, then concentric rings
          const bouquetSlots = getBouquetSlot(canvasItems.length);
          
          const newItem: CanvasFlower = {
            ...flower,
            canvasId: `${flower.id}-${Date.now()}`,
            x: bouquetSlots.x,
            y: bouquetSlots.y,
            rotation: bouquetSlots.rotation,
            scale: bouquetSlots.scale,
            zIndex: bouquetSlots.zIndex,
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
    setSelectedOccasion(null);
    saveToHistory([]);
    toast.success('Bouquet cleared');
  }, [saveToHistory]);

  // Apply occasion preset
  const applyPreset = useCallback((presetId: string) => {
    const preset = OCCASION_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    // Generate fresh flowers with new IDs
    const freshFlowers = preset.flowers.map((flower, index) => ({
      ...flower,
      canvasId: `preset-${flower.id}-${Date.now()}-${index}`,
    }));

    setCanvasItems(freshFlowers);
    setWrapping(preset.wrapping);
    setRibbonColor(preset.ribbonColor);
    setSelectedOccasion(presetId);
    saveToHistory(freshFlowers);
    toast.success(`${preset.name} preset applied!`);
  }, [saveToHistory]);

  // Apply flower template
  const applyTemplate = useCallback((template: FlowerTemplate) => {
    // Map template arrangements to actual flowers
    const templateFlowers: CanvasFlower[] = template.arrangement.map((arr, index) => {
      // Find matching flower from inventory
      const flower = flowers.find(f => 
        f.id === arr.flowerId || 
        f.name.toLowerCase().includes(arr.flowerId.replace(/-/g, ' '))
      );
      
      if (!flower) {
        // Use a default flower if not found
        return {
          canvasId: `template-${arr.id}-${Date.now()}-${index}`,
          id: arr.flowerId,
          name: arr.flowerId.replace(/-/g, ' '),
          image: '/placeholder.svg',
          color: '#ff69b4',
          price: template.basePrice / template.arrangement.length,
          category: 'focal' as const,
          size: 'medium' as const,
          stock: 100,
          x: arr.x,
          y: arr.y,
          rotation: arr.rotation,
          scale: arr.scale,
          zIndex: arr.zIndex,
        };
      }

      return {
        ...flower,
        canvasId: `template-${arr.id}-${Date.now()}-${index}`,
        x: arr.x,
        y: arr.y,
        rotation: arr.rotation,
        scale: arr.scale,
        zIndex: arr.zIndex,
      };
    });

    setCanvasItems(templateFlowers);
    saveToHistory(templateFlowers);
    toast.success(`${template.name} template applied!`);
  }, [flowers, saveToHistory]);

  // Load design from saved
  const loadDesign = useCallback((designData: any) => {
    if (designData?.items) {
      setCanvasItems(designData.items);
      saveToHistory(designData.items);
    }
    if (designData?.wrapping) setWrapping(designData.wrapping);
    if (designData?.ribbonColor) setRibbonColor(designData.ribbonColor);
    if (designData?.occasion) setSelectedOccasion(designData.occasion);
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
        size: bouquetSize,
        deliverySchedule: deliverySchedule.date ? deliverySchedule : null,
        giftCard: giftCard.enabled ? giftCard : null,
      }
    };

    addItem(bouquetData);
    toast.success('Added to cart!');
  }, [canvasItems, totalPrice, bouquetName, wrapping, ribbonColor, selectedOccasion, bouquetSize, deliverySchedule, giftCard, addItem]);

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 px-3 py-4 md:px-6 md:py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-5 md:mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Flower2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">
                Bouquet Builder
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Design your perfect arrangement in 2D or immersive 3D
              </p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-2 sm:p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center justify-center sm:justify-start gap-1 sm:gap-2">
              <Button variant="outline" size="sm" onClick={undo} disabled={historyIndex <= 0} className="h-8 w-8 sm:h-9 sm:w-auto p-0 sm:px-3">
                <Undo className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1} className="h-8 w-8 sm:h-9 sm:w-auto p-0 sm:px-3">
                <Redo className="w-4 h-4" />
              </Button>
              <Separator orientation="vertical" className="h-6 mx-1 sm:mx-2 hidden sm:block" />
              <Button
                variant={showGrid ? "secondary" : "outline"}
                size="sm"
                onClick={() => setShowGrid(!showGrid)}
                className="h-8 w-8 sm:h-9 sm:w-auto p-0 sm:px-3"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === '3d' ? "secondary" : "outline"}
                size="sm"
                onClick={() => setViewMode(viewMode === '2d' ? '3d' : '2d')}
                className="h-8 sm:h-9"
                title={viewMode === '2d' ? 'Switch to 3D view' : 'Switch to 2D view'}
              >
                {viewMode === '2d' ? <Box className="w-4 h-4 sm:mr-1" /> : <Layout className="w-4 h-4 sm:mr-1" />}
                <span className="hidden sm:inline">{viewMode === '2d' ? '3D' : '2D'}</span>
              </Button>
              <Button variant="outline" size="sm" onClick={clearBouquet} className="h-8 sm:h-9">
                <RotateCcw className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">Clear</span>
              </Button>
            </div>
            
            <div className="flex items-center justify-center sm:justify-end gap-1.5 sm:gap-2">
              <Badge variant="secondary" className="text-sm sm:text-base px-2 sm:px-3 py-1">
                {formatPrice(totalPrice)}
              </Badge>
              <BouquetShare 
                bouquetName={bouquetName}
                items={canvasItems}
                totalPrice={totalPrice}
                disabled={canvasItems.length === 0}
              />
              <Button variant="outline" size="sm" onClick={() => setShowExportDialog(true)} disabled={canvasItems.length === 0} className="h-8 sm:h-9">
                <Download className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowSaveDialog(true)} className="h-8 sm:h-9">
                <Save className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">Save</span>
              </Button>
              <Button size="sm" onClick={addToCart} disabled={canvasItems.length === 0} className="h-8 sm:h-9">
                <ShoppingCart className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">Add to Cart</span>
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            {/* Left Panel - Flower Inventory */}
            <div className="lg:col-span-3 space-y-4 order-2 lg:order-first">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Flowers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {flowersLoading ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-2 gap-2">
                      {[1, 2, 3, 4].map(i => (
                        <Skeleton key={i} className="h-20 sm:h-24 w-full rounded-lg" />
                      ))}
                    </div>
                  ) : (
                    <ScrollArea className="h-[200px] sm:h-[300px] lg:h-[400px] pr-2">
                      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-2 gap-2">
                        {flowers.map((flower) => (
                          <FlowerCard key={flower.id} flower={flower} compact />
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>

              {/* Seasonal Recommendations */}
              <SeasonalRecommendations flowers={flowers} />
              
              {/* Saved Designs - Hidden on mobile */}
              <div className="hidden sm:block">
                <SavedDesignsPanel onLoadDesign={loadDesign} />
              </div>
            </div>

            {/* Center - Canvas */}
            <div className="lg:col-span-6 order-first lg:order-none space-y-4">
              <Card className="h-full border-0 shadow-lg bg-card/80 backdrop-blur-sm">
                <CardContent className="p-3 sm:p-6 flex items-center justify-center min-h-[350px] sm:min-h-[500px]">
                  {viewMode === '2d' ? (
                    <VisualBouquetCanvas
                      items={canvasItems}
                      selectedItem={selectedItem}
                      onItemSelect={setSelectedItem}
                      onItemUpdate={updateItem}
                      onItemRemove={removeItem}
                      showGrid={showGrid}
                      wrapping={wrapping}
                      ribbonColor={ribbonColor}
                      sizeScale={scaleMultiplier}
                    />
                  ) : (
                    <Bouquet3DPreview
                      flowers={canvasItems}
                      wrappingColor={WRAPPING_OPTIONS.find(w => w.id === wrapping)?.color || '#d4a574'}
                      ribbonColor={ribbonColor}
                      className="w-full h-full"
                    />
                  )}
                </CardContent>
              </Card>
              
              {/* Flower Templates */}
              <FlowerTemplates onSelectTemplate={applyTemplate} />
              
              {/* Preview Thumbnail - Mobile only */}
              <div className="block lg:hidden">
                <BouquetPreviewThumbnail
                  items={canvasItems}
                  wrapping={wrapping}
                  ribbonColor={ribbonColor}
                />
              </div>
            </div>

            {/* Right Panel - Customization */}
            <div className="lg:col-span-3 space-y-4 order-3">
              {/* Occasion Presets */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Quick Start Presets</CardTitle>
                  <p className="text-xs text-muted-foreground">Click to auto-fill your bouquet</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-2 gap-2">
                    {OCCASION_PRESETS.map((preset) => (
                      <Button
                        key={preset.id}
                        variant={selectedOccasion === preset.id ? "default" : "outline"}
                        size="sm"
                        className="h-auto py-2 sm:py-3 flex-col gap-0.5 sm:gap-1 transition-all hover:scale-105"
                        onClick={() => applyPreset(preset.id)}
                      >
                        <span className="text-lg sm:text-xl">{preset.icon}</span>
                        <span className="text-[10px] sm:text-xs font-medium">{preset.name}</span>
                        <span className="text-[8px] sm:text-[10px] text-muted-foreground line-clamp-1 hidden sm:block">{preset.description}</span>
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

              {/* Size Selector */}
              <SizeSelector value={bouquetSize} onChange={setBouquetSize} />

              {/* Delivery Scheduler */}
              <DeliveryScheduler value={deliverySchedule} onChange={setDeliverySchedule} />

              {/* Gift Message Card */}
              <GiftMessageCard value={giftCard} onChange={setGiftCard} />

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
                  {giftCard.enabled && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gift Card</span>
                      <span>{formatPrice(giftCardPrice)}</span>
                    </div>
                  )}
                  {bouquetSize !== 'medium' && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Size ({bouquetSize})</span>
                      <span>{priceMultiplier < 1 ? '-20%' : '+40%'}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(totalPrice)}</span>
                  </div>
                  {deliverySchedule.date && (
                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      📅 Delivery: {deliverySchedule.date.toLocaleDateString()}
                    </div>
                  )}
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

        {/* Export Dialog */}
        <BouquetExport
          isOpen={showExportDialog}
          onClose={() => setShowExportDialog(false)}
          items={canvasItems}
          wrapping={wrapping}
          ribbonColor={ribbonColor}
          bouquetName={bouquetName || `Custom Bouquet - ${new Date().toLocaleDateString()}`}
        />
      </div>
    </div>
  );
};
