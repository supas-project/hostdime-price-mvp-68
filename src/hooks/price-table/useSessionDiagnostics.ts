
import { useEffect, useState } from 'react';
import { PriceService } from '@/services/price-service';
import { toast } from '@/utils/toast-utils';

interface SessionEvent {
  sessionId: string;
  timestamp: number;
  level: 'info' | 'warn' | 'error';
  event: string;
  details?: any;
}

interface SessionDiagnostics {
  sessionId: string;
  sessionDuration: number;
  lastUpdateTimestamp: number;
  isWriteLocked: boolean;
  activeListeners: number;
  recentEvents: Array<SessionEvent>;
  hasDataConflicts: boolean;
}

export function useSessionDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<SessionDiagnostics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Função para atualizar os dados de diagnóstico
  const updateDiagnostics = () => {
    try {
      const info = PriceService.getDiagnosticInfo();
      const hasConflicts = PriceService.checkForDataConflicts();
      
      setDiagnostics({
        ...info,
        hasDataConflicts: hasConflicts
      });
      
      setIsLoading(false);
    } catch (e) {
      console.error('Erro ao obter dados de diagnóstico:', e);
      
      // Em caso de erro, criar um objeto que satisfaça a interface SessionDiagnostics
      // com valores padrão para as propriedades obrigatórias
      setDiagnostics({
        sessionId: 'erro',
        sessionDuration: 0,
        lastUpdateTimestamp: 0,
        isWriteLocked: false,
        activeListeners: 0,
        recentEvents: [],
        hasDataConflicts: false
      });
      
      // Notificar o usuário sobre o erro
      toast.error("Erro de diagnóstico", {
        description: "Não foi possível obter informações de diagnóstico da sessão."
      });
      
      setIsLoading(false);
    }
  };

  // Atualizar diagnóstico periodicamente
  useEffect(() => {
    // Carregar diagnóstico inicial
    updateDiagnostics();
    
    // Configurar atualização periódica
    const intervalId = setInterval(updateDiagnostics, 10000); // 10 segundos
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Função para forçar atualização de dados quando conflitos são detectados
  const refreshFromLatestSource = () => {
    PriceService.forceRefreshFromLatestSource();
    updateDiagnostics();
  };

  return {
    diagnostics,
    isLoading,
    refreshFromLatestSource,
    updateDiagnostics
  };
}
