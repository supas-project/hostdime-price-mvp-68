
import { useState, useEffect } from "react";
import { PricedDiskOption } from "@/types/storage";

export function useInitialDiskLoader(
  setSelectedDisks: React.Dispatch<React.SetStateAction<{ disk: PricedDiskOption; quantity: number }[]>>
) {
  // Tracking state for initial loading
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const [isDataRefreshed, setIsDataRefreshed] = useState<boolean>(false);

  useEffect(() => {
    if (isInitialLoad) {
      try {
        // Check if there are stored selections in localStorage
        const storedDisks = localStorage.getItem('selectedDisks');
        
        if (storedDisks) {
          const parsedDisks = JSON.parse(storedDisks);
          
          // Only set selected disks if we have valid stored selections
          if (Array.isArray(parsedDisks) && parsedDisks.length > 0) {
            // Verify the stored disks have the proper structure before using them
            const validDisks = parsedDisks.filter(item => 
              item && 
              item.disk && 
              item.disk.id && 
              item.disk.type && 
              typeof item.quantity === 'number'
            );
            
            if (validDisks.length > 0) {
              setSelectedDisks(validDisks);
            }
          }
        }
      } catch (error) {
        console.error("Error restoring selected disks:", error);
      } finally {
        // Mark initial load as complete
        setIsInitialLoad(false);
        setIsDataRefreshed(true);
      }
    }
  }, [isInitialLoad, setSelectedDisks]);

  return { isInitialLoad, setIsInitialLoad, isDataRefreshed, setIsDataRefreshed };
}
