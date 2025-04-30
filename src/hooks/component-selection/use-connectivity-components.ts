
import { useState } from "react";
import { ComponentOption } from "@/types/component";

export function useConnectivityComponents() {
  const [connectivityItems, setConnectivityItems] = useState<{ [key: string]: { option: ComponentOption, quantity: number } }>({});

  const handleRemoveConnectivityItem = (type: string) => {
    if (type.includes("network-") || type.includes("ip-")) {
      setConnectivityItems(prev => {
        const newItems = { ...prev };
        delete newItems[type];
        return newItems;
      });
    }
  };

  return {
    connectivityItems,
    setConnectivityItems,
    handleRemoveConnectivityItem
  };
}
