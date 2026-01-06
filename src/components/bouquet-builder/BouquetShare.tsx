import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Share2, Facebook, Twitter, Instagram, MessageCircle, Mail, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { CanvasFlower } from './VisualBouquetCanvas';

interface BouquetShareProps {
  bouquetName: string;
  items: CanvasFlower[];
  totalPrice: number;
  disabled?: boolean;
}

export const BouquetShare: React.FC<BouquetShareProps> = ({
  bouquetName,
  items,
  totalPrice,
  disabled = false,
}) => {
  const flowerCount = items.length;
  const uniqueFlowers = [...new Set(items.map(f => f.name))].slice(0, 3);
  
  const title = bouquetName || 'My Custom Bouquet';
  const description = flowerCount > 0
    ? `🌸 Check out my custom bouquet with ${flowerCount} beautiful flowers including ${uniqueFlowers.join(', ')}! Created with Roses Garden Bouquet Builder.`
    : 'Create your own custom bouquet at Roses Garden!';
  
  const url = typeof window !== 'undefined' ? window.location.href : '';

  const handleShare = async (platform: string) => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description);

    // Use Web Share API if available
    if (platform === 'native' && navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description,
          url: url,
        });
        toast.success('Shared successfully!');
        return;
      } catch {
        console.log('Share cancelled');
      }
    }

    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedDescription}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}%0A${encodedDescription}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedTitle}%0A${encodedDescription}%0A${encodedUrl}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`;
        break;
      case 'instagram':
        const instagramText = `${title}\n\n${description}\n\n${url}`;
        await navigator.clipboard.writeText(instagramText);
        toast.success('Text copied! Open Instagram to share.');
        return;
      case 'copy':
        const shareText = `${title}\n\n${description}\n\n${url}`;
        await navigator.clipboard.writeText(shareText);
        toast.success('Link copied to clipboard!');
        return;
    }

    if (shareUrl) {
      if (platform === 'email') {
        window.location.href = shareUrl;
      } else {
        window.open(shareUrl, '_blank', 'width=600,height=600');
      }
    }
  };

  const hasNativeShare = typeof navigator !== 'undefined' && navigator.share;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled} className="h-8 sm:h-9">
          <Share2 className="w-4 h-4 sm:mr-1" />
          <span className="hidden sm:inline">Share</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {hasNativeShare && (
          <DropdownMenuItem onClick={() => handleShare('native')}>
            <Share2 className="h-4 w-4 mr-2" />
            Share via...
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => handleShare('facebook')}>
          <Facebook className="h-4 w-4 mr-2" />
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('twitter')}>
          <Twitter className="h-4 w-4 mr-2" />
          Twitter (X)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('whatsapp')}>
          <MessageCircle className="h-4 w-4 mr-2" />
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('telegram')}>
          <MessageCircle className="h-4 w-4 mr-2" />
          Telegram
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('instagram')}>
          <Instagram className="h-4 w-4 mr-2" />
          Instagram
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('email')}>
          <Mail className="h-4 w-4 mr-2" />
          Email
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('copy')}>
          <LinkIcon className="h-4 w-4 mr-2" />
          Copy Link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
