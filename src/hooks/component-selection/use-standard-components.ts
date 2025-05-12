
import { useState } from "react";
import { ComponentOption } from "@/types/component";
import { normalizeComponentType } from "../use-component-selection";

export function useStandardComponents() {
  const [selectedComponents, setSelectedComponents] = useState<{ [key: string]: ComponentOption }>({});

  const validateOption = (option: ComponentOption): boolean => {
    if (!option.type || !option.id || typeof option.price !== 'number') {
      console.error('Invalid option format:', option);
      return false;
    }
    return true;
  };

  const handleSelectOption = (option: ComponentOption) => {
    if (!validateOption(option)) return;

    setSelectedComponents((prev) => {
      const normalizedType = normalizeComponentType(option.type);
      
      // Always create a new object to ensure state is updated
      return {
        ...prev,
        [normalizedType]: { ...option }
      };
    });
  };

  const handleRemoveStandardComponent = (type: string) => {
    const normalizedType = normalizeComponentType(type);
    
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
