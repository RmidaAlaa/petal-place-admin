import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FlowerData } from '@/components/bouquet-builder/FlowerCard';

// Import local flower images
import redRoseImg from '@/assets/flowers/red-rose.png';
import pinkRoseImg from '@/assets/flowers/pink-rose.png';
import whiteRoseImg from '@/assets/flowers/white-rose.png';
import sunflowerImg from '@/assets/flowers/sunflower.png';
import peonyImg from '@/assets/flowers/peony.png';
import babysBreathImg from '@/assets/flowers/babys-breath.png';
import eucalyptusImg from '@/assets/flowers/eucalyptus.png';
import purpleTulipImg from '@/assets/flowers/purple-tulip.png';
import orangeLilyImg from '@/assets/flowers/orange-lily.png';
import lavenderImg from '@/assets/flowers/lavender.png';

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
      // Set fallback flowers with real images
      setFlowers(FALLBACK_FLOWERS);
    } finally {
      setLoading(false);
    }
  };

  return { flowers, loading, error, refetch: fetchFlowers };
};

// Fallback flowers with real generated images
const FALLBACK_FLOWERS: FlowerData[] = [
  {
    id: 'fallback-rose-red',
    name: 'Red Rose',
    price: 8,
    color: '#dc2626',
    image: redRoseImg,
    category: 'focal',
    size: 'large',
    stock: 50,
  },
  {
    id: 'fallback-rose-pink',
    name: 'Pink Rose',
    price: 8,
    color: '#ec4899',
    image: pinkRoseImg,
    category: 'focal',
    size: 'large',
    stock: 40,
  },
  {
    id: 'fallback-rose-white',
    name: 'White Rose',
    price: 8,
    color: '#f5f5f5',
    image: whiteRoseImg,
    category: 'focal',
    size: 'large',
    stock: 45,
  },
  {
    id: 'fallback-sunflower',
    name: 'Sunflower',
    price: 6,
    color: '#eab308',
    image: sunflowerImg,
    category: 'focal',
    size: 'large',
    stock: 35,
  },
  {
    id: 'fallback-peony',
    name: 'Peony',
    price: 12,
    color: '#fce7f3',
    image: peonyImg,
    category: 'focal',
    size: 'large',
    stock: 25,
  },
  {
    id: 'fallback-baby-breath',
    name: "Baby's Breath",
    price: 4,
    color: '#ffffff',
    image: babysBreathImg,
    category: 'filler',
    size: 'small',
    stock: 100,
  },
  {
    id: 'fallback-eucalyptus',
    name: 'Eucalyptus',
    price: 5,
    color: '#22c55e',
    image: eucalyptusImg,
    category: 'greenery',
    size: 'medium',
    stock: 60,
  },
  {
    id: 'fallback-tulip-purple',
    name: 'Purple Tulip',
    price: 7,
    color: '#a855f7',
    image: purpleTulipImg,
    category: 'focal',
    size: 'medium',
    stock: 40,
  },
  {
    id: 'fallback-lily-orange',
    name: 'Orange Lily',
    price: 9,
    color: '#f97316',
    image: orangeLilyImg,
    category: 'focal',
    size: 'large',
    stock: 30,
  },
  {
    id: 'fallback-lavender',
    name: 'Lavender',
    price: 5,
    color: '#8b5cf6',
    image: lavenderImg,
    category: 'filler',
    size: 'small',
    stock: 55,
  },
];
