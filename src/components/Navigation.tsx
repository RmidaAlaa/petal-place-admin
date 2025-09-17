import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flower2, ShoppingBag, User, LogOut, Settings } from "lucide-react";
import CartSidebar from "@/components/CartSidebar";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navigation = () => {
  const location = useLocation();
  const { state } = useCart();
  const { state: authState, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Flower2 className="h-8 w-8 text-primary" />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-foreground">Roses Garden</span>
              <span className="text-xs text-muted-foreground">حديقة الأزهار</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === "/" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Marketplace
            </Link>
            <Link 
              to="/builder" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === "/builder" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Bouquet Builder
            </Link>
            <Link 
              to="/natural-roses" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === "/natural-roses" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Natural Roses
            </Link>
            <Link 
              to="/gift-boxes" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === "/gift-boxes" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Gift Boxes
            </Link>
            <Link 
              to="/occasions" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === "/occasions" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Occasions
            </Link>
            <Link 
              to="/partners" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === "/partners" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Partners
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
                Sign In
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