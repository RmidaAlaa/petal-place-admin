import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  images: string[];
  category: string;
  subcategory?: string;
  vendor: string;
  rating: number;
  review_count: number;
  stock_quantity: number;
  sku: string;
  is_active: boolean;
  is_featured: boolean;
  is_new: boolean;
  tags: string[];
  variants?: ProductVariant[];
  specifications?: ProductSpecification[];
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  type: 'size' | 'color' | 'style';
  value: string;
  price_modifier: number;
  stock_quantity: number;
  is_active: boolean;
}

export interface ProductSpecification {
  id: string;
  product_id: string;
  name: string;
  value: string;
}

export interface ProductFilter {
  search?: string;
  categories?: string[];
  price_min?: number;
  price_max?: number;
  rating_min?: number;
  in_stock?: boolean;
  is_featured?: boolean;
  is_new?: boolean;
  tags?: string[];
  sort_by?: 'name' | 'price' | 'rating' | 'created_at' | 'popularity';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ProductSearchResult {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent_id?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

class ProductService {
  // Get all products with filtering and pagination
  async getProducts(filter: ProductFilter = {}): Promise<ProductSearchResult> {
    try {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('is_active', true);

      // Apply filters
      if (filter.search) {
        query = query.or(`name.ilike.%${filter.search}%,description.ilike.%${filter.search}%,tags.cs.{${filter.search}}`);
      }

      if (filter.categories && filter.categories.length > 0) {
        query = query.in('category', filter.categories);
      }

      if (filter.price_min !== undefined) {
        query = query.gte('price', filter.price_min);
      }

      if (filter.price_max !== undefined) {
        query = query.lte('price', filter.price_max);
      }

      if (filter.rating_min !== undefined) {
        query = query.gte('rating', filter.rating_min);
      }

      if (filter.in_stock) {
        query = query.gt('stock_quantity', 0);
      }

      if (filter.is_featured) {
        query = query.eq('is_featured', true);
      }

      if (filter.is_new) {
        query = query.eq('is_new', true);
      }

      if (filter.tags && filter.tags.length > 0) {
        query = query.overlaps('tags', filter.tags);
      }

      // Apply sorting
      const sortBy = filter.sort_by || 'created_at';
      const sortOrder = filter.sort_order || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const page = filter.page || 1;
      const limit = filter.limit || 20;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        products: data || [],
        total: count || 0,
        page,
        limit,
        total_pages: Math.ceil((count || 0) / limit)
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch products');
    }
  }

  // Get product by ID
  async getProductById(id: string): Promise<Product> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Product not found');

      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch product');
    }
  }

  // Get trending products
  async getTrendingProducts(limit: number = 10): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('rating', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch trending products');
    }
  }

  // Get new products
  async getNewProducts(limit: number = 10): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('is_new', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch new products');
    }
  }

  // Get products by category
  async getProductsByCategory(category: string, limit: number = 20): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('category', category)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch products by category');
    }
  }

  // Get related products
  async getRelatedProducts(productId: string, category: string, limit: number = 4): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('category', category)
        .neq('id', productId)
        .order('rating', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch related products');
    }
  }

  // Search products with autocomplete
  async searchProducts(query: string, limit: number = 10): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, images, category')
        .eq('is_active', true)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to search products');
    }
  }

  // Get all categories
  async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch categories');
    }
  }

  // Get product variants
  async getProductVariants(productId: string): Promise<ProductVariant[]> {
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)
        .eq('is_active', true)
        .order('type', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch product variants');
    }
  }

  // Get product specifications
  async getProductSpecifications(productId: string): Promise<ProductSpecification[]> {
    try {
      const { data, error } = await supabase
        .from('product_specifications')
        .select('*')
        .eq('product_id', productId)
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch product specifications');
    }
  }

  // Update product stock
  async updateProductStock(productId: string, quantity: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('products')
        .update({ stock_quantity: quantity })
        .eq('id', productId);

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update product stock');
    }
  }

  // Get product reviews
  async getProductReviews(productId: string, page: number = 1, limit: number = 10) {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from('product_reviews')
        .select(`
          *,
          user_profiles!inner(first_name, last_name, avatar_url)
        `, { count: 'exact' })
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      return {
        reviews: data || [],
        total: count || 0,
        page,
        limit,
        total_pages: Math.ceil((count || 0) / limit)
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch product reviews');
    }
  }

  // Add product review
  async addProductReview(productId: string, userId: string, rating: number, comment: string) {
    try {
      const { error } = await supabase
        .from('product_reviews')
        .insert({
          product_id: productId,
          user_id: userId,
          rating,
          comment,
          is_approved: false // Requires admin approval
        });

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to add product review');
    }
  }

  // Get recently viewed products
  async getRecentlyViewedProducts(userId: string, limit: number = 10): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('recently_viewed')
        .select(`
          products!inner(*)
        `)
        .eq('user_id', userId)
        .order('viewed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data?.map(item => item.products) || [];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch recently viewed products');
    }
  }

  // Add to recently viewed
  async addToRecentlyViewed(userId: string, productId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('recently_viewed')
        .upsert({
          user_id: userId,
          product_id: productId,
          viewed_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to add to recently viewed');
    }
  }
}

export const productService = new ProductService();
