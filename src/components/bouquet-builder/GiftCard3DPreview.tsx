import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Gift, Sparkles, RotateCw, Eye, EyeOff, Heart, Star, Flower2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface GiftCard3DData {
  enabled: boolean;
  style: 'elegant' | 'modern' | 'romantic' | 'playful' | 'minimal';
  recipientName: string;
  senderName: string;
  message: string;
}

interface CardStyle {
  id: GiftCard3DData['style'];
  name: string;
  bgClass: string;
  textClass: string;
  accentClass: string;
  icon: React.ReactNode;
  price: number;
}

const CARD_STYLES: CardStyle[] = [
  {
    id: 'elegant',
    name: 'Elegant',
    bgClass: 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/40 dark:to-amber-900/40',
    textClass: 'text-amber-900 dark:text-amber-100',
    accentClass: 'border-amber-300 dark:border-amber-700',
    icon: <Star className="w-4 h-4" />,
    price: 5,
  },
  {
    id: 'modern',
    name: 'Modern',
    bgClass: 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800',
    textClass: 'text-slate-800 dark:text-slate-100',
    accentClass: 'border-slate-300 dark:border-slate-600',
    icon: <Sparkles className="w-4 h-4" />,
    price: 4,
  },
  {
    id: 'romantic',
    name: 'Romantic',
    bgClass: 'bg-gradient-to-br from-rose-50 to-pink-100 dark:from-rose-950/40 dark:to-pink-900/40',
    textClass: 'text-rose-800 dark:text-rose-100',
    accentClass: 'border-rose-300 dark:border-rose-700',
    icon: <Heart className="w-4 h-4" />,
    price: 5,
  },
  {
    id: 'playful',
    name: 'Playful',
    bgClass: 'bg-gradient-to-br from-violet-50 to-purple-100 dark:from-violet-950/40 dark:to-purple-900/40',
    textClass: 'text-violet-800 dark:text-violet-100',
    accentClass: 'border-violet-300 dark:border-violet-700',
    icon: <Flower2 className="w-4 h-4" />,
    price: 4,
  },
  {
    id: 'minimal',
    name: 'Minimal',
    bgClass: 'bg-white dark:bg-slate-900',
    textClass: 'text-gray-800 dark:text-gray-100',
    accentClass: 'border-gray-200 dark:border-gray-700',
    icon: <Gift className="w-4 h-4" />,
    price: 3,
  },
];

interface GiftCard3DPreviewProps {
  value: GiftCard3DData;
  onChange: (data: GiftCard3DData) => void;
  className?: string;
}

export const GiftCard3DPreview: React.FC<GiftCard3DPreviewProps> = ({
  value,
  onChange,
  className,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const selectedStyle = CARD_STYLES.find(s => s.id === value.style) || CARD_STYLES[0];

  const updateField = <K extends keyof GiftCard3DData>(field: K, newValue: GiftCard3DData[K]) => {
    onChange({ ...value, [field]: newValue });
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Gift className="w-4 h-4 text-primary" />
            3D Gift Card
            {value.enabled && (
              <Badge variant="secondary" className="text-[10px]">
                +${selectedStyle.price}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </Button>
            <Switch
              checked={value.enabled}
              onCheckedChange={(checked) => updateField('enabled', checked)}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {value.enabled && (
          <>
            {/* Style Selection */}
            <div className="space-y-2">
              <Label className="text-xs">Card Style</Label>
              <div className="flex flex-wrap gap-2">
                {CARD_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => updateField('style', style.id)}
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border-2 text-xs font-medium transition-all',
                      style.bgClass,
                      value.style === style.id
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-transparent hover:border-primary/50'
                    )}
                  >
                    {style.icon}
                    {style.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 3D Card Preview */}
            {showPreview && (
              <div className="perspective-1000 flex justify-center py-4">
                <div
                  className={cn(
                    'relative w-64 h-40 cursor-pointer transition-transform duration-700',
                    'transform-style-preserve-3d',
                    isFlipped && 'rotate-y-180'
                  )}
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  }}
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  {/* Front */}
                  <div
                    className={cn(
                      'absolute inset-0 rounded-xl p-4 shadow-lg border-2 backface-hidden',
                      selectedStyle.bgClass,
                      selectedStyle.accentClass
                    )}
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <div className="h-full flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <span className={cn('text-sm font-serif italic', selectedStyle.textClass)}>
                          To: {value.recipientName || 'Recipient'}
                        </span>
                        <Sparkles className={cn('w-5 h-5', selectedStyle.textClass, 'opacity-60')} />
                      </div>
                      
                      <div className={cn('text-xs text-center line-clamp-3', selectedStyle.textClass, 'opacity-80')}>
                        {value.message || 'Your heartfelt message here...'}
                      </div>
                      
                      <div className="flex justify-between items-end">
                        <span className={cn('text-xs', selectedStyle.textClass, 'opacity-60')}>
                          Click to flip
                        </span>
                        <span className={cn('text-sm font-serif italic', selectedStyle.textClass)}>
                          From: {value.senderName || 'Sender'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Back */}
                  <div
                    className={cn(
                      'absolute inset-0 rounded-xl p-4 shadow-lg border-2',
                      selectedStyle.bgClass,
                      selectedStyle.accentClass
                    )}
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    <div className="h-full flex flex-col items-center justify-center gap-2">
                      <Flower2 className={cn('w-8 h-8', selectedStyle.textClass)} />
                      <span className={cn('text-lg font-serif', selectedStyle.textClass)}>
                        Roses Garden
                      </span>
                      <span className={cn('text-xs', selectedStyle.textClass, 'opacity-60')}>
                        Made with love 💐
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Input Fields */}
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Recipient Name</Label>
                  <Input
                    placeholder="To..."
                    value={value.recipientName}
                    onChange={(e) => updateField('recipientName', e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Your Name</Label>
                  <Input
                    placeholder="From..."
                    value={value.senderName}
                    onChange={(e) => updateField('senderName', e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <Label className="text-xs">Message (max 100 chars)</Label>
                <Textarea
                  placeholder="Write your heartfelt message..."
                  value={value.message}
                  onChange={(e) => updateField('message', e.target.value.slice(0, 100))}
                  className="text-sm resize-none"
                  rows={2}
                  maxLength={100}
                />
                <p className="text-[10px] text-right text-muted-foreground">
                  {value.message.length}/100
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <RotateCw className="w-3 h-3 mr-1.5" />
              Flip Card Preview
            </Button>
          </>
        )}

        {!value.enabled && (
          <div className="text-center py-6 text-muted-foreground">
            <Gift className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Enable to add a personalized gift card</p>
            <p className="text-xs mt-1">Starting from $3</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
