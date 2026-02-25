import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Star, ShoppingCart, Heart, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

interface RelatedProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  category: string;
  inStock: boolean;
}

const RELATED_PRODUCTS: RelatedProduct[] = [
  {
    id: 'vase-crystal',
    name: 'Crystal Flower Vase',
    image: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=200&h=200&fit=crop',
    price: 35,
    originalPrice: 45,
    rating: 4.8,
    reviewCount: 124,
    category: 'Vases',
    inStock: true,
  },
  {
    id: 'chocolates-premium',
    name: 'Premium Chocolates Box',
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=200&h=200&fit=crop',
    price: 28,
    rating: 4.9,
    reviewCount: 89,
    category: 'Gifts',
    inStock: true,
  },
  {
    id: 'teddy-bear',
    name: 'Luxury Teddy Bear',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop',
    price: 42,
    rating: 4.7,
    reviewCount: 56,
    category: 'Gifts',
    inStock: true,
  },
  {
    id: 'scented-candle',
    name: 'Rose Scented Candle',
    image: 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=200&h=200&fit=crop',
    price: 24,
    originalPrice: 32,
    rating: 4.6,
    reviewCount: 203,
    category: 'Home',
    inStock: true,
  },
  {
    id: 'greeting-card',
    name: 'Handmade Card Set',
    image: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=200&h=200&fit=crop',
    price: 12,
    rating: 4.5,
    reviewCount: 78,
    category: 'Cards',
    inStock: true,
  },
  {
    id: 'ribbon-set',
    name: 'Premium Ribbon Set',
    image: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=200&h=200&fit=crop',
    price: 15,
    rating: 4.4,
    reviewCount: 45,
    category: 'Accessories',
    inStock: false,
  },
];

interface RelatedProductsSectionProps {
  className?: string;
}

export const RelatedProductsSection: React.FC<RelatedProductsSectionProps> = ({ className }) => {
  const { formatPrice } = useCurrency();
  const { addItem } = useCart();

  const handleAddToCart = (product: RelatedProduct) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      type: 'product',
    });
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Complete Your Gift</span>
          <Badge variant="secondary" className="text-xs">
            {RELATED_PRODUCTS.filter(p => p.inStock).length} items available
          </Badge>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Add these popular items to make your bouquet extra special
        </p>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-3 pb-2">
            {RELATED_PRODUCTS.map((product) => (
              <Card
                key={product.id}
                className={cn(
                  'flex-shrink-0 w-40 sm:w-48 overflow-hidden transition-all hover:shadow-md',
                  !product.inStock && 'opacity-60'
                )}
              >
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                  {product.originalPrice && (
                    <Badge className="absolute top-2 left-2 text-[10px] bg-destructive">
                      {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                    </Badge>
                  )}
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <Badge variant="secondary">Out of Stock</Badge>
                    </div>
                  )}
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-2 right-2 w-7 h-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Heart className="w-3.5 h-3.5" />
                  </Button>
                </div>
                
                <CardContent className="p-3 space-y-2">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{product.category}</p>
                    <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium">{product.rating}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">({product.reviewCount})</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-bold text-primary">{formatPrice(product.price)}</span>
                      {product.originalPrice && (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                    
                    <Button
                      size="icon"
                      className="h-7 w-7 rounded-full"
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.inStock}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
