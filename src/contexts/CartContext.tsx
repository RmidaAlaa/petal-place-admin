import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { cartService, CartItem as ServiceCartItem, CartSummary } from '@/services/cartService';
import { useAuth } from './AuthContext';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  type: 'product' | 'bouquet' | 'custom-bouquet';
  vendor?: string;
  category?: string;
  product_id?: string;
  variant_id?: string;
  custom_bouquet_id?: string;
}

interface CartState {
  items: CartItem[];
  summary: CartSummary | null;
  total: number;
  itemCount: number;
  isLoading: boolean;
  error: string | null;
}

type CartAction = 
  | { type: 'CART_LOADING' }
  | { type: 'CART_SUCCESS'; payload: { items: CartItem[]; summary: CartSummary } }
  | { type: 'CART_ERROR'; payload: string }
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' };

const initialState: CartState = {
  items: [],
  summary: null,
  total: 0,
  itemCount: 0,
  isLoading: false,
  error: null,
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'CART_LOADING':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'CART_SUCCESS':
      return {
        ...state,
        items: action.payload.items,
        summary: action.payload.summary,
        total: action.payload.summary.total,
        itemCount: action.payload.summary.item_count,
        isLoading: false,
        error: null,
      };

    case 'CART_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      let newItems: CartItem[];
      if (existingItem) {
        newItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newItems = [...state.items, { ...action.payload, quantity: 1 }];
      }

      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return { 
        ...state,
        items: newItems, 
        total, 
        itemCount 
      };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload);
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return { 
        ...state,
        items: newItems, 
        total, 
        itemCount 
      };
    }

    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: Math.max(0, action.payload.quantity) }
          : item
      ).filter(item => item.quantity > 0);

      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return { 
        ...state,
        items: newItems, 
        total, 
        itemCount 
      };
    }

    case 'CLEAR_CART':
      return initialState;

    default:
      return state;
  }
};

interface CartContextType {
  state: CartState;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  addItemAsync: (productId: string, quantity?: number, variantId?: string, customBouquetId?: string, productData?: any) => Promise<void>;
  removeItem: (id: string) => void;
  removeItemAsync: (itemId: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => void;
  updateQuantityAsync: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  clearCartAsync: () => Promise<void>;
  refreshCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  saveForLater: (itemId: string) => Promise<void>;
  syncCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { state: authState } = useAuth();

  // Load cart items on mount and when user changes
  useEffect(() => {
    loadCart();
  }, [authState.user?.id]);

  const loadCart = async () => {
    try {
      dispatch({ type: 'CART_LOADING' });
      const items = await cartService.getCartItems(authState.user?.id);
      const summary = await cartService.getCartSummary(authState.user?.id);
      
      // Convert service cart items to context cart items
      const contextItems: CartItem[] = items.map(item => ({
        id: item.id,
        name: item.product_name,
        price: item.price,
        image: item.product_image,
        quantity: item.quantity,
        type: item.custom_bouquet_id ? 'custom-bouquet' : 'product',
        product_id: item.product_id,
        variant_id: item.variant_id,
        custom_bouquet_id: item.custom_bouquet_id,
      }));

      dispatch({ type: 'CART_SUCCESS', payload: { items: contextItems, summary } });
    } catch (error: any) {
      dispatch({ type: 'CART_ERROR', payload: error.message || 'Failed to load cart' });
    }
  };

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const addItemAsync = async (
    productId: string, 
    quantity: number = 1, 
    variantId?: string, 
    customBouquetId?: string, 
    productData?: any
  ) => {
    try {
      dispatch({ type: 'CART_LOADING' });
      await cartService.addToCart(
        productId, 
        quantity, 
        authState.user?.id, 
        variantId, 
        customBouquetId, 
        productData
      );
      await loadCart();
    } catch (error: any) {
      dispatch({ type: 'CART_ERROR', payload: error.message || 'Failed to add item to cart' });
      throw error;
    }
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const removeItemAsync = async (itemId: string) => {
    try {
      dispatch({ type: 'CART_LOADING' });
      await cartService.removeFromCart(itemId, authState.user?.id);
      await loadCart();
    } catch (error: any) {
      dispatch({ type: 'CART_ERROR', payload: error.message || 'Failed to remove item from cart' });
      throw error;
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const updateQuantityAsync = async (itemId: string, quantity: number) => {
    try {
      dispatch({ type: 'CART_LOADING' });
      await cartService.updateCartItemQuantity(itemId, quantity, authState.user?.id);
      await loadCart();
    } catch (error: any) {
      dispatch({ type: 'CART_ERROR', payload: error.message || 'Failed to update item quantity' });
      throw error;
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const clearCartAsync = async () => {
    try {
      dispatch({ type: 'CART_LOADING' });
      await cartService.clearCart(authState.user?.id);
      dispatch({ type: 'CLEAR_CART' });
    } catch (error: any) {
      dispatch({ type: 'CART_ERROR', payload: error.message || 'Failed to clear cart' });
      throw error;
    }
  };

  const refreshCart = async () => {
    await loadCart();
  };

  const applyCoupon = async (code: string) => {
    try {
      dispatch({ type: 'CART_LOADING' });
      await cartService.applyCoupon(code, authState.user?.id);
      await loadCart();
    } catch (error: any) {
      dispatch({ type: 'CART_ERROR', payload: error.message || 'Failed to apply coupon' });
      throw error;
    }
  };

  const saveForLater = async (itemId: string) => {
    try {
      if (!authState.user?.id) {
        throw new Error('You must be logged in to save items for later');
      }
      dispatch({ type: 'CART_LOADING' });
      await cartService.saveForLater(itemId, authState.user.id);
      await loadCart();
    } catch (error: any) {
      dispatch({ type: 'CART_ERROR', payload: error.message || 'Failed to save item for later' });
      throw error;
    }
  };

  const syncCart = async () => {
    try {
      if (authState.user?.id) {
        await cartService.syncCartWithUser(authState.user.id);
        await loadCart();
      }
    } catch (error: any) {
      console.error('Failed to sync cart:', error);
    }
  };

  return (
    <CartContext.Provider value={{
      state,
      addItem,
      addItemAsync,
      removeItem,
      removeItemAsync,
      updateQuantity,
      updateQuantityAsync,
      clearCart,
      clearCartAsync,
      refreshCart,
      applyCoupon,
      saveForLater,
      syncCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};