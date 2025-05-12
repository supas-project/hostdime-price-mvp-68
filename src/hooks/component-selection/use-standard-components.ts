
import { useState, useEffect } from "react";
import { ComponentOption } from "@/types/component";
import { useLocalStorage } from "./use-local-storage";
import { normalizeComponentType } from "../use-component-selection";
import { canSelectItem } from "@/utils/item-validation";
import { toast } from "sonner";

export function useStandardComponents() {
  const [selectedComponents, setSelectedComponents] = useLocalStorage<{[key: string]: ComponentOption}>(
    'selectedComponents',
    {}
  );

  const handleSelectOption = (option: ComponentOption) => {
    // Validação do item antes de selecionar
    if (!canSelectItem(option)) {
      console.warn(`Item não pode ser selecionado: ${option.name}`);
      toast.error("Item não selecionável", {
        description: "Este item não pode ser selecionado devido a configuração inválida."
      });
      return;
    }
    
    // Normaliza o tipo do componente para consistência
    const normalizedType = normalizeComponentType(option.type);
    
    setSelectedComponents(prev => ({
      ...prev,
      [normalizedType]: option
    }));
  };

  const handleRemoveStandardComponent = (type: string) => {
    const normalizedType = normalizeComponentType(type);
    
    setSelectedComponents(prev => {
      const updated = {...prev};
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
