
import React from 'react';
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Star, Trophy, Zap, Plus, Check } from "lucide-react";
import { formatCurrency } from "@/utils/number-formatter";
import { PriceCategory, PriceItem } from "@/types/pricing";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TableContentProps {
  category: PriceCategory;
  onDelete?: (itemId: string) => void;
  onEdit?: (item: PriceItem) => void;
  displayMode?: "table" | "card";
  sortOrder?: "asc" | "desc" | null;
  contractDuration?: string;
  isComparisonMode?: boolean;
  onAddToComparison?: (item: PriceItem) => void;
  isItemInComparison?: (itemId: string) => boolean;
  canAddMoreToComparison?: boolean;
}

export function TableContent({
  category,
  onDelete,
  onEdit,
  displayMode = "table",
  sortOrder = null,
  contractDuration = "0",
  isComparisonMode = false,
  onAddToComparison,
  isItemInComparison,
  canAddMoreToComparison = true
}: TableContentProps) {
  // Sort items if needed
  let items = [...category.items];
  
  if (sortOrder === "asc") {
    items = items.sort((a, b) => a.price - b.price);
  } else if (sortOrder === "desc") {
    items = items.sort((a, b) => b.price - a.price);
  }
  
  const getDisplayPrice = (item: PriceItem): number => {
    return typeof item.price === 'number' && !isNaN(item.price) 
      ? item.price 
      : 0;
  };

  const getRecommendationType = (item: PriceItem): { type: 'popular' | 'recommended' | 'best-value' | null, label: string, icon: React.ReactNode } => {
    const tags = item.tags || [];
    
    if (tags.some(tag => tag.toLowerCase().includes('popular'))) {
      return { type: 'popular', label: 'Mais Popular', icon: <Star className="h-3 w-3 fill-current" /> };
    }
    if (tags.some(tag => tag.toLowerCase().includes('recomendado'))) {
      return { type: 'recommended', label: 'Recomendado', icon: <Trophy className="h-3 w-3 fill-current" /> };
    }
    if (tags.some(tag => tag.toLowerCase().includes('melhor') || tag.toLowerCase().includes('value'))) {
      return { type: 'best-value', label: 'Melhor Custo-Benefício', icon: <Zap className="h-3 w-3 fill-current" /> };
    }
    
    return { type: null, label: '', icon: null };
  };

  const handleComparisonClick = (item: PriceItem) => {
    if (onAddToComparison && canAddMoreToComparison) {
      onAddToComparison(item);
    }
  };

  console.log(`[TableContent] Category ${category.id} items:`, 
    items.map(item => `${item.name}: ${item.price} (${typeof item.price})`));

  if (displayMode === "card") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {items.map((item) => {
          const price = getDisplayPrice(item);
          const recommendation = getRecommendationType(item);
          const isRecommended = recommendation.type !== null;
          const inComparison = isItemInComparison?.(item.id);
          
          console.log(`[TableContent] Card Item ${item.id} price:`, price);
          
          return (
            <Card key={item.id} className={cn(
              "group relative overflow-hidden transition-all duration-300",
              "hover:shadow-xl hover:-translate-y-1 transform-gpu",
              isRecommended 
                ? "ring-2 ring-[#f58220] shadow-lg shadow-[#f58220]/20 hover:shadow-[#f58220]/30" 
                : "border border-border hover:border-[#f58220]/50 hover:shadow-lg",
              inComparison && "ring-2 ring-emerald-500 bg-emerald-50/50"
            )}>
              
              {/* Recommendation Badge */}
              {isRecommended && (
                <div className="absolute -top-3 -right-3 z-10">
                  <Badge className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold shadow-lg",
                    "animate-pulse-orange transition-all duration-300 hover:scale-105",
                    recommendation.type === 'popular' ? 'bg-gradient-to-r from-[#f58220] to-[#ff8533] text-white' : '',
                    recommendation.type === 'recommended' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white' : '',
                    recommendation.type === 'best-value' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' : ''
                  )}>
                    {recommendation.icon}
                    {recommendation.label}
                  </Badge>
                </div>
              )}

              {/* Comparison Mode Button */}
              {isComparisonMode && (
                <div className="absolute top-3 left-3 z-10">
                  <Button
                    size="sm"
                    variant={inComparison ? "default" : "secondary"}
                    onClick={() => handleComparisonClick(item)}
                    disabled={!canAddMoreToComparison && !inComparison}
                    className={cn(
                      "h-8 w-8 p-0 transition-all duration-200 hover:scale-110",
                      inComparison 
                        ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md" 
                        : "bg-white/90 hover:bg-[#f58220] hover:text-white border border-border/50"
                    )}
                  >
                    {inComparison ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}
              
              <CardHeader className="pb-4 space-y-3">
                <div className="space-y-2">
                  <h4 className={cn(
                    "text-lg font-bold leading-tight transition-colors duration-200 line-clamp-2",
                    "group-hover:text-[#f58220]",
                    isRecommended ? 'text-[#f58220]' : 'text-foreground'
                  )}>
                    {item.name}
                  </h4>
                  
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {item.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5 bg-muted/50 hover:bg-muted transition-colors">
                          {tag}
                        </Badge>
                      ))}
                      {item.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs px-2 py-0.5 hover:bg-muted/30 transition-colors">
                          +{item.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="px-4 sm:px-6 py-4 space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 transition-colors group-hover:text-foreground">
                  {item.description}
                </p>
                
                {/* Enhanced Price Display */}
                <div className={cn(
                  "relative rounded-xl p-4 text-center transition-all duration-300",
                  "transform-gpu group-hover:scale-105",
                  isRecommended 
                    ? 'bg-gradient-to-br from-[#f58220]/10 via-[#f58220]/5 to-transparent border-2 border-[#f58220]/30' 
                    : 'bg-gradient-to-br from-muted/50 to-muted/20 border border-border group-hover:border-[#f58220]/30'
                )}>
                  {/* Price spotlight effect for recommended items */}
                  {isRecommended && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-[#f58220]/5 to-transparent animate-pulse-orange" />
                  )}
                  
                  <div className="relative z-10">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className={cn(
                        "text-2xl sm:text-3xl font-bold transition-all duration-300",
                        "group-hover:scale-105 transform-gpu",
                        isRecommended 
                          ? 'text-[#f58220] drop-shadow-sm' 
                          : 'text-foreground group-hover:text-[#f58220]'
                      )}>
                        {formatCurrency(price)}
                      </span>
                      <span className={cn(
                        "text-sm font-medium transition-colors duration-300",
                        isRecommended ? 'text-[#f58220]/80' : 'text-muted-foreground group-hover:text-[#f58220]/80'
                      )}>
                        /mês
                      </span>
                    </div>
                    
                    {isRecommended && (
                      <div className="mt-2 animate-fade-in">
                        <div className="text-xs font-medium text-[#f58220] bg-[#f58220]/10 rounded-full px-3 py-1 inline-block transition-all hover:bg-[#f58220]/20">
                          {recommendation.type === 'popular' && '⭐ Escolha Popular'}
                          {recommendation.type === 'recommended' && '🏆 Nossa Recomendação'}
                          {recommendation.type === 'best-value' && '⚡ Melhor Valor'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              
              {(onDelete || onEdit) && (
                <CardFooter className="flex justify-end gap-2 px-4 sm:px-6 py-4 border-t border-border/50 bg-muted/20">
                  {onEdit && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onEdit(item)} 
                      className="h-8 w-8 p-0 hover:bg-[#f58220]/10 hover:text-[#f58220] transition-all duration-200 hover:scale-110"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onDelete(item.id)} 
                      className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive transition-all duration-200 hover:scale-110"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </CardFooter>
              )}
            </Card>
          );
        })}
      </div>
    );
  }

  // Enhanced table display with improved responsiveness
  return (
    <>
      {items.map((item) => {
        const price = getDisplayPrice(item);
        const recommendation = getRecommendationType(item);
        const isRecommended = recommendation.type !== null;
        const inComparison = isItemInComparison?.(item.id);
        
        console.log(`[TableContent] Table Item ${item.id} price:`, price);
        
        return (
          <TableRow key={item.id} className={cn(
            "h-16 transition-all duration-200 group hover:bg-muted/50",
            isRecommended && 'bg-gradient-to-r from-[#f58220]/5 to-transparent border-l-4 border-l-[#f58220] hover:bg-[#f58220]/10',
            inComparison && "bg-emerald-50/50 border-l-4 border-l-emerald-500"
          )}>
            <TableCell className="py-4 px-3 sm:px-6 font-medium align-middle">
              <div className="flex items-center gap-2 sm:gap-3">
                {isComparisonMode && (
                  <Button
                    size="sm"
                    variant={inComparison ? "default" : "ghost"}
                    onClick={() => handleComparisonClick(item)}
                    disabled={!canAddMoreToComparison && !inComparison}
                    className={cn(
                      "h-6 w-6 p-0 transition-all duration-200 hover:scale-110 flex-shrink-0",
                      inComparison 
                        ? "bg-emerald-500 hover:bg-emerald-600 text-white" 
                        : "hover:bg-[#f58220]/10 hover:text-[#f58220]"
                    )}
                  >
                    {inComparison ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Plus className="h-3 w-3" />
                    )}
                  </Button>
                )}
                
                {isRecommended && (
                  <div className={cn(
                    "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold flex-shrink-0 transition-all duration-200 group-hover:scale-110",
                    recommendation.type === 'popular' ? 'bg-[#f58220] text-white' : '',
                    recommendation.type === 'recommended' ? 'bg-emerald-500 text-white' : '',
                    recommendation.type === 'best-value' ? 'bg-blue-500 text-white' : ''
                  )}>
                    {recommendation.icon}
                  </div>
                )}
                
                <div className="space-y-1 min-w-0 flex-1">
                  <div className={cn(
                    "font-semibold transition-colors duration-200 group-hover:text-[#f58220] truncate sm:text-clip",
                    isRecommended ? 'text-[#f58220]' : 'text-foreground'
                  )}>
                    {item.name}
                  </div>
                  {isRecommended && (
                    <Badge variant="outline" className="text-xs hidden sm:inline-flex">
                      {recommendation.label}
                    </Badge>
                  )}
                </div>
              </div>
            </TableCell>
            
            <TableCell className="py-4 px-3 sm:px-6 align-middle max-w-xs hidden md:table-cell">
              <div className="text-sm text-muted-foreground line-clamp-2 group-hover:text-foreground transition-colors">
                {item.description}
              </div>
            </TableCell>
            
            <TableCell className="py-4 px-3 sm:px-6 text-right align-middle">
              <div className="space-y-1">
                <div className={cn(
                  "text-xl sm:text-2xl font-bold transition-all duration-200 group-hover:scale-105 transform-gpu",
                  isRecommended ? 'text-[#f58220]' : 'text-foreground group-hover:text-[#f58220]'
                )}>
                  {formatCurrency(price)}
                </div>
                <div className="text-xs text-muted-foreground">por mês</div>
                {isRecommended && (
                  <div className="text-xs font-medium text-[#f58220] hidden sm:block">
                    {recommendation.type === 'popular' && '⭐ Popular'}
                    {recommendation.type === 'recommended' && '🏆 Top'}
                    {recommendation.type === 'best-value' && '⚡ Valor'}
                  </div>
                )}
              </div>
            </TableCell>
            
            <TableCell className="py-4 px-3 sm:px-6 text-right align-middle">
              <div className="flex justify-end gap-1">
                {onEdit && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 hover:bg-[#f58220]/10 hover:text-[#f58220] transition-all duration-200 hover:scale-110" 
                    onClick={() => onEdit(item)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                )}
                {onDelete && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive transition-all duration-200 hover:scale-110" 
                    onClick={() => onDelete(item.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
}
