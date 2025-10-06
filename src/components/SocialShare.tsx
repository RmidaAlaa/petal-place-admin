import React from 'react';
import { Button } from './ui/button';
import { Share2, Facebook, Twitter, Instagram, Link as LinkIcon, MessageCircle, Mail } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface SocialShareProps {
  url?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
}

export const SocialShare: React.FC<SocialShareProps> = ({ 
  url = window.location.href,
  title = document.title,
  description = 'Check out this beautiful bouquet from Roses Garden',
  imageUrl
}) => {
  const { t } = useLanguage();

  const handleShare = async (platform: string) => {
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description);

    // Use Web Share API if available (mobile devices)
    if (platform === 'native' && navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description,
          url: url
        });
        toast({
          title: t('common.shared') || 'Shared successfully!',
          description: t('common.shareSuccess') || 'Content has been shared.',
        });
        return;
      } catch (error) {
        console.log('Share cancelled or failed');
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
        navigator.clipboard.writeText(instagramText);
        toast({
          title: t('common.instagramReady') || 'Ready for Instagram!',
          description: t('common.instagramCopied') || 'Text copied. Open Instagram and paste in your story or post.',
        });
        return;
      case 'copy':
        const shareText = `${title}\n\n${description}\n\n${url}`;
        navigator.clipboard.writeText(shareText);
        toast({
          title: t('common.linkCopied') || 'Link copied!',
          description: t('common.linkCopiedDesc') || 'Link and description copied to clipboard.',
        });
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
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          {t('builder.share') || 'Share'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {hasNativeShare && (
          <DropdownMenuItem onClick={() => handleShare('native')}>
            <Share2 className="h-4 w-4 mr-2" />
            {t('common.shareVia') || 'Share via...'}
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
          {t('common.copyLink') || 'Copy Link'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};