import { ComponentOption } from "@/types/component";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, Save, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { useWizard } from "@/contexts/WizardContext";
import { serverData } from "@/data/server-components";

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
  const { handleRemoveComponent, storageItems, connectivityItems } = useWizard();
  const [isNextAnimating, setIsNextAnimating] = useState(false);
  
  // Filter and handle components
  const standardComponents = Object.entries(selectedComponents).reduce((acc, [type, component]) => {
    // Skip storage components as they're handled separately
    if (type === 'storage_internal' || type === 'storage_external') {
      return acc;
    }
    
    if (component.type === "Processador" && acc["cpu"]) {
      acc["cpu"] = component;
    } else {
      acc[type] = component;
    }
    return acc;
  }, {} as { [key: string]: ComponentOption });
  
  // Calculate standard components total price
  const standardComponentsPrice = Object.values(standardComponents).reduce(
    (sum, component) => sum + component.price,
    0
  );
  
  // Calculate storage price
  const internalStoragePrice = storageItems.internal.reduce(
    (sum, disk) => sum + disk.price,
    0
  );
  
  const externalStoragePrice = storageItems.external.reduce(
    (sum, storage) => sum + storage.price, 
    0
  );

  // Calculate connectivity price
  const connectivityPrice = Object.values(connectivityItems).reduce(
    (sum, item) => sum + (item.option.price * item.quantity),
    0
  );
  
  // Calculate total price
  const totalPrice = standardComponentsPrice + internalStoragePrice + externalStoragePrice + connectivityPrice;

  const handleSave = () => {
    toast({
      title: "Configuração salva",
      description: "Sua configuração foi salva com sucesso."
    });
  };

  const handleRemove = (type: string) => {
    handleRemoveComponent(type);
  };
  
  const handleNextClick = () => {
    setIsNextAnimating(true);
    setTimeout(() => {
      onNext();
      setIsNextAnimating(false);
    }, 300);
  };

  const standardComponentCount = Object.keys(standardComponents).length;
  const storageComponentCount = storageItems.internal.length + storageItems.external.length;
  const connectivityComponentCount = Object.keys(connectivityItems).length;
  const totalItemCount = standardComponentCount + storageComponentCount + connectivityComponentCount;
  
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  
  // Improved selection detection logic for the Next button
  const hasSelection = (() => {
    const currentServerComponent = serverData.componentes[currentStep];
    if (!currentServerComponent) return false;
    
    const componentType = currentServerComponent.type;
    console.log('Checking selection for current step:', { currentStep, componentType });
    
    if (componentType === "Memória") {
      return selectedComponents["memoria"] !== undefined;
    }
    
    if (componentType === "Contrato") {
      return selectedComponents["contrato"] !== undefined;
    }
    
    if (componentType === "Conectividade") {
      return connectivityItems && Object.keys(connectivityItems).length > 0;
    }
    
    if (componentType === "Armazenamento") {
      return storageItems.internal.length > 0 || storageItems.external.length > 0;
    }
    
    const typeKey = componentType.toLowerCase();
    return selectedComponents[typeKey] !== undefined;
  })();
  
  const hasConnectivityItems = Object.keys(connectivityItems).length > 0;
  
  return (
    <div className="bg-card rounded-2xl border border-border shadow-lg">
      <div className="p-4 border-b border-border">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Resumo do Servidor</h3>
          <span className="text-xs text-muted-foreground">
            {totalItemCount} {totalItemCount === 1 ? 'item' : 'itens'}
          </span>
        </div>
      </div>
      
      <div className="p-4 space-y-4 max-h-[300px] overflow-auto">
        {/* Standard components */}
        {Object.entries(standardComponents).map(([type, component]) => (
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
                  className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleRemove(type)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        
        {/* Internal storage components */}
        {storageItems.internal.length > 0 && (
          <div className="pt-2">
            <p className="text-xs font-medium text-muted-foreground mb-2">Discos Internos</p>
            {storageItems.internal.map((disk) => (
              <div key={disk.id} className="flex justify-between items-start group animate-fade-in mb-2">
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {disk.metadata?.quantity && disk.metadata.quantity > 1 ? 
                      `${disk.metadata.quantity}x ${disk.name}` : 
                      disk.name
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">{disk.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="text-sm font-medium">{formatCurrency(disk.price)}</p>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemove("storage_internal")}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* External storage components */}
        {storageItems.external.length > 0 && (
          <div className="pt-2">
            <p className="text-xs font-medium text-muted-foreground mb-2">Storage Externo</p>
            {storageItems.external.map((storage) => (
              <div key={storage.id} className="flex justify-between items-start group animate-fade-in mb-2">
                <div className="flex-1">
                  <p className="text-sm font-medium">{storage.name}</p>
                  <p className="text-xs text-muted-foreground">{storage.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="text-sm font-medium">{formatCurrency(storage.price)}</p>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemove("storage_external")}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Connectivity components */}
        {Object.keys(connectivityItems).length > 0 && (
          <div className="pt-2">
            <p className="text-xs font-medium text-muted-foreground mb-2">Conectividade</p>
            {Object.values(connectivityItems).map((item) => (
              <div key={item.option.id} className="flex justify-between items-start group animate-fade-in mb-2">
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {item.option.name}
                    {item.quantity > 1 && ` (${item.quantity}x)`}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.option.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="text-sm font-medium">
                    {formatCurrency(item.option.price * item.quantity)}
                  </p>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveComponent(item.option.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {totalItemCount === 0 && (
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
