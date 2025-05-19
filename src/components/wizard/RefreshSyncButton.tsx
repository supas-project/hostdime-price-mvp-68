
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "@/utils/toast-utils";
import { initializeServerCategories } from "@/services/component-sync";

export function RefreshSyncButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await initializeServerCategories();
      toast.success("Componentes atualizados com sucesso!");
    } catch (error) {
      console.error("Error refreshing components:", error);
      toast.error("Falha ao sincronizar componentes. Tente novamente.");
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="gap-1.5"
    >
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      {isRefreshing ? 'Sincronizando...' : 'Sincronizar'}
    </Button>
  );
}
