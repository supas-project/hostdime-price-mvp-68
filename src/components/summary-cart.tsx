import { ComponentOption, serverData } from "@/data/server-components";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, Save, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

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
  const isMobile = useIsMobile();
  
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

  const handleEdit = (type: string) => {
    // Find the step index for this component type
    const stepIndex = serverData.componentes.findIndex(comp => comp.id === type);
    if (stepIndex >= 0) {
      // This would be implemented by the parent component
      toast({
        title: "Editar componente",
        description: `Editando o componente: ${selectedComponents[type].name}`
      });
    }
  };

  const handleRemove = (type: string) => {
    // This would be implemented by the parent component
    toast({
      title: "Remover componente",
      description: `O componente ${selectedComponents[type].name} foi removido.`
    });
  };

  const itemCount = Object.keys(selectedComponents).length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  const hasSelection = selectedComponents[serverData.componentes[currentStep]?.id] !== undefined;
  
  if (isMobile) {
    return (
      <Collapsible className="fixed bottom-0 left-0 right-0 bg-background border-t animate-slide-up z-50">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-4 rounded-none border-b"
          >
            <span className="font-medium">Total: {formatCurrency(totalPrice)}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-4 pb-4 max-h-[70vh] overflow-y-auto">
          <div className="p-4 border-b border-border">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Resumo do Servidor</h3>
              <span className="text-xs text-muted-foreground">
                {itemCount} {itemCount === 1 ? 'item' : 'itens'}
              </span>
            </div>
          </div>
          
          <div className="p-4 space-y-4 max-h-[300px] overflow-auto">
            {Object.entries(selectedComponents).map(([type, component]) => (
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
                  <Button onClick={onNext} disabled={!hasSelection}>
                    Próximo
                  </Button>
                </div>
              )}
            </div>
            
            <Button variant="ghost" className="w-full mt-2" onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" /> Salvar Configuração
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <div className="md:sticky md:top-24 h-fit animate-fade-in">
      <div className="p-4 border-b border-border">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Resumo do Servidor</h3>
          <span className="text-xs text-muted-foreground">
            {itemCount} {itemCount === 1 ? 'item' : 'itens'}
          </span>
        </div>
      </div>
      
      <div className="p-4 space-y-4 max-h-[300px] overflow-auto">
        {Object.entries(selectedComponents).map(([type, component]) => (
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
              <Button onClick={onNext} disabled={!hasSelection}>
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
