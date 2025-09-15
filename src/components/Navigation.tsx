import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Flower2, ShoppingBag, Settings } from "lucide-react";

const Navigation = () => {
  const location = useLocation();

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
              to="/admin" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === "/admin" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Admin
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <ShoppingBag className="h-5 w-5" />
            </Button>
            <Button variant="default" size="sm">
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;