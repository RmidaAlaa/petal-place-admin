import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import ProductCard from "@/components/ProductCard";
import ProductFilters, { FilterOptions } from "@/components/ProductFilters";
import TopHighlights from "@/components/TopHighlights";
import GeolocationNotice from "@/components/GeolocationNotice";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ExternalLink, Heart, Sparkles, Gift, Flower, Home, Building, Baby, Mail, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Grid3X3, List } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import rosesBouquet from "@/assets/roses-bouquet.jpg";
import whitePeonies from "@/assets/white-peonies.jpg";
import springWildflowers from "@/assets/spring-wildflowers.jpg";
import heroImage from "@/assets/hero-flowers.jpg";

const Marketplace = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
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

  const partners = [
    {
      id: "1",
      name: "Premium Florists Co.",
      name_ar: "شركة الزهور الفاخرة",
      description: "Specializing in premium floral arrangements for all occasions",
      logo_url: "/placeholder.svg",
      website_url: "https://example.com",
      contact_email: "info@premiumflorists.com",
      contact_phone: "+966501234567",
      is_active: true,
    },
    {
      id: "2",
      name: "Wedding Flowers Plus",
      name_ar: "زهور الأعراس بلس",
      description: "Your trusted partner for wedding and event floral services",
      logo_url: "/placeholder.svg",
      website_url: "https://example.com",
      contact_email: "contact@weddingflowers.com",
      contact_phone: "+966507654321",
      is_active: true,
    },
    {
      id: "3",
      name: "Fresh Blooms Daily",
      name_ar: "زهور طازجة يومياً",
      description: "Daily fresh flowers delivered to your doorstep",
      logo_url: "/placeholder.svg",
      website_url: "https://example.com",
      contact_email: "orders@freshblooms.com",
      contact_phone: "+966509876543",
      is_active: true,
    },
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

    // Stock filter - products with stock > 0
    if (filters.inStock) {
      result = result.filter(product => (product as any).stock_quantity > 0);
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
      <div className="relative z-10">
        <Navigation />
        <GeolocationNotice />
        <TopHighlights />
        <HeroSection />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Offers & Discounts Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center">
            <Sparkles className="h-6 w-6 mr-2 text-primary" />
            Special Offers & Discounts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-destructive text-destructive-foreground">50% OFF</Badge>
                  <Heart className="h-5 w-5 text-destructive" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Valentine's Day Special</h3>
                <p className="text-muted-foreground mb-4">Red roses and romantic bouquets at half price</p>
                <Button className="w-full">Shop Valentine's Deals</Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-secondary/40 to-secondary/20 border-secondary hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-sage text-sage-foreground">Buy 2 Get 1 Free</Badge>
                  <Gift className="h-5 w-5 text-sage" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Mix & Match Bouquets</h3>
                <p className="text-muted-foreground mb-4">Create your perfect combination with our bundle deals</p>
                <Button variant="outline" className="w-full">View Bundles</Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-accent text-accent-foreground">Free Delivery</Badge>
                  <Flower className="h-5 w-5 text-accent" />
                </div>
                <h3 className="text-lg font-semibold mb-2">New Customer Welcome</h3>
                <p className="text-muted-foreground mb-4">Free delivery on your first order over {formatPrice(50)}</p>
                <Button variant="outline" className="w-full">Sign Up Now</Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Services Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center">
            <Building className="h-6 w-6 mr-2 text-primary" />
            Our Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Wedding Hall Floral Design</h3>
                <p className="text-muted-foreground mb-4">Complete floral arrangements for your special day, from ceremony to reception</p>
                <Button variant="outline" className="w-full">Learn More</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 transition-colors">
                  <Baby className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-lg font-semibold mb-2">New Baby Arrival Decoration</h3>
                <p className="text-muted-foreground mb-4">Celebrate new life with beautiful floral decorations and gift arrangements</p>
                <Button variant="outline" className="w-full">Learn More</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-sage/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-sage/30 transition-colors">
                  <Building className="h-8 w-8 text-sage" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Work/Office Floral Design</h3>
                <p className="text-muted-foreground mb-4">Professional floral arrangements to brighten up your workspace</p>
                <Button variant="outline" className="w-full">Learn More</Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Product Trends Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center">
            <Sparkles className="h-6 w-6 mr-2 text-primary" />
            Product Trends
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { label: 'Red Roses', search: 'Red Roses', tag: 'Trending', icon: Flower },
              { label: "Valentine's Gifts", search: "Valentine's", tag: 'Popular', icon: Heart },
              { label: 'Gift Boxes', search: 'Gift Boxes', tag: 'Best Seller', icon: Gift },
              { label: 'Sunflowers', search: 'Sunflowers', tag: 'Seasonal', icon: Flower },
              { label: 'Mixed Bouquets', search: 'Mixed', tag: 'Trending', icon: Flower },
              { label: 'Blue Hydrangeas', search: 'Hydrangeas', tag: 'New', icon: Flower },
            ].map((item) => (
              <Card
                key={item.label}
                className="hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => setFilters(prev => ({ ...prev, search: item.search }))}
              >
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-primary/20 transition-colors">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="font-medium text-sm">{item.label}</h4>
                  <p className="text-xs text-muted-foreground">{item.tag}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Categories Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">{t('common.shopByCategory')}</h2>
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

        {/* Partners Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Our Trusted Partners</h2>
              <p className="text-muted-foreground">Quality partners providing exceptional floral services</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/partners')}>
              View All Partners
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.slice(0, 6).map((partner) => (
              <Card key={partner.id} className="bg-card border-border/50 hover:shadow-lg transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {partner.logo_url ? (
                        <img
                          src={partner.logo_url}
                          alt={partner.name}
                          className="w-12 h-12 rounded-lg object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                          <span className="text-primary font-semibold text-lg">
                            {partner.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                          {partner.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{partner.name_ar}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      Active
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {partner.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    {partner.contact_email && (
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{partner.contact_email}</span>
                      </div>
                    )}
                    {partner.contact_phone && (
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{partner.contact_phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    {partner.website_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-border hover:bg-primary hover:text-primary-foreground"
                        onClick={() => window.open(partner.website_url, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Visit
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 hover:bg-muted"
                      onClick={() => navigate('/partners')}
                    >
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {partners.length > 6 && (
            <div className="text-center mt-6">
              <Button variant="outline" onClick={() => navigate('/partners')}>
                View All {partners.length} Partners
              </Button>
            </div>
          )}
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
                {t('common.freshToday')}
              </Badge>
              <Badge variant="secondary" className="bg-coral text-coral-foreground">
                {t('common.bestSellers')}
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
              {filters.search ? `${t('common.searchResults')} "${filters.search}"` : t('common.featuredFlowers')}
            </h2>
            {filteredProducts.length > 0 && (
              <Button variant="outline" className="border-border text-foreground">
                {t('common.viewAll')} ({filteredProducts.length})
              </Button>
            )}
          </div>
          
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground mb-4">{t('common.noResults')}</p>
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
                {t('common.clearFilters')}
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
            {t('common.loadMore')}
          </Button>
        </div>
      </main>
      <Footer />
      </div>
    </div>
  );
};

export default Marketplace;