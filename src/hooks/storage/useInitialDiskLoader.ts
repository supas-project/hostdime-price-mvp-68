
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
            
            // Filter out any disks that might be invalid (missing required properties)
            const validDisks = parsedDisks.filter(item => 
              item && 
              item.disk && 
              item.disk.id && 
              item.disk.type && 
              item.disk.capacity && 
              typeof item.quantity === 'number'
            );
            
            if (validDisks.length > 0) {
              setSelectedDisks(validDisks);
            } else {
              console.log('[useInitialDiskLoader] No valid disks found in saved selections');
            }
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
        // Also mark data as refreshed to ensure persistence works
        setIsDataRefreshed(true);
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
    
    // Ensure data is marked as refreshed after component mount
    const timeoutId = setTimeout(() => {
      if (!isDataRefreshed) {
        console.log('[useInitialDiskLoader] Ensuring data is marked as refreshed after timeout');
        setIsDataRefreshed(true);
      }
    }, 1000);
    
    return () => {
      window.removeEventListener('data-refreshed', handlePriceDataUpdate);
      window.removeEventListener('data-reset', handlePriceDataUpdate);
      clearTimeout(timeoutId);
    };
  }, [isDataRefreshed]);

  return {
    isInitialLoad,
    setIsInitialLoad,
    isDataRefreshed,
    setIsDataRefreshed
  };
}
