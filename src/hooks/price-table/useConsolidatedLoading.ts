
import { useState, useCallback, useRef } from 'react';
import { LoadingState } from './useLoadingStates';

export interface ConsolidatedLoadingState {
  isLoading: boolean;
  loadingMessage: string;
  currentState: LoadingState;
  setLoadingState: (state: LoadingState) => void;
  setFileLoading: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  reset: () => void;
}

export function useConsolidatedLoading(): ConsolidatedLoadingState {
  const [currentState, setCurrentState] = useState<LoadingState>('idle');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getLoadingMessage = useCallback((state: LoadingState): string => {
    switch (state) {
      case 'initializing':
        return 'Inicializando tabela de preços...';
      case 'loading-data':
        return 'Carregando dados...';
      case 'refreshing':
        return 'Atualizando dados...';
      case 'syncing':
        return 'Sincronizando com o servidor...';
      case 'uploading-file':
        return 'Enviando arquivo...';
      case 'processing':
        return 'Processando dados...';
      default:
        return '';
    }
  }, []);

  const setLoadingState = useCallback((state: LoadingState) => {
    console.log(`[ConsolidatedLoading] Setting state: ${state}`);
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    setCurrentState(state);
    
    // Auto-reset to idle after a timeout for non-idle states to prevent infinite loading
    if (state !== 'idle') {
      timeoutRef.current = setTimeout(() => {
        console.log(`[ConsolidatedLoading] Auto-resetting from ${state} to idle after timeout`);
        setCurrentState('idle');
      }, 30000); // 30 seconds timeout
    }
  }, []);

  const setFileLoading = useCallback((loading: boolean) => {
    console.log(`[ConsolidatedLoading] File loading: ${loading}`);
    if (loading) {
      setLoadingState('uploading-file');
    } else {
      setLoadingState('idle');
    }
  }, [setLoadingState]);

  const setRefreshing = useCallback((refreshing: boolean) => {
    console.log(`[ConsolidatedLoading] Refreshing: ${refreshing}`);
    if (refreshing) {
      setLoadingState('refreshing');
    } else {
      setLoadingState('idle');
    }
  }, [setLoadingState]);

  const reset = useCallback(() => {
    console.log(`[ConsolidatedLoading] Resetting state`);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setCurrentState('idle');
  }, []);

  const isLoading = currentState !== 'idle';
  const loadingMessage = getLoadingMessage(currentState);

  return {
    isLoading,
    loadingMessage,
    currentState,
    setLoadingState,
    setFileLoading,
    setRefreshing,
    reset
  };
}
