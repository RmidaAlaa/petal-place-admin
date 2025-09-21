import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { productService, Product } from '@/services/productService';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, TrendingUp, X, Mic, MicOff, Filter, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  showSuggestions?: boolean;
  showFilters?: boolean;
  enableVoiceSearch?: boolean;
  onSearch?: (query: string) => void;
}

interface SearchSuggestion {
  id: string;
  type: 'product' | 'category' | 'recent' | 'trending';
  title: string;
  subtitle?: string;
  image?: string;
  price?: number;
  category?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  className, 
  placeholder, 
  showSuggestions = true,
  showFilters = false,
  enableVoiceSearch = false,
  onSearch 
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isListening, setIsListening] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    category: '',
    priceRange: { min: 0, max: 1000 },
    rating: 0,
    inStock: false,
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Mock trending searches (in a real app, this would come from analytics)
  useEffect(() => {
    setTrendingSearches([
      'red roses',
      'wedding bouquet',
      'valentine flowers',
      'birthday flowers',
      'anniversary gift'
    ]);
  }, []);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!showSuggestions) return;

    try {
      setIsLoading(true);
      const products = await productService.searchProducts(searchQuery, 5);

      const productSuggestions: SearchSuggestion[] = products.map(product => ({
        id: product.id,
        type: 'product',
        title: product.name,
        subtitle: product.category,
        image: product.images[0],
        price: product.price,
        category: product.category
      }));

      setSuggestions(productSuggestions);
    } catch (error) {
      console.error('Search error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [showSuggestions]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim().length > 0) {
      debounceRef.current = setTimeout(() => {
        performSearch(query);
      }, 300);
    } else {
      setSuggestions([]);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, performSearch]);

  // Voice search functionality
  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice search is not supported in this browser');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      handleSearch(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const stopVoiceSearch = () => {
    setIsListening(false);
  };

  const handleSearch = (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    // Add to recent searches
    const newRecentSearches = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(newRecentSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));

    // Navigate to search results
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    setIsOpen(false);
    setQuery('');
    
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'product') {
      navigate(`/product/${suggestion.id}`);
    } else if (suggestion.type === 'category') {
      navigate(`/categories?category=${suggestion.title}`);
    } else {
      handleSearch(suggestion.title);
    }
    setIsOpen(false);
    setQuery('');
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const removeRecentSearch = (searchToRemove: string) => {
    const newRecentSearches = recentSearches.filter(s => s !== searchToRemove);
    setRecentSearches(newRecentSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
  };

  const getDisplaySuggestions = () => {
    if (query.trim().length === 0) {
      return [
        ...recentSearches.map(search => ({
          id: `recent-${search}`,
          type: 'recent' as const,
          title: search
        })),
        ...trendingSearches.map(search => ({
          id: `trending-${search}`,
          type: 'trending' as const,
          title: search
        }))
      ];
    }
    return suggestions;
  };

  const displaySuggestions = getDisplaySuggestions();

  return (
    <div className={cn("relative w-full", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder || t('common.search')}
              className="pl-10 pr-20"
            />
            <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              {enableVoiceSearch && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={isListening ? stopVoiceSearch : startVoiceSearch}
                >
                  {isListening ? (
                    <MicOff className="h-3 w-3 text-red-500" />
                  ) : (
                    <Mic className="h-3 w-3" />
                  )}
                </Button>
              )}
              {showFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                  <SlidersHorizontal className="h-3 w-3" />
                </Button>
              )}
              {query && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setQuery('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </PopoverTrigger>
        
        <PopoverContent 
          className="w-[var(--radix-popover-trigger-width)] p-0" 
          align="start"
        >
          {showAdvancedFilters && (
            <div className="p-4 border-b">
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <Select value={searchFilters.category} onValueChange={(value) => 
                    setSearchFilters(prev => ({ ...prev, category: value }))
                  }>
                    <SelectTrigger className="w-full">
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
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={searchFilters.priceRange.min}
                      onChange={(e) => setSearchFilters(prev => ({
                        ...prev,
                        priceRange: { ...prev.priceRange, min: Number(e.target.value) }
                      }))}
                      className="w-20"
                    />
                    <span className="text-muted-foreground">-</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={searchFilters.priceRange.max}
                      onChange={(e) => setSearchFilters(prev => ({
                        ...prev,
                        priceRange: { ...prev.priceRange, max: Number(e.target.value) }
                      }))}
                      className="w-20"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="in-stock"
                    checked={searchFilters.inStock}
                    onChange={(e) => setSearchFilters(prev => ({ ...prev, inStock: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="in-stock" className="text-sm">In Stock Only</Label>
                </div>
              </div>
            </div>
          )}
          
          <Command>
            <CommandList>
              {displaySuggestions.length === 0 && !isLoading ? (
                <CommandEmpty>
                  {query.trim().length === 0 ? 'Start typing to search...' : 'No results found'}
                </CommandEmpty>
              ) : (
                <>
                  {query.trim().length === 0 && recentSearches.length > 0 && (
                    <CommandGroup heading="Recent Searches">
                      {recentSearches.map((search, index) => (
                        <CommandItem
                          key={`recent-${search}`}
                          value={search}
                          onSelect={() => handleSuggestionClick({
                            id: `recent-${search}`,
                            type: 'recent',
                            title: search
                          })}
                          className={cn(
                            "flex items-center justify-between",
                            selectedIndex === index && "bg-accent"
                          )}
                        >
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{search}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeRecentSearch(search);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </CommandItem>
                      ))}
                      <CommandItem onSelect={clearRecentSearches} className="text-muted-foreground">
                        Clear recent searches
                      </CommandItem>
                    </CommandGroup>
                  )}

                  {query.trim().length === 0 && trendingSearches.length > 0 && (
                    <CommandGroup heading="Trending">
                      {trendingSearches.map((search, index) => (
                        <CommandItem
                          key={`trending-${search}`}
                          value={search}
                          onSelect={() => handleSuggestionClick({
                            id: `trending-${search}`,
                            type: 'trending',
                            title: search
                          })}
                          className={cn(
                            "flex items-center space-x-2",
                            selectedIndex === recentSearches.length + index && "bg-accent"
                          )}
                        >
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <span>{search}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}

                  {query.trim().length > 0 && suggestions.length > 0 && (
                    <CommandGroup heading="Products">
                      {suggestions.map((suggestion, index) => (
                        <CommandItem
                          key={suggestion.id}
                          value={suggestion.title}
                          onSelect={() => handleSuggestionClick(suggestion)}
                          className={cn(
                            "flex items-center space-x-3 p-3",
                            selectedIndex === index && "bg-accent"
                          )}
                        >
                          {suggestion.image && (
                            <div className="w-10 h-10 overflow-hidden rounded-md bg-muted flex-shrink-0">
                              <img
                                src={suggestion.image}
                                alt={suggestion.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{suggestion.title}</div>
                            {suggestion.subtitle && (
                              <div className="text-sm text-muted-foreground truncate">
                                {suggestion.subtitle}
                              </div>
                            )}
                            {suggestion.price && (
                              <div className="text-sm font-medium text-primary">
                                {formatPrice(suggestion.price)}
                              </div>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}

                  {isLoading && (
                    <CommandItem disabled>
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <span>Searching...</span>
                      </div>
                    </CommandItem>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SearchBar;
