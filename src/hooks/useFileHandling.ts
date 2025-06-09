
import { useRef, useState } from "react";
import { PriceService } from "@/services/price-service";
import { toast } from "@/utils/toast-utils";
import { PriceData } from "@/types/pricing";

export function useFileHandling(setPriceData: (data: PriceData) => void) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      let importedData: PriceData;
      
      if (file.name.toLowerCase().endsWith('.json')) {
        importedData = PriceService.importFromJSON(content);
        setPriceData(importedData);
        toast.success("Dados importados com sucesso", {
          description: "Os dados JSON foram validados e carregados."
        });
      } else if (file.name.toLowerCase().endsWith('.csv')) {
        try {
          importedData = PriceService.importFromCSV(content);
          setPriceData(importedData);
          toast.success("Dados importados com sucesso", {
            description: "Os dados CSV foram validados e carregados."
          });
        } catch (csvError) {
          throw new Error("Formato CSV não suportado ainda. Use JSON.");
        }
      } else if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
        throw new Error("Formatos Excel (.xlsx, .xls) serão suportados em breve. Por favor, use JSON ou CSV.");
      } else {
        throw new Error("Formato de arquivo não suportado. Use JSON ou CSV.");
      }
    } catch (error) {
      toast.error("Erro ao importar", {
        description: error instanceof Error ? error.message : "Verifique se o arquivo está no formato correto."
      });
      throw error;
    } finally {
      // Reset the input value to allow the same file to be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return {
    fileInputRef,
    handleFileUpload
  };
}
