
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ComponentOption } from "@/types/component";
import { formatCurrency } from "@/lib/utils";
import { Calculator, TrendingUp, Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface CostPreviewProps {
  selectedComponents: { [key: string]: ComponentOption };
  connectivityItems?: { [key: string]: { option: ComponentOption, quantity: number } };
  storageItems?: { internal: ComponentOption[], external: ComponentOption[] };
  customServices?: ComponentOption[];
  className?: string;
}

export function CostPreview({ 
  selectedComponents, 
  connectivityItems = {}, 
  storageItems = { internal: [], external: [] },
  customServices = [],
  className 
}: CostPreviewProps) {
  
  // Calcular custos por categoria
  const calculateCosts = () => {
    let hardwareCost = 0;
    let servicesCost = 0;
    let totalComponents = 0;

    // Componentes principais
    Object.values(selectedComponents).forEach(component => {
      if (component && typeof component.price === 'number') {
        const isHardware = component.isHardware || 
          ['processador', 'memoria', 'armazenamento'].includes(component.type.toLowerCase());
        
        if (isHardware) {
          hardwareCost += component.price;
        } else {
          servicesCost += component.price;
        }
        totalComponents++;
      }
    });

    // Conectividade
    Object.values(connectivityItems).forEach(item => {
      if (item?.option?.price) {
        servicesCost += item.option.price * item.quantity;
        totalComponents++;
      }
    });

    // Armazenamento
    [...storageItems.internal, ...storageItems.external].forEach(item => {
      if (item?.price) {
        hardwareCost += item.price;
        totalComponents++;
      }
    });

    // Serviços customizados
    customServices.forEach(service => {
      if (service?.price) {
        servicesCost += service.price;
        totalComponents++;
      }
    });

    return {
      hardwareCost,
      servicesCost,
      totalCost: hardwareCost + servicesCost,
      totalComponents
    };
  };

  const costs = calculateCosts();

  // Calcular estimativas anuais
  const annualSavings = costs.totalCost * 12 * 0.1; // 10% desconto anual estimado
  const monthlyTotal = costs.totalCost;

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calculator className="h-4 w-4 text-orange-500" />
          Preview de Custos
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Resumo Principal */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4 border border-orange-200 dark:border-orange-700">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {formatCurrency(monthlyTotal)}
            </div>
            <div className="text-sm text-orange-500 dark:text-orange-300 font-medium">
              por mês
            </div>
          </div>
        </div>

        {/* Breakdown por categoria */}
        {(costs.hardwareCost > 0 || costs.servicesCost > 0) && (
          <div className="space-y-3">
            <Separator />
            
            {costs.hardwareCost > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Hardware</span>
                <span className="font-medium">{formatCurrency(costs.hardwareCost)}</span>
              </div>
            )}
            
            {costs.servicesCost > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Serviços</span>
                <span className="font-medium">{formatCurrency(costs.servicesCost)}</span>
              </div>
            )}
          </div>
        )}

        {/* Informações adicionais */}
        {costs.totalComponents > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>Estimativa anual: {formatCurrency(monthlyTotal * 12)}</span>
            </div>
            
            {annualSavings > 0 && (
              <div className="flex items-center gap-2 text-xs text-green-600">
                <Info className="h-3 w-3" />
                <span>Economia potencial anual: {formatCurrency(annualSavings)}</span>
              </div>
            )}
            
            <Badge variant="secondary" className="text-xs">
              {costs.totalComponents} componente{costs.totalComponents !== 1 ? 's' : ''} selecionado{costs.totalComponents !== 1 ? 's' : ''}
            </Badge>
          </div>
        )}

        {costs.totalComponents === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <Calculator className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Selecione componentes para ver o preview de custos</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
