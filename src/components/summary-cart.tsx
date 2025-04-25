
import { ComponentOption, serverData } from "@/data/server-components";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, Save, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

interface SummaryCartProps {
  selectedComponents: { [key: string]: ComponentOption };
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
  const [isNextAnimating, setIsNextAnimating] = useState(false);
  
  const uniqueComponents = Object.entries(selectedComponents).reduce((acc, [type, component]) => {
    if (component.type === "Processador" && acc["cpu"]) {
      acc["cpu"] = component;
    } else {
      acc[type] = component;
    }
    return acc;
  }, {} as { [key: string]: ComponentOption });
  
  const totalPrice = Object.values(uniqueComponents).reduce(
    (sum, component) => sum + component.price,
    0
  );

  const handleSave = () => {
    toast({
      title: "Configuração salva",
      description: "Sua configuração foi salva com sucesso."
    });
  };

  const handleEdit = (type: string) => {
    const stepIndex = serverData.componentes.findIndex(comp => comp.id === type);
    if (stepIndex >= 0) {
      toast({
        title: "Editar componente",
        description: `Editando o componente: ${selectedComponents[type].name}`
      });
    }
  };

  const handleRemove = (type: string) => {
    toast({
      title: "Remover componente",
      description: `O componente ${selectedComponents[type].name} foi removido.`
    });
  };
  
  const handleNextClick = () => {
    setIsNextAnimating(true);
    setTimeout(() => {
      onNext();
      setIsNextAnimating(false);
    }, 300);
  };

  const itemCount = Object.keys(uniqueComponents).length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  
  const currentComponent = serverData.componentes[currentStep];
  const hasSelection = (() => {
    if (!currentComponent) return false;
    
    console.log('Checking selection for type:', currentComponent.type);
    console.log('Selected components:', selectedComponents);
    
    if (currentComponent.type === "Memória") {
      const hasMemory = selectedComponents["memoria"] !== undefined;
      console.log('Memory check:', { hasMemory, memoryComponent: selectedComponents["memoria"] });
      return hasMemory;
    }
    
    if (currentComponent.type === "Contrato") {
      return selectedComponents["contrato"] !== undefined;
    }
    
    const typeKey = currentComponent.type.toLowerCase();
    const hasComponent = selectedComponents[typeKey] !== undefined;
    console.log(`Selection check for ${typeKey}:`, hasComponent);
    
    return hasComponent;
  })();
  
  console.log('Current step:', currentStep);
  console.log('Current component:', currentComponent?.type);
  console.log('Has selection:', hasSelection);
  
  return (
    <div className="bg-card rounded-2xl border border-border shadow-lg">
      <div className="p-4 border-b border-border">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Resumo do Servidor</h3>
          <span className="text-xs text-muted-foreground">
            {itemCount} {itemCount === 1 ? 'item' : 'itens'}
          </span>
        </div>
      </div>
      
      <div className="p-4 space-y-4 max-h-[300px] overflow-auto">
        {Object.entries(uniqueComponents).map(([type, component]) => (
          <div key={type} className="flex justify-between items-start group animate-fade-in">
            <div className="flex-1">
              <p className="text-sm font-medium">{component.name}</p>
              <p className="text-xs text-muted-foreground">{component.description}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <p className="text-sm font-medium">{formatCurrency(component.price)}</p>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => handleEdit(type)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-destructive"
                  onClick={() => handleRemove(type)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
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
              <Button 
                onClick={handleNextClick} 
                disabled={!hasSelection}
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
    </div>
  );
}
