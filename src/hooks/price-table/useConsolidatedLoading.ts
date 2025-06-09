
import { useState, useCallback } from 'react';
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
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getLoadingMessage = (state: LoadingState): string => {
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
  };

  const setLoadingState = useCallback((state: LoadingState) => {
    setCurrentState(state);
    // Reset other states when setting main state
    if (state !== 'idle') {
      setIsFileLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const setFileLoading = useCallback((loading: boolean) => {
    setIsFileLoading(loading);
    if (loading) {
      setCurrentState('uploading-file');
    } else if (currentState === 'uploading-file') {
      setCurrentState('idle');
    }
  }, [currentState]);

  const setRefreshing = useCallback((refreshing: boolean) => {
    setIsRefreshing(refreshing);
    if (refreshing) {
      setCurrentState('refreshing');
    } else if (currentState === 'refreshing') {
      setCurrentState('idle');
    }
  }, [currentState]);

  const reset = useCallback(() => {
    setCurrentState('idle');
    setIsFileLoading(false);
    setIsRefreshing(false);
  }, []);

  // Determine if any loading is active
  const isLoading = currentState !== 'idle' || isFileLoading || isRefreshing;
  
  // Get appropriate message
  let loadingMessage = getLoadingMessage(currentState);
  if (isFileLoading && !loadingMessage) {
    loadingMessage = 'Enviando arquivo...';
  } else if (isRefreshing && !loadingMessage) {
    loadingMessage = 'Atualizando dados...';
  }

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
