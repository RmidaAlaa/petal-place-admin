import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  images: string[];
  category: string;
  subcategory?: string;
  vendor?: string;
  rating: number;
  review_count: number;
  stock_quantity: number;
  sku?: string;
  is_active: boolean;
  is_featured: boolean;
  is_new: boolean;
  tags?: string[];
  variants?: ProductVariant[];
  specifications?: ProductSpecification[];
  created_at: string;
  updated_at: string;
  care_instructions?: string;
  colors?: any;
  sizes?: any;
  occasions?: any;
  dimensions?: any;
  weight?: number;
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
  inStock?: boolean;
  sortBy?: string;
}

export interface Review {
  id: string;
  user_id: string;
  user_name: string;
  product_id: string;
  rating: number;
  comment?: string;
  helpful_count: number;
  verified_purchase: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
}

class ProductService {
  // Get all products
  async getAllProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return this.transformProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  // Get product by ID
  async getProductById(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) return null;

      return this.transformProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  // Search products
  async searchProducts(query: string, limit: number = 20, filters?: ProductFilter): Promise<Product[]> {
    try {
      let queryBuilder = supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      if (query.trim()) {
        queryBuilder = queryBuilder.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
      }

      if (filters?.categories && filters.categories.length > 0) {
        queryBuilder = queryBuilder.in('category', filters.categories);
      }

      if (filters?.price_min !== undefined) {
        queryBuilder = queryBuilder.gte('price', filters.price_min);
      }

      if (filters?.price_max !== undefined) {
        queryBuilder = queryBuilder.lte('price', filters.price_max);
      }

      if (filters?.rating_min !== undefined) {
        queryBuilder = queryBuilder.gte('rating', filters.rating_min);
      }

      if (filters?.sortBy) {
        switch (filters.sortBy) {
          case 'price_asc':
            queryBuilder = queryBuilder.order('price', { ascending: true });
            break;
          case 'price_desc':
            queryBuilder = queryBuilder.order('price', { ascending: false });
            break;
          case 'rating':
            queryBuilder = queryBuilder.order('rating', { ascending: false });
            break;
          case 'newest':
            queryBuilder = queryBuilder.order('created_at', { ascending: false });
            break;
          default:
            queryBuilder = queryBuilder.order('created_at', { ascending: false });
        }
      } else {
        queryBuilder = queryBuilder.order('created_at', { ascending: false });
      }

      const { data, error } = await queryBuilder.limit(limit);

      if (error) throw error;

      return this.transformProducts(data || []);
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  // Get products by category
  async getProductsByCategory(category: string, limit: number = 20): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return this.transformProducts(data || []);
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  }

  // Get featured products
  async getFeaturedProducts(limit: number = 12): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return this.transformProducts(data || []);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  }

  // Get new products
  async getNewProducts(limit: number = 12): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_new', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return this.transformProducts(data || []);
    } catch (error) {
      console.error('Error fetching new products:', error);
      throw error;
    }
  }

  // Get related products
  async getRelatedProducts(productId: string, category: string, limit: number = 8): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .neq('id', productId)
        .order('rating', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return this.transformProducts(data || []);
    } catch (error) {
      console.error('Error fetching related products:', error);
      throw error;
    }
  }

  // Get product highlights/recommendations
  async getProductHighlights(limit: number = 6): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, images, category')
        .eq('is_active', true)
        .or('is_featured.eq.true,rating.gte.4')
        .order('rating', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        images: Array.isArray(item.images) ? item.images as string[] : [],
        category: item.category,
        description: '',
        vendor: 'Rose Garden',
        rating: 5,
        review_count: 0,
        stock_quantity: 10,
        is_active: true,
        is_featured: false,
        is_new: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Error fetching product highlights:', error);
      throw error;
    }
  }

  // Get categories
  async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  // Get product reviews from Supabase
  async getProductReviews(productId: string): Promise<{ reviews: Review[] }> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          user_id,
          product_id,
          rating,
          comment,
          helpful_count,
          verified_purchase,
          created_at
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform to include user_name (we'll use a placeholder since profiles aren't linked)
      const reviews: Review[] = (data || []).map(review => ({
        id: review.id,
        user_id: review.user_id,
        user_name: 'Customer', // Would need to join with user_profiles
        product_id: review.product_id,
        rating: review.rating,
        comment: review.comment || '',
        helpful_count: review.helpful_count || 0,
        verified_purchase: review.verified_purchase || false,
        created_at: review.created_at,
      }));

      return { reviews };
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return { reviews: [] };
    }
  }

  // Add product review to Supabase
  async addProductReview(productId: string, rating: number, comment?: string): Promise<Review> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('reviews')
        .insert({
          product_id: productId,
          user_id: userData.user.id,
          rating,
          comment: comment || null,
          verified_purchase: false,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        user_id: data.user_id,
        user_name: 'You',
        product_id: data.product_id,
        rating: data.rating,
        comment: data.comment || '',
        helpful_count: data.helpful_count || 0,
        verified_purchase: data.verified_purchase || false,
        created_at: data.created_at,
      };
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  }

  // Get product variants
  async getProductVariants(productId: string): Promise<ProductVariant[]> {
    try {
      // Since variants aren't in database yet, return mock data
      return [];
    } catch (error) {
      console.error('Error fetching product variants:', error);
      return [];
    }
  }

  // Get product specifications
  async getProductSpecifications(productId: string): Promise<ProductSpecification[]> {
    try {
      // Since specifications aren't in database yet, return mock data
      return [];
    } catch (error) {
      console.error('Error fetching product specifications:', error);
      return [];
    }
  }

  // Transform database products to match interface
  private transformProducts(products: any[]): Product[] {
    return products.map(product => this.transformProduct(product));
  }

  private transformProduct(product: any): Product {
    return {
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      original_price: product.original_price,
      images: Array.isArray(product.images) ? product.images : [],
      category: product.category,
      vendor: 'Rose Garden', // Default vendor
      rating: product.rating || 5,
      review_count: product.review_count || 0,
      stock_quantity: product.stock_quantity,
      sku: product.sku,
      is_active: product.is_active,
      is_featured: product.is_featured,
      is_new: product.is_new,
      tags: Array.isArray(product.tags) ? product.tags : [],
      created_at: product.created_at,
      updated_at: product.updated_at,
      care_instructions: product.care_instructions,
      colors: product.colors,
      sizes: product.sizes,
      occasions: product.occasions,
      dimensions: product.dimensions,
      weight: product.weight,
    };
  }
}

export const productService = new ProductService();