import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Heart, ShoppingCart, Truck, Shield, RotateCcw, Plus, Minus } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

export interface Product {
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
  longDescription?: string;
  features?: string[];
  specifications?: { [key: string]: string };
  images?: string[];
  inStock?: boolean;
  stock?: number;
}

interface ProductDetailModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

const ProductDetailModal = ({ product, open, onClose }: ProductDetailModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const { addItem } = useCart();
  const { toast } = useToast();

  if (!product) return null;

  const images = product.images || [product.image];
  const currentImage = images[currentImageIndex];
  const inStock = product.inStock !== false;
  const stockCount = product.stock || 10;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: `${product.id}-${Date.now()}-${i}`,
        name: product.name,
        price: product.price,
        image: product.image,
        type: 'product',
        vendor: product.vendor,
        category: product.category,
      });
    }
    
    toast({
      title: "Added to Cart",
      description: `${quantity}x ${product.name} added to your cart.`,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    toast({
      title: "Quick Checkout",
      description: "Redirecting to checkout... (Available after Supabase integration)",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">{product.name}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            by {product.vendor} • {product.category}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
              <img
                src={currentImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.isNew && (
                <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                  New
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 bg-background/80 hover:bg-background"
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-primary text-primary' : 'text-foreground'}`} />
              </Button>
            </div>
            
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                      currentImageIndex === index 
                        ? 'border-primary' 
                        : 'border-border hover:border-border/70'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Rating and Reviews */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="font-medium">{product.rating}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                ({product.reviewCount} reviews)
              </span>
              <Badge variant="secondary" className="bg-sage text-sage-foreground">
                {product.category}
              </Badge>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-primary">{product.price} SAR</span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  {product.originalPrice} SAR
                </span>
              )}
              {product.originalPrice && (
                <Badge variant="destructive">
                  Save {((product.originalPrice - product.price) / product.originalPrice * 100).toFixed(0)}%
                </Badge>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {inStock ? (
                <>
                  <Badge variant="secondary" className="bg-sage text-sage-foreground">
                    ✓ In Stock
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    ({stockCount} available)
                  </span>
                </>
              ) : (
                <Badge variant="destructive">Out of Stock</Badge>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-muted-foreground">{product.description}</p>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="font-medium">Quantity:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 border-border"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 border-border"
                  onClick={() => setQuantity(Math.min(stockCount, quantity + 1))}
                  disabled={quantity >= stockCount || !inStock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" 
                size="lg"
                onClick={handleAddToCart}
                disabled={!inStock}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart ({(product.price * quantity).toFixed(2)} SAR)
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground" 
                size="lg"
                onClick={handleBuyNow}
                disabled={!inStock}
              >
                Buy Now
              </Button>
            </div>

            {/* Features */}
            <div className="flex items-center justify-around text-sm text-muted-foreground border border-border rounded-lg p-4">
              <div className="flex flex-col items-center gap-1">
                <Truck className="h-5 w-5" />
                <span>Free Delivery</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Shield className="h-5 w-5" />
                <span>Quality Guarantee</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RotateCcw className="h-5 w-5" />
                <span>Easy Returns</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Additional Information */}
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted">
            <TabsTrigger value="description" className="data-[state=active]:bg-background">Description</TabsTrigger>
            <TabsTrigger value="features" className="data-[state=active]:bg-background">Features</TabsTrigger>
            <TabsTrigger value="care" className="data-[state=active]:bg-background">Care Instructions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="mt-4">
            <div className="prose prose-sm max-w-none text-card-foreground">
              <p>{product.longDescription || product.description || "Beautiful handcrafted flowers perfect for any occasion. Each arrangement is carefully prepared by our expert florists using the freshest flowers available."}</p>
            </div>
          </TabsContent>
          
          <TabsContent value="features" className="mt-4">
            <div className="space-y-2">
              {(product.features || [
                "Hand-picked fresh flowers",
                "Professional arrangement",
                "Same-day delivery available",
                "Satisfaction guaranteed",
                "Eco-friendly packaging"
              ]).map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  <span className="text-card-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="care" className="mt-4">
            <div className="space-y-3 text-card-foreground">
              <div>
                <h4 className="font-medium mb-2">To keep your flowers fresh:</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Trim stems at an angle under running water</li>
                  <li>• Change water every 2-3 days</li>
                  <li>• Keep away from direct sunlight and heat</li>
                  <li>• Remove wilted flowers promptly</li>
                  <li>• Use flower food if provided</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailModal;