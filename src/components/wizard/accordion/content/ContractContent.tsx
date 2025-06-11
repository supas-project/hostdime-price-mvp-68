import { useState, useEffect } from "react";
import { ComponentSelector } from "@/components/component-selector";
import { ComponentOption } from "@/types/component";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPayBack } from "@/utils/payback-utils";
import { findMatchingComponent } from "@/utils/component-matching";
import { usePaybackOptions } from "@/hooks/use-payback-options";

interface ContractContentProps {
  options: ComponentOption[];
  selectedOption: ComponentOption | null;
  onSelectOption: (option: ComponentOption) => void;
}

export function ContractContent({ 
  options, 
  selectedOption, 
  onSelectOption 
}: ContractContentProps) {
  const [localSelectedId, setLocalSelectedId] = useState<string>(selectedOption?.id || "");
  const { data: paybackOptions, isLoading: isLoadingPayback } = usePaybackOptions();
  
  // CORREÇÃO: Log para debug
  console.log("[ContractContent] Opções disponíveis:", options);
  console.log("[ContractContent] Opção selecionada:", selectedOption);
  console.log("[ContractContent] PayBack options:", paybackOptions);
  
  // Synchronize selected option when it changes
  useEffect(() => {
    if (selectedOption) {
      const matchingComponent = findMatchingComponent(selectedOption, options);
      setLocalSelectedId(matchingComponent?.id || selectedOption.id);
      
      // CORREÇÃO: Log para debug
      console.log("[ContractContent] selectedOption alterado:", selectedOption);
      console.log("[ContractContent] matchingComponent encontrado:", matchingComponent);
    } else {
      setLocalSelectedId("");
    }
  }, [selectedOption, options]);
  
  const handleOptionChange = (value: string) => {
    setLocalSelectedId(value);
    const option = options.find(opt => opt?.id === value);
    
    // CORREÇÃO: Adicionar verificação e log
    if (option) {
      console.log("[ContractContent] Selecionando opção:", option);
      onSelectOption({...option, type: "contrato"}); // Garantir que o tipo é lowercase para compatibilidade
    } else {
      console.warn("[ContractContent] Opção não encontrada para id:", value);
    }
  };

  // Get the PayBack value for the current contract from dynamic data
  const getPayBackValueFromOptions = (contractDuration: string | number): number | null => {
    if (!paybackOptions || paybackOptions.length === 0) return null;
    
    const duration = String(contractDuration);
    const paybackOption = paybackOptions.find(option => String(option.contract_duration) === duration);
    
    return paybackOption?.value || null;
  };

  const paybackValue = selectedOption ? 
    getPayBackValueFromOptions(selectedOption.subtype || "0") : null;

  // Show loading state
  if (isLoadingPayback) {
    return (
      <Card className="p-4 sm:p-6 overflow-hidden">
        <div className="w-full overflow-x-hidden space-y-4">
          <Skeleton className="h-10 w-full bg-[#2a2a2a]" />
          <Skeleton className="h-6 w-2/3 bg-[#2a2a2a]" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-6 overflow-hidden">
      <div className="w-full overflow-x-hidden">
        <ComponentSelector
          label="Duração do Contrato"
          options={options || []}
          value={localSelectedId}
          onChange={handleOptionChange}
          tooltip="Escolha o período do seu contrato"
          highlightSelection={true}
        />
      </div>
      
      {selectedOption && (
        <div className="mt-4 p-3 bg-primary/5 rounded-md overflow-x-auto">
          <div className="flex flex-wrap gap-2 items-center">
            {selectedOption.metadata?.discount && selectedOption.metadata?.discount > 0 ? (
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200 whitespace-nowrap">
                {selectedOption.metadata.discount}% de desconto
              </Badge>
            ) : null}
            
            {paybackValue && (
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200 whitespace-nowrap">
                PayBack: {formatPayBack(paybackValue)} para hardware
              </Badge>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground mt-2 break-words">
            {paybackValue ? 
              `Com este contrato, você obtém ${formatPayBack(paybackValue)} de PayBack em componentes de hardware.` : 
              "Selecione um contrato para ver os benefícios."}
          </p>
        </div>
      )}
    </Card>
  );
}
