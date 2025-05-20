
import { useState, useEffect } from 'react';
import { PricedDiskOption } from '@/types/storage';

interface UseInitialDiskLoaderReturn {
  isInitialLoad: boolean;
  setIsInitialLoad: (value: boolean) => void;
  isDataRefreshed: boolean;
  setIsDataRefreshed: (value: boolean) => void;
}

export function useInitialDiskLoader(
  setSelectedDisks: (disks: { disk: PricedDiskOption; quantity: number }[]) => void
): UseInitialDiskLoaderReturn {
  // Use strict boolean types and initialization
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const [isDataRefreshed, setIsDataRefreshed] = useState<boolean>(false);

  // Load from localStorage on mount
  useEffect(() => {
    const loadSavedSelections = () => {
      try {
        const savedDisks = localStorage.getItem('selectedDisks');
        if (savedDisks) {
          const parsedDisks = JSON.parse(savedDisks);
          if (Array.isArray(parsedDisks) && parsedDisks.length > 0) {
            console.log('[useInitialDiskLoader] Loading saved selections:', parsedDisks.length, 'disks');
            setSelectedDisks(parsedDisks);
          } else {
            console.log('[useInitialDiskLoader] No valid saved disk selections found');
          }
        } else {
          console.log('[useInitialDiskLoader] No saved disk selections found');
        }
      } catch (error) {
        console.error('[useInitialDiskLoader] Error loading saved disk selections:', error);
      } finally {
        // Mark initial load as complete with explicit boolean
        setIsInitialLoad(false);
      }
    };

    if (isInitialLoad === true) {
      console.log('[useInitialDiskLoader] Initial load in progress');
      loadSavedSelections();
    }
  }, [isInitialLoad, setSelectedDisks]);

  // Listen for price data updates that might affect disks
  useEffect(() => {
    const handlePriceDataUpdate = () => {
      console.log('[useInitialDiskLoader] Price data updated, marking data as refreshed');
      setIsDataRefreshed(true);
    };

    // Setup event listeners for price data changes
    window.addEventListener('data-refreshed', handlePriceDataUpdate);
    window.addEventListener('data-reset', handlePriceDataUpdate);
    
    return () => {
      window.removeEventListener('data-refreshed', handlePriceDataUpdate);
      window.removeEventListener('data-reset', handlePriceDataUpdate);
    };
  }, []);

  return {
    isInitialLoad,
    setIsInitialLoad,
    isDataRefreshed,
    setIsDataRefreshed
  };
}
