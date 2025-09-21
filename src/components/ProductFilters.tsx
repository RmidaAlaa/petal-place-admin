import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Filter, Search, X } from 'lucide-react';

export interface FilterOptions {
  search: string;
  categories: string[];
  priceRange: [number, number];
  sortBy: string;
  inStock: boolean;
  isNew: boolean;
  rating: number;
}

interface ProductFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  categories: string[];
}

const ProductFilters = ({ filters, onFiltersChange, categories }: ProductFiltersProps) => {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);

  const resetFilters = () => {
    const defaultFilters: FilterOptions = {
      search: '',
      categories: [],
      priceRange: [0, 500],
      sortBy: 'name',
      inStock: false,
      isNew: false,
      rating: 0,
    };
    setLocalFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const updateFilter = <K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const toggleCategory = (category: string) => {
    const newCategories = localFilters.categories.includes(category)
      ? localFilters.categories.filter(c => c !== category)
      : [...localFilters.categories, category];
    updateFilter('categories', newCategories);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilters.search) count++;
    if (localFilters.categories.length > 0) count++;
    if (localFilters.priceRange[0] > 0 || localFilters.priceRange[1] < 500) count++;
    if (localFilters.inStock) count++;
    if (localFilters.isNew) count++;
    if (localFilters.rating > 0) count++;
    return count;
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Search Bar */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search flowers, bouquets, occasions..."
          value={localFilters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="pl-10 border-border"
        />
      </div>

      {/* Quick Filters */}
      <div className="flex items-center gap-2">
        <Button
          variant={localFilters.inStock ? "default" : "outline"}
          size="sm"
          onClick={() => updateFilter('inStock', !localFilters.inStock)}
          className="border-border"
        >
          In Stock
        </Button>
        <Button
          variant={localFilters.isNew ? "default" : "outline"}
          size="sm"
          onClick={() => updateFilter('isNew', !localFilters.isNew)}
          className="border-border"
        >
          New Arrivals
        </Button>

        {/* Sort Dropdown */}
        <Select value={localFilters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
          <SelectTrigger className="w-[140px] border-border">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name A-Z</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
          </SelectContent>
        </Select>

        {/* Advanced Filters Sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="border-border relative">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {getActiveFilterCount() > 0 && (
                <Badge 
                  variant="secondary" 
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary text-primary-foreground text-xs"
                >
                  {getActiveFilterCount()}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md bg-background border-border">
            <SheetHeader>
              <SheetTitle className="text-foreground">Filter Products</SheetTitle>
              <SheetDescription className="text-muted-foreground">
                Refine your search to find exactly what you're looking for
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 py-6">
              {/* Categories */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">Categories</Label>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={category}
                        checked={localFilters.categories.includes(category)}
                        onCheckedChange={() => toggleCategory(category)}
                      />
                      <Label htmlFor={category} className="text-sm text-card-foreground cursor-pointer">
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">Price Range</Label>
                <div className="px-2">
                  <Slider
                    value={localFilters.priceRange}
                    onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
                    min={0}
                    max={500}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>{localFilters.priceRange[0]} SAR</span>
                    <span>{localFilters.priceRange[1]} SAR</span>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">Minimum Rating</Label>
                <Select 
                  value={localFilters.rating.toString()} 
                  onValueChange={(value) => updateFilter('rating', parseInt(value))}
                >
                  <SelectTrigger className="border-border">
                    <SelectValue placeholder="Any rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Any Rating</SelectItem>
                    <SelectItem value="4">4 Stars & Up</SelectItem>
                    <SelectItem value="4.5">4.5 Stars & Up</SelectItem>
                    <SelectItem value="5">5 Stars Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Active Filters */}
              {getActiveFilterCount() > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-foreground">Active Filters</Label>
                  <div className="flex flex-wrap gap-2">
                    {localFilters.search && (
                      <Badge variant="secondary" className="flex items-center gap-1 bg-sage text-sage-foreground">
                        Search: {localFilters.search}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => updateFilter('search', '')}
                        />
                      </Badge>
                    )}
                    {localFilters.categories.map(category => (
                      <Badge key={category} variant="secondary" className="flex items-center gap-1 bg-coral text-coral-foreground">
                        {category}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => toggleCategory(category)}
                        />
                      </Badge>
                    ))}
                    {localFilters.inStock && (
                      <Badge variant="secondary" className="flex items-center gap-1 bg-primary text-primary-foreground">
                        In Stock
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => updateFilter('inStock', false)}
                        />
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Button onClick={resetFilters} variant="outline" className="w-full border-border text-foreground">
                Reset All Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default ProductFilters;