
import { ComponentOption } from "@/data/server-components";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";

interface SelectedComponents {
  [key: string]: ComponentOption;
}

interface SummaryCartProps {
  selectedComponents: SelectedComponents;
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onComplete: () => void;
}

export function SummaryCart({
  selectedComponents,
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onComplete
}: SummaryCartProps) {
  const { toast } = useToast();
  
  const totalPrice = Object.values(selectedComponents).reduce(
    (sum, component) => sum + component.price,
    0
  );

  const handleSave = () => {
    toast({
      title: "Configuração salva",
      description: "Sua configuração foi salva com sucesso."
    });
  };

  const itemCount = Object.keys(selectedComponents).length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  
  return (
    <div className="bg-card rounded-2xl border border-border shadow-lg">
      <div className="p-4 border-b border-border">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Resumo do Servidor</h3>
          <span className="text-xs text-muted-foreground">{itemCount} {itemCount === 1 ? 'item' : 'itens'}</span>
        </div>
      </div>
      
      <div className="p-4 space-y-4 max-h-[300px] overflow-auto">
        {Object.entries(selectedComponents).map(([type, component]) => (
          <div key={type} className="flex justify-between">
            <div>
              <p className="text-sm font-medium">{component.name}</p>
              <p className="text-xs text-muted-foreground">{component.description}</p>
            </div>
            <p className="text-sm font-medium">{formatCurrency(component.price)}</p>
          </div>
        ))}
        
        {itemCount === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <p>Selecione componentes para montar seu servidor</p>
          </div>
        )}
      </div>
      
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
              <Button onClick={onNext} disabled={itemCount === 0}>
                Próximo
              </Button>
            </div>
          )}
        </div>
        
        <Button variant="ghost" className="w-full mt-2" onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" /> Salvar Configuração
        </Button>
      </div>
    </div>
  );
}
