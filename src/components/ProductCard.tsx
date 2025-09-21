import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, Eye, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import ProductDetailModal, { Product } from "@/components/ProductDetailModal";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  vendor: string;
  rating: number;
  reviewCount: number;
  category: string;
  isNew?: boolean;
  description?: string;
}

const ProductCard = ({
  id,
  name,
  price,
  originalPrice,
  image,
  vendor,
  rating,
  reviewCount,
  category,
  isNew = false,
  description,
}: ProductCardProps) => {
  const [showModal, setShowModal] = useState(false);
  const { addItemAsync } = useCart();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const { toast } = useToast();
  const navigate = useNavigate();

  const product: Product = {
    id,
    name,
    price,
    originalPrice,
    image,
    vendor,
    rating,
    reviewCount,
    category,
    isNew,
    description,
    longDescription: `${description} This beautiful arrangement is carefully crafted by our expert florists using the finest, freshest flowers available. Perfect for any special occasion or to brighten someone's day.`,
    features: [
      "Hand-picked fresh flowers",
      "Professional arrangement", 
      "Same-day delivery available",
      "Satisfaction guaranteed",
      "Eco-friendly packaging"
    ],
    inStock: true,
    stock: Math.floor(Math.random() * 20) + 5
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await addItemAsync(
        id,
        1,
        undefined,
        undefined,
        {
          name,
          price,
          image,
          sku: `SKU-${id}`,
        }
      );
      toast({
        title: "Added to Cart",
        description: `${name} has been added to your cart.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add item to cart",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/product/${id}`);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isFavorite(id)) {
      removeFavorite(id);
      toast({
        title: "Removed from Favorites",
        description: `${name} removed from your favorites.`,
      });
    } else {
      addFavorite({
        id,
        name,
        price,
        image,
        vendor,
        category,
      });
      toast({
        title: "Added to Favorites",
        description: `${name} added to your favorites.`,
      });
    }
  };
  return (
    <>
      <Card 
        className="group overflow-hidden bg-card hover:shadow-lg transition-all duration-300 border-border/50 cursor-pointer hover:scale-[1.02] max-w-[300px] sm:max-w-[320px] lg:max-w-[340px] mx-auto w-full"
        onClick={handleViewDetails}
      >
        <div className="relative overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full aspect-[4/3] object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-1">
            {isNew && (
              <Badge 
                variant="default" 
                className="bg-primary text-primary-foreground text-[10px] sm:text-xs py-0"
              >
                New
              </Badge>
            )}
            <Badge 
              variant="secondary" 
              className="bg-sage text-sage-foreground text-[10px] sm:text-xs py-0"
            >
              {category}
            </Badge>
          </div>
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8 bg-background/80 hover:bg-background text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                setShowModal(true);
              }}
            >
              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8 bg-background/80 hover:bg-background text-foreground"
              onClick={handleLike}
            >
              <Heart 
                className={cn(
                  "h-3 w-3 sm:h-4 sm:w-4",
                  isFavorite(id) ? "fill-primary text-primary" : ""
                )} 
              />
            </Button>
          </div>
        </div>

        <CardContent className="p-3 sm:p-4">
          <div className="space-y-1 sm:space-y-2">
            <h3 className="font-semibold text-card-foreground text-sm sm:text-base line-clamp-1">
              {name}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">by {vendor}</p>
            
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-primary text-primary" />
                <span className="text-xs sm:text-sm font-medium">{rating}</span>
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground">
                ({reviewCount} reviews)
              </span>
            </div>

            {description && (
              <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">
                {description}
              </p>
            )}

            <div className="flex items-center gap-2 pt-1">
              <span className="text-base sm:text-lg font-bold text-primary">
                {formatPrice(price)}
              </span>
              {originalPrice && price < originalPrice && (
                <span className="text-xs sm:text-sm text-muted-foreground line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>
          </div>
        </CardContent>

      <CardFooter className="p-3 sm:p-4 pt-0">
        <div className="grid grid-cols-2 gap-2 w-full">
          <Button
            variant="outline"
            className="w-full text-xs sm:text-sm h-8 sm:h-9 flex items-center justify-center gap-1 sm:gap-2"
            onClick={handleViewDetails}
          >
            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{t('product.details')}</span>
          </Button>
          <Button 
            className="w-full text-xs sm:text-sm h-8 sm:h-9 flex items-center justify-center gap-1 sm:gap-2"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{t('product.addToCart')}</span>
          </Button>
        </div>
      </CardFooter>
    </Card>

    <ProductDetailModal
      product={product}
      open={showModal}
      onClose={() => setShowModal(false)}
    />
    </>
  );
};

export default ProductCard;