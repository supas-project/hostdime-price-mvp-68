
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, ShoppingCart, ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectedComponent {
  category: string;
  component: {
    id: number;
    name: string;
    price: number;
  };
  quantity: number;
}

interface FloatingCartProps {
  selectedComponents: SelectedComponent[];
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onComplete: () => void;
  onClear: () => void;
  totalPrice: number;
  totalItems: number;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export function FloatingCart({
  selectedComponents,
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onComplete,
  onClear,
  totalPrice,
  totalItems
}: FloatingCartProps) {
  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            <span>Configuração</span>
          </div>
          <Badge variant="secondary">
            {totalItems} {totalItems === 1 ? 'item' : 'itens'}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {selectedComponents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum componente selecionado</p>
          </div>
        ) : (
          <>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {selectedComponents.map((item, index) => (
                <div key={`${item.category}-${item.component.id}`} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.component.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.category} • Qtd: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(item.component.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold">Total Mensal:</span>
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(totalPrice)}
                </span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onClear}
                className="w-full mb-4"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Configuração
              </Button>
            </div>
          </>
        )}
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={currentStep === 0}
            className="flex-1"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>
          
          <Button
            onClick={currentStep === totalSteps - 1 ? onComplete : onNext}
            className="flex-1"
          >
            {currentStep === totalSteps - 1 ? 'Finalizar' : 'Próximo'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
        
        <div className="text-center text-xs text-muted-foreground">
          Etapa {currentStep + 1} de {totalSteps}
        </div>
      </CardContent>
    </Card>
  );
}
