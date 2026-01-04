import React, { useRef, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Share2, Copy, Check, Image, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { CanvasFlower } from './VisualBouquetCanvas';

interface BouquetExportProps {
  isOpen: boolean;
  onClose: () => void;
  items: CanvasFlower[];
  wrapping: 'paper' | 'cellophane' | 'burlap' | 'fabric';
  ribbonColor: string;
  bouquetName?: string;
}

const WRAPPING_COLORS = {
  paper: { from: '#d4a574', to: '#c49a6c' },
  cellophane: { from: '#e0e0e0', to: '#ffffff' },
  burlap: { from: '#a67c52', to: '#8b6642' },
  fabric: { from: '#f8b4c4', to: '#f0a0b4' },
};

export const BouquetExport: React.FC<BouquetExportProps> = ({
  isOpen,
  onClose,
  items,
  wrapping,
  ribbonColor,
  bouquetName = 'My Custom Bouquet',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Generate the bouquet image on a canvas
  const generateImage = useCallback(async () => {
    if (items.length === 0) {
      toast.error('No flowers to export');
      return null;
    }

    setIsGenerating(true);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      const size = 600;
      canvas.width = size;
      canvas.height = size + 80; // Extra space for text

      // Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Wrapping circle gradient
      const centerX = size / 2;
      const centerY = size / 2;
      const radius = size / 2 - 20;

      const wrapColors = WRAPPING_COLORS[wrapping];
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      gradient.addColorStop(0, wrapColors.from);
      gradient.addColorStop(1, wrapColors.to);

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Inner greenery background
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - 30, 0, Math.PI * 2);
      const innerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius - 30);
      innerGradient.addColorStop(0, '#f0fdf4');
      innerGradient.addColorStop(1, '#dcfce7');
      ctx.fillStyle = innerGradient;
      ctx.fill();

      // Scale factor to fit flowers in the canvas
      const scaleFactor = 2.5;

      // Load and draw each flower image
      const sortedItems = [...items].sort((a, b) => a.zIndex - b.zIndex);
      
      for (const item of sortedItems) {
        try {
          const img = await loadImage(item.image);
          const x = centerX - 120 + item.x * scaleFactor / 2;
          const y = centerY - 120 + item.y * scaleFactor / 2;
          const flowerSize = 60 * item.scale * scaleFactor;

          ctx.save();
          ctx.translate(x, y);
          ctx.rotate((item.rotation * Math.PI) / 180);

          // Draw circular mask
          ctx.beginPath();
          ctx.arc(0, 0, flowerSize / 2, 0, Math.PI * 2);
          ctx.clip();

          ctx.drawImage(
            img,
            -flowerSize / 2,
            -flowerSize / 2,
            flowerSize,
            flowerSize
          );

          ctx.restore();
        } catch (err) {
          // If image fails to load, draw a colored circle
          ctx.beginPath();
          ctx.arc(
            centerX - 120 + item.x * scaleFactor / 2,
            centerY - 120 + item.y * scaleFactor / 2,
            30 * item.scale * scaleFactor,
            0,
            Math.PI * 2
          );
          ctx.fillStyle = item.color;
          ctx.fill();
        }
      }

      // Draw ribbon
      ctx.fillStyle = ribbonColor;
      ctx.beginPath();
      ctx.roundRect(centerX - 60, size - 80, 120, 40, 20);
      ctx.fill();

      // Bow
      ctx.beginPath();
      ctx.ellipse(centerX - 25, size - 90, 20, 25, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(centerX + 25, size - 90, 20, 25, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(centerX, size - 90, 10, 0, Math.PI * 2);
      ctx.fill();

      // Text at bottom
      ctx.fillStyle = '#374151';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(bouquetName, centerX, size + 50);

      ctx.fillStyle = '#9ca3af';
      ctx.font = '14px sans-serif';
      ctx.fillText('Created with Roses Garden Bouquet Builder', centerX, size + 70);

      const dataUrl = canvas.toDataURL('image/png', 1.0);
      setPreviewUrl(dataUrl);
      return dataUrl;
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Failed to generate image');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [items, wrapping, ribbonColor, bouquetName]);

  // Load image helper
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  // Download the generated image
  const handleDownload = useCallback(async () => {
    let url = previewUrl;
    if (!url) {
      url = await generateImage();
    }
    if (!url) return;

    const link = document.createElement('a');
    link.download = `${bouquetName.replace(/\s+/g, '-').toLowerCase()}-bouquet.png`;
    link.href = url;
    link.click();
    toast.success('Image downloaded!');
  }, [previewUrl, generateImage, bouquetName]);

  // Copy image to clipboard
  const handleCopy = useCallback(async () => {
    let url = previewUrl;
    if (!url) {
      url = await generateImage();
    }
    if (!url) return;

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      setCopied(true);
      toast.success('Image copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy image');
    }
  }, [previewUrl, generateImage]);

  // Share via Web Share API
  const handleShare = useCallback(async () => {
    let url = previewUrl;
    if (!url) {
      url = await generateImage();
    }
    if (!url) return;

    if (navigator.share) {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const file = new File([blob], `${bouquetName}-bouquet.png`, { type: 'image/png' });

        await navigator.share({
          title: bouquetName,
          text: 'Check out my custom bouquet design!',
          files: [file],
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    } else {
      handleCopy();
    }
  }, [previewUrl, generateImage, bouquetName, handleCopy]);

  // Generate preview when dialog opens
  React.useEffect(() => {
    if (isOpen && !previewUrl && items.length > 0) {
      generateImage();
    }
  }, [isOpen, items.length]);

  // Reset preview when closed
  React.useEffect(() => {
    if (!isOpen) {
      setPreviewUrl(null);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Export Bouquet
          </DialogTitle>
          <DialogDescription>
            Download or share your beautiful creation
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Preview area */}
          <div className="relative aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="text-sm">Generating preview...</p>
              </div>
            ) : previewUrl ? (
              <img 
                src={previewUrl} 
                alt="Bouquet preview" 
                className="w-full h-full object-contain"
              />
            ) : items.length === 0 ? (
              <div className="text-center text-muted-foreground">
                <p>No flowers in your bouquet</p>
                <p className="text-sm mt-1">Add some flowers first!</p>
              </div>
            ) : (
              <Button onClick={generateImage} variant="outline">
                Generate Preview
              </Button>
            )}
          </div>

          {/* Bouquet name input */}
          <div className="mt-4">
            <Label htmlFor="export-name" className="text-sm">Bouquet Name</Label>
            <Input
              id="export-name"
              value={bouquetName}
              className="mt-1"
              readOnly
              disabled
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={handleCopy} 
            disabled={isGenerating || items.length === 0}
            className="flex-1"
          >
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          
          {navigator.share && (
            <Button 
              variant="outline" 
              onClick={handleShare} 
              disabled={isGenerating || items.length === 0}
              className="flex-1"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          )}
          
          <Button 
            onClick={handleDownload} 
            disabled={isGenerating || items.length === 0}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
