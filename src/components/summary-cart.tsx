
import { ComponentOption } from "@/types/component";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { useWizard } from "@/contexts/WizardContext";

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
  
  // Calculate prices
  const standardComponentsPrice = Object.values(selectedComponents).reduce(
    (sum, component) => sum + component.price,
    0
  );
  
  const internalStoragePrice = storageItems.internal.reduce(
    (sum, disk) => sum + disk.price,
    0
  );
  
  const externalStoragePrice = storageItems.external.reduce(
    (sum, storage) => sum + storage.price,
    0
  );

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

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  
  return (
    <div className="bg-card rounded-2xl border border-border shadow-lg">
      <div className="p-4 border-b border-border">
        <h3 className="font-medium">Resumo do Servidor</h3>
      </div>
      
      <div className="p-4 space-y-4 max-h-[300px] overflow-auto">
        {/* Standard components - simplified */}
        {Object.values(selectedComponents).map((component) => (
          <div key={component.id} className="flex justify-between items-center group animate-fade-in">
            <p className="text-sm font-medium">{component.name}</p>
            <p className="text-sm font-medium">{formatCurrency(component.price)}</p>
          </div>
        ))}
        
        {/* Storage components - simplified */}
        {storageItems.internal.map((disk) => (
          <div key={disk.id} className="flex justify-between items-center group animate-fade-in">
            <p className="text-sm font-medium">
              {disk.metadata?.quantity && disk.metadata.quantity > 1 ? 
                `${disk.metadata.quantity}x ${disk.name}` : 
                disk.name
              }
            </p>
            <p className="text-sm font-medium">{formatCurrency(disk.price)}</p>
          </div>
        ))}
        
        {storageItems.external.map((storage) => (
          <div key={storage.id} className="flex justify-between items-center group animate-fade-in">
            <p className="text-sm font-medium">{storage.name}</p>
            <p className="text-sm font-medium">{formatCurrency(storage.price)}</p>
          </div>
        ))}
        
        {/* Connectivity items - simplified */}
        {Object.values(connectivityItems).map((item) => (
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
