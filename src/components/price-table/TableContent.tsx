
import React from 'react';
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Star, Trophy, Zap } from "lucide-react";
import { formatCurrency } from "@/utils/number-formatter";
import { PriceCategory, PriceItem } from "@/types/pricing";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TableContentProps {
  category: PriceCategory;
  onDelete?: (itemId: string) => void;
  onEdit?: (item: PriceItem) => void;
  displayMode?: "table" | "card";
  sortOrder?: "asc" | "desc" | null;
  contractDuration?: string;
}

export function TableContent({
  category,
  onDelete,
  onEdit,
  displayMode = "table",
  sortOrder = null,
  contractDuration = "0"
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

  // Enhanced recommendation logic with different types
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

  console.log(`[TableContent] Category ${category.id} items:`, 
    items.map(item => `${item.name}: ${item.price} (${typeof item.price})`));

  if (displayMode === "card") {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          const price = getDisplayPrice(item);
          const recommendation = getRecommendationType(item);
          const isRecommended = recommendation.type !== null;
          
          console.log(`[TableContent] Card Item ${item.id} price:`, price);
          
          return (
            <Card key={item.id} className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
              isRecommended 
                ? 'ring-2 ring-[#f58220] shadow-lg shadow-[#f58220]/20 hover:shadow-[#f58220]/30' 
                : 'border border-border hover:border-[#f58220]/50 hover:shadow-lg'
            }`}>
              
              {/* Recommendation Badge */}
              {isRecommended && (
                <div className="absolute -top-3 -right-3 z-10">
                  <Badge className={`
                    flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold shadow-lg
                    ${recommendation.type === 'popular' ? 'bg-gradient-to-r from-[#f58220] to-[#ff8533] text-white' : ''}
                    ${recommendation.type === 'recommended' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white' : ''}
                    ${recommendation.type === 'best-value' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' : ''}
                    animate-pulse-orange
                  `}>
                    {recommendation.icon}
                    {recommendation.label}
                  </Badge>
                </div>
              )}
              
              <CardHeader className="pb-4 space-y-3">
                <div className="space-y-2">
                  <h4 className={`text-lg font-bold leading-tight transition-colors duration-200 ${
                    isRecommended ? 'text-[#f58220]' : 'text-foreground'
                  }`}>
                    {item.name}
                  </h4>
                  
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {item.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5 bg-muted/50">
                          {tag}
                        </Badge>
                      ))}
                      {item.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs px-2 py-0.5">
                          +{item.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="px-6 py-4 space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {item.description}
                </p>
                
                {/* Enhanced Price Display */}
                <div className={`relative rounded-xl p-4 text-center transition-all duration-300 ${
                  isRecommended 
                    ? 'bg-gradient-to-br from-[#f58220]/10 via-[#f58220]/5 to-transparent border-2 border-[#f58220]/30' 
                    : 'bg-gradient-to-br from-muted/50 to-muted/20 border border-border'
                }`}>
                  {/* Price spotlight effect for recommended items */}
                  {isRecommended && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-[#f58220]/5 to-transparent animate-pulse-orange" />
                  )}
                  
                  <div className="relative z-10">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className={`text-3xl font-bold transition-all duration-300 ${
                        isRecommended 
                          ? 'text-[#f58220] drop-shadow-sm' 
                          : 'text-foreground'
                      }`}>
                        {formatCurrency(price)}
                      </span>
                      <span className={`text-sm font-medium ${
                        isRecommended ? 'text-[#f58220]/80' : 'text-muted-foreground'
                      }`}>
                        /mês
                      </span>
                    </div>
                    
                    {isRecommended && (
                      <div className="mt-2">
                        <div className="text-xs font-medium text-[#f58220] bg-[#f58220]/10 rounded-full px-3 py-1 inline-block">
                          {recommendation.type === 'popular' && '⭐ Escolha Popular'}
                          {recommendation.type === 'recommended' && '🏆 Nossa Recomendação'}
                          {recommendation.type === 'best-value' && '⚡ Melhor Valor'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              
              {onDelete || onEdit ? (
                <CardFooter className="flex justify-end gap-2 px-6 py-4 border-t border-border/50 bg-muted/20">
                  {onEdit && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onEdit(item)} 
                      className="h-8 w-8 p-0 hover:bg-[#f58220]/10 hover:text-[#f58220] transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onDelete(item.id)} 
                      className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </CardFooter>
              ) : null}
            </Card>
          );
        })}
      </div>
    );
  }

  // Enhanced table display
  return (
    <>
      {items.map((item) => {
        const price = getDisplayPrice(item);
        const recommendation = getRecommendationType(item);
        const isRecommended = recommendation.type !== null;
        
        console.log(`[TableContent] Table Item ${item.id} price:`, price);
        
        return (
          <TableRow key={item.id} className={`h-16 transition-all duration-200 ${
            isRecommended 
              ? 'bg-gradient-to-r from-[#f58220]/5 to-transparent border-l-4 border-l-[#f58220] hover:bg-[#f58220]/10' 
              : 'hover:bg-muted/50'
          }`}>
            <TableCell className="py-4 px-6 font-medium align-middle">
              <div className="flex items-center gap-3">
                {isRecommended && (
                  <div className={`
                    flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold
                    ${recommendation.type === 'popular' ? 'bg-[#f58220] text-white' : ''}
                    ${recommendation.type === 'recommended' ? 'bg-emerald-500 text-white' : ''}
                    ${recommendation.type === 'best-value' ? 'bg-blue-500 text-white' : ''}
                  `}>
                    {recommendation.icon}
                  </div>
                )}
                <div className="space-y-1">
                  <div className={`font-semibold ${isRecommended ? 'text-[#f58220]' : 'text-foreground'}`}>
                    {item.name}
                  </div>
                  {isRecommended && (
                    <Badge variant="outline" className="text-xs">
                      {recommendation.label}
                    </Badge>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell className="py-4 px-6 align-middle max-w-xs">
              <div className="text-sm text-muted-foreground line-clamp-2">
                {item.description}
              </div>
            </TableCell>
            <TableCell className="py-4 px-6 text-right align-middle">
              <div className="space-y-1">
                <div className={`text-2xl font-bold transition-colors duration-200 ${
                  isRecommended ? 'text-[#f58220]' : 'text-foreground'
                }`}>
                  {formatCurrency(price)}
                </div>
                <div className="text-xs text-muted-foreground">por mês</div>
                {isRecommended && (
                  <div className="text-xs font-medium text-[#f58220]">
                    {recommendation.type === 'popular' && '⭐ Popular'}
                    {recommendation.type === 'recommended' && '🏆 Top'}
                    {recommendation.type === 'best-value' && '⚡ Valor'}
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell className="py-4 px-6 text-right align-middle">
              <div className="flex justify-end gap-1">
                {onEdit && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 hover:bg-[#f58220]/10 hover:text-[#f58220] transition-colors" 
                    onClick={() => onEdit(item)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                )}
                {onDelete && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors" 
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
