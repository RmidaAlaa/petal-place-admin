import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { MessageSquare, Heart, Sparkles, Star, Leaf, Gift } from 'lucide-react';

export interface GiftCardData {
  enabled: boolean;
  style: string;
  recipientName: string;
  senderName: string;
  message: string;
}

interface GiftMessageCardProps {
  value: GiftCardData;
  onChange: (data: GiftCardData) => void;
}

const CARD_STYLES = [
  {
    id: 'elegant',
    name: 'Elegant',
    icon: Sparkles,
    bgClass: 'bg-gradient-to-br from-amber-50 to-amber-100',
    borderClass: 'border-amber-200',
    textClass: 'text-amber-900',
    accentClass: 'text-amber-600',
    price: 3,
  },
  {
    id: 'romantic',
    name: 'Romantic',
    icon: Heart,
    bgClass: 'bg-gradient-to-br from-rose-50 to-pink-100',
    borderClass: 'border-rose-200',
    textClass: 'text-rose-900',
    accentClass: 'text-rose-500',
    price: 3,
  },
  {
    id: 'nature',
    name: 'Nature',
    icon: Leaf,
    bgClass: 'bg-gradient-to-br from-green-50 to-emerald-100',
    borderClass: 'border-green-200',
    textClass: 'text-green-900',
    accentClass: 'text-green-600',
    price: 3,
  },
  {
    id: 'celebration',
    name: 'Celebration',
    icon: Star,
    bgClass: 'bg-gradient-to-br from-purple-50 to-violet-100',
    borderClass: 'border-purple-200',
    textClass: 'text-purple-900',
    accentClass: 'text-purple-500',
    price: 3,
  },
  {
    id: 'classic',
    name: 'Classic',
    icon: Gift,
    bgClass: 'bg-gradient-to-br from-slate-50 to-gray-100',
    borderClass: 'border-slate-200',
    textClass: 'text-slate-900',
    accentClass: 'text-slate-600',
    price: 2,
  },
];

const MAX_MESSAGE_LENGTH = 200;

export const GiftMessageCard: React.FC<GiftMessageCardProps> = ({ value, onChange }) => {
  const selectedStyle = CARD_STYLES.find(s => s.id === value.style) || CARD_STYLES[0];

  const updateField = <K extends keyof GiftCardData>(field: K, newValue: GiftCardData[K]) => {
    onChange({ ...value, [field]: newValue });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Gift Message
          </CardTitle>
          <Switch
            checked={value.enabled}
            onCheckedChange={(checked) => updateField('enabled', checked)}
          />
        </div>
        {value.enabled && (
          <p className="text-xs text-muted-foreground">
            Add a personalized card to your bouquet
          </p>
        )}
      </CardHeader>

      {value.enabled && (
        <CardContent className="space-y-4">
          {/* Card Style Selection */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Card Style</Label>
            <ScrollArea className="w-full">
              <div className="flex gap-2 pb-2">
                {CARD_STYLES.map((style) => {
                  const Icon = style.icon;
                  const isSelected = value.style === style.id;
                  return (
                    <button
                      key={style.id}
                      onClick={() => updateField('style', style.id)}
                      className={cn(
                        "flex-shrink-0 w-20 p-2 rounded-lg border-2 transition-all",
                        style.bgClass,
                        isSelected ? 'border-primary ring-2 ring-primary/20' : style.borderClass,
                        "hover:scale-105"
                      )}
                    >
                      <Icon className={cn("w-5 h-5 mx-auto mb-1", style.accentClass)} />
                      <p className={cn("text-[10px] font-medium text-center", style.textClass)}>
                        {style.name}
                      </p>
                      <p className="text-[9px] text-center text-muted-foreground">
                        +${style.price}
                      </p>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Recipient & Sender Names */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="recipient" className="text-xs">To</Label>
              <Input
                id="recipient"
                value={value.recipientName}
                onChange={(e) => updateField('recipientName', e.target.value.slice(0, 50))}
                placeholder="Recipient name"
                className="h-8 text-sm mt-1"
                maxLength={50}
              />
            </div>
            <div>
              <Label htmlFor="sender" className="text-xs">From</Label>
              <Input
                id="sender"
                value={value.senderName}
                onChange={(e) => updateField('senderName', e.target.value.slice(0, 50))}
                placeholder="Your name"
                className="h-8 text-sm mt-1"
                maxLength={50}
              />
            </div>
          </div>

          {/* Message */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <Label htmlFor="message" className="text-xs">Message</Label>
              <span className="text-[10px] text-muted-foreground">
                {value.message.length}/{MAX_MESSAGE_LENGTH}
              </span>
            </div>
            <Textarea
              id="message"
              value={value.message}
              onChange={(e) => updateField('message', e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
              placeholder="Write your heartfelt message..."
              className="text-sm resize-none"
              rows={3}
              maxLength={MAX_MESSAGE_LENGTH}
            />
          </div>

          {/* Preview */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Preview</Label>
            <div
              className={cn(
                "p-4 rounded-lg border-2 min-h-[120px]",
                selectedStyle.bgClass,
                selectedStyle.borderClass
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <selectedStyle.icon className={cn("w-4 h-4", selectedStyle.accentClass)} />
                <span className={cn("text-xs font-medium", selectedStyle.accentClass)}>
                  {selectedStyle.name} Card
                </span>
              </div>
              
              {value.recipientName && (
                <p className={cn("text-sm font-medium mb-1", selectedStyle.textClass)}>
                  Dear {value.recipientName},
                </p>
              )}
              
              <p className={cn(
                "text-sm italic leading-relaxed",
                selectedStyle.textClass,
                !value.message && "opacity-50"
              )}>
                {value.message || "Your message will appear here..."}
              </p>
              
              {value.senderName && (
                <p className={cn("text-sm font-medium mt-3 text-right", selectedStyle.textClass)}>
                  With love, {value.senderName}
                </p>
              )}
            </div>
          </div>

          {/* Price indicator */}
          <div className="flex justify-end">
            <Badge variant="secondary" className="text-xs">
              +${selectedStyle.price}.00 for card
            </Badge>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
