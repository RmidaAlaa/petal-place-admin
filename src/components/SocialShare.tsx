import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Facebook, Instagram, MessageCircle, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

interface SocialShareProps {
  url?: string;
  title?: string;
  description?: string;
  image?: string;
  className?: string;
}

export const SocialShare: React.FC<SocialShareProps> = ({
  url = window.location.href,
  title = 'Check out this beautiful bouquet from Rose Garden',
  description = 'Discover amazing flower arrangements and custom bouquets',
  image,
  className = ''
}) => {
  const { t } = useLanguage();

  const shareData = {
    title,
    text: description,
    url,
  };

  const handleShare = async (platform: string) => {
    try {
      switch (platform) {
        case 'native':
          if (navigator.share) {
            await navigator.share(shareData);
          } else {
            fallbackShare();
          }
          break;
          
        case 'facebook':
          const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&t=${encodeURIComponent(title)}`;
          window.open(fbUrl, '_blank', 'width=600,height=400');
          break;
          
        case 'instagram':
          // Instagram doesn't allow direct sharing via URL, so copy to clipboard
          await navigator.clipboard.writeText(`${title}\n${description}\n${url}`);
          toast.success(t('social.instagram_copied'));
          break;
          
        case 'whatsapp':
          const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title}\n${description}\n${url}`)}`;
          window.open(waUrl, '_blank');
          break;
          
        case 'copy':
          await navigator.clipboard.writeText(url);
          toast.success(t('social.link_copied'));
          break;
          
        default:
          fallbackShare();
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error(t('social.share_error'));
    }
  };

  const fallbackShare = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t('social.link_copied'));
    } catch (error) {
      toast.error(t('social.share_error'));
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-muted-foreground">{t('social.share')}:</span>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('native')}
        className="h-8 w-8 p-0"
        title={t('social.share_native')}
      >
        <Share2 className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('facebook')}
        className="h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-200"
        title={t('social.share_facebook')}
      >
        <Facebook className="h-4 w-4 text-blue-600" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('instagram')}
        className="h-8 w-8 p-0 hover:bg-pink-50 hover:border-pink-200"
        title={t('social.share_instagram')}
      >
        <Instagram className="h-4 w-4 text-pink-600" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('whatsapp')}
        className="h-8 w-8 p-0 hover:bg-green-50 hover:border-green-200"
        title={t('social.share_whatsapp')}
      >
        <MessageCircle className="h-4 w-4 text-green-600" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('copy')}
        className="h-8 w-8 p-0"
        title={t('social.copy_link')}
      >
        <Copy className="h-4 w-4" />
      </Button>
    </div>
  );
};