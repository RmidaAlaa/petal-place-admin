import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { Heart, ShoppingCart, Gift, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const GiftBoxes = () => {
  const { addItem } = useCart();
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();
  const { toast } = useToast();

  const giftBoxes = [
    {
      id: 'gift-1',
      name: 'Luxury Rose Gift Box',
      price: 120.00,
      originalPrice: 150.00,
      image: '/api/placeholder/400/300',
      description: 'Premium roses with chocolate and champagne',
      rating: 4.9,
      reviewCount: 156,
      category: 'Premium',
      includes: ['12 Premium Roses', 'Swiss Chocolate', 'Mini Champagne', 'Greeting Card'],
    },
    {
      id: 'gift-2',
      name: 'Romantic Surprise Box',
      price: 85.00,
      image: '/api/placeholder/400/300',
      description: 'Perfect for anniversaries and special moments',
      rating: 4.7,
      reviewCount: 89,
      category: 'Romance',
      includes: ['Mixed Flowers', 'Scented Candle', 'Love Notes', 'Silk Ribbon'],
    },
    {
      id: 'gift-3',
      name: 'Birthday Celebration Box',
      price: 95.00,
      image: '/api/placeholder/400/300',
      description: 'Colorful flowers with birthday treats',
      rating: 4.8,
      reviewCount: 124,
      category: 'Birthday',
      includes: ['Colorful Bouquet', 'Birthday Cake', 'Balloons', 'Party Hat'],
    },
    {
      id: 'gift-4',
      name: 'Get Well Soon Box',
      price: 65.00,
      image: '/api/placeholder/400/300',
      description: 'Uplifting flowers with wellness treats',
      rating: 4.6,
      reviewCount: 67,
      category: 'Wellness',
      includes: ['Bright Flowers', 'Herbal Tea', 'Honey', 'Comfort Card'],
    },
    {
      id: 'gift-5',
      name: 'New Baby Gift Box',
      price: 78.00,
      image: '/api/placeholder/400/300',
      description: 'Delicate flowers for new arrivals',
      rating: 4.9,
      reviewCount: 198,
      category: 'Baby',
      includes: ['Soft Pastel Flowers', 'Baby Blanket', 'Teddy Bear', 'Congratulations Card'],
    },
    {
      id: 'gift-6',
      name: 'Sympathy Comfort Box',
      price: 90.00,
      image: '/api/placeholder/400/300',
      description: 'Thoughtful arrangement for difficult times',
      rating: 4.8,
      reviewCount: 45,
      category: 'Sympathy',
      includes: ['White Lilies', 'Comfort Food', 'Memorial Candle', 'Sympathy Card'],
    },
  ];

  const handleAddToCart = (giftBox: any) => {
    addItem({
      id: giftBox.id,
      name: giftBox.name,
      price: giftBox.price,
      image: giftBox.image,
      type: 'product',
      category: giftBox.category,
    });
    toast({
      title: "Added to Cart",
      description: `${giftBox.name} has been added to your cart.`,
    });
  };

  const handleWishlistToggle = (giftBox: any) => {
    if (isInWishlist(giftBox.id)) {
      removeFromWishlist(giftBox.id);
      toast({
        title: "Removed from Wishlist",
        description: `${giftBox.name} has been removed from your wishlist.`,
      });
    } else {
      addToWishlist({
        id: giftBox.id,
        name: giftBox.name,
        price: giftBox.price,
        image_url: giftBox.image_url,
        description: giftBox.description || '',
      });
      toast({
        title: "Added to Wishlist",
        description: `${giftBox.name} has been added to your wishlist.`,
      });
    }
  };

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {giftBoxes.map((giftBox) => (
            <Card key={giftBox.id} className="group hover:shadow-lg transition-all duration-300">
              <div className="relative overflow-hidden rounded-t-lg">
                <img
                  src={giftBox.image}
                  alt={giftBox.name}
                  className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-4 right-4 h-8 w-8 p-0 bg-background/80 backdrop-blur-sm"
                  onClick={() => handleWishlistToggle(giftBox)}
                >
                  <Heart 
                    className={`h-4 w-4 ${
                      isInWishlist(giftBox.id) 
                        ? 'fill-current text-red-500' 
                        : 'text-muted-foreground'
                    }`} 
                  />
                </Button>
                <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                  <Gift className="w-3 h-3 mr-1" />
                  {giftBox.category}
                </Badge>
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2">{giftBox.name}</h3>
                <p className="text-muted-foreground mb-4">{giftBox.description}</p>
                
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 fill-current text-yellow-400" />
                    <span className="ml-1 text-sm font-medium">{giftBox.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({giftBox.reviewCount} reviews)
                  </span>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium mb-2">What's Included:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {giftBox.includes.map((item, index) => (
                      <li key={index} className="flex items-center">
                        <div className="w-1 h-1 bg-primary rounded-full mr-2" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl font-bold">${giftBox.price}</span>
                  {giftBox.originalPrice && (
                    <span className="text-lg text-muted-foreground line-through">
                      ${giftBox.originalPrice}
                    </span>
                  )}
                  {giftBox.originalPrice && (
                    <Badge variant="destructive" className="ml-auto">
                      Save ${(giftBox.originalPrice - giftBox.price).toFixed(2)}
                    </Badge>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="p-6 pt-0">
                <Button
                  className="w-full"
                  onClick={() => handleAddToCart(giftBox)}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 bg-muted/50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Custom Gift Boxes</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Create a personalized gift box with your choice of flowers, treats, and accessories. 
            Perfect for making someone feel truly special.
          </p>
          <Button size="lg">
            Create Custom Gift Box
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GiftBoxes;