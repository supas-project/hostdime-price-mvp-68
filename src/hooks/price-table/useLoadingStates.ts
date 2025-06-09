
import { useState, useCallback } from 'react';

export type LoadingState = 
  | 'idle'
  | 'initializing'
  | 'loading-data'
  | 'refreshing'
  | 'syncing'
  | 'uploading-file'
  | 'processing';

export interface LoadingStates {
  currentState: LoadingState;
  isLoading: boolean;
  loadingMessage: string;
}

export function useLoadingStates() {
  const [currentState, setCurrentState] = useState<LoadingState>('idle');

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
  }, []);

  const isLoading = currentState !== 'idle';
  const loadingMessage = getLoadingMessage(currentState);

  return {
    currentState,
    isLoading,
    loadingMessage,
    setLoadingState
  };
}
