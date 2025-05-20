
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, RefreshCw, CheckCircle2 } from "lucide-react";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface SyncIndicatorProps {
  lastSyncTime: Date | null;
  hasConflicts: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function SyncIndicator({ 
  lastSyncTime, 
  hasConflicts, 
  onRefresh,
  isRefreshing 
}: SyncIndicatorProps) {
  const formattedTime = lastSyncTime 
    ? formatDistanceToNow(lastSyncTime, { addSuffix: true, locale: ptBR })
    : null;
    
  const { user } = useAuth();
  
  // Verifica se o usuário é admin@hostdime.com.br
  const isAdmin = user?.email === "admin@hostdime.com.br";
  
  // Se não for admin, não mostra o componente
  if (!isAdmin) {
    return null;
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={hasConflicts ? "outline" : "ghost"}
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className={cn(
              "flex items-center gap-2 text-xs transition-all",
              hasConflicts && "border-yellow-500/50 text-yellow-500 animate-pulse"
            )}
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Sincronizando...</span>
              </>
            ) : hasConflicts ? (
              <>
                <AlertCircle className="h-3.5 w-3.5 text-yellow-500" />
                <span>Atualizações disponíveis</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Sincronizado {formattedTime}</span>
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-background text-foreground border shadow-md">
          {isRefreshing ? (
            "Sincronizando dados..."
          ) : hasConflicts ? (
            "Clique para atualizar a tabela com as mudanças"
          ) : (
            `Última atualização: ${formattedTime}`
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
