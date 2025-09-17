import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Gift, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '@/services/api';

interface HighlightProduct {
  id: string;
  name: string;
  name_ar?: string;
  price: number;
  original_price?: number;
  image_url?: string;
  images?: string[];
  is_featured: boolean;
  rating: number;
  review_count: number;
  category?: string;
}

const TopHighlights: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<HighlightProduct[]>([]);
  const [promoProducts, setPromoProducts] = useState<HighlightProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadHighlights();
  }, []);

  const loadHighlights = async () => {
    try {
      setIsLoading(true);
      
      // Get featured products
      const featuredData = await apiService.getProducts({ 
        is_featured: true, 
        is_active: true, 
        limit: 4 
      });
      
      // Get products with discounts (original_price > price)
      const promoData = await apiService.getProducts({ 
        is_active: true, 
        limit: 4 
      });
      
      setFeaturedProducts(featuredData.products || []);
      setPromoProducts(promoData.products?.filter(p => p.original_price && p.original_price > p.price) || []);
    } catch (error) {
      console.error('Failed to load highlights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDiscountPercentage = (price: number, originalPrice?: number) => {
    if (!originalPrice || originalPrice <= price) return 0;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  const getImageUrl = (product: HighlightProduct) => {
    if (product.image_url) return product.image_url;
    if (product.images && product.images.length > 0) {
      return Array.isArray(product.images) ? product.images[0] : product.images;
    }
    return '/placeholder.svg';
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">Loading highlights...</span>
          </div>
        </div>
      </div>
    );
  }

  const allHighlights = [...featuredProducts, ...promoProducts].slice(0, 8);

  if (allHighlights.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Top Highlights</h2>
            <Badge variant="secondary" className="bg-primary/20 text-primary">
              Best Sellers & Promotions
            </Badge>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/marketplace')}
            className="text-primary hover:text-primary/80"
          >
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {allHighlights.map((product) => {
            const discount = getDiscountPercentage(product.price, product.original_price);
            const isPromo = discount > 0;
            
            return (
              <Card 
                key={product.id} 
                className="cursor-pointer hover:shadow-md transition-all duration-200 bg-card/50 border-border/30 hover:border-primary/30"
                onClick={() => navigate(`/products/${product.id}`)}
              >
                <CardContent className="p-3">
                  <div className="space-y-2">
                    {/* Image */}
                    <div className="relative">
                      <img 
                        src={getImageUrl(product)} 
                        alt={product.name}
                        className="w-full h-16 object-cover rounded-lg"
                      />
                      {isPromo && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-1 -right-1 text-xs px-1 py-0"
                        >
                          -{discount}%
                        </Badge>
                      )}
                      {product.is_featured && !isPromo && (
                        <Badge 
                          variant="default" 
                          className="absolute -top-1 -right-1 text-xs px-1 py-0 bg-primary"
                        >
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-1">
                      <h3 className="text-xs font-medium text-card-foreground line-clamp-2">
                        {product.name}
                      </h3>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-1">
                            <span className="text-sm font-semibold text-primary">
                              {product.price} SAR
                            </span>
                            {product.original_price && product.original_price > product.price && (
                              <span className="text-xs text-muted-foreground line-through">
                                {product.original_price} SAR
                              </span>
                            )}
                          </div>
                          
                          {product.rating > 0 && (
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              <span className="text-xs text-muted-foreground">
                                {product.rating.toFixed(1)} ({product.review_count})
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="mt-4 text-center">
          <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Gift className="h-4 w-4 text-primary" />
              <span>Special Gifts Available</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>Premium Quality</span>
            </div>
            <div className="flex items-center space-x-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span>Best Sellers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopHighlights;
