
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
      
      // Sempre fazemos uma cópia para garantir que o estado seja atualizado
      const newState = { ...updated };
      newState[normalizedType] = { ...option };
      
      console.log("Updated components:", newState);
      
      // Notificação ao usuário para feedback (removido para não afetar a experiência)
      // toast.success(`${option.name} selecionado`);
      
      return newState;
    });
  };

  const handleRemoveStandardComponent = (type: string) => {
    const normalizedType = normalizeComponentType(type);
    console.log(`Removing component type: ${type} (normalized: ${normalizedType})`);
    
    setSelectedComponents((prev) => {
      const updated = { ...prev };
      delete updated[normalizedType];
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
