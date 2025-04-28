
import { CheckCircle, RefreshCcw } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface SyncIndicatorProps {
  lastSyncTime: Date | null;
}

export function SyncIndicator({ lastSyncTime }: SyncIndicatorProps) {
  const [timeAgo, setTimeAgo] = useState<string>("");

  useEffect(() => {
    if (!lastSyncTime) return;

    // Função para calcular tempo desde a última sincronização
    const updateTimeAgo = () => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - lastSyncTime.getTime()) / 1000);
      
      if (diff < 60) {
        setTimeAgo("agora mesmo");
      } else if (diff < 3600) {
        const minutes = Math.floor(diff / 60);
        setTimeAgo(`há ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`);
      } else if (diff < 86400) {
        const hours = Math.floor(diff / 3600);
        setTimeAgo(`há ${hours} ${hours === 1 ? 'hora' : 'horas'}`);
      } else {
        const days = Math.floor(diff / 86400);
        setTimeAgo(`há ${days} ${days === 1 ? 'dia' : 'dias'}`);
      }
    };
    
    updateTimeAgo();
    
    // Atualizar a cada minuto
    const interval = setInterval(updateTimeAgo, 60000);
    return () => clearInterval(interval);
  }, [lastSyncTime]);

  if (!lastSyncTime) {
    return (
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <RefreshCcw className="w-3 h-3 animate-spin" />
        <span>Sincronizando...</span>
      </div>
    );
  }

  const handleClick = () => {
    toast.info("Última atualização: " + lastSyncTime.toLocaleTimeString(), {
      description: "Os componentes no configurador são atualizados automaticamente quando você modifica a tabela de preços."
    });
  };

  return (
    <div 
      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary cursor-help transition-colors"
      onClick={handleClick}
    >
      <CheckCircle className="w-3 h-3 text-green-500" />
      <span>Atualizado {timeAgo}</span>
    </div>
  );
}
