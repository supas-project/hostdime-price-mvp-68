
import { useRef, useState } from "react";
import { PriceService } from "@/services/price-service";
import { useToast } from "@/hooks/use-toast";

export function useFileHandling(setPriceData: (data: any) => void) {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    
    try {
      const content = await file.text();
      
      if (file.name.toLowerCase().endsWith('.json')) {
        setPriceData(PriceService.importFromJSON(content));
        toast({
          title: "Dados importados com sucesso",
          description: "Os dados JSON foram validados e carregados."
        });
      } else if (file.name.toLowerCase().endsWith('.csv')) {
        setPriceData(PriceService.importFromCSV(content));
        toast({
          title: "Dados importados com sucesso",
          description: "Os dados CSV foram validados e carregados."
        });
      } else {
        throw new Error("Formato de arquivo não suportado. Use JSON ou CSV.");
      }
    } catch (error) {
      toast({
        title: "Erro ao importar",
        description: error instanceof Error ? error.message : "Verifique se o arquivo está no formato correto.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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
