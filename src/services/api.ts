const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Don't attempt API calls if backend URL is not properly configured (production)
    if (this.baseURL.includes('localhost') && typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      throw new Error('Backend API not available in production');
    }

    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // Silently fail in production if backend not available - use Supabase instead
      if (error instanceof Error && error.message === 'Backend API not available in production') {
        throw error;
      }
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
    role?: string;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async updateProfile(profileData: {
    first_name?: string;
    last_name?: string;
    phone?: string;
  }) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
  }

  async forgotPassword(email: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, new_password: newPassword }),
    });
  }

  // Product endpoints
  async getProducts(filters: {
    search?: string;
    category_id?: string;
    vendor_id?: string;
    min_price?: number;
    max_price?: number;
    is_featured?: boolean;
    is_active?: boolean;
    in_stock?: boolean;
    sort_by?: string;
    sort_order?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    return this.request(`/products?${params.toString()}`);
  }

  async getProduct(id: string) {
    return this.request(`/products/${id}`);
  }

  async createProduct(productData: any) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id: string, productData: any) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  async updateStock(id: string, quantity: number) {
    return this.request(`/products/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    });
  }

  async getLowStockProducts() {
    return this.request('/products/inventory/low-stock');
  }

  // Order endpoints
  async createOrder(orderData: {
    items: Array<{
      product_id: string;
      quantity: number;
      unit_price: number;
    }>;
    shipping_address: any;
    billing_address?: any;
    payment_method?: string;
    notes?: string;
  }) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getMyOrders(limit = 50, offset = 0) {
    return this.request(`/orders/my-orders?limit=${limit}&offset=${offset}`);
  }

  async getOrder(id: string) {
    return this.request(`/orders/${id}`);
  }

  async getAllOrders(filters: {
    status?: string;
    payment_status?: string;
    limit?: number;
    offset?: number;
  } = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    return this.request(`/orders?${params.toString()}`);
  }

  async updateOrderStatus(id: string, status: string, tracking_number?: string, estimated_delivery?: string, notes?: string) {
    return this.request(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        status,
        tracking_number,
        estimated_delivery,
        notes
      }),
    });
  }

  async updatePaymentStatus(id: string, payment_status: string, payment_intent_id?: string) {
    return this.request(`/orders/${id}/payment`, {
      method: 'PATCH',
      body: JSON.stringify({
        payment_status,
        payment_intent_id
      }),
    });
  }

  async cancelOrder(id: string, reason?: string) {
    return this.request(`/orders/${id}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  }

  async getOrderStats() {
    return this.request('/orders/stats/overview');
  }

  async getRecentOrders(limit = 10) {
    return this.request(`/orders/recent/list?limit=${limit}`);
  }

  // Checkout endpoints
  async createCheckoutSession(checkoutData: any) {
    return this.request('/checkout/create-session', {
      method: 'POST',
      body: JSON.stringify(checkoutData),
    });
  }

  // Search endpoints
  async getSearchSuggestions(query: string) {
    return this.request(`/search/suggestions?q=${encodeURIComponent(query)}`);
  }

  async advancedSearch(params: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/search/advanced?${query}`);
  }

  // Review endpoints
  async getProductReviews(productId: string, params: any = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/products/${productId}/reviews?${query}`);
  }

  async addProductReview(productId: string, reviewData: any) {
    return this.request(`/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  // Highlights endpoints
  async getTopHighlights() {
    return this.request('/highlights/featured');
  }

  // Tracking endpoints
  async getOrderTracking(orderId: string) {
    return this.request(`/orders/${orderId}/tracking`);
  }

  async updateOrderTracking(orderId: string, trackingData: any) {
    return this.request(`/orders/${orderId}/tracking`, {
      method: 'POST',
      body: JSON.stringify(trackingData),
    });
  }

  async getDeliverySlots(date: string) {
    return this.request(`/delivery/slots/${date}`);
  }

  async requestRefund(orderId: string, refundData: any) {
    return this.request(`/orders/${orderId}/refund`, {
      method: 'POST',
      body: JSON.stringify(refundData),
    });
  }

  // Partners API
  async getPartners() {
    return this.request('/partners');
  }

  async createPartner(data: any) {
    return this.request('/partners', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePartner(id: string, data: any) {
    return this.request(`/partners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePartner(id: string) {
    return this.request(`/partners/${id}`, {
      method: 'DELETE',
    });
  }

  // Search History API
  async getSearchHistory() {
    return this.request('/search/history');
  }

  async clearSearchHistory() {
    return this.request('/search/history', {
      method: 'DELETE',
    });
  }

  // Location API
  async getUserLocation() {
    return this.request('/user/location');
  }

  async updateUserLocation(location: any) {
    return this.request('/user/location', {
      method: 'PUT',
      body: JSON.stringify(location),
    });
  }

  // Reviews API
  async createReview(data: any) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async markReviewHelpful(id: string) {
    return this.request(`/reviews/${id}/helpful`, {
      method: 'POST',
    });
  }

  // Payment API
  async confirmPayment(data: any) {
    return this.request('/payments/confirm', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // User Profile API
  async getUserProfile() {
    return this.request('/user/profile');
  }

  // Top Products API
  async getTopProducts() {
    return this.request('/products/top');
  }
}

export const apiService = new ApiService(API_BASE_URL);
export default apiService;