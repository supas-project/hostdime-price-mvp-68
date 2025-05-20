
import { useState, useEffect } from "react";
import { PricedDiskOption } from "@/types/storage";
import { PriceService } from "@/services/price-service";

export function useInitialDiskLoader(
  setSelectedDisks: (disks: { disk: PricedDiskOption; quantity: number }[]) => void
) {
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isDataRefreshed, setIsDataRefreshed] = useState(false);

  // Load saved disk selections on initial mount
  useEffect(() => {
    const loadSavedSelections = async () => {
      try {
        // First try to get from localStorage for quick load
        const savedSelectionsString = localStorage.getItem('selectedDisks');
        let savedSelections = [];
        
        if (savedSelectionsString) {
          try {
            savedSelections = JSON.parse(savedSelectionsString);
            console.log("[InternalStoragePanel] Loaded selections from localStorage:", savedSelections);
          } catch (e) {
            console.error("Error parsing saved disk selections:", e);
          }
        }
        
        // If we have local selections, use them initially
        if (savedSelections && savedSelections.length > 0) {
          // Make sure each disk has the required specs property
          const validatedSelections = savedSelections.map(item => {
            // Ensure disk has all required properties
            const validatedDisk: PricedDiskOption = {
              id: item.disk.id,
              type: item.disk.type as "nvme" | "ssd" | "hdd",
              capacity: item.disk.capacity,
              price: item.disk.price,
              specs: item.disk.specs || {
                readSpeed: "N/A",
                writeSpeed: "N/A",
                iops: "N/A",
                recommended: []
              },
              name: item.disk.name,
              description: item.disk.description
            };
            
            return {
              disk: validatedDisk,
              quantity: item.quantity
            };
          });
          
          setSelectedDisks(validatedSelections);
        }

        // Then check database for most up-to-date data
        const allData = await PriceService.getAllData();
        
        if (allData && allData.disk && allData.disk.items && allData.disk.items.length > 0) {
          console.log("[InternalStoragePanel] Found disk items in database:", allData.disk.items.length);
          
          const dbSelections = allData.disk.items.map(item => {
            // Extract capacity from various possible sources
            let capacity;
            
            // First check explicit capacity property
            if (item.capacity) {
              capacity = item.capacity;
            } else {
              // Try to extract from specs
              const capacitySpec = item.specs?.find(spec => spec.toLowerCase().includes('capacidade:'));
              capacity = capacitySpec ? capacitySpec.split(':')[1]?.trim() : '';
              
              // If not in specs, try to extract from name
              if (!capacity) {
                const capacityMatch = item.name.match(/(\d+(?:\.\d+)?)\s*([TGM]B)/i);
                if (capacityMatch) {
                  capacity = `${capacityMatch[1]}${capacityMatch[2].toUpperCase()}`;
                }
              }
            }
            
            // Default capacity if nothing was found
            capacity = capacity || '500GB';
            
            // Determine disk type from various sources
            let diskType = item.subtype || item.type;
            if (!diskType || typeof diskType !== 'string') {
              const typeSpec = item.specs?.find(spec => spec.toLowerCase().includes('tipo:'));
              diskType = typeSpec 
                ? typeSpec.split(':')[1]?.trim().toLowerCase()
                : 'ssd';  // Default to SSD if no type found
            }
            
            // Validate disk type is one of the allowed values
            const validDiskType = (diskType === 'nvme' || diskType === 'ssd' || diskType === 'hdd') 
              ? diskType as "nvme" | "ssd" | "hdd" 
              : 'ssd' as "ssd";
            
            // Build the disk object  
            const disk: PricedDiskOption = {
              id: item.id,
              name: item.name,
              type: validDiskType,
              capacity: capacity,
              price: item.price || 0,
              description: item.description,
              specs: {
                readSpeed: "N/A",
                writeSpeed: "N/A", 
                iops: "N/A",
                recommended: []
              }
            };
            
            // Determine quantity from metadata or default to 1
            const quantity = item.metadata?.quantity || 1;
            
            return {
              disk,
              quantity
            };
          });
          
          if (dbSelections.length > 0 && isInitialLoad) {
            console.log("[InternalStoragePanel] Setting selections from database:", dbSelections);
            setSelectedDisks(dbSelections);
            
            // Update localStorage with latest database data
            localStorage.setItem('selectedDisks', JSON.stringify(dbSelections));
          }
        } else {
          console.log("[InternalStoragePanel] No disk selections found in database");
        }
        
        setIsInitialLoad(false);
        setIsDataRefreshed(true);
      } catch (error) {
        console.error("Error loading saved disk selections:", error);
        setIsInitialLoad(false);
      }
    };

    if (isInitialLoad) {
      loadSavedSelections();
    }
  }, [isInitialLoad, setSelectedDisks]);

  return {
    isInitialLoad,
    setIsInitialLoad,
    isDataRefreshed,
    setIsDataRefreshed
  };
}
