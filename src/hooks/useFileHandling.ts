
import { useRef, useState } from "react";
import { PriceService } from "@/services/price-service";
import { toast } from "@/utils/toast-utils";
import { PriceData } from "@/types/pricing";

export function useFileHandling(setPriceData: (data: PriceData) => void) {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    
    try {
      const content = await file.text();
      let importedData: PriceData;
      
      if (file.name.toLowerCase().endsWith('.json')) {
        // Use type assertion to ensure TypeScript recognizes these methods
        importedData = (PriceService as any).importFromJSON(content);
        setPriceData(importedData);
        toast.success("Dados importados com sucesso", {
          description: "Os dados JSON foram validados e carregados."
        });
      } else if (file.name.toLowerCase().endsWith('.csv')) {
        try {
          // Use type assertion to ensure TypeScript recognizes these methods
          importedData = (PriceService as any).importFromCSV(content);
          setPriceData(importedData);
          toast.success("Dados importados com sucesso", {
            description: "Os dados CSV foram validados e carregados."
          });
        } catch (csvError) {
          throw new Error("Formato CSV não suportado ainda. Use JSON.");
        }
      } else {
        throw new Error("Formato de arquivo não suportado. Use JSON ou CSV.");
      }
    } catch (error) {
      toast.error("Erro ao importar", {
        description: error instanceof Error ? error.message : "Verifique se o arquivo está no formato correto."
      });
    } finally {
      setIsLoading(false);
      // Resetar o valor do input para permitir que o mesmo arquivo seja selecionado novamente
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return {
    isLoading,
    fileInputRef,
    handleFileUpload
  };
}
