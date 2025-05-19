
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook para gerenciar ações relacionadas ao PayBack e contratos
 */
export function usePayBackActions(setPriceData: (data: any) => void) {
  const [selectedContract, setSelectedContract] = useState("0"); // Default: sem contrato
  const { toast } = useToast();
  
  // Dummy export data handler to fix type errors
  const handleExportData = () => {
    console.log("Export data from PayBackActions");
    // Implementation would go here
  };
  
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
    applyPayBackDiscount,
    handleExportData
  };
}
