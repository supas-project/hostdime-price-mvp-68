
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, X, RefreshCw } from 'lucide-react';
import { ComponentOption } from '@/types/component';

export interface FilterCriteria {
  search: string;
  category: string[];
  priceRange: [number, number];
  features: string[];
  availability: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface IntelligentFiltersProps {
  items: ComponentOption[];
  onFilterChange: (filteredItems: ComponentOption[], criteria: FilterCriteria) => void;
  className?: string;
}

export function IntelligentFilters({ items, onFilterChange, className }: IntelligentFiltersProps) {
  const [filters, setFilters] = useState<FilterCriteria>({
    search: '',
    category: [],
    priceRange: [0, 10000],
    features: [],
    availability: 'all',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Extract unique values from items for filter options
  const categories = Array.from(new Set(items.map(item => item.type).filter(Boolean)));
  const features = Array.from(new Set(
    items.flatMap(item => item.details || []).filter(Boolean)
  )).slice(0, 10); // Limit to 10 most common features
  
  const maxPrice = Math.max(...items.map(item => item.price || 0));

  // Apply filters
  useEffect(() => {
    let filtered = [...items];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm) ||
        item.description?.toLowerCase().includes(searchTerm) ||
        item.details?.some(detail => detail.toLowerCase().includes(searchTerm))
      );
    }

    // Category filter
    if (filters.category.length > 0) {
      filtered = filtered.filter(item => 
        filters.category.includes(item.type)
      );
    }

    // Price range filter
    filtered = filtered.filter(item => {
      const price = item.price || 0;
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    // Features filter
    if (filters.features.length > 0) {
      filtered = filtered.filter(item =>
        filters.features.every(feature =>
          item.details?.some(detail => 
            detail.toLowerCase().includes(feature.toLowerCase())
          )
        )
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = (a.price || 0) - (b.price || 0);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        default:
          comparison = 0;
      }

      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    // Count active filters
    const activeCount = (
      (filters.search ? 1 : 0) +
      filters.category.length +
      (filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice ? 1 : 0) +
      filters.features.length +
      (filters.availability !== 'all' ? 1 : 0)
    );
    
    setActiveFiltersCount(activeCount);
    onFilterChange(filtered, filters);
  }, [filters, items, maxPrice, onFilterChange]);

  const updateFilter = (key: keyof FilterCriteria, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleCategory = (category: string) => {
    const newCategories = filters.category.includes(category)
      ? filters.category.filter(c => c !== category)
      : [...filters.category, category];
    updateFilter('category', newCategories);
  };

  const toggleFeature = (feature: string) => {
    const newFeatures = filters.features.includes(feature)
      ? filters.features.filter(f => f !== feature)
      : [...filters.features, feature];
    updateFilter('features', newFeatures);
  };

  const clearAllFilters = () => {
    setFilters({
      search: '',
      category: [],
      priceRange: [0, maxPrice],
      features: [],
      availability: 'all',
      sortBy: 'name',
      sortOrder: 'asc'
    });
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros Inteligentes
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            {activeFiltersCount > 0 && (
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                <RefreshCw className="h-3 w-3 mr-1" />
                Limpar
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Ocultar' : 'Expandir'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, descrição ou especificações..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {isExpanded && (
          <>
            {/* Categories */}
            {categories.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Categorias</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {categories.map(category => (
                    <Badge
                      key={category}
                      variant={filters.category.includes(category) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleCategory(category)}
                    >
                      {category}
                      {filters.category.includes(category) && (
                        <X className="h-3 w-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Price Range */}
            <div>
              <Label className="text-sm font-medium">
                Faixa de Preço: R$ {filters.priceRange[0]} - R$ {filters.priceRange[1]}
              </Label>
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
                max={maxPrice}
                step={50}
                className="mt-2"
              />
            </div>

            {/* Features */}
            {features.length > 0 && (
              <div>
                <Label className="text-sm font-medium">Características</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {features.slice(0, 8).map(feature => (
                    <div key={feature} className="flex items-center space-x-2">
                      <Checkbox
                        id={feature}
                        checked={filters.features.includes(feature)}
                        onCheckedChange={() => toggleFeature(feature)}
                      />
                      <Label
                        htmlFor={feature}
                        className="text-xs font-normal cursor-pointer"
                      >
                        {feature}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sort Options */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Ordenar por</Label>
                <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Nome</SelectItem>
                    <SelectItem value="price">Preço</SelectItem>
                    <SelectItem value="type">Categoria</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">Ordem</Label>
                <Select 
                  value={filters.sortOrder} 
                  onValueChange={(value: 'asc' | 'desc') => updateFilter('sortOrder', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Crescente</SelectItem>
                    <SelectItem value="desc">Decrescente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}

        {/* Active Filters Summary */}
        {activeFiltersCount > 0 && (
          <div className="pt-2 border-t">
            <div className="flex flex-wrap gap-1">
              {filters.search && (
                <Badge variant="secondary" className="text-xs">
                  "{filters.search}"
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => updateFilter('search', '')}
                  />
                </Badge>
              )}
              {filters.category.map(cat => (
                <Badge key={cat} variant="secondary" className="text-xs">
                  {cat}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => toggleCategory(cat)}
                  />
                </Badge>
              ))}
              {filters.features.map(feature => (
                <Badge key={feature} variant="secondary" className="text-xs">
                  {feature}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => toggleFeature(feature)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
