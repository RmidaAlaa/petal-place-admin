import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, User, LogOut, Settings, Globe, Coins } from "lucide-react";
import CartSidebar from "@/components/CartSidebar";
import MobileMenu from "@/components/MobileMenu";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { AuthModal } from "@/components/AuthModal";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import logoImage from "@/assets/roses-garden-logo.jpg";

const Navigation = () => {
  const location = useLocation();
  const { state } = useCart();
  const { state: authState, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <MobileMenu />
            <Link to="/" className="flex items-center space-x-3">
              <img src={logoImage} alt="Roses Garden" className="h-10 w-10 object-cover rounded-full" />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-foreground">Roses Garden</span>
                <span className="text-xs text-muted-foreground">Your Joy is Roses</span>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === "/" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {t('nav.marketplace')}
            </Link>
            <Link 
              to="/builder" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === "/builder" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {t('nav.bouquetBuilder')}
            </Link>
            <Link 
              to="/categories" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === "/categories" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {t('nav.categories')}
            </Link>
            <Link 
              to="/gift-boxes" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === "/gift-boxes" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {t('nav.giftBoxes')}
            </Link>
            <Link 
              to="/occasions" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === "/occasions" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {t('nav.occasions')}
            </Link>
            <Link 
              to="/partners" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === "/partners" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {t('nav.partners')}
            </Link>
            {authState.isAuthenticated && authState.user?.role === 'admin' && (
              <Link 
                to="/admin" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === "/admin" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Admin
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-16 h-8 border-none">
                <Globe className="h-4 w-4" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">EN</SelectItem>
                <SelectItem value="ar">AR</SelectItem>
                <SelectItem value="fr">FR</SelectItem>
              </SelectContent>
            </Select>

            {/* Currency Selector */}
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="w-20 h-8 border-none">
                <Coins className="h-4 w-4" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="SAR">SAR</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
              </SelectContent>
            </Select>

            <CartSidebar>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingBag className="h-5 w-5" />
                {state.itemCount > 0 && (
                  <Badge variant="secondary" className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground">
                    {state.itemCount}
                  </Badge>
                )}
              </Button>
            </CartSidebar>
            
            {authState.isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-border text-foreground">
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
                    <Link to="/profile">
                      <Settings className="mr-2 h-4 w-4" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/partners">
                      <User className="mr-2 h-4 w-4" />
                      Partners
                    </Link>
                  </DropdownMenuItem>
                  {authState.user?.role === 'admin' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin">
                          <Settings className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/import">
                          <Settings className="mr-2 h-4 w-4" />
                          Import Products
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="outline" 
                className="border-border text-foreground"
                onClick={() => setShowAuthModal(true)}
              >
                <User className="h-4 w-4 mr-2" />
                {t('nav.signIn')}
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <AuthModal 
        open={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </nav>
  );
};

export default Navigation;