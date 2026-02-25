/**
 * Bouquet puzzle layout — places flowers in concentric rings
 * like a real bouquet viewed from above.
 */

interface BouquetSlot {
  x: number;
  y: number;
  rotation: number;
  scale: number;
  zIndex: number;
}

// Slots for the ImprovedBouquetBuilder canvas (center ~120,120 area)
const BUILDER_CENTER = { x: 110, y: 110 };
// Slots for the VisualBouquetCanvas (larger canvas, relative to inner area)
const CANVAS_CENTER = { x: 120, y: 120 };

function generateRingSlots(
  cx: number,
  cy: number,
  ringIndex: number,
  count: number,
  startAngle: number = 0,
  radius: number = 0,
  scale: number = 1
): BouquetSlot[] {
  const slots: BouquetSlot[] = [];
  for (let i = 0; i < count; i++) {
    const angle = startAngle + (i / count) * Math.PI * 2;
    // Slight jitter for organic feel
    const jitterR = radius * 0.05 * Math.sin(i * 7.3);
    const jitterA = 0.05 * Math.cos(i * 3.1);
    const r = radius + jitterR;
    const a = angle + jitterA;
    
    slots.push({
      x: cx + Math.cos(a) * r - 28, // offset for flower element width/2
      y: cy + Math.sin(a) * r - 28,
      rotation: ((angle * 180) / Math.PI) * 0.3 + (Math.sin(i * 2.7) * 8), // gentle outward tilt
      scale,
      zIndex: ringIndex === 0 ? 10 : 5 - ringIndex + i,
    });
  }
  return slots;
}

function buildSlotTable(cx: number, cy: number): BouquetSlot[] {
  const slots: BouquetSlot[] = [];

  // Ring 0: center flower (1 flower)
  slots.push({
    x: cx - 28,
    y: cy - 28,
    rotation: 0,
    scale: 1.1,
    zIndex: 10,
  });

  // Ring 1: 6 flowers, radius ~44
  slots.push(...generateRingSlots(cx, cy, 1, 6, -Math.PI / 6, 44, 1.0));

  // Ring 2: 12 flowers, radius ~88
  slots.push(...generateRingSlots(cx, cy, 2, 12, 0, 88, 0.9));

  return slots; // 19 total slots
}

const builderSlots = buildSlotTable(BUILDER_CENTER.x, BUILDER_CENTER.y);
const canvasSlots = buildSlotTable(CANVAS_CENTER.x, CANVAS_CENTER.y);

/** Get the slot for the Nth flower on the ImprovedBouquetBuilder */
export function getBouquetSlot(index: number): BouquetSlot {
  if (index < builderSlots.length) {
    return builderSlots[index];
  }
  // Overflow: place in a wider ring
  const angle = ((index - builderSlots.length) / 8) * Math.PI * 2;
  return {
    x: BUILDER_CENTER.x + Math.cos(angle) * 120 - 28,
    y: BUILDER_CENTER.y + Math.sin(angle) * 120 - 28,
    rotation: Math.sin(index) * 10,
    scale: 0.8,
    zIndex: 1,
  };
}

/** Get the slot for the Nth flower on the VisualBouquetCanvas */
export function getBouquetSlotForCanvas(index: number): BouquetSlot {
  if (index < canvasSlots.length) {
    return canvasSlots[index];
  }
  const angle = ((index - canvasSlots.length) / 8) * Math.PI * 2;
  return {
    x: CANVAS_CENTER.x + Math.cos(angle) * 120 - 28,
    y: CANVAS_CENTER.y + Math.sin(angle) * 120 - 28,
    rotation: Math.sin(index) * 10,
    scale: 0.8,
    zIndex: 1,
  };
}
