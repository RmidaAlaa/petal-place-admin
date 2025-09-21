import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import ProductCard from '@/components/ProductCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { Grid3X3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import rosesBouquet from "@/assets/roses-bouquet.jpg";
import whitePeonies from "@/assets/white-peonies.jpg";
import springWildflowers from "@/assets/spring-wildflowers.jpg";
import heroImage from "@/assets/hero-flowers.jpg";

const GiftBoxes = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { t } = useLanguage();

  const giftBoxes = [
    {
      id: 'gift-1',
      name: 'Luxury Rose Gift Box',
      price: 120.00,
      originalPrice: 150.00,
      image: rosesBouquet,
      vendor: "Roses Garden",
      rating: 4.9,
      reviewCount: 156,
      category: 'Gift Boxes',
      isNew: true,
      description: 'Premium roses with chocolate and champagne'
    },
    {
      id: 'gift-2',
      name: 'Romantic Surprise Box',
      price: 85.00,
      image: whitePeonies,
      vendor: "Roses Garden",
      rating: 4.7,
      reviewCount: 89,
      category: 'Gift Boxes',
      description: 'Perfect for anniversaries and special moments'
    },
    {
      id: 'gift-3',
      name: 'Birthday Celebration Box',
      price: 95.00,
      image: springWildflowers,
      vendor: "Roses Garden",
      rating: 4.8,
      reviewCount: 124,
      category: 'Gift Boxes',
      isNew: true,
      description: 'Colorful flowers with birthday treats'
    },
    {
      id: 'gift-4',
      name: 'Get Well Soon Box',
      price: 65.00,
      image: heroImage,
      vendor: "Roses Garden",
      rating: 4.6,
      reviewCount: 67,
      category: 'Gift Boxes',
      description: 'Uplifting flowers with wellness treats'
    },
    {
      id: 'gift-5',
      name: 'New Baby Gift Box',
      price: 78.00,
      image: rosesBouquet,
      vendor: "Roses Garden",
      rating: 4.9,
      reviewCount: 198,
      category: 'Gift Boxes',
      description: 'Delicate flowers for new arrivals'
    },
    {
      id: 'gift-6',
      name: 'Sympathy Comfort Box',
      price: 90.00,
      image: whitePeonies,
      vendor: "Roses Garden",
      rating: 4.8,
      reviewCount: 45,
      category: 'Gift Boxes',
      description: 'Thoughtful arrangement for difficult times'
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Gift Boxes</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Thoughtfully curated gift boxes that combine beautiful flowers with special treats for every occasion
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Showing {giftBoxes.length} gift boxes
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-primary text-primary-foreground">
                Premium Collection
              </Badge>
              <Badge variant="secondary" className="bg-sage text-sage-foreground">
                Curated Selection
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Products */}
        <div className={
          viewMode === 'grid'
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        }>
          {giftBoxes.map((giftBox) => (
            <ProductCard key={giftBox.id} {...giftBox} />
          ))}
        </div>

        {/* Custom Gift Box CTA */}
        <div className="mt-12 bg-gradient-to-r from-primary/10 to-sage/10 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Create Custom Gift Box</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Design a personalized gift box with your choice of flowers, treats, and accessories.
            Perfect for making someone feel truly special.
          </p>
          <Button size="lg" className="bg-primary hover:bg-primary/90">
            Start Designing
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GiftBoxes;