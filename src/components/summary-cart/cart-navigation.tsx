
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, ClipboardCheck } from "lucide-react";

interface CartNavigationProps {
  isFirstStep: boolean;
  isLastStep: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onComplete: () => void;
}

export function CartNavigation({
  isFirstStep,
  isLastStep,
  onPrevious,
  onNext,
  onComplete
}: CartNavigationProps) {
  const [isNextAnimating, setIsNextAnimating] = useState(false);

  const handleNextClick = () => {
    setIsNextAnimating(true);
    setTimeout(() => {
      onNext();
      setIsNextAnimating(false);
    }, 300);
  };
  
  return (
    <div className="p-4 border-b border-border bg-card">
      {isLastStep ? (
        <Button className="w-full" onClick={onComplete}>
          <ClipboardCheck className="mr-2 h-4 w-4" /> Finalizar Pedido
        </Button>
      ) : (
        <div className="grid grid-cols-2 w-full gap-2">
          <Button variant="outline" onClick={onPrevious} disabled={isFirstStep}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
          </Button>
          <Button 
            onClick={handleNextClick} 
            className={isNextAnimating ? "animate-scale-in" : ""}
          >
            Próximo <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
