
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ClipboardCheck, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";

interface CartFooterProps {
  totalPrice: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onComplete: () => void;
}

export function CartFooter({
  totalPrice,
  isFirstStep,
  isLastStep,
  onPrevious,
  onNext,
  onComplete
}: CartFooterProps) {
  const { toast } = useToast();
  const [isNextAnimating, setIsNextAnimating] = useState(false);

  const handleSave = () => {
    toast({
      title: "Configuração salva",
      description: "Sua configuração foi salva com sucesso."
    });
  };

  const handleNextClick = () => {
    setIsNextAnimating(true);
    setTimeout(() => {
      onNext();
      setIsNextAnimating(false);
    }, 300);
  };
  
  return (
    <div className="p-4 border-t border-border">
      <div className="flex justify-between items-center mb-4">
        <span className="font-medium">Total</span>
        <span className="font-bold text-primary text-lg">{formatCurrency(totalPrice)}</span>
      </div>
      
      <div className="flex space-x-2">
        {isLastStep ? (
          <Button className="w-full" onClick={onComplete}>
            <ClipboardCheck className="mr-2 h-4 w-4" /> Finalizar Pedido
          </Button>
        ) : (
          <div className="grid grid-cols-2 w-full gap-2">
            <Button variant="outline" onClick={onPrevious} disabled={isFirstStep}>
              Anterior
            </Button>
            <Button 
              onClick={handleNextClick} 
              className={isNextAnimating ? "animate-scale-in" : ""}
            >
              Próximo
            </Button>
          </div>
        )}
      </div>
      
      <Button variant="ghost" className="w-full mt-2" onClick={handleSave}>
        <Save className="mr-2 h-4 w-4" /> Salvar Configuração
      </Button>
    </div>
  );
}
