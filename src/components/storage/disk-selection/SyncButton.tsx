
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";

interface SyncButtonProps {
  onSync: () => Promise<void>;
  isSyncing: boolean;
}

export function SyncButton({ onSync, isSyncing }: SyncButtonProps) {
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
