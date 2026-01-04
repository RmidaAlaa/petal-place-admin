import redRose from '@/assets/flowers/red-rose.png';
import pinkRose from '@/assets/flowers/pink-rose.png';
import whiteRose from '@/assets/flowers/white-rose.png';
import sunflower from '@/assets/flowers/sunflower.png';
import peony from '@/assets/flowers/peony.png';
import babysBreath from '@/assets/flowers/babys-breath.png';
import eucalyptus from '@/assets/flowers/eucalyptus.png';
import purpleTulip from '@/assets/flowers/purple-tulip.png';
import orangeLily from '@/assets/flowers/orange-lily.png';
import lavender from '@/assets/flowers/lavender.png';

import { CanvasFlower } from './VisualBouquetCanvas';

// Preset flower data for each occasion
interface PresetFlower {
  name: string;
  price: number;
  color: string;
  image: string;
  category: 'focal' | 'filler' | 'greenery';
  size: 'small' | 'medium' | 'large';
}

export const PRESET_FLOWERS: Record<string, PresetFlower> = {
  redRose: { name: 'Red Rose', price: 8, color: '#dc2626', image: redRose, category: 'focal', size: 'large' },
  pinkRose: { name: 'Pink Rose', price: 8, color: '#ec4899', image: pinkRose, category: 'focal', size: 'large' },
  whiteRose: { name: 'White Rose', price: 8, color: '#f5f5f5', image: whiteRose, category: 'focal', size: 'large' },
  sunflower: { name: 'Sunflower', price: 6, color: '#eab308', image: sunflower, category: 'focal', size: 'large' },
  peony: { name: 'Peony', price: 12, color: '#fce7f3', image: peony, category: 'focal', size: 'large' },
  babysBreath: { name: "Baby's Breath", price: 4, color: '#ffffff', image: babysBreath, category: 'filler', size: 'small' },
  eucalyptus: { name: 'Eucalyptus', price: 5, color: '#22c55e', image: eucalyptus, category: 'greenery', size: 'medium' },
  purpleTulip: { name: 'Purple Tulip', price: 7, color: '#a855f7', image: purpleTulip, category: 'focal', size: 'medium' },
  orangeLily: { name: 'Orange Lily', price: 9, color: '#f97316', image: orangeLily, category: 'focal', size: 'large' },
  lavender: { name: 'Lavender', price: 5, color: '#8b5cf6', image: lavender, category: 'filler', size: 'small' },
};

// Generate canvas position with some randomness
const generatePosition = (baseX: number, baseY: number, index: number): { x: number; y: number } => {
  const angle = (index * 45) + (Math.random() * 20 - 10);
  const radius = 30 + Math.random() * 40;
  return {
    x: baseX + Math.cos(angle * Math.PI / 180) * radius,
    y: baseY + Math.sin(angle * Math.PI / 180) * radius,
  };
};

// Create a canvas flower from preset
const createCanvasFlower = (
  flowerKey: string, 
  index: number, 
  centerX = 120, 
  centerY = 120
): CanvasFlower => {
  const flower = PRESET_FLOWERS[flowerKey];
  const pos = generatePosition(centerX, centerY, index);
  
  return {
    id: `preset-${flowerKey}-${index}`,
    canvasId: `preset-${flowerKey}-${Date.now()}-${index}`,
    name: flower.name,
    price: flower.price,
    color: flower.color,
    image: flower.image,
    category: flower.category,
    size: flower.size,
    stock: 100,
    x: pos.x,
    y: pos.y,
    rotation: Math.random() * 30 - 15,
    scale: flower.category === 'focal' ? 1 : 0.85,
    zIndex: flower.category === 'greenery' ? 0 : flower.category === 'filler' ? 1 : 2,
  };
};

export interface OccasionPreset {
  id: string;
  name: string;
  icon: string;
  description: string;
  wrapping: 'paper' | 'cellophane' | 'burlap' | 'fabric';
  ribbonColor: string;
  flowers: CanvasFlower[];
}

export const OCCASION_PRESETS: OccasionPreset[] = [
  {
    id: 'romantic',
    name: 'Romantic',
    icon: '💕',
    description: 'Red roses & pink accents',
    wrapping: 'fabric',
    ribbonColor: '#dc2626',
    flowers: [
      createCanvasFlower('redRose', 0, 100, 100),
      createCanvasFlower('redRose', 1, 140, 90),
      createCanvasFlower('redRose', 2, 120, 130),
      createCanvasFlower('pinkRose', 3, 80, 120),
      createCanvasFlower('pinkRose', 4, 160, 115),
      createCanvasFlower('babysBreath', 5, 90, 150),
      createCanvasFlower('babysBreath', 6, 150, 145),
      createCanvasFlower('eucalyptus', 7, 70, 90),
      createCanvasFlower('eucalyptus', 8, 170, 95),
    ],
  },
  {
    id: 'birthday',
    name: 'Birthday',
    icon: '🎂',
    description: 'Colorful & cheerful mix',
    wrapping: 'cellophane',
    ribbonColor: '#ec4899',
    flowers: [
      createCanvasFlower('sunflower', 0, 120, 90),
      createCanvasFlower('orangeLily', 1, 90, 120),
      createCanvasFlower('purpleTulip', 2, 150, 115),
      createCanvasFlower('pinkRose', 3, 100, 150),
      createCanvasFlower('sunflower', 4, 140, 145),
      createCanvasFlower('lavender', 5, 75, 85),
      createCanvasFlower('lavender', 6, 165, 90),
      createCanvasFlower('babysBreath', 7, 110, 170),
    ],
  },
  {
    id: 'sympathy',
    name: 'Sympathy',
    icon: '🕊️',
    description: 'White & soft tones',
    wrapping: 'paper',
    ribbonColor: '#f5f5f5',
    flowers: [
      createCanvasFlower('whiteRose', 0, 100, 100),
      createCanvasFlower('whiteRose', 1, 140, 95),
      createCanvasFlower('whiteRose', 2, 120, 130),
      createCanvasFlower('peony', 3, 85, 125),
      createCanvasFlower('peony', 4, 155, 120),
      createCanvasFlower('babysBreath', 5, 70, 90),
      createCanvasFlower('babysBreath', 6, 170, 85),
      createCanvasFlower('eucalyptus', 7, 95, 160),
      createCanvasFlower('eucalyptus', 8, 145, 155),
    ],
  },
  {
    id: 'congratulations',
    name: 'Congrats',
    icon: '🎉',
    description: 'Bright & celebratory',
    wrapping: 'burlap',
    ribbonColor: '#d4af37',
    flowers: [
      createCanvasFlower('sunflower', 0, 120, 85),
      createCanvasFlower('orangeLily', 1, 85, 110),
      createCanvasFlower('orangeLily', 2, 155, 105),
      createCanvasFlower('pinkRose', 3, 100, 140),
      createCanvasFlower('purpleTulip', 4, 140, 135),
      createCanvasFlower('lavender', 5, 70, 130),
      createCanvasFlower('lavender', 6, 170, 125),
      createCanvasFlower('eucalyptus', 7, 115, 170),
    ],
  },
  {
    id: 'spring',
    name: 'Spring',
    icon: '🌷',
    description: 'Fresh tulips & pastels',
    wrapping: 'paper',
    ribbonColor: '#16a34a',
    flowers: [
      createCanvasFlower('purpleTulip', 0, 100, 95),
      createCanvasFlower('purpleTulip', 1, 140, 90),
      createCanvasFlower('pinkRose', 2, 120, 125),
      createCanvasFlower('peony', 3, 85, 120),
      createCanvasFlower('whiteRose', 4, 155, 115),
      createCanvasFlower('lavender', 5, 70, 140),
      createCanvasFlower('lavender', 6, 170, 135),
      createCanvasFlower('eucalyptus', 7, 110, 160),
    ],
  },
  {
    id: 'garden',
    name: 'Garden',
    icon: '🌻',
    description: 'Natural countryside feel',
    wrapping: 'burlap',
    ribbonColor: '#22c55e',
    flowers: [
      createCanvasFlower('sunflower', 0, 115, 85),
      createCanvasFlower('lavender', 1, 80, 100),
      createCanvasFlower('lavender', 2, 155, 95),
      createCanvasFlower('pinkRose', 3, 100, 130),
      createCanvasFlower('whiteRose', 4, 140, 125),
      createCanvasFlower('eucalyptus', 5, 65, 125),
      createCanvasFlower('eucalyptus', 6, 170, 120),
      createCanvasFlower('babysBreath', 7, 120, 160),
    ],
  },
];
