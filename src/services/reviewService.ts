// Review Service for Roses Garden
// Handles all review and rating operations

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number; // 1-5 stars
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
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  }

  // Get reviews for a product
  async getProductReviews(
    productId: string, 
    filters: ReviewFilters = {},
    page: number = 1,
    limit: number = 10
  ): Promise<{ reviews: Review[]; total: number; stats: ReviewStats }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined)
        ),
      });

      const response = await fetch(`${this.baseUrl}/reviews/product/${productId}?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      // Return mock data for development
      return this.getMockProductReviews(productId, filters, page, limit);
    }
  }

  // Get user's reviews
  async getUserReviews(userId: string, page: number = 1, limit: number = 10): Promise<{ reviews: Review[]; total: number }> {
    try {
      const response = await fetch(`${this.baseUrl}/reviews/user/${userId}?page=${page}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user reviews');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      return this.getMockUserReviews(userId, page, limit);
    }
  }

  // Create a new review
  async createReview(data: CreateReviewData): Promise<Review> {
    try {
      const formData = new FormData();
      formData.append('productId', data.productId);
      formData.append('rating', data.rating.toString());
      formData.append('title', data.title);
      formData.append('comment', data.comment);
      
      if (data.images) {
        data.images.forEach((image, index) => {
          formData.append(`images`, image);
        });
      }

      const response = await fetch(`${this.baseUrl}/reviews`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create review');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  // Update a review
  async updateReview(reviewId: string, data: UpdateReviewData): Promise<Review> {
    try {
      const formData = new FormData();
      
      if (data.rating !== undefined) formData.append('rating', data.rating.toString());
      if (data.title) formData.append('title', data.title);
      if (data.comment) formData.append('comment', data.comment);
      
      if (data.images) {
        data.images.forEach((image) => {
          formData.append('images', image);
        });
      }

      const response = await fetch(`${this.baseUrl}/reviews/${reviewId}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update review');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  }

  // Delete a review
  async deleteReview(reviewId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  }

  // Mark review as helpful
  async markHelpful(reviewId: string, helpful: boolean): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ helpful }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark review as helpful');
      }
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      throw error;
    }
  }

  // Report a review
  async reportReview(reviewId: string, reason: string, description?: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/reviews/${reviewId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason, description }),
      });

      if (!response.ok) {
        throw new Error('Failed to report review');
      }
    } catch (error) {
      console.error('Error reporting review:', error);
      throw error;
    }
  }

  // Get review statistics for admin
  async getReviewStats(): Promise<{
    totalReviews: number;
    averageRating: number;
    pendingModeration: number;
    reportedReviews: number;
    recentReviews: Review[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/reviews/stats`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch review stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching review stats:', error);
      return this.getMockReviewStats();
    }
  }

  // Moderate review (admin only)
  async moderateReview(reviewId: string, action: 'approve' | 'reject' | 'hide', reason?: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/reviews/${reviewId}/moderate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, reason }),
      });

      if (!response.ok) {
        throw new Error('Failed to moderate review');
      }
    } catch (error) {
      console.error('Error moderating review:', error);
      throw error;
    }
  }

  // Add admin response to review
  async addResponse(reviewId: string, comment: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/reviews/${reviewId}/response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment }),
      });

      if (!response.ok) {
        throw new Error('Failed to add response');
      }
    } catch (error) {
      console.error('Error adding response:', error);
      throw error;
    }
  }

  // Mock data for development
  private getMockProductReviews(
    productId: string, 
    filters: ReviewFilters, 
    page: number, 
    limit: number
  ): { reviews: Review[]; total: number; stats: ReviewStats } {
    const mockReviews: Review[] = [
      {
        id: '1',
        productId,
        userId: 'user1',
        userName: 'Sarah Johnson',
        userEmail: 'sarah@example.com',
        rating: 5,
        title: 'Absolutely beautiful!',
        comment: 'These roses were absolutely stunning! The quality was exceptional and they lasted much longer than expected. Perfect for my anniversary dinner.',
        images: ['https://via.placeholder.com/300x200/FFC0CB/FFFFFF?text=Rose+Photo+1'],
        verified: true,
        helpful: 12,
        notHelpful: 1,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
      },
      {
        id: '2',
        productId,
        userId: 'user2',
        userName: 'Michael Chen',
        userEmail: 'michael@example.com',
        rating: 4,
        title: 'Great quality, fast delivery',
        comment: 'The roses arrived fresh and beautiful. Delivery was quick and the packaging was excellent. Would definitely order again.',
        verified: true,
        helpful: 8,
        notHelpful: 0,
        createdAt: '2024-01-12T14:20:00Z',
        updatedAt: '2024-01-12T14:20:00Z',
      },
      {
        id: '3',
        productId,
        userId: 'user3',
        userName: 'Emily Davis',
        userEmail: 'emily@example.com',
        rating: 5,
        title: 'Perfect for special occasions',
        comment: 'I ordered these for my mother\'s birthday and she was thrilled! The arrangement was exactly as pictured and the flowers were fresh.',
        images: ['https://via.placeholder.com/300x200/FFB6C1/FFFFFF?text=Rose+Photo+2'],
        verified: true,
        helpful: 15,
        notHelpful: 0,
        createdAt: '2024-01-10T09:15:00Z',
        updatedAt: '2024-01-10T09:15:00Z',
      },
      {
        id: '4',
        productId,
        userId: 'user4',
        userName: 'David Wilson',
        userEmail: 'david@example.com',
        rating: 3,
        title: 'Good but could be better',
        comment: 'The roses were nice but some were slightly wilted upon arrival. Customer service was helpful and offered a partial refund.',
        verified: true,
        helpful: 3,
        notHelpful: 2,
        createdAt: '2024-01-08T16:45:00Z',
        updatedAt: '2024-01-08T16:45:00Z',
        response: {
          id: 'resp1',
          adminName: 'Roses Garden Support',
          comment: 'Thank you for your feedback. We apologize for the issue and have improved our quality control process.',
          createdAt: '2024-01-09T10:00:00Z',
        },
      },
      {
        id: '5',
        productId,
        userId: 'user5',
        userName: 'Lisa Anderson',
        userEmail: 'lisa@example.com',
        rating: 5,
        title: 'Exceeded expectations!',
        comment: 'I was skeptical about ordering flowers online, but these exceeded all my expectations. The quality and freshness were outstanding.',
        verified: true,
        helpful: 20,
        notHelpful: 0,
        createdAt: '2024-01-05T11:30:00Z',
        updatedAt: '2024-01-05T11:30:00Z',
      },
    ];

    // Apply filters
    let filteredReviews = mockReviews;

    if (filters.rating) {
      filteredReviews = filteredReviews.filter(review => review.rating === filters.rating);
    }

    if (filters.verified !== undefined) {
      filteredReviews = filteredReviews.filter(review => review.verified === filters.verified);
    }

    if (filters.hasImages) {
      filteredReviews = filteredReviews.filter(review => review.images && review.images.length > 0);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredReviews = filteredReviews.filter(review => 
        review.title.toLowerCase().includes(searchTerm) ||
        review.comment.toLowerCase().includes(searchTerm) ||
        review.userName.toLowerCase().includes(searchTerm)
      );
    }

    // Apply sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'newest':
          filteredReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'oldest':
          filteredReviews.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          break;
        case 'highest':
          filteredReviews.sort((a, b) => b.rating - a.rating);
          break;
        case 'lowest':
          filteredReviews.sort((a, b) => a.rating - b.rating);
          break;
        case 'most_helpful':
          filteredReviews.sort((a, b) => (b.helpful - b.notHelpful) - (a.helpful - a.notHelpful));
          break;
      }
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedReviews = filteredReviews.slice(startIndex, endIndex);

    // Calculate stats
    const stats: ReviewStats = {
      averageRating: mockReviews.reduce((sum, review) => sum + review.rating, 0) / mockReviews.length,
      totalReviews: mockReviews.length,
      ratingDistribution: {
        5: mockReviews.filter(r => r.rating === 5).length,
        4: mockReviews.filter(r => r.rating === 4).length,
        3: mockReviews.filter(r => r.rating === 3).length,
        2: mockReviews.filter(r => r.rating === 2).length,
        1: mockReviews.filter(r => r.rating === 1).length,
      },
      verifiedReviews: mockReviews.filter(r => r.verified).length,
      recentReviews: mockReviews.filter(r => {
        const reviewDate = new Date(r.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return reviewDate > weekAgo;
      }).length,
    };

    return {
      reviews: paginatedReviews,
      total: filteredReviews.length,
      stats,
    };
  }

  private getMockUserReviews(userId: string, page: number, limit: number): { reviews: Review[]; total: number } {
    const mockReviews: Review[] = [
      {
        id: '1',
        productId: 'prod1',
        userId,
        userName: 'Current User',
        userEmail: 'user@example.com',
        rating: 5,
        title: 'Amazing roses!',
        comment: 'These were perfect for my anniversary.',
        verified: true,
        helpful: 5,
        notHelpful: 0,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
      },
    ];

    return {
      reviews: mockReviews,
      total: mockReviews.length,
    };
  }

  private getMockReviewStats(): {
    totalReviews: number;
    averageRating: number;
    pendingModeration: number;
    reportedReviews: number;
    recentReviews: Review[];
  } {
    return {
      totalReviews: 1250,
      averageRating: 4.3,
      pendingModeration: 12,
      reportedReviews: 3,
      recentReviews: [],
    };
  }
}

export default new ReviewService();
