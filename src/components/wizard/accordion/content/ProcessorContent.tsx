
import { useState, useEffect } from "react";
import { ComponentOption } from "@/types/component";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { useProcessor } from "@/hooks/useProcessor";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown } from "lucide-react";
import { Cpu } from "lucide-react";
import { PriceService } from "@/services/price-service";

interface ProcessorContentProps {
  selectedOption: ComponentOption | null;
  onSelectOption: (option: ComponentOption) => void;
}

export function ProcessorContent({ selectedOption, onSelectOption }: ProcessorContentProps) {
  const { processorOptions, isLoading, error } = useProcessor();
  const [localOptions, setLocalOptions] = useState<ComponentOption[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (processorOptions && processorOptions.length > 0) {
      console.log("[ProcessorContent] Processor options loaded:", processorOptions.length);
      setLocalOptions(processorOptions);
    }
  }, [processorOptions]);

  // Adicionar listener para mudanças de dados
  useEffect(() => {
    // Adicionar listener para atualizações de dados
    const handleDataChange = async () => {
      console.log("[ProcessorContent] Data change detected, refreshing processor options");
      // Recarregar opções de processador quando os dados mudarem
      const refreshedOptions = await PriceService.getCategory('processor');
      if (refreshedOptions && refreshedOptions.items) {
        const convertedOptions = refreshedOptions.items.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description || `${item.name}`,
          price: item.price,
          type: 'Processador',
          specs: item.specs || [],
          metadata: {
            cores: item.metadata?.cores || 0,
            perCore: item.metadata?.perCore || false,
            features: item.metadata?.features || []
          }
        }));
        
        setLocalOptions(convertedOptions);
        console.log("[ProcessorContent] Refreshed processor options:", convertedOptions.length);
      }
    };

    // Adicionar o listener
    PriceService.addDataChangeListener(handleDataChange);

    // Limpar o listener quando o componente for desmontado
    return () => {
      PriceService.removeDataChangeListener(handleDataChange);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500">Erro ao carregar opções de processador: {error}</p>
      </div>
    );
  }

  if (localOptions.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground">Nenhuma opção de processador disponível</p>
      </div>
    );
  }

  // Renderização no estilo mostrado na imagem - dropdown único
  return (
    <div className="space-y-4">
      <div className="p-6 bg-card rounded-lg border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-primary/10 p-2 rounded-full">
            <Cpu className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-medium">Processador</h3>
            <p className="text-sm text-muted-foreground">
              Escolha o processador ideal para suas necessidades
            </p>
          </div>
        </div>
        
        <div className="relative">
          <div 
            className={`flex items-center justify-between border ${selectedOption ? 'border-primary/70' : 'border-border'} rounded-lg p-3 cursor-pointer bg-background hover:bg-accent/50 transition-colors`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className={`${selectedOption ? 'text-foreground' : 'text-muted-foreground'}`}>
              {selectedOption ? selectedOption.name : "Escolha o processador ideal para você"}
            </span>
            <ChevronDown className={`h-5 w-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </div>
          
          {isDropdownOpen && (
            <div className="absolute z-50 mt-1 w-full bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
              <RadioGroup
                value={selectedOption?.id || ""}
                onValueChange={(value) => {
                  const option = localOptions.find((opt) => opt.id === value);
                  if (option) {
                    onSelectOption(option);
                    setIsDropdownOpen(false);
                  }
                }}
                className="space-y-1 p-2"
              >
                {localOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`flex items-center justify-between space-x-2 p-2 rounded-md hover:bg-accent cursor-pointer ${
                      selectedOption?.id === option.id ? "bg-primary/10" : ""
                    }`}
                    onClick={() => {
                      onSelectOption(option);
                      setIsDropdownOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value={option.id} id={option.id} className="hidden" />
                      <div>
                        <Label
                          htmlFor={option.id}
                          className="text-base font-medium cursor-pointer"
                        >
                          {option.name}
                        </Label>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-primary">
                        {formatCurrency(option.price)}
                      </span>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
