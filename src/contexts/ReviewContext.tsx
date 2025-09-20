import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import reviewService, { 
  Review, 
  ReviewStats, 
  ReviewFilters, 
  CreateReviewData, 
  UpdateReviewData 
} from '@/services/reviewService';
import { useToast } from '@/hooks/use-toast';

interface ReviewState {
  reviews: Review[];
  stats: ReviewStats | null;
  total: number;
  currentPage: number;
  isLoading: boolean;
  error: string | null;
  filters: ReviewFilters;
}

type ReviewAction =
  | { type: 'REVIEWS_LOADING' }
  | { type: 'REVIEWS_SUCCESS'; payload: { reviews: Review[]; total: number; stats: ReviewStats } }
  | { type: 'REVIEWS_ERROR'; payload: string }
  | { type: 'ADD_REVIEW'; payload: Review }
  | { type: 'UPDATE_REVIEW'; payload: Review }
  | { type: 'DELETE_REVIEW'; payload: string }
  | { type: 'SET_FILTERS'; payload: ReviewFilters }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'CLEAR_ERROR' };

const initialState: ReviewState = {
  reviews: [],
  stats: null,
  total: 0,
  currentPage: 1,
  isLoading: false,
  error: null,
  filters: {},
};

const reviewReducer = (state: ReviewState, action: ReviewAction): ReviewState => {
  switch (action.type) {
    case 'REVIEWS_LOADING':
      return { ...state, isLoading: true, error: null };
    case 'REVIEWS_SUCCESS':
      return {
        ...state,
        isLoading: false,
        reviews: action.payload.reviews,
        total: action.payload.total,
        stats: action.payload.stats,
        error: null,
      };
    case 'REVIEWS_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'ADD_REVIEW':
      return {
        ...state,
        reviews: [action.payload, ...state.reviews],
        total: state.total + 1,
      };
    case 'UPDATE_REVIEW':
      return {
        ...state,
        reviews: state.reviews.map(review =>
          review.id === action.payload.id ? action.payload : review
        ),
      };
    case 'DELETE_REVIEW':
      return {
        ...state,
        reviews: state.reviews.filter(review => review.id !== action.payload),
        total: state.total - 1,
      };
    case 'SET_FILTERS':
      return { ...state, filters: action.payload, currentPage: 1 };
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

interface ReviewContextType {
  state: ReviewState;
  loadProductReviews: (productId: string, page?: number) => Promise<void>;
  loadUserReviews: (userId: string, page?: number) => Promise<void>;
  createReview: (data: CreateReviewData) => Promise<void>;
  updateReview: (reviewId: string, data: UpdateReviewData) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
  markHelpful: (reviewId: string, helpful: boolean) => Promise<void>;
  reportReview: (reviewId: string, reason: string, description?: string) => Promise<void>;
  setFilters: (filters: ReviewFilters) => void;
  setPage: (page: number) => void;
  clearError: () => void;
  refreshReviews: () => Promise<void>;
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

export const ReviewProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reviewReducer, initialState);
  const { toast } = useToast();

  const loadProductReviews = async (productId: string, page: number = 1) => {
    try {
      dispatch({ type: 'REVIEWS_LOADING' });
      const result = await reviewService.getProductReviews(
        productId, 
        state.filters, 
        page, 
        10
      );
      dispatch({ 
        type: 'REVIEWS_SUCCESS', 
        payload: { 
          reviews: result.reviews, 
          total: result.total, 
          stats: result.stats 
        } 
      });
      dispatch({ type: 'SET_PAGE', payload: page });
    } catch (error: any) {
      dispatch({ type: 'REVIEWS_ERROR', payload: error.message || 'Failed to load reviews' });
      toast({
        title: 'Error',
        description: 'Failed to load reviews',
        variant: 'destructive',
      });
    }
  };

  const loadUserReviews = async (userId: string, page: number = 1) => {
    try {
      dispatch({ type: 'REVIEWS_LOADING' });
      const result = await reviewService.getUserReviews(userId, page, 10);
      dispatch({ 
        type: 'REVIEWS_SUCCESS', 
        payload: { 
          reviews: result.reviews, 
          total: result.total, 
          stats: state.stats 
        } 
      });
      dispatch({ type: 'SET_PAGE', payload: page });
    } catch (error: any) {
      dispatch({ type: 'REVIEWS_ERROR', payload: error.message || 'Failed to load user reviews' });
      toast({
        title: 'Error',
        description: 'Failed to load user reviews',
        variant: 'destructive',
      });
    }
  };

  const createReview = async (data: CreateReviewData) => {
    try {
      const review = await reviewService.createReview(data);
      dispatch({ type: 'ADD_REVIEW', payload: review });
      toast({
        title: 'Review Added',
        description: 'Thank you for your review!',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create review',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateReview = async (reviewId: string, data: UpdateReviewData) => {
    try {
      const review = await reviewService.updateReview(reviewId, data);
      dispatch({ type: 'UPDATE_REVIEW', payload: review });
      toast({
        title: 'Review Updated',
        description: 'Your review has been updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update review',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteReview = async (reviewId: string) => {
    try {
      await reviewService.deleteReview(reviewId);
      dispatch({ type: 'DELETE_REVIEW', payload: reviewId });
      toast({
        title: 'Review Deleted',
        description: 'Your review has been deleted',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete review',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const markHelpful = async (reviewId: string, helpful: boolean) => {
    try {
      await reviewService.markHelpful(reviewId, helpful);
      
      // Update local state optimistically
      dispatch({
        type: 'UPDATE_REVIEW',
        payload: {
          ...state.reviews.find(r => r.id === reviewId)!,
          helpful: helpful ? 
            state.reviews.find(r => r.id === reviewId)!.helpful + 1 :
            state.reviews.find(r => r.id === reviewId)!.helpful - 1,
        } as Review,
      });

      toast({
        title: 'Thank you',
        description: helpful ? 'Marked as helpful' : 'Removed helpful vote',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update helpful status',
        variant: 'destructive',
      });
    }
  };

  const reportReview = async (reviewId: string, reason: string, description?: string) => {
    try {
      await reviewService.reportReview(reviewId, reason, description);
      toast({
        title: 'Review Reported',
        description: 'Thank you for reporting this review. We will review it shortly.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to report review',
        variant: 'destructive',
      });
    }
  };

  const setFilters = (filters: ReviewFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const setPage = (page: number) => {
    dispatch({ type: 'SET_PAGE', payload: page });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const refreshReviews = async () => {
    // This would need the current product ID to refresh
    // For now, we'll just clear the error
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: ReviewContextType = {
    state,
    loadProductReviews,
    loadUserReviews,
    createReview,
    updateReview,
    deleteReview,
    markHelpful,
    reportReview,
    setFilters,
    setPage,
    clearError,
    refreshReviews,
  };

  return (
    <ReviewContext.Provider value={value}>
      {children}
    </ReviewContext.Provider>
  );
};

export const useReviews = () => {
  const context = useContext(ReviewContext);
  if (context === undefined) {
    throw new Error('useReviews must be used within a ReviewProvider');
  }
  return context;
};
