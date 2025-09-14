import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Filter, Grid3X3, List } from "lucide-react";
import rosesBouquet from "@/assets/roses-bouquet.jpg";
import whitePeonies from "@/assets/white-peonies.jpg";
import springWildflowers from "@/assets/spring-wildflowers.jpg";

const Marketplace = () => {
  const featuredProducts = [
    {
      id: "1",
      name: "Spring Rose Bouquet",
      price: 89.99,
      originalPrice: 109.99,
      image: rosesBouquet,
      vendor: "Rose Garden Co.",
      rating: 4.8,
      reviewCount: 124,
      category: "Roses",
      isNew: true,
    },
    {
      id: "2",
      name: "Elegant White Peonies",
      price: 124.50,
      image: whitePeonies,
      vendor: "Bloom & Blossom",
      rating: 4.9,
      reviewCount: 89,
      category: "Peonies",
    },
    {
      id: "3",
      name: "Mixed Wildflower Bouquet",
      price: 67.00,
      image: springWildflowers,
      vendor: "Meadow Fresh",
      rating: 4.7,
      reviewCount: 156,
      category: "Mixed",
      isNew: true,
    },
    {
      id: "4",
      name: "Premium Rose Collection",
      price: 149.99,
      originalPrice: 179.99,
      image: rosesBouquet,
      vendor: "Rose Garden Co.",
      rating: 4.9,
      reviewCount: 67,
      category: "Roses",
    },
    {
      id: "5",
      name: "Seasonal Peony Mix",
      price: 98.00,
      image: whitePeonies,
      vendor: "Bloom & Blossom",
      rating: 4.6,
      reviewCount: 43,
      category: "Peonies",
    },
    {
      id: "6",
      name: "Garden Fresh Wildflowers",
      price: 54.99,
      image: springWildflowers,
      vendor: "Meadow Fresh",
      rating: 4.8,
      reviewCount: 92,
      category: "Mixed",
    },
  ];

  const categories = [
    { name: "Roses", count: 24, color: "bg-primary" },
    { name: "Peonies", count: 18, color: "bg-accent" },
    { name: "Mixed Bouquets", count: 32, color: "bg-sage" },
    { name: "Wedding", count: 16, color: "bg-coral" },
    { name: "Seasonal", count: 28, color: "bg-secondary" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Categories Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((category, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow bg-card border-border/50">
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 ${category.color} rounded-full mx-auto mb-3 opacity-20`} />
                  <h3 className="font-semibold text-card-foreground">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.count} items</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Filter and Sort Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="border-border text-foreground">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-sage text-sage-foreground">
                Fresh Today
              </Badge>
              <Badge variant="secondary" className="bg-coral text-coral-foreground">
                Best Sellers
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Featured Products */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Featured Flowers</h2>
            <Button variant="outline" className="border-border text-foreground">
              View All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </section>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-sage hover:text-sage-foreground">
            Load More Products
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Marketplace;