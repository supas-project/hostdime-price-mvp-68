
import { useEffect } from "react";
import { ComponentOption, StorageItems } from "@/types/component";

export interface SelectionState {
  selectedComponents: { [key: string]: ComponentOption };
  storageItems: StorageItems;
  connectivityItems: { [key: string]: { option: ComponentOption, quantity: number } };
  customServices: ComponentOption[];
}

export function useLocalStorage(
  selectedComponents: { [key: string]: ComponentOption },
  setSelectedComponents: React.Dispatch<React.SetStateAction<{ [key: string]: ComponentOption }>>,
  storageItems: StorageItems,
  setStorageItems: React.Dispatch<React.SetStateAction<StorageItems>>,
  connectivityItems: { [key: string]: { option: ComponentOption, quantity: number } },
  setConnectivityItems: React.Dispatch<React.SetStateAction<{ [key: string]: { option: ComponentOption, quantity: number } }>>,
  customServices: ComponentOption[],
  setCustomServices: React.Dispatch<React.SetStateAction<ComponentOption[]>>
) {
  // Recuperar dados salvos no carregamento
  useEffect(() => {
    try {
      const savedComponents = localStorage.getItem('selectedComponents');
      const savedStorageItems = localStorage.getItem('storageItems');
      const savedConnectivityItems = localStorage.getItem('connectivityItems');
      const savedCustomServices = localStorage.getItem('customServices');
      
      if (savedComponents) {
        setSelectedComponents(JSON.parse(savedComponents));
      }
      
      if (savedStorageItems) {
        setStorageItems(JSON.parse(savedStorageItems));
      }
      
      if (savedConnectivityItems) {
        setConnectivityItems(JSON.parse(savedConnectivityItems));
      }
      
      if (savedCustomServices) {
        setCustomServices(JSON.parse(savedCustomServices));
      }
    } catch (error) {
      console.error("Erro ao recuperar dados salvos:", error);
    }
  }, []);

  // Salvar alterações no localStorage
  useEffect(() => {
    try {
      localStorage.setItem('selectedComponents', JSON.stringify(selectedComponents));
      localStorage.setItem('storageItems', JSON.stringify(storageItems));
      localStorage.setItem('connectivityItems', JSON.stringify(connectivityItems));
      localStorage.setItem('customServices', JSON.stringify(customServices));
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
    }
  }, [selectedComponents, storageItems, connectivityItems, customServices]);
}
