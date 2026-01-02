import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FlowerData } from '@/components/bouquet-builder/FlowerCard';

// Color mapping for flower categories
const FLOWER_COLORS: Record<string, string> = {
  'rose': '#dc2626',
  'pink': '#ec4899',
  'white': '#f5f5f5',
  'yellow': '#eab308',
  'orange': '#f97316',
  'purple': '#a855f7',
  'blue': '#3b82f6',
  'red': '#dc2626',
  'green': '#22c55e',
  'cream': '#fef3c7',
};

const getFlowerColor = (name: string, colors: string[] | null): string => {
  // Check if colors array has values
  if (colors && colors.length > 0) {
    const colorName = colors[0].toLowerCase();
    if (FLOWER_COLORS[colorName]) {
      return FLOWER_COLORS[colorName];
    }
  }
  
  // Fallback: extract color from name
  const nameLower = name.toLowerCase();
  for (const [key, value] of Object.entries(FLOWER_COLORS)) {
    if (nameLower.includes(key)) {
      return value;
    }
  }
  
  return '#f472b6'; // Default pink
};

const getFlowerCategory = (category: string): 'focal' | 'filler' | 'greenery' => {
  const cat = category.toLowerCase();
  if (cat.includes('green') || cat.includes('foliage') || cat.includes('eucalyptus')) {
    return 'greenery';
  }
  if (cat.includes('filler') || cat.includes('baby') || cat.includes('gypsophila')) {
    return 'filler';
  }
  return 'focal';
};

const getFlowerSize = (name: string, price: number): 'small' | 'medium' | 'large' => {
  if (price >= 15) return 'large';
  if (price >= 8) return 'medium';
  return 'small';
};

export const useBouquetFlowers = () => {
  const [flowers, setFlowers] = useState<FlowerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFlowers();
  }, []);

  const fetchFlowers = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .gt('stock_quantity', 0)
        .order('name');

      if (error) throw error;

      const flowerData: FlowerData[] = (data || []).map((product) => {
        const images = product.images as string[] | null;
        const colors = product.colors as string[] | null;
        
        return {
          id: product.id,
          name: product.name,
          price: product.price,
          color: getFlowerColor(product.name, colors),
          image: images && images.length > 0 ? images[0] : '/placeholder.svg',
          category: getFlowerCategory(product.category),
          size: getFlowerSize(product.name, product.price),
          stock: product.stock_quantity,
        };
      });

      setFlowers(flowerData);
    } catch (err) {
      console.error('Error fetching flowers:', err);
      setError('Failed to load flowers');
      // Set fallback flowers
      setFlowers(FALLBACK_FLOWERS);
    } finally {
      setLoading(false);
    }
  };

  return { flowers, loading, error, refetch: fetchFlowers };
};

// Fallback flowers if database is empty or fails
const FALLBACK_FLOWERS: FlowerData[] = [
  {
    id: 'fallback-rose-red',
    name: 'Red Rose',
    price: 8,
    color: '#dc2626',
    image: '/placeholder.svg',
    category: 'focal',
    size: 'large',
    stock: 50,
  },
  {
    id: 'fallback-rose-pink',
    name: 'Pink Rose',
    price: 8,
    color: '#ec4899',
    image: '/placeholder.svg',
    category: 'focal',
    size: 'large',
    stock: 40,
  },
  {
    id: 'fallback-rose-white',
    name: 'White Rose',
    price: 8,
    color: '#f5f5f5',
    image: '/placeholder.svg',
    category: 'focal',
    size: 'large',
    stock: 45,
  },
  {
    id: 'fallback-baby-breath',
    name: "Baby's Breath",
    price: 5,
    color: '#ffffff',
    image: '/placeholder.svg',
    category: 'filler',
    size: 'small',
    stock: 100,
  },
  {
    id: 'fallback-eucalyptus',
    name: 'Eucalyptus',
    price: 4,
    color: '#22c55e',
    image: '/placeholder.svg',
    category: 'greenery',
    size: 'medium',
    stock: 60,
  },
  {
    id: 'fallback-peony',
    name: 'Peony',
    price: 12,
    color: '#fce7f3',
    image: '/placeholder.svg',
    category: 'focal',
    size: 'large',
    stock: 25,
  },
];
