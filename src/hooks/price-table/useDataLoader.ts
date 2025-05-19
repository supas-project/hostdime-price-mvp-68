
import { useEffect } from 'react';
import { PriceService } from '@/services/price-service';
import { toast } from 'sonner';
import { initializeServerCategories } from '@/services/component-sync';

export function useDataLoader(
  isLoading: boolean,
  setIsLoading: (loading: boolean) => void, 
  setPriceData: (data: any) => void,
  isAuthenticated: boolean
) {
  // Load price data
  const loadPriceData = async () => {
    setIsLoading(true);
    try {
      if (!isAuthenticated) {
        console.log("User not authenticated, not loading price data");
        setIsLoading(false);
        return;
      }

      console.log("Loading price data for authenticated user");
      const data = await PriceService.getAllData();
      
      if (!data) {
        console.warn("No price data returned from service");
        setIsLoading(false);
        return;
      }
      
      console.log("Price data loaded successfully with categories:", Object.keys(data).join(", "));
      setPriceData(data);
      
      // After loading price data, ensure server categories are initialized
      // This ensures that the wizard components are properly synchronized
      try {
        console.log("Initializing server categories from price data");
        await initializeServerCategories();
        console.log("Server categories initialized successfully");
      } catch (initError) {
        console.error("Error initializing server categories:", initError);
      }
    } catch (error) {
      console.error('Error loading price data:', error);
      toast.error("Error loading price data", {
        description: "Please try again or check if you are authenticated."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data loading
  useEffect(() => {
    if (isAuthenticated) {
      console.log("User authenticated, loading initial price data");
      loadPriceData();
  
      // Add listener for data changes
      PriceService.addDataChangeListener((newData) => {
        console.log('Price data updated:', newData ? Object.keys(newData).length : 0, 'categories');
        if (newData) {
          setPriceData(newData);
        }
      });
    } else {
      setPriceData(null);
      console.log("User not authenticated, clearing price data");
    }
    
    // Cleanup
    return () => {
      // Remove listener when unmounted
      PriceService.removeDataChangeListener();
    };
  }, [isAuthenticated, setPriceData]);

  return {
    loadPriceData
  };
}
