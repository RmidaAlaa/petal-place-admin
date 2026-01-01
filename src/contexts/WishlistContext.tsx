import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  image?: string;
  description: string;
}

interface WishlistContextType {
  wishlistItems: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider: React.FC<WishlistProviderProps> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadWishlist = async () => {
      if (currentUser) {
        setIsLoading(true);
        try {
          const { data: wishlistData, error: wishlistError } = await supabase
            .from('wishlists')
            .select('product_id')
            .eq('user_id', currentUser.id);

          if (wishlistError) {
            console.error('Error fetching wishlist:', wishlistError);
            return;
          }

          if (wishlistData && wishlistData.length > 0) {
            const productIds = wishlistData.map(item => item.product_id);
            const { data: products, error: productsError } = await supabase
              .from('products')
              .select('id, name, price, images, description')
              .in('id', productIds);

            if (productsError) {
              console.error('Error fetching products:', productsError);
              return;
            }

            const formattedProducts: Product[] = (products || []).map(p => ({
              id: p.id,
              name: p.name,
              price: Number(p.price),
              image_url: Array.isArray(p.images) && p.images.length > 0 ? String(p.images[0]) : '',
              description: p.description || ''
            }));

            setWishlistItems(formattedProducts);
          } else {
            setWishlistItems([]);
          }
        } catch (error) {
          console.error('Error loading wishlist:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
          try {
            setWishlistItems(JSON.parse(savedWishlist));
          } catch (error) {
            console.error('Error parsing wishlist from localStorage:', error);
          }
        }
      }
    };

    loadWishlist();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) {
      localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, currentUser]);

  const addToWishlist = async (product: Product) => {
    setWishlistItems(prev => {
      if (!prev.find(item => item.id === product.id)) {
        return [...prev, product];
      }
      return prev;
    });

    if (currentUser) {
      try {
        const { error } = await supabase
          .from('wishlists')
          .insert({ user_id: currentUser.id, product_id: product.id });

        if (error) {
          console.error('Error adding to wishlist:', error);
          setWishlistItems(prev => prev.filter(item => item.id !== product.id));
        }
      } catch (error) {
        console.error('Error adding to wishlist:', error);
        setWishlistItems(prev => prev.filter(item => item.id !== product.id));
      }
    }
  };

  const removeFromWishlist = async (productId: string) => {
    const previousItems = [...wishlistItems];
    setWishlistItems(prev => prev.filter(item => item.id !== productId));

    if (currentUser) {
      try {
        const { error } = await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('product_id', productId);

        if (error) {
          console.error('Error removing from wishlist:', error);
          setWishlistItems(previousItems);
        }
      } catch (error) {
        console.error('Error removing from wishlist:', error);
        setWishlistItems(previousItems);
      }
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item.id === productId);
  };

  const clearWishlist = async () => {
    const previousItems = [...wishlistItems];
    setWishlistItems([]);

    if (currentUser) {
      try {
        const { error } = await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', currentUser.id);

        if (error) {
          console.error('Error clearing wishlist:', error);
          setWishlistItems(previousItems);
        }
      } catch (error) {
        console.error('Error clearing wishlist:', error);
        setWishlistItems(previousItems);
      }
    }
  };

  const value: WishlistContextType = {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    isLoading,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
