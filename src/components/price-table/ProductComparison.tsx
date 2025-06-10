
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Scale, TrendingUp, Award } from "lucide-react";
import { formatCurrency } from "@/utils/number-formatter";
import { PriceItem } from "@/types/pricing";
import { cn } from "@/lib/utils";

interface ProductComparisonProps {
  items: PriceItem[];
  onRemoveItem: (itemId: string) => void;
  onClear: () => void;
  onClose: () => void;
}

export function ProductComparison({ 
  items, 
  onRemoveItem, 
  onClear, 
  onClose 
}: ProductComparisonProps) {
  if (items.length === 0) {
    return (
      <Card className="border-dashed border-2 border-muted-foreground/20 bg-muted/10">
        <CardContent className="p-8 text-center">
          <Scale className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold mb-2 text-muted-foreground">
            Modo Comparação Ativo
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Clique nos produtos que deseja comparar (máximo 3)
          </p>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="hover:bg-[#f58220]/10 hover:border-[#f58220]/50"
          >
            Sair do Modo Comparação
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getBestValue = () => {
    if (items.length < 2) return null;
    return items.reduce((best, current) => 
      current.price < best.price ? current : best
    );
  };

  const bestValue = getBestValue();

  return (
    <Card className="border-[#f58220]/30 bg-gradient-to-br from-[#f58220]/5 to-transparent shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#f58220] rounded-lg">
              <Scale className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#f58220]">
                Comparação de Produtos
              </h3>
              <p className="text-sm text-muted-foreground">
                {items.length} de 3 produtos selecionados
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClear}
              className="hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive"
            >
              Limpar
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="hover:bg-muted/50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const isBestValue = bestValue && item.id === bestValue.id;
            
            return (
              <div 
                key={item.id}
                className={cn(
                  "relative p-4 rounded-xl border-2 transition-all duration-300",
                  "hover:shadow-lg hover:-translate-y-1",
                  isBestValue 
                    ? "border-emerald-500 bg-emerald-50 shadow-emerald-200/50" 
                    : "border-border bg-card hover:border-[#f58220]/30"
                )}
              >
                {isBestValue && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-emerald-500 text-white border-none shadow-lg animate-pulse">
                      <Award className="h-3 w-3 mr-1" />
                      Melhor Custo-Benefício
                    </Badge>
                  </div>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveItem(item.id)}
                  className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-destructive text-white hover:bg-destructive/80"
                >
                  <X className="h-3 w-3" />
                </Button>

                <div className="space-y-3 pt-2">
                  <h4 className={cn(
                    "font-semibold text-sm leading-tight",
                    isBestValue ? "text-emerald-700" : "text-foreground"
                  )}>
                    {item.name}
                  </h4>

                  <div className={cn(
                    "text-center p-3 rounded-lg border",
                    isBestValue 
                      ? "bg-emerald-100 border-emerald-200" 
                      : "bg-muted/30 border-muted"
                  )}>
                    <div className={cn(
                      "text-2xl font-bold",
                      isBestValue ? "text-emerald-600" : "text-[#f58220]"
                    )}>
                      {formatCurrency(item.price)}
                    </div>
                    <div className="text-xs text-muted-foreground">por mês</div>
                  </div>

                  {item.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 2).map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="text-xs px-2 py-0.5"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {item.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs px-2 py-0.5">
                          +{item.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {items.length > 1 && (
          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-[#f58220]" />
              <span className="font-medium text-sm">Análise Rápida</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="text-center p-2 bg-card rounded border">
                <div className="font-semibold text-[#f58220]">
                  {formatCurrency(Math.min(...items.map(i => i.price)))}
                </div>
                <div className="text-xs text-muted-foreground">Menor Preço</div>
              </div>
              <div className="text-center p-2 bg-card rounded border">
                <div className="font-semibold text-[#f58220]">
                  {formatCurrency(Math.max(...items.map(i => i.price)))}
                </div>
                <div className="text-xs text-muted-foreground">Maior Preço</div>
              </div>
              <div className="text-center p-2 bg-card rounded border">
                <div className="font-semibold text-[#f58220]">
                  {formatCurrency(Math.max(...items.map(i => i.price)) - Math.min(...items.map(i => i.price)))}
                </div>
                <div className="text-xs text-muted-foreground">Diferença</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
