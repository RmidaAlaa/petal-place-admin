import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Star, 
  ThumbsUp, 
  User, 
  Calendar, 
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Filter,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import apiService from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface Review {
  id: string;
  user_id: string;
  product_id: string;
  order_id?: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
  is_verified: boolean;
  is_approved: boolean;
  admin_response?: string;
  helpful_count: number;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  order_number?: string;
  created_at: string;
  updated_at: string;
}

interface ReviewStats {
  total_reviews: number;
  average_rating: number;
  rating_distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, productName }) => {
  const { state: authState } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 0,
    title: '',
    comment: '',
    images: [] as string[]
  });
  const [filters, setFilters] = useState({
    rating: '',
    page: 1,
    limit: 10
  });
  const [sortBy, setSortBy] = useState('newest');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    loadReviews();
  }, [productId, filters, sortBy, sortOrder]);

  const loadReviews = async () => {
    try {
      setIsLoading(true);
      const params = {
        ...filters,
        sort_by: sortBy,
        sort_order: sortOrder
      };
      
      const data = await apiService.getProductReviews(productId, params);
      setReviews(data.reviews);
      setStats(data.statistics);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load reviews',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    try {
      await apiService.createReview({
        product_id: productId,
        rating: reviewData.rating,
        title: reviewData.title,
        comment: reviewData.comment,
        images: reviewData.images
      });
      
      toast({
        title: 'Review Submitted',
        description: 'Thank you for your review! It will be published after approval.',
      });
      
      setShowReviewDialog(false);
      setReviewData({ rating: 0, title: '', comment: '', images: [] });
      loadReviews();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit review',
        variant: 'destructive',
      });
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      await apiService.markReviewHelpful(reviewId);
      loadReviews();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to mark review as helpful',
        variant: 'destructive',
      });
    }
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onRatingChange?.(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            disabled={!interactive}
          >
            <Star
              className={`h-4 w-4 ${
                star <= rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const renderRatingBar = (rating: number, count: number, total: number) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="w-8">{rating}</span>
        <Star className="h-3 w-3 text-yellow-400 fill-current" />
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="w-8 text-right">{count}</span>
      </div>
    );
  };

  if (isLoading) {
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
      {/* Review Statistics */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Customer Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Overall Rating */}
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {stats.average_rating.toFixed(1)}
                </div>
                <div className="flex justify-center mb-2">
                  {renderStars(Math.round(stats.average_rating))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on {stats.total_reviews} review{stats.total_reviews !== 1 ? 's' : ''}
                </p>
              </div>
              
              {/* Rating Distribution */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating}>
                    {renderRatingBar(rating, stats.rating_distribution[rating as keyof typeof stats.rating_distribution], stats.total_reviews)}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          <select
            value={filters.rating}
            onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value, page: 1 }))}
            className="px-3 py-2 border border-border rounded-md text-sm"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-border rounded-md text-sm"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="rating">Rating</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
        
        {authState.isAuthenticated && (
          <Button onClick={() => setShowReviewDialog(true)}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Write Review
          </Button>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
              <p className="text-muted-foreground">
                Be the first to review this product!
              </p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* User Avatar */}
                  <div className="flex-shrink-0">
                    {review.avatar_url ? (
                      <img 
                        src={review.avatar_url} 
                        alt={`${review.first_name} ${review.last_name}`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                    )}
                  </div>
                  
                  {/* Review Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">
                        {review.first_name} {review.last_name}
                      </h4>
                      {review.is_verified && (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified Purchase
                        </Badge>
                      )}
                      {review.order_number && (
                        <Badge variant="outline" className="text-xs">
                          Order #{review.order_number}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      {renderStars(review.rating)}
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {review.title && (
                      <h5 className="font-medium mb-2">{review.title}</h5>
                    )}
                    
                    {review.comment && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {review.comment}
                      </p>
                    )}
                    
                    {/* Review Images */}
                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 mb-3">
                        {review.images.map((image, index) => (
                          <img 
                            key={index}
                            src={image} 
                            alt={`Review image ${index + 1}`}
                            className="w-16 h-16 object-cover rounded-md border"
                          />
                        ))}
                      </div>
                    )}
                    
                    {/* Admin Response */}
                    {review.admin_response && (
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="default" className="text-xs">
                            Store Response
                          </Badge>
                        </div>
                        <p className="text-sm text-blue-800">
                          {review.admin_response}
                        </p>
                      </div>
                    )}
                    
                    {/* Actions */}
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkHelpful(review.id)}
                        className="text-xs"
                      >
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        Helpful ({review.helpful_count})
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Write Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
            <DialogDescription>
              Share your experience with {productName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Rating */}
            <div className="space-y-2">
              <Label>Rating *</Label>
              <div className="flex items-center gap-2">
                {renderStars(reviewData.rating, true, (rating) => 
                  setReviewData(prev => ({ ...prev, rating }))
                )}
                <span className="text-sm text-muted-foreground">
                  {reviewData.rating > 0 && `${reviewData.rating} star${reviewData.rating !== 1 ? 's' : ''}`}
                </span>
              </div>
            </div>
            
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="reviewTitle">Review Title</Label>
              <Input
                id="reviewTitle"
                value={reviewData.title}
                onChange={(e) => setReviewData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Summarize your experience"
              />
            </div>
            
            {/* Comment */}
            <div className="space-y-2">
              <Label htmlFor="reviewComment">Your Review *</Label>
              <Textarea
                id="reviewComment"
                value={reviewData.comment}
                onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Tell others about your experience with this product..."
                rows={4}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowReviewDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitReview}
                disabled={reviewData.rating === 0 || !reviewData.comment.trim()}
                className="flex-1"
              >
                Submit Review
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductReviews;
