
import { useState } from "react";
import { PriceService } from "@/services/price-service";
import { useToast } from "@/hooks/use-toast";

export function useDataActions(setPriceData: (data: any) => void) {
  const [isExporting, setIsExporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();

  // Handle exporting data as JSON
  const handleExportData = () => {
    try {
      setIsExporting(true);
      const data = PriceService.getAllData();
      const dataStr = JSON.stringify(data, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      // Create an invisible link and trigger a download
      const exportFileDefaultName = `price-data-${new Date().toISOString().slice(0, 10)}.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast({
        title: "Exportação concluída",
        description: "Dados exportados com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro ao exportar dados",
        description: "Não foi possível exportar os dados.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Handle resetting data to initial state
  const handleResetData = () => {
    if (confirm("Tem certeza que deseja resetar todos os dados para o padrão inicial? Esta ação não pode ser desfeita.")) {
      try {
        setIsResetting(true);
        
        // Reset data in PriceService
        const resetData = PriceService.resetData();
        
        // Update state with reset data
        setPriceData(resetData);
        
        toast({
          title: "Dados resetados",
          description: "Todos os dados foram redefinidos para o padrão inicial."
        });
      } catch (error) {
        toast({
          title: "Erro ao resetar dados",
          description: "Não foi possível resetar os dados.",
          variant: "destructive"
        });
      } finally {
        setIsResetting(false);
      }
    }
  };

  return {
    isExporting,
    isResetting,
    handleExportData,
    handleResetData
  };
}
