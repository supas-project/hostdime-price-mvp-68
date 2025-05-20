
import { useState, useEffect } from "react";
import { PricedDiskOption } from "@/types/storage";

type SetSelectedDisksFunction = React.Dispatch<React.SetStateAction<{ disk: PricedDiskOption; quantity: number }[]>>;

export function useInitialDiskLoader(setSelectedDisks: SetSelectedDisksFunction) {
  // Define state variables with explicit boolean type
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const [isDataRefreshed, setIsDataRefreshed] = useState<boolean>(false);

  // Load saved disk selections from localStorage on initial load
  useEffect(() => {
    if (isInitialLoad) {
      try {
        const savedDisksString = localStorage.getItem('selectedDisks');
        if (savedDisksString) {
          const savedDisks = JSON.parse(savedDisksString);
          if (Array.isArray(savedDisks) && savedDisks.length > 0) {
            setSelectedDisks(savedDisks);
            console.log("[useInitialDiskLoader] Loaded saved disks from localStorage:", savedDisks);
          }
        }
      } catch (error) {
        console.error("[useInitialDiskLoader] Error loading saved disks:", error);
      } finally {
        // Mark initial load as complete
        setIsInitialLoad(false);
        // After a short delay, mark data as refreshed
        setTimeout(() => {
          setIsDataRefreshed(true);
        }, 500);
      }
    }
  }, [isInitialLoad, setSelectedDisks]);

  // Use a strictly typed return value to ensure TypeScript knows these are definitely booleans
  return {
    isInitialLoad, 
    setIsInitialLoad,
    isDataRefreshed,
    setIsDataRefreshed
  } as const; // Using const assertion to preserve strict boolean types
}
