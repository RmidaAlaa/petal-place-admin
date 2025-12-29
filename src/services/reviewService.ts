// Review Service for Roses Garden - Connected to Supabase
import { supabase } from '@/integrations/supabase/client';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  verified: boolean;
  helpful: number;
  notHelpful: number;
  createdAt: string;
  updatedAt: string;
  response?: {
    id: string;
    adminName: string;
    comment: string;
    createdAt: string;
  };
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  verifiedReviews: number;
  recentReviews: number;
}

export interface ReviewFilters {
  rating?: number;
  verified?: boolean;
  hasImages?: boolean;
  sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'most_helpful';
  search?: string;
}

export interface CreateReviewData {
  productId: string;
  rating: number;
  title: string;
  comment: string;
  images?: File[];
}

export interface UpdateReviewData {
  rating?: number;
  title?: string;
  comment?: string;
  images?: File[];
}

class ReviewService {
  // Get reviews for a product from Supabase
  async getProductReviews(
    productId: string, 
    filters: ReviewFilters = {},
    page: number = 1,
    limit: number = 10
  ): Promise<{ reviews: Review[]; total: number; stats: ReviewStats }> {
    try {
      let query = supabase
        .from('reviews')
        .select('*, user_profiles!reviews_user_id_fkey(first_name, last_name, email)', { count: 'exact' })
        .eq('product_id', productId);

      // Apply rating filter
      if (filters.rating) {
        query = query.eq('rating', filters.rating);
      }

      // Apply verified filter
      if (filters.verified !== undefined) {
        query = query.eq('verified_purchase', filters.verified);
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'highest':
          query = query.order('rating', { ascending: false });
          break;
        case 'lowest':
          query = query.order('rating', { ascending: true });
          break;
        case 'most_helpful':
          query = query.order('helpful_count', { ascending: false });
          break;
        default: // newest
          query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data: reviews, error, count } = await query;

      if (error) {
        console.error('Error fetching reviews:', error);
        throw error;
      }

      // Get all reviews for stats calculation
      const { data: allReviews } = await supabase
        .from('reviews')
        .select('rating, verified_purchase, created_at')
        .eq('product_id', productId);

      // Calculate stats
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const stats: ReviewStats = {
        averageRating: allReviews?.length 
          ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length 
          : 0,
        totalReviews: allReviews?.length || 0,
        ratingDistribution: {
          5: allReviews?.filter(r => r.rating === 5).length || 0,
          4: allReviews?.filter(r => r.rating === 4).length || 0,
          3: allReviews?.filter(r => r.rating === 3).length || 0,
          2: allReviews?.filter(r => r.rating === 2).length || 0,
          1: allReviews?.filter(r => r.rating === 1).length || 0,
        },
        verifiedReviews: allReviews?.filter(r => r.verified_purchase).length || 0,
        recentReviews: allReviews?.filter(r => new Date(r.created_at) > weekAgo).length || 0,
      };

      // Transform reviews to expected format
      const transformedReviews: Review[] = (reviews || []).map((r: any) => ({
        id: r.id,
        productId: r.product_id,
        userId: r.user_id,
        userName: r.user_profiles 
          ? `${r.user_profiles.first_name || ''} ${r.user_profiles.last_name || ''}`.trim() || 'Anonymous'
          : 'Anonymous',
        userEmail: r.user_profiles?.email || '',
        rating: r.rating,
        title: '', // Not in current schema
        comment: r.comment || '',
        verified: r.verified_purchase || false,
        helpful: r.helpful_count || 0,
        notHelpful: 0,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));

      return {
        reviews: transformedReviews,
        total: count || 0,
        stats,
      };
    } catch (error) {
      console.error('Error in getProductReviews:', error);
      throw error;
    }
  }

  // Get user's reviews
  async getUserReviews(userId: string, page: number = 1, limit: number = 10): Promise<{ reviews: Review[]; total: number }> {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data: reviews, error, count } = await supabase
        .from('reviews')
        .select('*, products(name)', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      const transformedReviews: Review[] = (reviews || []).map((r: any) => ({
        id: r.id,
        productId: r.product_id,
        userId: r.user_id,
        userName: 'You',
        userEmail: '',
        rating: r.rating,
        title: '',
        comment: r.comment || '',
        verified: r.verified_purchase || false,
        helpful: r.helpful_count || 0,
        notHelpful: 0,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));

      return {
        reviews: transformedReviews,
        total: count || 0,
      };
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      throw error;
    }
  }

  // Create a new review
  async createReview(data: CreateReviewData): Promise<Review> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in to create a review');

      const { data: review, error } = await supabase
        .from('reviews')
        .insert({
          product_id: data.productId,
          user_id: user.id,
          rating: data.rating,
          comment: data.comment,
          verified_purchase: false, // Will be set by trigger based on order history
        })
        .select()
        .single();

      if (error) throw error;

      // Update product rating
      await this.updateProductRating(data.productId);

      return {
        id: review.id,
        productId: review.product_id,
        userId: review.user_id,
        userName: 'You',
        userEmail: user.email || '',
        rating: review.rating,
        title: '',
        comment: review.comment || '',
        verified: review.verified_purchase || false,
        helpful: 0,
        notHelpful: 0,
        createdAt: review.created_at,
        updatedAt: review.updated_at,
      };
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  // Update a review
  async updateReview(reviewId: string, data: UpdateReviewData): Promise<Review> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in to update a review');

      const updateData: any = {};
      if (data.rating !== undefined) updateData.rating = data.rating;
      if (data.comment !== undefined) updateData.comment = data.comment;

      const { data: review, error } = await supabase
        .from('reviews')
        .update(updateData)
        .eq('id', reviewId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Update product rating
      await this.updateProductRating(review.product_id);

      return {
        id: review.id,
        productId: review.product_id,
        userId: review.user_id,
        userName: 'You',
        userEmail: user.email || '',
        rating: review.rating,
        title: '',
        comment: review.comment || '',
        verified: review.verified_purchase || false,
        helpful: review.helpful_count || 0,
        notHelpful: 0,
        createdAt: review.created_at,
        updatedAt: review.updated_at,
      };
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  }

  // Delete a review
  async deleteReview(reviewId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in to delete a review');

      // Get product_id before deletion
      const { data: review } = await supabase
        .from('reviews')
        .select('product_id')
        .eq('id', reviewId)
        .single();

      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update product rating
      if (review) {
        await this.updateProductRating(review.product_id);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  }

  // Mark review as helpful
  async markHelpful(reviewId: string, helpful: boolean): Promise<void> {
    try {
      const { data: review } = await supabase
        .from('reviews')
        .select('helpful_count')
        .eq('id', reviewId)
        .single();

      if (review) {
        const newCount = helpful 
          ? (review.helpful_count || 0) + 1 
          : Math.max(0, (review.helpful_count || 0) - 1);

        await supabase
          .from('reviews')
          .update({ helpful_count: newCount })
          .eq('id', reviewId);
      }
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      throw error;
    }
  }

  // Report a review (placeholder - would need a reports table)
  async reportReview(reviewId: string, reason: string, description?: string): Promise<void> {
    console.log('Review reported:', { reviewId, reason, description });
    // In a full implementation, this would insert into a review_reports table
  }

  // Update product rating based on reviews
  private async updateProductRating(productId: string): Promise<void> {
    try {
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', productId);

      if (reviews && reviews.length > 0) {
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        
        await supabase
          .from('products')
          .update({ 
            rating: Math.round(avgRating * 10) / 10,
            review_count: reviews.length 
          })
          .eq('id', productId);
      }
    } catch (error) {
      console.error('Error updating product rating:', error);
    }
  }
}

const reviewService = new ReviewService();
export default reviewService;
