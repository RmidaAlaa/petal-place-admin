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
      console.error('API request failed:', error);
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

  // Auth endpoints - additional
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

  // Partners endpoints
  async getPartners() {
    return this.request('/partners');
  }

  async getPartner(id: string) {
    return this.request(`/partners/${id}`);
  }

  async createPartner(partnerData: any) {
    return this.request('/partners', {
      method: 'POST',
      body: JSON.stringify(partnerData),
    });
  }

  async updatePartner(id: string, partnerData: any) {
    return this.request(`/partners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(partnerData),
    });
  }

  async deletePartner(id: string) {
    return this.request(`/partners/${id}`, {
      method: 'DELETE',
    });
  }

  // Location endpoints
  async getUserLocation() {
    return this.request('/locations/me');
  }

  async updateUserLocation(locationData: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
    address?: string;
  }) {
    return this.request('/locations/me', {
      method: 'POST',
      body: JSON.stringify(locationData),
    });
  }

  async getLocationHistory() {
    return this.request('/locations/history');
  }

  // Upload endpoints
  async uploadProductImage(file: File) {
    const formData = new FormData();
    formData.append('product', file);
    
    const url = `${this.baseURL}/upload/product`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  }

  async uploadPartnerLogo(file: File) {
    const formData = new FormData();
    formData.append('partner', file);
    
    const url = `${this.baseURL}/upload/partner`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  }

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const url = `${this.baseURL}/upload/avatar`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  }

  // Payment endpoints
  async createCheckoutSession(checkoutData: {
    items: Array<{
      product_id: string;
      quantity: number;
      unit_price: number;
    }>;
    shipping_address: any;
  }) {
    return this.request('/payments/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify(checkoutData),
    });
  }

  async confirmPayment(sessionId: string) {
    return this.request('/payments/success', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId }),
    });
  }

  // Order Tracking endpoints
  async getOrderTracking(orderId: string) {
    return this.request(`/order-tracking/${orderId}`);
  }

  async addTrackingUpdate(orderId: string, trackingData: any) {
    return this.request(`/order-tracking/${orderId}`, {
      method: 'POST',
      body: JSON.stringify(trackingData),
    });
  }

  async getDeliverySlots(date: string) {
    return this.request(`/order-tracking/delivery-slots/${date}`);
  }

  async cancelOrder(orderId: string, reason: string) {
    return this.request(`/order-tracking/${orderId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async requestRefund(orderId: string, refundData: any) {
    return this.request(`/order-tracking/${orderId}/refund`, {
      method: 'POST',
      body: JSON.stringify(refundData),
    });
  }

  // Inventory Management endpoints
  async getInventoryTransactions(productId: string, params?: any) {
    const queryParams = new URLSearchParams(params).toString();
    return this.request(`/inventory/transactions/${productId}${queryParams ? `?${queryParams}` : ''}`);
  }

  async addInventoryTransaction(transactionData: any) {
    return this.request('/inventory/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  async getStockAlerts(params?: any) {
    const queryParams = new URLSearchParams(params).toString();
    return this.request(`/inventory/alerts${queryParams ? `?${queryParams}` : ''}`);
  }

  async createStockAlert(alertData: any) {
    return this.request('/inventory/alerts', {
      method: 'POST',
      body: JSON.stringify(alertData),
    });
  }

  async resolveStockAlert(alertId: string) {
    return this.request(`/inventory/alerts/${alertId}/resolve`, {
      method: 'PATCH',
    });
  }

  async bulkStockUpdate(updates: any[]) {
    return this.request('/inventory/bulk-update', {
      method: 'POST',
      body: JSON.stringify({ updates }),
    });
  }

  // Reviews endpoints
  async getProductReviews(productId: string, params?: any) {
    const queryParams = new URLSearchParams(params).toString();
    return this.request(`/reviews/product/${productId}${queryParams ? `?${queryParams}` : ''}`);
  }

  async createReview(reviewData: any) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  async updateReview(reviewId: string, reviewData: any) {
    return this.request(`/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    });
  }

  async deleteReview(reviewId: string) {
    return this.request(`/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  }

  async approveReview(reviewId: string, approvalData: any) {
    return this.request(`/reviews/${reviewId}/approve`, {
      method: 'PATCH',
      body: JSON.stringify(approvalData),
    });
  }

  async markReviewHelpful(reviewId: string) {
    return this.request(`/reviews/${reviewId}/helpful`, {
      method: 'POST',
    });
  }

  async getPendingReviews(params?: any) {
    const queryParams = new URLSearchParams(params).toString();
    return this.request(`/reviews/pending${queryParams ? `?${queryParams}` : ''}`);
  }

  // Advanced Search endpoints
  async advancedSearch(params: any) {
    const queryParams = new URLSearchParams(params).toString();
    return this.request(`/search${queryParams ? `?${queryParams}` : ''}`);
  }

  async getSearchSuggestions(query: string) {
    return this.request(`/search/suggestions?q=${encodeURIComponent(query)}`);
  }

  async getPopularSearches(limit?: number) {
    const params = limit ? `?limit=${limit}` : '';
    return this.request(`/search/popular${params}`);
  }

  async getSearchHistory(limit?: number) {
    const params = limit ? `?limit=${limit}` : '';
    return this.request(`/search/history${params}`);
  }

  async clearSearchHistory() {
    return this.request('/search/history', {
      method: 'DELETE',
    });
  }

  async getSearchAnalytics(days?: number) {
    const params = days ? `?days=${days}` : '';
    return this.request(`/search/analytics${params}`);
  }
}

export const apiService = new ApiService(API_BASE_URL);
export default apiService;
