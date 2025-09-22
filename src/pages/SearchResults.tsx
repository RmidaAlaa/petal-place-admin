import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { productService, Product } from '@/services/productService';
import ProductCard from '@/components/ProductCard';
import SearchBar from '@/components/SearchBar';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Grid, 
  List, 
  SortAsc, 
  SortDesc,
  X,
  Star,
  Clock,
  TrendingUp
} from 'lucide-react';

interface SearchFilters {
  category: string;
  priceRange: { min: number; max: number };
  rating: number;
  inStock: boolean;
  sortBy: 'relevance' | 'price-low' | 'price-high' | 'rating' | 'newest';
}

const SearchResults: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    category: '',
    priceRange: { min: 0, max: 1000 },
    rating: 0,
    inStock: false,
    sortBy: 'relevance',
  });

  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query, filters, currentPage]);

  useEffect(() => {
    // Load recent searches
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const performSearch = async () => {
    if (!query.trim()) return;

    try {
      setIsLoading(true);
      const results = await productService.searchProducts(query, 20, {
        category: filters.category,
        priceRange: filters.priceRange,
        rating: filters.rating,
        sortBy: filters.sortBy,
      } as any);
      
      setProducts(results);
      setTotalResults(results.length);
    } catch (error) {
      console.error('Search error:', error);
      setProducts([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setSearchParams({ q: searchQuery });
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      priceRange: { min: 0, max: 1000 },
      rating: 0,
      inStock: false,
      sortBy: 'relevance',
    });
  };

  const getFilteredProducts = () => {
    let filtered = [...products];

    if (filters.category) {
      filtered = filtered.filter(p => p.category.toLowerCase().includes(filters.category.toLowerCase()));
    }

    if (filters.priceRange.min > 0 || filters.priceRange.max < 1000) {
      filtered = filtered.filter(p => 
        p.price >= filters.priceRange.min && p.price <= filters.priceRange.max
      );
    }

    if (filters.rating > 0) {
      filtered = filtered.filter(p => p.rating >= filters.rating);
    }

    if (filters.inStock) {
      filtered = filtered.filter(p => p.stock_quantity > 0);
    }

    return filtered;
  };

  const filteredProducts = getFilteredProducts();

  const getSearchSuggestions = () => {
    // Mock suggestions based on query
    const suggestions = [
      'red roses',
      'wedding bouquet',
      'valentine flowers',
      'birthday flowers',
      'anniversary gift',
      'white roses',
      'mixed bouquet',
      'rose arrangement',
    ];

    return suggestions.filter(s => 
      s.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Searching...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Search Results for "{query}"
              </h1>
              <p className="text-muted-foreground">
                {totalResults} products found
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl">
            <SearchBar
              placeholder="Search for products..."
              onSearch={handleSearch}
              showSuggestions={true}
              showFilters={true}
              enableVoiceSearch={true}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Filters</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-xs"
                  >
                    Clear All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <Select
                    value={filters.category}
                    onValueChange={(value) => handleFilterChange({ category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      <SelectItem value="roses">Roses</SelectItem>
                      <SelectItem value="bouquets">Bouquets</SelectItem>
                      <SelectItem value="arrangements">Arrangements</SelectItem>
                      <SelectItem value="gift-boxes">Gift Boxes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Price Range</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={filters.priceRange.min}
                        onChange={(e) => handleFilterChange({
                          priceRange: { ...filters.priceRange, min: Number(e.target.value) }
                        })}
                      />
                      <span className="text-muted-foreground">-</span>
                      <Input
                        type="number"
                        placeholder="Max"
                        value={filters.priceRange.max}
                        onChange={(e) => handleFilterChange({
                          priceRange: { ...filters.priceRange, max: Number(e.target.value) }
                        })}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Minimum Rating</Label>
                  <Select
                    value={filters.rating.toString()}
                    onValueChange={(value) => handleFilterChange({ rating: Number(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any Rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Any Rating</SelectItem>
                      <SelectItem value="4">4+ Stars</SelectItem>
                      <SelectItem value="3">3+ Stars</SelectItem>
                      <SelectItem value="2">2+ Stars</SelectItem>
                      <SelectItem value="1">1+ Stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="in-stock"
                    checked={filters.inStock}
                    onChange={(e) => handleFilterChange({ inStock: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="in-stock" className="text-sm">In Stock Only</Label>
                </div>

                <div>
                  <Label className="text-sm font-medium">Sort By</Label>
                  <Select
                    value={filters.sortBy}
                    onValueChange={(value: any) => handleFilterChange({ sortBy: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="newest">Newest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No products found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search terms or filters
                  </p>
                  <Button onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Results Header */}
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredProducts.length} of {totalResults} products
                  </p>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">View:</span>
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Products Grid/List */}
                <div className={
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                    : 'space-y-4'
                }>
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      price={product.price}
                      originalPrice={product.original_price}
                      image={product.images[0]}
                      vendor={product.vendor}
                      rating={product.rating}
                      reviewCount={product.review_count}
                      category={product.category}
                      isNew={product.is_new}
                      description={product.description}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalResults > 20 && (
                  <div className="flex justify-center mt-8">
                    <div className="flex space-x-2">
                      {Array.from({ length: Math.ceil(totalResults / 20) }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
