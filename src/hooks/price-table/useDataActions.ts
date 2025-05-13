
import { useToast } from "@/hooks/use-toast";
import { PriceService } from "@/services/price-service";

export function useDataActions(setPriceData: (data: any) => void) {
  const { toast } = useToast();

  const handleExportData = () => {
    try {
      const data = PriceService.getAllData();
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'price-table-export.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success({
        title: "Dados exportados",
        description: "Os dados foram exportados com sucesso."
      });
      return true;
    } catch (error) {
      toast.error({
        title: "Erro ao exportar dados",
        description: "Não foi possível exportar os dados.",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleResetData = () => {
    const data = PriceService.resetData();
    setPriceData(data);
    
    toast.success({
      title: "Dados resetados",
      description: "A tabela de preços foi restaurada para o estado inicial."
    });
    return true;
  };

  return {
    handleExportData,
    handleResetData,
  };
}
