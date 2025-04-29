
import { ComponentOption } from "@/types/component";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { useWizard } from "@/contexts/WizardContext";
import { useState } from 'react';
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  const { storageItems, connectivityItems } = useWizard();
  const [isNextAnimating, setIsNextAnimating] = useState(false);

  // Separate components by type
  const dataCenterComponent = selectedComponents["datacenter"];
  const contractComponent = selectedComponents["contrato"];
  
  // Filter other components (excluding DataCenter and Contract)
  const standardComponents = Object.values(selectedComponents).filter(
    component => {
      if (!component || component.type === "DataCenter" || component.type === "Contrato" || component.type === "Armazenamento") {
        return false;
      }
      return true;
    }
  );
  
  // Calcula preços excluindo DataCenter e Contract
  const standardComponentsPrice = standardComponents.reduce(
    (sum, component) => sum + (component.price || 0),
    0
  );
  
  const internalStoragePrice = storageItems.internal
    .filter(disk => disk && disk.price > 0)
    .reduce((sum, disk) => sum + disk.price, 0);
  
  const externalStoragePrice = storageItems.external
    .filter(storage => storage && storage.price > 0)
    .reduce((sum, storage) => sum + storage.price, 0);

  const totalPrice = standardComponentsPrice + internalStoragePrice + externalStoragePrice;

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

  // Agrupar discos internos por tipo para melhor organização
  const groupedInternalStorage = storageItems.internal
    .filter(disk => disk && disk.price > 0)
    .reduce((groups, disk) => {
      const type = disk.subtype || disk.name.split(' ')[0].toLowerCase();
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(disk);
      return groups;
    }, {} as Record<string, ComponentOption[]>);

  const diskTypeColors = {
    nvme: "success",
    ssd: "info",
    hdd: "warning"
  };

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  
  return (
    <div className="bg-card rounded-2xl border border-border shadow-lg">
      <div className="p-4 border-b border-border">
        <h3 className="font-medium">Resumo do Servidor</h3>
      </div>
      
      <div className="p-4 space-y-4 max-h-[300px] overflow-auto">
        {/* Data Center */}
        {dataCenterComponent && (
          <div className="flex justify-between items-center group animate-fade-in">
            <div>
              <p className="text-sm font-medium flex items-center gap-2">
                {dataCenterComponent.name}
                <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                  Data Center
                </span>
              </p>
              {dataCenterComponent.metadata?.features && (
                <div className="mt-1">
                  {dataCenterComponent.metadata.features.map((feature, index) => (
                    <p key={index} className="text-xs text-muted-foreground flex items-center">
                      <Check className="h-3 w-3 text-primary mr-1" />
                      {feature}
                    </p>
                  ))}
                </div>
              )}
            </div>
            <span className="text-sm text-muted-foreground">Incluído</span>
          </div>
        )}

        {/* Contract */}
        {contractComponent && (
          <div className="flex justify-between items-center group animate-fade-in">
            <div>
              <p className="text-sm font-medium flex items-center gap-2">
                {contractComponent.name}
                <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                  Contrato
                </span>
              </p>
              {contractComponent.metadata?.discount && (
                <p className="text-xs text-green-500">
                  Desconto de {contractComponent.metadata.discount}% incluído
                </p>
              )}
            </div>
            <span className="text-sm text-muted-foreground">Incluído</span>
          </div>
        )}

        {/* Standard components with prices */}
        {standardComponents.map((component) => (
          <div key={component.id} className="flex justify-between items-center group animate-fade-in">
            <p className="text-sm font-medium">{component.name}</p>
            <p className="text-sm font-medium">{formatCurrency(component.price)}</p>
          </div>
        ))}
        
        {/* Storage components grouped by type */}
        {Object.entries(groupedInternalStorage).map(([type, disks]) => (
          <div key={type} className="space-y-2 pt-2 border-t border-border/50 first:border-t-0 first:pt-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={diskTypeColors[type as keyof typeof diskTypeColors] || "default"}>
                {type.toUpperCase()}
              </Badge>
            </div>
            {disks.map((disk) => (
              <div key={disk.id} className="flex justify-between items-center group animate-fade-in pl-2">
                <p className="text-sm">
                  {disk.metadata?.quantity && disk.metadata.quantity > 1 ? 
                    `${disk.metadata.quantity}x ${disk.capacity || disk.name.split(' ').slice(1).join(' ')}` : 
                    disk.capacity || disk.name.split(' ').slice(1).join(' ')
                  }
                </p>
                <p className="text-sm font-medium">{formatCurrency(disk.price)}</p>
              </div>
            ))}
          </div>
        ))}
        
        {storageItems.external
          .filter(storage => storage && storage.price > 0)
          .map((storage) => (
            <div key={storage.id} className="flex justify-between items-center group animate-fade-in">
              <p className="text-sm font-medium">{storage.name}</p>
              <p className="text-sm font-medium">{formatCurrency(storage.price)}</p>
            </div>
          ))}
        
        {/* Connectivity items */}
        {Object.values(connectivityItems)
          .filter(item => item && item.option)
          .map((item) => (
            <div key={item.option.id} className="flex justify-between items-center group animate-fade-in">
              <p className="text-sm font-medium">
                {item.quantity > 1 ? `${item.quantity}x ${item.option.name}` : item.option.name}
              </p>
              <p className="text-sm font-medium">{formatCurrency(item.option.price * item.quantity)}</p>
            </div>
          ))}
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
