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
