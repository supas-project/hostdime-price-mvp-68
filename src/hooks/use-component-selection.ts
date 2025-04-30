
import { useStandardComponents } from "./component-selection/use-standard-components";
import { useStorageComponents } from "./component-selection/use-storage-components";
import { useConnectivityComponents } from "./component-selection/use-connectivity-components";
import { useCustomServices } from "./component-selection/use-custom-services";
import { ComponentOption } from "@/types/component";

// Helper function to normalize component types for consistent key usage
export const normalizeComponentType = (type: string): string => {
  // Primeiro, trata nulo ou undefined
  if (!type) return "";
  
  // Remove acentos e caracteres especiais
  const withoutAccents = type
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  
  // Converte para minúsculas
  const lowercase = withoutAccents.toLowerCase();
  
  // Mapeamento específico para garantir consistência
  const typeMap: Record<string, string> = {
    "memoria": "memoria",
    "memória": "memoria",
    "sistemaoperacional": "sistemaoperacional",
    "processador": "processador",
    "datacenter": "datacenter",
    "contrato": "contrato",
    "conectividade": "conectividade",
    "armazenamento": "armazenamento",
    "servicospersonalizados": "servicospersonalizados",
    "serviçospersonalizados": "servicospersonalizados"
  };
  
  console.log(`Normalizing type: ${type} -> lowercase: ${lowercase} -> normalized: ${typeMap[lowercase] || lowercase}`);
  return typeMap[lowercase] || lowercase;
};

export function useComponentSelection() {
  const {
    selectedComponents,
    setSelectedComponents,
    handleSelectOption,
    handleRemoveStandardComponent
  } = useStandardComponents();

  const {
    storageItems,
    setStorageItems,
    handleSelectStorageItem,
    handleRemoveStorageItem
  } = useStorageComponents();

  const {
    connectivityItems,
    setConnectivityItems,
    handleRemoveConnectivityItem
  } = useConnectivityComponents();

  const {
    customServices,
    setCustomServices,
    addCustomService,
    removeCustomService
  } = useCustomServices();

  // We're not calling useLocalStorage here anymore - each hook manages its own localStorage

  // Função principal para remover componentes
  const handleRemoveComponent = (type: string) => {
    console.log("Removing component:", type);
    
    if (type.startsWith("internal-disk-") || type.startsWith("external-storage-") ||
        type === "storage_internal" || type === "storage_external") {
      handleRemoveStorageItem(type);
    } else if (type.includes("network-") || type.includes("ip-")) {
      handleRemoveConnectivityItem(type);
    } else if (type.includes("custom-service-")) {
      removeCustomService(type);
    } else {
      handleRemoveStandardComponent(type);
    }
  };

  return {
    selectedComponents,
    setSelectedComponents,
    connectivityItems,
    setConnectivityItems,
    storageItems,
    setStorageItems,
    customServices,
    setCustomServices,
    handleSelectOption,
    handleSelectStorageItem,
    handleRemoveComponent,
    addCustomService,
    removeCustomService,
    normalizeComponentType
  };
}
