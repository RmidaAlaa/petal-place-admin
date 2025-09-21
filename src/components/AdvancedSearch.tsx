import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { 
  Search, 
  Filter, 
  X, 
  Star, 
  TrendingUp,
  Clock,
  History,
  Trash2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import apiService from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface SearchFilters {
  q: string;
  category: string;
  min_price: number;
  max_price: number;
  rating: number;
  in_stock: boolean;
  featured: boolean;
  vendor: string;
  sort_by: string;
  sort_order: string;
}

interface SearchResult {
  products: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters: SearchFilters;
}

interface AdvancedSearchProps {
  onResults: (results: SearchResult) => void;
  onLoading: (loading: boolean) => void;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ onResults, onLoading }) => {
  const { state: authState } = useAuth();
  const { toast } = useToast();
  const [filters, setFilters] = useState<SearchFilters>({
    q: '',
    category: '',
    min_price: 0,
    max_price: 1000,
    rating: 0,
    in_stock: false,
    featured: false,
    vendor: '',
    sort_by: 'relevance',
    sort_order: 'desc'
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (authState.isAuthenticated) {
      loadSearchHistory();
    }
  }, [authState.isAuthenticated]);

  const loadSuggestions = useCallback(async () => {
    try {
      const data = await apiService.getSearchSuggestions(filters.q) as { suggestions: { text: string }[] };
      setSuggestions(data.suggestions.map((s: any) => s.text));
      setShowSuggestions(true);
    } catch (error) {
      // Silently fail for suggestions
    }
  }, [filters.q]);

  useEffect(() => {
    if (filters.q.length >= 2) {
      loadSuggestions();
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [filters.q, loadSuggestions]);

  const loadSearchHistory = async () => {
    try {
      const data = await apiService.getSearchHistory();
      setSearchHistory(data as any[]);
    } catch (error) {
      // Silently fail for history
    }
  };

  const handleSearch = async (page = 1) => {
    try {
      setIsSearching(true);
      onLoading(true);
      
      const searchParams = {
        ...filters,
        page,
        limit: 20
      };
      
      const data = await apiService.advancedSearch(searchParams);
      onResults(data as SearchResult);
      
      // Save to search history if authenticated
      if (authState.isAuthenticated && filters.q.trim()) {
        loadSearchHistory();
      }
    } catch (error: any) {
      toast({
        title: 'Search Error',
        description: error.message || 'Failed to perform search',
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
      onLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setFilters(prev => ({ ...prev, q: suggestion }));
    setShowSuggestions(false);
    handleSearch();
  };

  const handleHistoryClick = (historyItem: any) => {
    setFilters(prev => ({
      ...prev,
      q: historyItem.search_query,
      ...JSON.parse(historyItem.filters || '{}')
    }));
    handleSearch();
  };

  const clearFilters = () => {
    setFilters({
      q: '',
      category: '',
      min_price: 0,
      max_price: 1000,
      rating: 0,
      in_stock: false,
      featured: false,
      vendor: '',
      sort_by: 'relevance',
      sort_order: 'desc'
    });
  };

  const clearSearchHistory = async () => {
    try {
      await apiService.clearSearchHistory();
      setSearchHistory([]);
      toast({
        title: 'History Cleared',
        description: 'Search history has been cleared',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to clear search history',
        variant: 'destructive',
      });
    }
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== 0 && value !== false && value !== 'relevance' && value !== 'desc'
  );

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                value={filters.q}
                onChange={(e) => setFilters(prev => ({ ...prev, q: e.target.value }))}
                placeholder="Search for flowers, bouquets, or gifts..."
                className="pr-10"
                onFocus={() => setShowSuggestions(filters.q.length >= 2)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
              
              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-md shadow-lg z-10 mt-1">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <Button onClick={() => handleSearch()} disabled={isSearching}>
              {isSearching ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search History */}
      {authState.isAuthenticated && searchHistory.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Recent Searches
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearSearchHistory}
                className="text-xs"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {searchHistory.slice(0, 5).map((item, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleHistoryClick(item)}
                  className="text-xs"
                >
                  {item.search_query}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advanced Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </span>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="h-3 w-3 mr-1" />
                  Clear All
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select 
                value={filters.category} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  <SelectItem value="roses">Roses</SelectItem>
                  <SelectItem value="bouquets">Bouquets</SelectItem>
                  <SelectItem value="plants">Plants</SelectItem>
                  <SelectItem value="gifts">Gifts</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <Label>Price Range: {filters.min_price} - {filters.max_price} SAR</Label>
              <div className="px-3">
                <Slider
                  value={[filters.min_price, filters.max_price]}
                  onValueChange={([min, max]) => setFilters(prev => ({ 
                    ...prev, 
                    min_price: min, 
                    max_price: max 
                  }))}
                  max={1000}
                  step={10}
                  className="w-full"
                />
              </div>
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <Label>Minimum Rating</Label>
              <Select 
                value={filters.rating.toString()} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, rating: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any Rating</SelectItem>
                  <SelectItem value="1">1+ Stars</SelectItem>
                  <SelectItem value="2">2+ Stars</SelectItem>
                  <SelectItem value="3">3+ Stars</SelectItem>
                  <SelectItem value="4">4+ Stars</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Vendor */}
            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor</Label>
              <Input
                id="vendor"
                value={filters.vendor}
                onChange={(e) => setFilters(prev => ({ ...prev, vendor: e.target.value }))}
                placeholder="Search by vendor name"
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="in_stock"
                  checked={filters.in_stock}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, in_stock: !!checked }))}
                />
                <Label htmlFor="in_stock">In Stock Only</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={filters.featured}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, featured: !!checked }))}
                />
                <Label htmlFor="featured">Featured Products</Label>
              </div>
            </div>

            {/* Sort Options */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sort By</Label>
                <Select 
                  value={filters.sort_by} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, sort_by: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="popular">Popular</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Order</Label>
                <Select 
                  value={filters.sort_order} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, sort_order: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="space-y-2">
                <Label>Active Filters:</Label>
                <div className="flex flex-wrap gap-2">
                  {filters.category && (
                    <Badge variant="secondary">
                      Category: {filters.category}
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => setFilters(prev => ({ ...prev, category: '' }))}
                      />
                    </Badge>
                  )}
                  {filters.rating > 0 && (
                    <Badge variant="secondary">
                      <Star className="h-3 w-3 mr-1" />
                      {filters.rating}+ Stars
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => setFilters(prev => ({ ...prev, rating: 0 }))}
                      />
                    </Badge>
                  )}
                  {filters.in_stock && (
                    <Badge variant="secondary">
                      In Stock
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => setFilters(prev => ({ ...prev, in_stock: false }))}
                      />
                    </Badge>
                  )}
                  {filters.featured && (
                    <Badge variant="secondary">
                      Featured
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => setFilters(prev => ({ ...prev, featured: false }))}
                      />
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedSearch;
