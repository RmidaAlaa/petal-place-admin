import React from 'react';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Mail,
  Phone,
  MapPin,
  Flower2,
  Facebook,
  Instagram,
  Twitter,
  Send,
  CreditCard,
  Shield,
  Truck,
  RotateCcw,
  MessageCircle,
  Youtube,
} from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background">
      {/* Trust bar */}
      <div className="border-b border-background/10">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center gap-1.5">
              <Truck className="w-5 h-5 text-primary-foreground/80" />
              <span className="text-xs font-medium">Same-Day Delivery</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Shield className="w-5 h-5 text-primary-foreground/80" />
              <span className="text-xs font-medium">Secure Payments</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <RotateCcw className="w-5 h-5 text-primary-foreground/80" />
              <span className="text-xs font-medium">Freshness Guarantee</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <CreditCard className="w-5 h-5 text-primary-foreground/80" />
              <span className="text-xs font-medium">Multiple Payment Options</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container mx-auto px-4 py-10 md:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Flower2 className="w-6 h-6 text-primary" />
              <span className="text-lg font-bold">Roses Garden</span>
            </div>
            <p className="text-sm text-background/60 leading-relaxed">
              Premium natural roses, custom bouquets, and gift arrangements for every occasion. Making moments beautiful since 2020.
            </p>
            <div className="flex gap-3">
              <a
                href="https://facebook.com/rosesgarden"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-background/10 hover:bg-primary/80 flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com/rosesgarden"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-background/10 hover:bg-primary/80 flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com/rosesgarden"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-background/10 hover:bg-primary/80 flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/966501234567"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-background/10 hover:bg-[hsl(142,70%,40%)]/80 flex items-center justify-center transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com/@rosesgarden"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-background/10 hover:bg-primary/80 flex items-center justify-center transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://tiktok.com/@rosesgarden"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-background/10 hover:bg-foreground/80 hover:text-background flex items-center justify-center transition-colors"
                aria-label="TikTok"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.71a8.21 8.21 0 0 0 4.76 1.52V6.69h-1z"/></svg>
              </a>
              <a
                href="https://snapchat.com/add/rosesgarden"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-background/10 hover:bg-[hsl(60,100%,50%)]/80 hover:text-foreground flex items-center justify-center transition-colors"
                aria-label="Snapchat"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.21 1.5c2.63.06 4.75 1.51 5.88 3.78.44.89.6 1.85.6 2.85v2.26c.42-.07.84-.04 1.23.13.5.22.78.62.78 1.16 0 .58-.37 1.03-.85 1.32-.26.16-.55.27-.84.37-.14.05-.28.09-.4.15.03.12.1.24.18.34.53.77 1.2 1.41 1.98 1.93.38.25.79.44 1.22.57.52.16.82.55.78 1.05-.04.46-.39.8-.83.96-.55.2-1.13.3-1.72.36-.13.01-.25.03-.37.08-.13.05-.2.16-.24.3-.06.2-.14.4-.28.56-.3.33-.7.42-1.12.46-.4.04-.8.1-1.18.23-.63.22-1.2.6-1.82.87-.92.41-1.87.52-2.83.28-.6-.15-1.15-.43-1.69-.73-.42-.23-.84-.44-1.3-.55a5.2 5.2 0 0 0-1.28-.16c-.37 0-.73.11-1.07.29-.08.04-.13.12-.16.21-.07.27-.18.5-.4.67-.3.24-.67.3-1.04.33-.39.03-.77.1-1.14.22-.06.02-.11.04-.17.07-.57.24-1.16.34-1.76.14-.43-.14-.77-.47-.82-.93-.04-.47.24-.86.73-1.03.44-.15.86-.35 1.25-.6.78-.52 1.45-1.15 1.98-1.93.08-.11.15-.23.18-.36-.14-.06-.28-.1-.43-.15-.28-.1-.56-.2-.82-.36-.49-.29-.87-.75-.87-1.34 0-.54.29-.94.79-1.15.39-.17.81-.2 1.23-.14v-2.25c0-1.01.16-1.97.6-2.86C7.45 3 9.57 1.56 12.21 1.5z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-background/80">
              Shop
            </h4>
            <nav className="flex flex-col gap-2.5">
              {[
                { to: '/', label: 'All Products' },
                { to: '/categories', label: 'Categories' },
                { to: '/builder', label: 'Bouquet Builder' },
                { to: '/gift-boxes', label: 'Gift Boxes' },
                { to: '/occasions', label: 'Occasions' },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm text-background/50 hover:text-background transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-background/80">
              Support
            </h4>
            <nav className="flex flex-col gap-2.5">
              {[
                { to: '/contact', label: 'Contact Us' },
                { to: '/partners', label: 'Partners' },
                { to: '/profile', label: 'My Account' },
                { to: '/wishlist', label: 'Wishlist' },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm text-background/50 hover:text-background transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-background/80">
              Stay Updated
            </h4>
            <p className="text-sm text-background/50">
              Subscribe for exclusive offers and seasonal bouquets.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
              }}
              className="flex gap-2"
            >
              <Input
                type="email"
                placeholder="Your email"
                className="bg-background/10 border-background/20 text-background placeholder:text-background/40 h-9 text-sm"
              />
              <Button size="sm" className="h-9 px-3 shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </form>
            <div className="space-y-2 text-sm text-background/50">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5" />
                <span>+966 50 123 4567</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" />
                <span>hello@rosesgarden.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" />
                <span>Riyadh, Saudi Arabia</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-background/10">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-background/40">
          <p>© {currentYear} Roses Garden. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-background/60 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-background/60 cursor-pointer">Terms of Service</span>
            <span className="hover:text-background/60 cursor-pointer">Refund Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
