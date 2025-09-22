import { supabase } from '@/integrations/supabase/client';

export interface CartItem {
  id: string;
  user_id?: string;
  product_id?: string;
  quantity: number;
  price?: number;
  custom_bouquet_data?: any;
  created_at?: string;
  updated_at?: string;
  // Virtual fields for display
  product_name?: string;
  product_image?: string;
  product_sku?: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minimum_amount?: number;
  maximum_discount?: number;
  usage_limit?: number;
  used_count: number;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
}

class CartService {
  // Get cart items for a user
  async getCartItems(userId?: string): Promise<CartItem[]> {
    try {
      if (userId) {
        // Get from database for logged-in users
        const { data, error } = await supabase
          .from('cart_items')
          .select(`
            *,
            products (
              name,
              images,
              sku
            )
          `)
          .eq('user_id', userId);

        if (error) throw error;

        // Transform data to match CartItem interface
        const items: CartItem[] = data?.map((item: any) => ({
          id: item.id,
          user_id: item.user_id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          custom_bouquet_data: item.custom_bouquet_data,
          created_at: item.created_at,
          updated_at: item.updated_at,
          product_name: item.products?.name,
          product_image: item.products?.images?.[0],
          product_sku: item.products?.sku,
        })) || [];

        return items;
      } else {
        // Get from localStorage for guest users
        return this.getLocalCartItems();
      }
    } catch (error) {
      console.error('Error fetching cart items:', error);
      throw error;
    }
  }

  // Add item to cart
  async addToCart(cartItem: Omit<CartItem, 'id' | 'created_at' | 'updated_at'>, userId?: string): Promise<CartItem> {
    try {
      // Ensure required fields
      const itemToAdd = {
        user_id: userId || '',
        product_id: cartItem.product_id || '',
        quantity: cartItem.quantity,
        price: cartItem.price,
        custom_bouquet_data: cartItem.custom_bouquet_data,
      };

      if (userId) {
        // Add to database for logged-in users
        const { data, error } = await supabase
          .from('cart_items')
          .insert(itemToAdd)
          .select()
          .single();

        if (error) throw error;
        return {
          id: data.id,
          user_id: data.user_id,
          product_id: data.product_id,
          quantity: data.quantity,
          price: data.price,
          custom_bouquet_data: data.custom_bouquet_data,
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
      } else {
        // Add to localStorage for guest users
        const existingItems = this.getLocalCartItems();
        const existingItem = existingItems.find(
          item => item.product_id === cartItem.product_id
        );

        if (existingItem) {
          existingItem.quantity += cartItem.quantity;
        } else {
          const newItem: CartItem = {
            id: `temp_${Date.now()}`,
            ...cartItem,
          };
          existingItems.push(newItem);
        }

        this.setLocalCartItems(existingItems);
        return existingItems.find(item => item.product_id === cartItem.product_id)!;
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  // Update cart item quantity
  async updateCartItem(itemId: string, quantity: number, userId?: string): Promise<CartItem> {
    try {
      if (userId) {
        // Update in database for logged-in users
        const { data, error } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('id', itemId)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) throw error;
        return {
          id: data.id,
          user_id: data.user_id,
          product_id: data.product_id,
          quantity: data.quantity,
          price: data.price,
          custom_bouquet_data: data.custom_bouquet_data,
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
      } else {
        // Update in localStorage for guest users
        const existingItems = this.getLocalCartItems();
        const item = existingItems.find(item => item.id === itemId);
        if (item) {
          item.quantity = quantity;
          this.setLocalCartItems(existingItems);
          return item;
        }
        throw new Error('Item not found');
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  }

  // Remove item from cart
  async removeFromCart(itemId: string, userId?: string): Promise<void> {
    try {
      if (userId) {
        // Remove from database for logged-in users
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', itemId)
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Remove from localStorage for guest users
        const existingItems = this.getLocalCartItems();
        const filteredItems = existingItems.filter(item => item.id !== itemId);
        this.setLocalCartItems(filteredItems);
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }

  // Clear cart
  async clearCart(userId?: string): Promise<void> {
    try {
      if (userId) {
        // Clear database cart for logged-in users
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Clear localStorage cart for guest users
        this.setLocalCartItems([]);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }

  // Get cart total
  async getCartTotal(userId?: string): Promise<{ subtotal: number; tax: number; shipping: number; total: number }> {
    try {
      const items = await this.getCartItems(userId);
      const subtotal = items.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);
      const tax = subtotal * 0.1; // 10% tax
      const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
      const total = subtotal + tax + shipping;

      return { subtotal, tax, shipping, total };
    } catch (error) {
      console.error('Error calculating cart total:', error);
      throw error;
    }
  }

  // Transfer guest cart to user cart on login
  async transferGuestCart(userId: string): Promise<void> {
    try {
      const guestItems = this.getLocalCartItems();
      if (guestItems.length === 0) return;

      // Insert guest items into database
      for (const item of guestItems) {
        if (item.product_id) {
          await this.addToCart(item, userId);
        }
      }

      // Clear local storage
      this.setLocalCartItems([]);
    } catch (error) {
      console.error('Error transferring guest cart:', error);
      throw error;
    }
  }

  // Apply coupon (placeholder - will need coupons migration)
  async applyCoupon(code: string, userId?: string): Promise<any> {
    try {
      // This would need a coupons table in the database
      // For now, return a mock response
      return {
        id: 'mock',
        code,
        type: 'percentage',
        value: 10,
        is_active: true
      };
    } catch (error) {
      console.error('Error applying coupon:', error);
      throw error;
    }
  }

  // Local storage helpers
  private getLocalCartItems(): CartItem[] {
    try {
      const items = localStorage.getItem('cart_items');
      return items ? JSON.parse(items) : [];
    } catch (error) {
      console.error('Error reading local cart:', error);
      return [];
    }
  }

  private setLocalCartItems(items: CartItem[]): void {
    try {
      localStorage.setItem('cart_items', JSON.stringify(items));
    } catch (error) {
      console.error('Error saving local cart:', error);
    }
  }
}

export const cartService = new CartService();