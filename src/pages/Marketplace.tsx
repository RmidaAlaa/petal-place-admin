import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import ProductCard from "@/components/ProductCard";
import ProductFilters, { FilterOptions } from "@/components/ProductFilters";
import TopHighlights from "@/components/TopHighlights";
import GeolocationNotice from "@/components/GeolocationNotice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Grid3X3, List } from "lucide-react";
import rosesBouquet from "@/assets/roses-bouquet.jpg";
import whitePeonies from "@/assets/white-peonies.jpg";
import springWildflowers from "@/assets/spring-wildflowers.jpg";

const Marketplace = () => {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    categories: [],
    priceRange: [0, 500],
    sortBy: 'name',
    inStock: false,
    isNew: false,
    rating: 0,
  });

  // Handle search from URL parameters
  useEffect(() => {
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      setFilters(prev => ({ ...prev, search: searchQuery }));
    }
  }, [searchParams]);
  const featuredProducts = [
    {
      id: "1",
      name: "Natural Roses (جوري)",
      price: 8.00,
      image: rosesBouquet,
      vendor: "Roses Garden",
      rating: 4.9,
      reviewCount: 234,
      category: "Natural Roses",
      isNew: true,
      description: "Available in Red, White, Pink, Fuchsia, Purple, Yellow, Orange"
    },
    {
      id: "2",
      name: "Baby Roses (بيبي جوري)",
      price: 12.00,
      image: whitePeonies,
      vendor: "Roses Garden",
      rating: 4.8,
      reviewCount: 189,
      category: "Natural Roses",
      description: "Available in Red, White, Pink, Fuchsia, Purple, Yellow, Orange"
    },
    {
      id: "3",
      name: "Lily Arrangement (زنبق)",
      price: 17.00,
      image: springWildflowers,
      vendor: "Roses Garden",
      rating: 4.7,
      reviewCount: 156,
      category: "Premium Flowers",
      isNew: true,
    },
    {
      id: "4",
      name: "Happiness Gift Box",
      price: 45.00,
      originalPrice: 55.00,
      image: rosesBouquet,
      vendor: "Roses Garden",
      rating: 4.9,
      reviewCount: 67,
      category: "Gift Boxes",
    },
    {
      id: "5",
      name: "Wedding Bouquet Package",
      price: 180.00,
      image: whitePeonies,
      vendor: "Roses Garden",
      rating: 5.0,
      reviewCount: 43,
      category: "Wedding",
    },
    {
      id: "6",
      name: "Birthday Special Arrangement",
      price: 65.00,
      image: springWildflowers,
      vendor: "Roses Garden",
      rating: 4.8,
      reviewCount: 92,
      category: "Occasions",
    },
  ];

  const categories = [
    { name: "Natural Roses", count: 15, color: "bg-primary", arabic: "الورد الطبيعي" },
    { name: "Gift Boxes", count: 12, color: "bg-accent", arabic: "بوكسات السعادة" },
    { name: "Wedding Services", count: 8, color: "bg-sage", arabic: "كوش الأفراح" },
    { name: "Bridal Bouquets", count: 6, color: "bg-coral", arabic: "مسكات العروس" },
    { name: "Special Occasions", count: 20, color: "bg-secondary", arabic: "المناسبات" },
    { name: "Premium Flowers", count: 8, color: "bg-accent", arabic: "الورود الفاخرة" },
    { name: "Wedding", count: 5, color: "bg-sage", arabic: "الأعراس" },
    { name: "Occasions", count: 10, color: "bg-coral", arabic: "المناسبات" },
  ];

  const filteredProducts = useMemo(() => {
    let result = [...featuredProducts];

    // Search filter
    if (filters.search) {
      result = result.filter(product =>
        product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.category.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      result = result.filter(product =>
        filters.categories.includes(product.category)
      );
    }

    // Price range filter
    result = result.filter(product =>
      product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    );

    // Stock filter
    if (filters.inStock) {
      // Simulate stock check (in real app this would come from backend)
      result = result.filter(() => Math.random() > 0.2);
    }

    // New items filter
    if (filters.isNew) {
      result = result.filter(product => product.isNew);
    }

    // Rating filter
    if (filters.rating > 0) {
      result = result.filter(product => product.rating >= filters.rating);
    }

    // Sort
    switch (filters.sortBy) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case 'popular':
        result.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      default:
        break;
    }

    return result;
  }, [featuredProducts, filters]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <GeolocationNotice />
      <TopHighlights />
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
                  <p className="text-xs text-muted-foreground mb-1">{category.arabic}</p>
                  <p className="text-sm text-muted-foreground">{category.count} items</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Filter and Search Bar */}
        <div className="mb-8">
          <ProductFilters
            filters={filters}
            onFiltersChange={setFilters}
            categories={categories.map(c => c.name)}
          />
        </div>

        {/* Results Summary and View Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredProducts.length} of {featuredProducts.length} products
            </p>
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
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              {filters.search ? `Search Results for "${filters.search}"` : 'Featured Flowers'}
            </h2>
            {filteredProducts.length > 0 && (
              <Button variant="outline" className="border-border text-foreground">
                View All ({filteredProducts.length})
              </Button>
            )}
          </div>
          
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground mb-4">No products match your current filters</p>
              <Button 
                variant="outline" 
                onClick={() => setFilters({
                  search: '',
                  categories: [],
                  priceRange: [0, 500],
                  sortBy: 'name',
                  inStock: false,
                  isNew: false,
                  rating: 0,
                })}
                className="border-border text-foreground"
              >
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          )}
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