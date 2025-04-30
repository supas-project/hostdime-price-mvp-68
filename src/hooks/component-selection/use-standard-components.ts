
import { useState } from "react";
import { ComponentOption } from "@/types/component";
import { toast } from "sonner";
import { normalizeComponentType } from "../use-component-selection";

export function useStandardComponents() {
  const [selectedComponents, setSelectedComponents] = useState<{ [key: string]: ComponentOption }>({});

  const validateOption = (option: ComponentOption): boolean => {
    if (!option.type || !option.id || typeof option.price !== 'number') {
      console.error('Invalid option format:', option);
      toast.error('Erro na seleção do componente', {
        description: 'O formato do componente é inválido'
      });
      return false;
    }
    return true;
  };

  const handleSelectOption = (option: ComponentOption) => {
    console.log("Selecting option:", option);
    
    if (!validateOption(option)) return;

    setSelectedComponents((prev) => {
      const updated = { ...prev };
      const normalizedType = normalizeComponentType(option.type);
      
      console.log(`Normalized type for ${option.type}: ${normalizedType}`);
      updated[normalizedType] = option;
      
      console.log("Updated components:", updated);
      return updated;
    });
  };

  const handleRemoveStandardComponent = (type: string) => {
    setSelectedComponents((prev) => {
      const updated = { ...prev };
      delete updated[type];
      return updated;
    });
  };

  return {
    selectedComponents,
    setSelectedComponents,
    handleSelectOption,
    handleRemoveStandardComponent
  };
}
