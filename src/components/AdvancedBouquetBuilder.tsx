import React, { useState, useCallback, useRef, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
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
import { Slider } from '@/components/ui/slider';
import { FlowerInventory } from './FlowerInventory';
import { 
  Save, Share2, RotateCcw, ShoppingCart, Download, Copy, Palette, Type, Ribbon, 
  Move, RotateCw, ZoomIn, ZoomOut, Layers, Undo, Redo, Grid, Trash2 
} from 'lucide-react';
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
  bow: boolean;
}

interface CardCustomization {
  text: string;
  font: 'elegant' | 'modern' | 'classic' | 'handwritten';
  color: string;
  design: 'simple' | 'floral' | 'vintage' | 'minimalist';
  size: 'small' | 'medium' | 'large';
  position: 'attached' | 'separate';
}

interface FlowerCustomization {
  id: string;
  customColor?: string;
  arrangement: 'tight' | 'loose' | 'cascade' | 'dome';
  opacity: number;
  brightness: number;
  saturation: number;
}

interface CanvasItem extends BouquetItem {
  scale: number;
  rotation: number;
  zIndex: number;
  opacity: number;
  locked: boolean;
}

interface HistoryState {
  items: CanvasItem[];
  timestamp: number;
}

// Draggable flower component
const DraggableFlower: React.FC<{ flower: FlowerItem }> = ({ flower }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: flower.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="p-2 border rounded-lg bg-card cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-2">
        <div
          className="w-8 h-8 rounded-full"
          style={{ backgroundColor: flower.color }}
        />
      </div>
      <p className="text-xs font-medium truncate">{flower.name}</p>
      <p className="text-xs text-muted-foreground">${flower.price}</p>
      <Badge variant="outline" className="text-xs">
        {flower.stock} left
      </Badge>
    </div>
  );
};

// Enhanced canvas with advanced features
const AdvancedCanvas: React.FC<{
  items: CanvasItem[];
  onItemUpdate: (id: string, updates: Partial<CanvasItem>) => void;
  onItemRemove: (id: string) => void;
  selectedItem: string | null;
  onItemSelect: (id: string | null) => void;
  showGrid: boolean;
  zoom: number;
}> = ({ items, onItemUpdate, onItemRemove, selectedItem, onItemSelect, showGrid, zoom }) => {
  const { setNodeRef } = useDroppable({ id: 'advanced-canvas' });
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleItemClick = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    onItemSelect(itemId);
  };

  const handleCanvasClick = () => {
    onItemSelect(null);
  };

  return (
    <div className="relative border-2 border-dashed border-muted-foreground/20 rounded-lg overflow-hidden bg-gradient-to-br from-background to-muted/10">
      <div
        ref={setNodeRef}
        className="relative w-full h-96 overflow-hidden"
        style={{ 
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
          backgroundImage: showGrid ? 
            'radial-gradient(circle, #e2e8f0 1px, transparent 1px)' : 'none',
          backgroundSize: showGrid ? '20px 20px' : 'auto'
        }}
        onClick={handleCanvasClick}
      >
        {items
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((item) => (
            <div
              key={item.canvasId}
              className={`absolute cursor-pointer transition-all duration-200 ${
                selectedItem === item.canvasId 
                  ? 'ring-2 ring-primary ring-offset-2' 
                  : 'hover:ring-1 hover:ring-primary/50'
              } ${item.locked ? 'cursor-not-allowed opacity-60' : ''}`}
              style={{
                left: `${item.x}px`,
                top: `${item.y}px`,
                transform: `rotate(${item.rotation}deg) scale(${item.scale})`,
                opacity: item.opacity,
                zIndex: item.zIndex,
              }}
              onClick={(e) => handleItemClick(e, item.canvasId)}
            >
              <div
                className="w-12 h-12 rounded-full border-2 border-white shadow-lg"
                style={{ backgroundColor: item.color }}
              />
              <div className="absolute -top-1 -right-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onItemRemove(item.canvasId);
                  }}
                  className="w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs hover:bg-destructive/80"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

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

export const AdvancedBouquetBuilder: React.FC = () => {
  const [flowers] = useState<FlowerItem[]>(INITIAL_FLOWERS);
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [wrapping, setWrapping] = useState<'paper' | 'cellophane' | 'burlap'>('paper');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [bouquetName, setBouquetName] = useState('');
  const [bouquetDescription, setBouquetDescription] = useState('');
  
  // Advanced features state
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(false);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Enhanced customization states
  const [ribbon, setRibbon] = useState<RibbonCustomization>({
    color: '#dc2626',
    width: 'medium',
    style: 'satin',
    position: 'middle',
    bow: true
  });
  
  const [card, setCard] = useState<CardCustomization>({
    text: '',
    font: 'elegant',
    color: '#000000',
    design: 'simple',
    size: 'medium',
    position: 'attached'
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
  const cardPrice = card.text ? (card.size === 'small' ? 2 : card.size === 'large' ? 5 : 3) : 0;
  
  const totalPrice = canvasItems.reduce((sum, item) => sum + item.price, 0) + 
                    basePrice + 
                    wrappingPrices[wrapping] + 
                    ribbonPrices[ribbon.width] + 
                    cardPrice;

  // Save state to history
  const saveToHistory = useCallback(() => {
    const newState: HistoryState = {
      items: [...canvasItems],
      timestamp: Date.now()
    };
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    
    if (newHistory.length > 50) { // Limit history to 50 states
      newHistory.shift();
    }
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [canvasItems, history, historyIndex]);

  // Undo/Redo functionality
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setCanvasItems(prevState.items);
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setCanvasItems(nextState.items);
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex]);


  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && over.id === 'advanced-canvas') {
      const flower = flowers.find(f => f.id === active.id);
      if (flower && flower.stock > 0) {
        const newCanvasItem: CanvasItem = {
          ...flower,
          canvasId: `${flower.id}-${Date.now()}`,
          x: Math.random() * 300,
          y: Math.random() * 200,
          rotation: 0,
          scale: 1,
          zIndex: canvasItems.length,
          opacity: 1,
          locked: false,
        };
        setCanvasItems(prev => [...prev, newCanvasItem]);
        saveToHistory();
        toast.success(`${flower.name} added to bouquet`);
      }
    }
    setActiveId(null);
  }, [flowers, canvasItems, saveToHistory]);

  const updateItem = useCallback((canvasId: string, updates: Partial<CanvasItem>) => {
    setCanvasItems(prev => prev.map(item => 
      item.canvasId === canvasId ? { ...item, ...updates } : item
    ));
  }, []);

  const removeItem = useCallback((canvasId: string) => {
    setCanvasItems(prev => prev.filter(item => item.canvasId !== canvasId));
    setSelectedItem(null);
    saveToHistory();
  }, [saveToHistory]);

  const duplicateItem = useCallback((canvasId: string) => {
    const item = canvasItems.find(i => i.canvasId === canvasId);
    if (item) {
      const newItem: CanvasItem = {
        ...item,
        canvasId: `${item.id}-${Date.now()}`,
        x: item.x + 20,
        y: item.y + 20,
        zIndex: Math.max(...canvasItems.map(i => i.zIndex)) + 1
      };
      setCanvasItems(prev => [...prev, newItem]);
      saveToHistory();
    }
  }, [canvasItems, saveToHistory]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
          case 'g':
            e.preventDefault();
            setShowGrid(!showGrid);
            break;
        }
      }

      if (selectedItem) {
        switch (e.key) {
          case 'Delete':
          case 'Backspace':
            removeItem(selectedItem);
            break;
          case 'ArrowUp':
            e.preventDefault();
            updateItem(selectedItem, { y: canvasItems.find(i => i.canvasId === selectedItem)!.y - 5 });
            break;
          case 'ArrowDown':
            e.preventDefault();
            updateItem(selectedItem, { y: canvasItems.find(i => i.canvasId === selectedItem)!.y + 5 });
            break;
          case 'ArrowLeft':
            e.preventDefault();
            updateItem(selectedItem, { x: canvasItems.find(i => i.canvasId === selectedItem)!.x - 5 });
            break;
          case 'ArrowRight':
            e.preventDefault();
            updateItem(selectedItem, { x: canvasItems.find(i => i.canvasId === selectedItem)!.x + 5 });
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem, canvasItems, showGrid, undo, redo, removeItem, updateItem]);

  const clearBouquet = useCallback(() => {
    setCanvasItems([]);
    setSelectedItem(null);
    setRibbon({
      color: '#dc2626',
      width: 'medium',
      style: 'satin',
      position: 'middle',
      bow: true
    });
    setCard({
      text: '',
      font: 'elegant',
      color: '#000000',
      design: 'simple',
      size: 'medium',
      position: 'attached'
    });
    saveToHistory();
    toast.success('Bouquet cleared');
  }, [saveToHistory]);

  const addToCart = useCallback(() => {
    if (canvasItems.length === 0) {
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
        flowers: canvasItems,
        wrapping,
        ribbon,
        card,
        arrangement: selectedArrangement
      }
    };

    addItem(bouquetData);
    toast.success('Custom bouquet added to cart!');
  }, [canvasItems, totalPrice, bouquetName, wrapping, ribbon, card, selectedArrangement, addItem]);

  const colorOptions = [
    '#dc2626', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', 
    '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#f97316'
  ];

  const selectedItemData = selectedItem ? canvasItems.find(i => i.canvasId === selectedItem) : null;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Top Toolbar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={undo}
                  disabled={historyIndex <= 0}
                >
                  <Undo className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                >
                  <Redo className="w-4 h-4" />
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowGrid(!showGrid)}
                  data-active={showGrid}
                  className="data-[active=true]:bg-muted"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-medium w-12 text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={clearBouquet}>
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Clear
                </Button>
                <Button size="sm" onClick={() => setShowSaveDialog(true)}>
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Flower Inventory */}
          <div className="lg:col-span-1">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground">{t('common.availableFlowers')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {flowers.map((flower) => (
                    <DraggableFlower key={flower.id} flower={flower} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center Panel - Advanced Canvas */}
          <div className="lg:col-span-2">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground">{t('common.designBouquet')}</CardTitle>
              </CardHeader>
              <CardContent>
                <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                  <AdvancedCanvas
                    items={canvasItems}
                    onItemUpdate={updateItem}
                    onItemRemove={removeItem}
                    selectedItem={selectedItem}
                    onItemSelect={setSelectedItem}
                    showGrid={showGrid}
                    zoom={zoom}
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

                {/* Selected Item Controls */}
                {selectedItemData && (
                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="text-sm">Item Controls</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs">Scale</Label>
                          <Slider
                            value={[selectedItemData.scale]}
                            onValueChange={([value]) => updateItem(selectedItem!, { scale: value })}
                            min={0.5}
                            max={2}
                            step={0.1}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Rotation</Label>
                          <Slider
                            value={[selectedItemData.rotation]}
                            onValueChange={([value]) => updateItem(selectedItem!, { rotation: value })}
                            min={0}
                            max={360}
                            step={15}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Opacity</Label>
                          <Slider
                            value={[selectedItemData.opacity]}
                            onValueChange={([value]) => updateItem(selectedItem!, { opacity: value })}
                            min={0.1}
                            max={1}
                            step={0.1}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Z-Index</Label>
                          <Slider
                            value={[selectedItemData.zIndex]}
                            onValueChange={([value]) => updateItem(selectedItem!, { zIndex: value })}
                            min={0}
                            max={canvasItems.length}
                            step={1}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => duplicateItem(selectedItem!)}>
                          <Copy className="w-3 h-3 mr-1" />
                          Duplicate
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => removeItem(selectedItem!)}>
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Enhanced Customization */}
          <div className="lg:col-span-1 space-y-4">
            {/* Enhanced Customization Tabs */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Customization</CardTitle>
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
                      <Label>Width & Style</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
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
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="ribbon-bow"
                        checked={ribbon.bow}
                        onChange={(e) => setRibbon(prev => ({ ...prev, bow: e.target.checked }))}
                        className="rounded"
                      />
                      <Label htmlFor="ribbon-bow" className="text-sm">Add bow</Label>
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
                        maxLength={200}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {card.text.length}/200 characters
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
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
                        <Label>Size</Label>
                        <Select value={card.size} onValueChange={(size: 'small' | 'medium' | 'large') => 
                          setCard(prev => ({ ...prev, size }))
                        }>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small (+$2)</SelectItem>
                            <SelectItem value="medium">Medium (+$3)</SelectItem>
                            <SelectItem value="large">Large (+$5)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label>Design & Color</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
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
                        
                        <input
                          type="color"
                          value={card.color}
                          onChange={(e) => setCard(prev => ({ ...prev, color: e.target.value }))}
                          className="w-full h-10 border rounded"
                        />
                      </div>
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
                <CardTitle className="text-foreground">Price Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Base bouquet</span>
                    <span>{formatPrice(basePrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Flowers ({canvasItems.length})</span>
                    <span>{formatPrice(canvasItems.reduce((sum, item) => sum + item.price, 0))}</span>
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
                disabled={canvasItems.length === 0}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
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