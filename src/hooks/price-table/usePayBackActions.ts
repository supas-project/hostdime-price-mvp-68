
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useDataActions } from "./useDataActions";

/**
 * Hook para gerenciar ações relacionadas ao PayBack e contratos
 */
export function usePayBackActions(setPriceData: (data: any) => void) {
  const [selectedContract, setSelectedContract] = useState("0"); // Default: sem contrato
  const { handleExportData } = useDataActions(setPriceData);
  const { toast } = useToast();
  
  // Função para aplicar o desconto de PayBack com base no contrato selecionado
  const applyPayBackDiscount = (price: number, isHardware: boolean = false) => {
    if (!isHardware || selectedContract === "0") {
      return price;
    }
    
    // Mapear duração do contrato para percentual de desconto
    const discountMap: Record<string, number> = {
      "12": 5,
      "24": 10,
      "36": 15,
      "48": 20,
      "60": 25,
    };
    
    const discount = discountMap[selectedContract] || 0;
    return price * (1 - discount / 100);
  };
  
  return {
    selectedContract,
    setSelectedContract,
    applyPayBackDiscount
  };
}
