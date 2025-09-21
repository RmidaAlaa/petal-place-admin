import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { productService, Product, ProductVariant, ProductSpecification } from '@/services/productService';
import ProductReviews from '@/components/ProductReviews';
import { toast } from 'sonner';
import {
  Heart,
  Star,
  Share2,
  Minus,
  Plus,
  Truck,
  Shield,
  RotateCcw,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Link,
  Play,
  Pause,
  Volume2,
  VolumeX
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorBoundary from '@/components/ErrorBoundary';

interface Review {
  id: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  comment: string;
  created_at: string;
  helpful_count: number;
  verified_purchase: boolean;
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItemAsync } = useCart();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const { state: authState } = useAuth();
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();

  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [specifications, setSpecifications] = useState<ProductSpecification[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Product selection state
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Review state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [productData, variantsData, specificationsData, reviewsData] = await Promise.all([
        productService.getProductById(id!),
        productService.getProductVariants(id!),
        productService.getProductSpecifications(id!),
        productService.getProductReviews(id!)
      ]);

      setProduct(productData);
      setVariants(variantsData);
      setSpecifications(specificationsData);
      setReviews(reviewsData.reviews);

      // Load related products
      if (productData.category) {
        const related = await productService.getRelatedProducts(id!, productData.category, 4);
        setRelatedProducts(related);
      }

      // Add to recently viewed
      if (authState.user?.id) {
        await productService.addToRecentlyViewed(authState.user.id, id!);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      const variantId = Object.values(selectedVariants).find(Boolean);
      
      await addItemAsync(
        product.id,
        quantity,
        variantId,
        undefined,
        {
          name: product.name,
          price: product.price,
          image: product.images[0],
          sku: product.sku,
          variantName: variantId ? variants.find(v => v.id === variantId)?.name : undefined
        }
      );

      toast.success('Product added to cart!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add product to cart');
    }
  };

  const handleToggleFavorite = () => {
    if (!product) return;

    if (isFavorite(product.id)) {
      removeFavorite(product.id);
      toast.success('Removed from favorites');
    } else {
      addFavorite({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        vendor: product.vendor,
        category: product.category,
      });
      toast.success('Added to favorites');
    }
  };

  const handleVariantChange = (type: string, value: string) => {
    setSelectedVariants(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handleQuantityChange = (change: number) => {
    setQuantity(prev => Math.max(1, Math.min(99, prev + change)));
  };

  const handleSubmitReview = async () => {
    if (!product || !authState.user || reviewRating === 0) return;

    try {
      await productService.addProductReview(
        product.id,
        authState.user.id,
        reviewRating,
        reviewComment
      );

      toast.success('Review submitted for approval');
      setShowReviewForm(false);
      setReviewRating(0);
      setReviewComment('');

      // Reload reviews
      const reviewsData = await productService.getProductReviews(product.id);
      setReviews(reviewsData.reviews);
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit review');
    }
  };

  const handleShare = (platform: string) => {
    if (!product) return;

    const url = window.location.href;
    const text = `Check out this amazing product: ${product.name}`;

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent(product.name)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
        break;
    }
    setShowShareModal(false);
  };

  const getMediaType = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    return ['mp4', 'webm', 'ogg'].includes(extension || '') ? 'video' : 'image';
  };

  const toggleVideoPlayback = () => {
    setIsVideoPlaying(!isVideoPlaying);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading product..." />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
            <p className="text-muted-foreground mb-6">
              {error || 'The product you are looking for does not exist.'}
            </p>
            <Button onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentPrice = product.original_price && product.original_price > product.price 
    ? product.original_price 
    : product.price;

  const discountPercentage = product.original_price && product.original_price > product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
            <button onClick={() => navigate('/')} className="hover:text-foreground">
              Home
            </button>
            <span>/</span>
            <button onClick={() => navigate('/categories')} className="hover:text-foreground">
              Categories
            </button>
            <span>/</span>
            <span className="text-foreground">{product.category}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Media Gallery */}
            <div className="space-y-4">
              <div className="aspect-square relative overflow-hidden rounded-lg bg-muted group">
                {getMediaType(product.images[selectedImageIndex]) === 'video' ? (
                  <video
                    src={product.images[selectedImageIndex]}
                    className="w-full h-full object-cover"
                    controls={isVideoPlaying}
                    autoPlay={isVideoPlaying}
                    muted
                    loop
                    onClick={() => setShowImageModal(true)}
                  />
                ) : (
                  <img
                    src={product.images[selectedImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover cursor-zoom-in group-hover:scale-105 transition-transform"
                    onClick={() => setShowImageModal(true)}
                  />
                )}

                {/* Media Controls */}
                {getMediaType(product.images[selectedImageIndex]) === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={toggleVideoPlayback}
                      className="rounded-full"
                    >
                      {isVideoPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                    </Button>
                  </div>
                )}

                {/* Badges */}
                {product.is_new && (
                  <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                    New
                  </Badge>
                )}
                {discountPercentage > 0 && (
                  <Badge className="absolute top-4 right-4 bg-destructive text-destructive-foreground">
                    -{discountPercentage}%
                  </Badge>
                )}

                {/* Media Type Indicator */}
                <div className="absolute bottom-4 left-4">
                  <Badge variant="secondary" className="text-xs">
                    {getMediaType(product.images[selectedImageIndex]) === 'video' ? 'Video' : 'Image'} {selectedImageIndex + 1} of {product.images.length}
                  </Badge>
                </div>
              </div>

              {/* Enhanced Media Thumbnails */}
              {product.images.length > 1 && (
                <div className="grid grid-cols-6 gap-2">
                  {product.images.map((media, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
                      }`}
                      title={`${getMediaType(media) === 'video' ? 'Video' : 'Image'} ${index + 1}`}
                    >
                      {getMediaType(media) === 'video' ? (
                        <>
                          <video
                            src={media}
                            className="w-full h-full object-cover"
                            muted
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Play className="h-4 w-4 text-white" />
                          </div>
                        </>
                      ) : (
                        <img
                          src={media}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">{product.name}</h1>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.rating)
                            ? 'fill-primary text-primary'
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-muted-foreground ml-2">
                      ({product.review_count} reviews)
                    </span>
                  </div>
                  <Badge variant="secondary">{product.vendor}</Badge>
                </div>

                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <span className="text-3xl font-bold text-primary">
                      {formatPrice(product.price)}
                    </span>
                    {product.original_price && product.original_price > product.price && (
                      <span className="text-xl text-muted-foreground line-through">
                        {formatPrice(product.original_price)}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </div>

              {/* Product Variants */}
              {variants.length > 0 && (
                <div className="space-y-4">
                  {Object.entries(
                    variants.reduce((acc, variant) => {
                      if (!acc[variant.type]) acc[variant.type] = [];
                      acc[variant.type].push(variant);
                      return acc;
                    }, {} as Record<string, ProductVariant[]>)
                  ).map(([type, typeVariants]) => (
                    <div key={type} className="space-y-2">
                      <Label className="text-sm font-medium capitalize">{type}</Label>
                      <Select
                        value={selectedVariants[type] || ''}
                        onValueChange={(value) => handleVariantChange(type, value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={`Select ${type}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {typeVariants.map((variant) => (
                            <SelectItem key={variant.id} value={variant.id}>
                              {variant.name} {variant.price_modifier !== 0 && `(${variant.price_modifier > 0 ? '+' : ''}${formatPrice(variant.price_modifier)})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity and Actions */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Label className="text-sm font-medium">Quantity</Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(99, parseInt(e.target.value) || 1)))}
                      className="w-16 text-center"
                      min="1"
                      max="99"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= 99}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button
                    onClick={handleAddToCart}
                    className="flex-1"
                    disabled={product.stock_quantity === 0}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleToggleFavorite}
                  >
                    <Heart className={`h-4 w-4 ${isFavorite(product.id) ? 'fill-primary text-primary' : ''}`} />
                  </Button>
                  <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Share this product</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4">
                        <Button
                          variant="outline"
                          onClick={() => handleShare('facebook')}
                          className="flex items-center space-x-2 h-12"
                        >
                          <Facebook className="h-5 w-5 text-blue-600" />
                          <span>Facebook</span>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleShare('twitter')}
                          className="flex items-center space-x-2 h-12"
                        >
                          <Twitter className="h-5 w-5 text-blue-400" />
                          <span>Twitter</span>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleShare('email')}
                          className="flex items-center space-x-2 h-12"
                        >
                          <Mail className="h-5 w-5 text-gray-600" />
                          <span>Email</span>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleShare('copy')}
                          className="flex items-center space-x-2 h-12"
                        >
                          <Link className="h-5 w-5 text-gray-600" />
                          <span>Copy Link</span>
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Stock Status */}
                <div className="text-sm text-muted-foreground">
                  {product.stock_quantity > 10 ? (
                    <span className="text-green-600">In Stock ({product.stock_quantity} available)</span>
                  ) : product.stock_quantity > 0 ? (
                    <span className="text-yellow-600">Only {product.stock_quantity} left in stock</span>
                  ) : (
                    <span className="text-red-600">Out of Stock</span>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
                <div className="flex items-center space-x-2">
                  <Truck className="h-5 w-5 text-primary" />
                  <span className="text-sm">Free Shipping</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="text-sm">Secure Payment</span>
                </div>
                <div className="flex items-center space-x-2">
                  <RotateCcw className="h-5 w-5 text-primary" />
                  <span className="text-sm">Easy Returns</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="mt-12">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
                <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="prose max-w-none">
                      <p className="text-muted-foreground leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="specifications" className="mt-6">
                <div className="space-y-6">
                  {/* Product Overview */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Product Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">SKU</span>
                            <span className="font-mono text-sm">{product.sku}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Category</span>
                            <span>{product.category}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Vendor</span>
                            <span>{product.vendor}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Stock Status</span>
                            <Badge variant={product.stock_quantity > 0 ? "default" : "destructive"}>
                              {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Rating</span>
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 fill-primary text-primary" />
                              <span>{product.rating.toFixed(1)}</span>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Reviews</span>
                            <span>{product.review_count}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Media</span>
                            <span>{product.images.length} items</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status</span>
                            <Badge variant={product.is_active ? "default" : "secondary"}>
                              {product.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Detailed Specifications */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Technical Specifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {specifications.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {specifications.map((spec) => (
                            <div key={spec.id} className="flex justify-between py-3 px-4 bg-muted/50 rounded-lg">
                              <span className="font-medium">{spec.name}</span>
                              <span className="text-muted-foreground">{spec.value}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-8">No detailed specifications available.</p>
                      )}
                    </CardContent>
                  </Card>

                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <div className="space-y-6">
                  {/* Rating Summary */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-primary mb-2">
                            {product.rating.toFixed(1)}
                          </div>
                          <div className="flex items-center justify-center mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-5 w-5 ${
                                  i < Math.floor(product.rating)
                                    ? 'fill-primary text-primary'
                                    : 'text-muted-foreground'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Based on {product.review_count} reviews
                          </p>
                        </div>

                        <div className="space-y-2">
                          {[5, 4, 3, 2, 1].map((rating) => (
                            <div key={rating} className="flex items-center space-x-2">
                              <span className="text-sm w-8">{rating}★</span>
                              <div className="flex-1 bg-muted rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full"
                                  style={{
                                    width: `${product.review_count > 0 ? (reviews.filter(r => r.rating === rating).length / product.review_count) * 100 : 0}%`
                                  }}
                                />
                              </div>
                              <span className="text-sm text-muted-foreground w-8">
                                {reviews.filter(r => r.rating === rating).length}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Write Review Button */}
                  {authState.isAuthenticated && (
                    <div className="flex justify-center">
                      <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
                        <DialogTrigger asChild>
                          <Button>
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Write a Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Write a Review</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Rating</Label>
                              <div className="flex space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <button
                                    key={i}
                                    onClick={() => setReviewRating(i + 1)}
                                    className="text-2xl"
                                  >
                                    <Star
                                      className={`h-8 w-8 ${
                                        i < reviewRating
                                          ? 'fill-primary text-primary'
                                          : 'text-muted-foreground'
                                      }`}
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="review-comment">Comment</Label>
                              <Textarea
                                id="review-comment"
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                placeholder="Share your experience with this product..."
                                rows={4}
                              />
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleSubmitReview} disabled={reviewRating === 0}>
                                Submit Review
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}

                  {/* Reviews List */}
                  <ProductReviews
                    productId={product.id}
                    productName={product.name}
                    onReviewAdded={() => {
                      // Refresh product data or show success message
                      toast.success('Thank you for your review!');
                    }}
                  />
                </div>
              </TabsContent>

              <TabsContent value="shipping" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">Shipping Information</h3>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Free shipping on orders over $100</li>
                          <li>• Standard shipping: 3-5 business days</li>
                          <li>• Express shipping: 1-2 business days</li>
                          <li>• Same-day delivery available in select areas</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Return Policy</h3>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• 30-day return policy</li>
                          <li>• Items must be in original condition</li>
                          <li>• Free return shipping</li>
                          <li>• Refunds processed within 5-7 business days</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Related Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <Card key={relatedProduct.id} className="group cursor-pointer hover:shadow-lg transition-shadow">
                    <div className="aspect-square overflow-hidden rounded-t-lg">
                      <img
                        src={relatedProduct.images[0]}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-2">{relatedProduct.name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">
                          {formatPrice(relatedProduct.price)}
                        </span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-primary text-primary" />
                          <span className="text-sm text-muted-foreground">
                            {relatedProduct.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Media Modal */}
        <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
          <DialogContent className="max-w-5xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{product.name}</span>
                <Badge variant="secondary">
                  {getMediaType(product.images[selectedImageIndex]) === 'video' ? 'Video' : 'Image'} {selectedImageIndex + 1} of {product.images.length}
                </Badge>
              </DialogTitle>
            </DialogHeader>
            <div className="relative bg-black rounded-lg overflow-hidden">
              {getMediaType(product.images[selectedImageIndex]) === 'video' ? (
                <video
                  src={product.images[selectedImageIndex]}
                  controls
                  autoPlay
                  className="w-full h-auto max-h-[70vh] object-contain"
                />
              ) : (
                <img
                  src={product.images[selectedImageIndex]}
                  alt={product.name}
                  className="w-full h-auto max-h-[70vh] object-contain"
                />
              )}

              {product.images.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 border-0"
                    onClick={() => setSelectedImageIndex(
                      selectedImageIndex === 0 ? product.images.length - 1 : selectedImageIndex - 1
                    )}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 border-0"
                    onClick={() => setSelectedImageIndex(
                      selectedImageIndex === product.images.length - 1 ? 0 : selectedImageIndex + 1
                    )}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}

              {/* Thumbnail strip */}
              {product.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 bg-black/50 rounded-lg p-2">
                  {product.images.map((media, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`w-12 h-12 rounded border-2 overflow-hidden ${
                        selectedImageIndex === index ? 'border-white' : 'border-gray-400'
                      }`}
                    >
                      {getMediaType(media) === 'video' ? (
                        <video
                          src={media}
                          className="w-full h-full object-cover"
                          muted
                        />
                      ) : (
                        <img
                          src={media}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </ErrorBoundary>
  );
};

export default ProductDetailPage;
