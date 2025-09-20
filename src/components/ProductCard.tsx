import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, Eye } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import ProductDetailModal, { Product } from "@/components/ProductDetailModal";

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
        className="group overflow-hidden bg-card hover:shadow-lg transition-all duration-300 border-border/50 cursor-pointer hover-lift animate-fade-in"
        onClick={handleViewDetails}
      >
        <div className="relative overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            {isNew && (
              <Badge variant="default" className="bg-primary text-primary-foreground">
                New
              </Badge>
            )}
            <Badge variant="secondary" className="bg-sage text-sage-foreground">
              {category}
            </Badge>
          </div>
          <div className="absolute top-3 right-3 flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="bg-background/80 hover:bg-background text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                setShowModal(true);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="bg-background/80 hover:bg-background text-foreground"
              onClick={handleLike}
            >
              <Heart className={`h-4 w-4 ${isFavorite(id) ? 'fill-primary text-primary' : ''}`} />
            </Button>
          </div>
        </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-card-foreground line-clamp-2">{name}</h3>
          <p className="text-sm text-muted-foreground">by {vendor}</p>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="text-sm font-medium">{rating}</span>
            </div>
            <span className="text-sm text-muted-foreground">({reviewCount} reviews)</span>
          </div>

          {description && (
            <p className="text-xs text-muted-foreground mb-2">{description}</p>
          )}

          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary">{formatPrice(price)}</span>
            {originalPrice && (
              <span className="text-sm text-muted-foreground line-through">{formatPrice(originalPrice)}</span>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 space-y-2">
        <Button 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={handleAddToCart}
        >
          {t('common.addToCart')}
        </Button>
        <Button 
          variant="outline"
          className="w-full"
          onClick={handleViewDetails}
        >
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Button>
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