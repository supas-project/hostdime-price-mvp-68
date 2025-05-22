
import { useState, useEffect } from "react";
import { ComponentSelector } from "@/components/component-selector";
import { ComponentOption } from "@/types/component";
import { Card } from "@/components/ui/card";
import { findMatchingComponent } from "@/utils/component-matching";

interface DataCenterContentProps {
  options: ComponentOption[];
  selectedOption: ComponentOption | null;
  onSelectOption: (option: ComponentOption) => void;
}

export function DataCenterContent({ 
  options, 
  selectedOption, 
  onSelectOption 
}: DataCenterContentProps) {
  // Local state to track selection
  const [localSelectedId, setLocalSelectedId] = useState<string>(selectedOption?.id || "");
  
  // CORREÇÃO: Log para debug
  console.log("[DataCenterContent] Opções disponíveis:", options);
  console.log("[DataCenterContent] Opção selecionada:", selectedOption);
  
  // Synchronize local state with props when selectedOption changes
  useEffect(() => {
    if (selectedOption) {
      // Try to find a matching component in case the selectedOption came from elsewhere
      const matchingComponent = findMatchingComponent(selectedOption, options);
      setLocalSelectedId(matchingComponent?.id || selectedOption.id);
      
      // CORREÇÃO: Log para debug
      console.log("[DataCenterContent] selectedOption alterado:", selectedOption);
      console.log("[DataCenterContent] matchingComponent encontrado:", matchingComponent);
    } else {
      setLocalSelectedId("");
    }
  }, [selectedOption, options]);
  
  const handleChange = (value: string) => {
    setLocalSelectedId(value);
    const option = options.find(opt => opt.id === value);
    
    // CORREÇÃO: Adicionar verificação e log
    if (option) {
      console.log("[DataCenterContent] Selecionando opção:", option);
      onSelectOption({...option, type: "datacenter"}); // Garantir que o tipo é lowercase para compatibilidade
    } else {
      console.warn("[DataCenterContent] Opção não encontrada para id:", value);
    }
  };

  return (
    <Card className="p-4 sm:p-6 overflow-hidden">
      <div className="w-full overflow-x-hidden">
        <ComponentSelector
          label="Data Center"
          options={options}
          value={localSelectedId}
          onChange={handleChange}
          tooltip="Escolha a localização ideal para seu servidor"
          highlightSelection={true}
        />
      </div>
    </Card>
  );
}
