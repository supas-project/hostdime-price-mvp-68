
import { CheckCircle, RefreshCcw, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/utils/toast-utils";

interface SyncIndicatorProps {
  lastSyncTime: Date | null;
}

export function SyncIndicator({ lastSyncTime }: SyncIndicatorProps) {
  const [timeAgo, setTimeAgo] = useState<string>("");
  const [isStale, setIsStale] = useState<boolean>(false);

  useEffect(() => {
    if (!lastSyncTime) return;

    // Função para calcular tempo desde a última sincronização
    const updateTimeAgo = () => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - lastSyncTime.getTime()) / 1000);
      
      // Verificar se os dados estão desatualizados (mais de 1 hora)
      setIsStale(diff >= 3600);
      
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
      <div className="flex items-center gap-1 text-xs bg-background/80 border border-border rounded-full px-2.5 py-1 shadow-sm">
        <RefreshCcw className="w-3 h-3 animate-spin text-blue-500" />
        <span>Sincronizando...</span>
      </div>
    );
  }

  const handleClick = () => {
    const formattedTime = lastSyncTime.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    
    const formattedDate = lastSyncTime.toLocaleDateString([], {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    toast.info("Informações de sincronização", {
      description: `Última atualização: ${formattedDate} às ${formattedTime}. Os componentes no configurador são atualizados automaticamente quando você modifica a tabela de preços.`
    });
  };

  return (
    <div 
      className={`flex items-center gap-1.5 text-xs border rounded-full px-2.5 py-1 shadow-sm 
                cursor-pointer transition-all hover:shadow-md
                ${isStale 
                  ? "bg-amber-500/10 text-amber-700 border-amber-200 hover:bg-amber-500/15" 
                  : "bg-green-500/10 text-green-700 border-green-200 hover:bg-green-500/15"}`}
      onClick={handleClick}
    >
      {isStale ? (
        <AlertCircle className="w-3 h-3 text-amber-500" />
      ) : (
        <CheckCircle className="w-3 h-3 text-green-500" />
      )}
      <span>Atualizado {timeAgo}</span>
    </div>
  );
}
