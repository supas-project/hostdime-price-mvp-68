
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
  const isLoadingRef = useRef(false);

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
    setCurrentState(state);
    isLoadingRef.current = state !== 'idle';
  }, []);

  const setFileLoading = useCallback((loading: boolean) => {
    console.log(`[ConsolidatedLoading] File loading: ${loading}`);
    if (loading) {
      setLoadingState('uploading-file');
    } else if (currentState === 'uploading-file') {
      setLoadingState('idle');
    }
  }, [currentState, setLoadingState]);

  const setRefreshing = useCallback((refreshing: boolean) => {
    console.log(`[ConsolidatedLoading] Refreshing: ${refreshing}`);
    if (refreshing) {
      setLoadingState('refreshing');
    } else if (currentState === 'refreshing') {
      setLoadingState('idle');
    }
  }, [currentState, setLoadingState]);

  const reset = useCallback(() => {
    console.log(`[ConsolidatedLoading] Resetting state`);
    setCurrentState('idle');
    isLoadingRef.current = false;
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
