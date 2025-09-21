import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X, User, ShoppingBag, Globe, Coins } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { AuthModal } from '@/components/AuthModal';
import CartSidebar from '@/components/CartSidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import logoImage from '@/assets/roses-garden-logo.jpg';

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const location = useLocation();
  const { state } = useCart();
  const { state: authState, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { currency, setCurrency } = useCurrency();

  const navigationItems = [
    { path: '/', label: t('nav.marketplace') },
    { path: '/builder', label: t('nav.bouquetBuilder') },
    { path: '/categories', label: t('nav.categories') },
    { path: '/gift-boxes', label: t('nav.giftBoxes') },
    { path: '/occasions', label: t('nav.occasions') },
    { path: '/partners', label: t('nav.partners') },
    { path: '/contact', label: t('nav.contact') },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-full sm:max-w-md bg-background border-border">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <Link to="/" className="flex items-center space-x-3" onClick={() => setIsOpen(false)}>
                <img src={logoImage} alt="Roses Garden" className="h-8 w-8 object-cover rounded-full" />
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-foreground">Roses Garden</span>
                  <span className="text-xs text-muted-foreground">Your Joy is Roses</span>
                </div>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="md:hidden"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              
              {authState.isAuthenticated && authState.user?.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/admin')
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  Admin
                </Link>
              )}
            </nav>

            {/* Settings and Actions */}
            <div className="p-4 border-t border-border space-y-4">
              {/* Language and Currency */}
              <div className="flex gap-2">
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="flex-1 h-8">
                    <Globe className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">EN</SelectItem>
                    <SelectItem value="ar">AR</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="flex-1 h-8">
                    <Coins className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="SAR">SAR</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Cart */}
              <CartSidebar>
                <Button variant="outline" className="w-full justify-start">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Cart ({state.itemCount})
                </Button>
              </CartSidebar>

              {/* User Actions */}
              {authState.isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <User className="h-4 w-4 mr-2" />
                      {authState.user?.first_name}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{authState.user?.first_name} {authState.user?.last_name}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {authState.user?.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" onClick={() => setIsOpen(false)}>
                        Profile Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/partners" onClick={() => setIsOpen(false)}>
                        Partners
                      </Link>
                    </DropdownMenuItem>
                    {authState.user?.role === 'admin' && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/admin" onClick={() => setIsOpen(false)}>
                            Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/import" onClick={() => setIsOpen(false)}>
                            Import Products
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowAuthModal(true)}
                >
                  <User className="h-4 w-4 mr-2" />
                  {t('nav.signIn')}
                </Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AuthModal 
        open={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
};

export default MobileMenu;
