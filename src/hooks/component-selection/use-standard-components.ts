
import { useState } from "react";
import { ComponentOption } from "@/types/component";
import { toast } from "sonner";

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
      
      if (option.type.toLowerCase() === "memoria") {
        console.log("Setting memory component:", option);
        updated["memoria"] = option;
      } else if (option.type === "SistemaOperacional") {
        updated["sistemaoperacional"] = option;
      } else {
        updated[option.type.toLowerCase()] = option;
      }
      
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
