import { supabase } from '@/integrations/supabase/client';

export interface CartItem {
  id: string;
  product_id: string;
  user_id?: string;
  session_id?: string;
  quantity: number;
  price: number;
  product_name: string;
  product_image: string;
  product_sku: string;
  variant_id?: string;
  variant_name?: string;
  custom_bouquet_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CartSummary {
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  item_count: number;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_order_amount?: number;
  max_discount?: number;
  is_active: boolean;
  expires_at?: string;
  usage_limit?: number;
  used_count: number;
}

class CartService {
  private readonly CART_STORAGE_KEY = 'cart_items';
  private readonly SESSION_ID_KEY = 'session_id';

  // Get or create session ID
  private getSessionId(): string {
    let sessionId = localStorage.getItem(this.SESSION_ID_KEY);
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(this.SESSION_ID_KEY, sessionId);
    }
    return sessionId;
  }

  // Get cart items from local storage
  private getLocalCartItems(): CartItem[] {
    try {
      const items = localStorage.getItem(this.CART_STORAGE_KEY);
      return items ? JSON.parse(items) : [];
    } catch {
      return [];
    }
  }

  // Save cart items to local storage
  private saveLocalCartItems(items: CartItem[]): void {
    localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(items));
  }

  // Get cart items (from database if user is logged in, otherwise from localStorage)
  async getCartItems(userId?: string): Promise<CartItem[]> {
    try {
      if (userId) {
        // Get from database for logged-in users
        const { data, error } = await supabase
          .from('cart_items')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        return data || [];
      } else {
        // Get from localStorage for guest users
        return this.getLocalCartItems();
      }
    } catch (error: any) {
      console.error('Failed to fetch cart items:', error);
      // Fallback to localStorage
      return this.getLocalCartItems();
    }
  }

  // Add item to cart
  async addToCart(
    productId: string,
    quantity: number = 1,
    userId?: string,
    variantId?: string,
    customBouquetId?: string,
    productData?: {
      name: string;
      price: number;
      image: string;
      sku: string;
      variantName?: string;
    }
  ): Promise<CartItem> {
    try {
      const sessionId = this.getSessionId();
      const cartItem: Omit<CartItem, 'id' | 'created_at' | 'updated_at'> = {
        product_id: productId,
        user_id: userId,
        session_id: sessionId,
        quantity,
        price: productData?.price || 0,
        product_name: productData?.name || '',
        product_image: productData?.image || '',
        product_sku: productData?.sku || '',
        variant_id: variantId,
        variant_name: productData?.variantName,
        custom_bouquet_id: customBouquetId
      };

      if (userId) {
        // Add to database for logged-in users
        const { data, error } = await supabase
          .from('cart_items')
          .insert(cartItem)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Add to localStorage for guest users
        const existingItems = this.getLocalCartItems();
        const existingItem = existingItems.find(
          item => item.product_id === productId && 
                  item.variant_id === variantId && 
                  item.custom_bouquet_id === customBouquetId
        );

        if (existingItem) {
          existingItem.quantity += quantity;
          existingItem.updated_at = new Date().toISOString();
        } else {
          const newItem: CartItem = {
            ...cartItem,
            id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          existingItems.push(newItem);
        }

        this.saveLocalCartItems(existingItems);
        return existingItems[existingItems.length - 1];
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to add item to cart');
    }
  }

  // Update cart item quantity
  async updateCartItemQuantity(
    itemId: string,
    quantity: number,
    userId?: string
  ): Promise<CartItem> {
    try {
      if (userId) {
        // Update in database
        const { data, error } = await supabase
          .from('cart_items')
          .update({ 
            quantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', itemId)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Update in localStorage
        const items = this.getLocalCartItems();
        const itemIndex = items.findIndex(item => item.id === itemId);
        
        if (itemIndex === -1) {
          throw new Error('Cart item not found');
        }

        if (quantity <= 0) {
          items.splice(itemIndex, 1);
        } else {
          items[itemIndex].quantity = quantity;
          items[itemIndex].updated_at = new Date().toISOString();
        }

        this.saveLocalCartItems(items);
        return items[itemIndex];
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update cart item');
    }
  }

  // Remove item from cart
  async removeFromCart(itemId: string, userId?: string): Promise<void> {
    try {
      if (userId) {
        // Remove from database
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', itemId)
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Remove from localStorage
        const items = this.getLocalCartItems();
        const filteredItems = items.filter(item => item.id !== itemId);
        this.saveLocalCartItems(filteredItems);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to remove item from cart');
    }
  }

  // Clear cart
  async clearCart(userId?: string): Promise<void> {
    try {
      if (userId) {
        // Clear from database
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Clear from localStorage
        localStorage.removeItem(this.CART_STORAGE_KEY);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to clear cart');
    }
  }

  // Get cart summary
  async getCartSummary(userId?: string): Promise<CartSummary> {
    try {
      const items = await this.getCartItems(userId);
      
      const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const tax = subtotal * 0.1; // 10% tax
      const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
      const discount = 0; // Will be calculated when coupon is applied
      const total = subtotal + tax + shipping - discount;

      return {
        items,
        subtotal,
        tax,
        shipping,
        discount,
        total,
        item_count: items.reduce((sum, item) => sum + item.quantity, 0)
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get cart summary');
    }
  }

  // Apply coupon
  async applyCoupon(code: string, userId?: string): Promise<Coupon> {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Invalid coupon code');

      // Check if coupon is expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        throw new Error('Coupon has expired');
      }

      // Check usage limit
      if (data.usage_limit && data.used_count >= data.usage_limit) {
        throw new Error('Coupon usage limit exceeded');
      }

      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to apply coupon');
    }
  }

  // Save cart for later (move to wishlist)
  async saveForLater(itemId: string, userId: string): Promise<void> {
    try {
      // Get cart item
      const { data: cartItem, error: fetchError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('id', itemId)
        .eq('user_id', userId)
        .single();

      if (fetchError) throw fetchError;

      // Add to wishlist
      const { error: wishlistError } = await supabase
        .from('wishlist_items')
        .insert({
          user_id: userId,
          product_id: cartItem.product_id,
          variant_id: cartItem.variant_id,
          custom_bouquet_id: cartItem.custom_bouquet_id
        });

      if (wishlistError) throw wishlistError;

      // Remove from cart
      await this.removeFromCart(itemId, userId);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to save item for later');
    }
  }

  // Sync local cart with database when user logs in
  async syncCartWithUser(userId: string): Promise<void> {
    try {
      const localItems = this.getLocalCartItems();
      
      if (localItems.length === 0) return;

      // Get existing cart items for user
      const { data: existingItems } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId);

      // Merge local items with existing items
      for (const localItem of localItems) {
        const existingItem = existingItems?.find(
          item => item.product_id === localItem.product_id && 
                  item.variant_id === localItem.variant_id &&
                  item.custom_bouquet_id === localItem.custom_bouquet_id
        );

        if (existingItem) {
          // Update quantity
          await supabase
            .from('cart_items')
            .update({ 
              quantity: existingItem.quantity + localItem.quantity,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingItem.id);
        } else {
          // Add new item
          await supabase
            .from('cart_items')
            .insert({
              ...localItem,
              user_id: userId,
              session_id: null
            });
        }
      }

      // Clear local cart
      localStorage.removeItem(this.CART_STORAGE_KEY);
    } catch (error: any) {
      console.error('Failed to sync cart:', error);
    }
  }

  // Get cart item count
  async getCartItemCount(userId?: string): Promise<number> {
    try {
      const summary = await this.getCartSummary(userId);
      return summary.item_count;
    } catch (error: any) {
      console.error('Failed to get cart item count:', error);
      return 0;
    }
  }
}

export const cartService = new CartService();
