
import { useStandardComponents } from "./component-selection/use-standard-components";
import { useStorageComponents } from "./component-selection/use-storage-components";
import { useConnectivityComponents } from "./component-selection/use-connectivity-components";
import { useCustomServices } from "./component-selection/use-custom-services";
import { useLocalStorage } from "./component-selection/use-local-storage";
import { ComponentOption } from "@/types/component";

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

  // Integrar com o localStorage
  useLocalStorage(
    selectedComponents,
    setSelectedComponents,
    storageItems,
    setStorageItems,
    connectivityItems,
    setConnectivityItems,
    customServices,
    setCustomServices
  );

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
    customServices,
    handleSelectOption,
    handleSelectStorageItem,
    handleRemoveComponent,
    addCustomService,
    removeCustomService
  };
}
