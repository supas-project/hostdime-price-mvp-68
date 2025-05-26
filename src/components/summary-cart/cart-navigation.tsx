
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, ClipboardCheck, Pause } from "lucide-react";

interface CartNavigationProps {
  isFirstStep: boolean;
  isLastStep: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onComplete: () => void;
  autoProgressionActive?: boolean;
  onPauseAutoProgression?: () => void;
}

export function CartNavigation({
  isFirstStep,
  isLastStep,
  onPrevious,
  onNext,
  onComplete,
  autoProgressionActive = false,
  onPauseAutoProgression
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
        <div className="space-y-2">
          {/* Indicador de Auto-progressão */}
          {autoProgressionActive && (
            <div className="flex items-center justify-center gap-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
              <span>Progressão automática ativa</span>
              {onPauseAutoProgression && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onPauseAutoProgression}
                  className="h-6 px-2 text-orange-600"
                >
                  <Pause className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
          
          {/* Botões de Navegação */}
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
        </div>
      )}
    </div>
  );
}
