import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useReviews } from '@/contexts/ReviewContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  Flag, 
  Camera, 
  Send, 
  Filter,
  Search,
  SortAsc,
  SortDesc,
  CheckCircle,
  AlertTriangle,
  Image as ImageIcon,
  X,
  Edit,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface ProductReviewsProps {
  productId: string;
  productName: string;
  onReviewAdded?: () => void;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ 
  productId, 
  productName, 
  onReviewAdded 
}) => {
  const { state, loadProductReviews, createReview, markHelpful, reportReview, setFilters, setPage } = useReviews();
  const { state: authState } = useAuth();
  const { toast } = useToast();

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: '',
    images: [] as File[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest' | 'most_helpful'>('newest');
  const [ratingFilter, setRatingFilter] = useState<number | undefined>(undefined);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [showImagesOnly, setShowImagesOnly] = useState(false);

  useEffect(() => {
    loadProductReviews(productId);
  }, [productId]);

  useEffect(() => {
    const filters: any = {};
    if (searchTerm) filters.search = searchTerm;
    if (ratingFilter) filters.rating = ratingFilter;
    if (showVerifiedOnly) filters.verified = true;
    if (showImagesOnly) filters.hasImages = true;
    filters.sortBy = sortBy;
    
    setFilters(filters);
    loadProductReviews(productId);
  }, [searchTerm, ratingFilter, showVerifiedOnly, showImagesOnly, sortBy]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authState.isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please log in to write a review',
        variant: 'destructive',
      });
      return;
    }

    if (!newReview.title.trim() || !newReview.comment.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await createReview({
        productId,
        rating: newReview.rating,
        title: newReview.title.trim(),
        comment: newReview.comment.trim(),
        images: newReview.images,
      });

      setNewReview({
        rating: 5,
        title: '',
        comment: '',
        images: [],
      });
      setShowReviewForm(false);
      onReviewAdded?.();
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewReview(prev => ({
      ...prev,
      images: [...prev.images, ...files].slice(0, 5), // Max 5 images
    }));
  };

  const removeImage = (index: number) => {
    setNewReview(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleMarkHelpful = async (reviewId: string, helpful: boolean) => {
    await markHelpful(reviewId, helpful);
  };

  const handleReportReview = async (reviewId: string) => {
    await reportReview(reviewId, 'inappropriate', 'This review contains inappropriate content');
  };

  const renderStars = (rating: number, interactive: boolean = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`${interactive ? 'cursor-pointer' : 'cursor-default'} ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            } transition-colors`}
            onClick={() => interactive && onRatingChange?.(star)}
            disabled={!interactive}
          >
            <Star className="h-5 w-5 fill-current" />
          </button>
        ))}
      </div>
    );
  };

  const renderRatingDistribution = () => {
    if (!state.stats) return null;

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = state.stats!.ratingDistribution[rating as keyof typeof state.stats.ratingDistribution];
          const percentage = (count / state.stats!.totalReviews) * 100;
          
          return (
            <div key={rating} className="flex items-center space-x-2">
              <span className="text-sm font-medium w-8">{rating}</span>
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 w-8">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (state.isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading reviews...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      {state.stats && (
        <Card>
          <CardHeader>
            <CardTitle>Customer Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {state.stats.averageRating.toFixed(1)}
                </div>
                <div className="flex justify-center mb-2">
                  {renderStars(Math.round(state.stats.averageRating))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on {state.stats.totalReviews} reviews
                </p>
              </div>
              
              <div className="lg:col-span-2">
                <h4 className="font-semibold mb-3">Rating Distribution</h4>
                {renderRatingDistribution()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            
            <Select value={ratingFilter?.toString() || 'all'} onValueChange={(value) => 
              setRatingFilter(value === 'all' ? undefined : parseInt(value))
            }>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="highest">Highest Rated</SelectItem>
                <SelectItem value="lowest">Lowest Rated</SelectItem>
                <SelectItem value="most_helpful">Most Helpful</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="verified-only"
                checked={showVerifiedOnly}
                onChange={(e) => setShowVerifiedOnly(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="verified-only" className="text-sm">Verified Only</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="images-only"
                checked={showImagesOnly}
                onChange={(e) => setShowImagesOnly(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="images-only" className="text-sm">With Images</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Write Review Button */}
      {authState.isAuthenticated && (
        <div className="flex justify-end">
          <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
            <DialogTrigger asChild>
              <Button>
                <Send className="h-4 w-4 mr-2" />
                Write a Review
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Write a Review for {productName}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <Label htmlFor="rating">Rating *</Label>
                  <div className="mt-2">
                    {renderStars(newReview.rating, true, (rating) => 
                      setNewReview(prev => ({ ...prev, rating }))
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="title">Review Title *</Label>
                  <Input
                    id="title"
                    value={newReview.title}
                    onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Summarize your experience"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="comment">Your Review *</Label>
                  <Textarea
                    id="comment"
                    value={newReview.comment}
                    onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                    placeholder="Tell others about your experience with this product"
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="images">Photos (Optional)</Label>
                  <div className="mt-2">
                    <input
                      id="images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Label htmlFor="images" className="cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                        <Camera className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">Click to upload photos</p>
                        <p className="text-xs text-gray-500">Up to 5 images</p>
                      </div>
                    </Label>
                  </div>
                  
                  {newReview.images.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {newReview.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Review image ${index + 1}`}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowReviewForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {state.reviews.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No reviews found for this product.</p>
              {authState.isAuthenticated && (
                <Button 
                  className="mt-4" 
                  onClick={() => setShowReviewForm(true)}
                >
                  Be the first to review!
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          state.reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {review.userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold">{review.userName}</h4>
                        {review.verified && (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified Purchase
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        {renderStars(review.rating)}
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleReportReview(review.id)}>
                        <Flag className="h-4 w-4 mr-2" />
                        Report
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mb-4">
                  <h5 className="font-semibold text-lg mb-2">{review.title}</h5>
                  <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
                </div>

                {review.images && review.images.length > 0 && (
                  <div className="mb-4">
                    <div className="flex space-x-2 overflow-x-auto">
                      {review.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Review image ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {review.response && (
                  <div className="bg-muted/50 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <h6 className="font-semibold text-sm">Roses Garden Response</h6>
                      <Badge variant="outline" className="text-xs">
                        Official
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.response.comment}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(review.response.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkHelpful(review.id, true)}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Helpful ({review.helpful})
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkHelpful(review.id, false)}
                    >
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      Not Helpful ({review.notHelpful})
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {state.total > 10 && (
        <div className="flex justify-center">
          <div className="flex space-x-2">
            {Array.from({ length: Math.ceil(state.total / 10) }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={state.currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setPage(page);
                  loadProductReviews(productId, page);
                }}
              >
                {page}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;