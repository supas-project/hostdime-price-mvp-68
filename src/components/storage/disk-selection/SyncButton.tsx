
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface SyncButtonProps {
  onSync: () => Promise<void>;
  isSyncing: boolean;
}

export function SyncButton({ onSync, isSyncing }: SyncButtonProps) {
  const { user } = useAuth();
  
  // Verifica se o usuário é admin@hostdime.com.br
  const isAdmin = user?.email === "admin@hostdime.com.br";
  
  // Se não for admin, não mostra o botão
  if (!isAdmin) {
    return null;
  }
  
  return (
    <Button 
      onClick={onSync} 
      variant="outline" 
      size="sm"
      disabled={isSyncing}
      className="flex items-center gap-2"
    >
      {isSyncing ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Sincronizando...</span>
        </>
      ) : (
        <>
          <RefreshCw className="h-4 w-4" />
          <span>Sincronizar Dados</span>
        </>
      )}
    </Button>
  );
}
