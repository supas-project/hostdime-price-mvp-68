
import { useEffect } from "react";
import { PriceService } from "@/services/price-service";
import { PricedDiskOption } from "@/types/storage";
import { toast } from "sonner";

interface DiskSyncProps {
  selectedDisks: Array<{disk: PricedDiskOption, quantity: number}>;
  isPersisted: boolean;
  setIsPersisted: (isPersisted: boolean) => void;
  isInitialLoad: boolean;
}

export function useDiskSync({
  selectedDisks, 
  isPersisted, 
  setIsPersisted,
  isInitialLoad
}: DiskSyncProps) {
  // Persist to database when changes are made
  useEffect(() => {
    if (isInitialLoad) return; // Skip during initial load
    
    if (!isPersisted) {
      const saveToDatabase = async () => {
        try {
          console.log("Saving disk selections to database:", selectedDisks.length);
          
          // Get existing price data
          const allData = await PriceService.getAllData();
          
          // Make sure we have the discos_internos category
          if (!allData.discos_internos) {
            allData.discos_internos = {
              id: 'discos_internos',
              name: 'Discos Internos',
              items: []
            };
          }
          
          // Convert selected disks to price items
          const diskItems = selectedDisks.map(item => ({
            id: item.disk.id,
            name: `${item.disk.type.toUpperCase()} ${item.disk.capacity}`,
            description: `${item.disk.type.toUpperCase()} disk with ${item.disk.capacity} capacity`,
            price: item.disk.price * item.quantity,
            type: 'disk',
            subtype: item.disk.type,
            metadata: {
              quantity: item.quantity
            },
            specs: [
              `Capacidade: ${item.disk.capacity}`,
              `Tipo: ${item.disk.type.toUpperCase()}`
            ]
          }));
          
          // Update items in the category
          allData.discos_internos.items = diskItems;
          
          // Save to database
          await PriceService.saveData(allData);
          console.log("Disk selections saved to database:", diskItems.length);
          setIsPersisted(true);
        } catch (error) {
          console.error("Error saving disk selections to database:", error);
          toast.error("Erro ao salvar discos", {
            description: "Não foi possível salvar as alterações no banco de dados. Tente novamente mais tarde."
          });
        }
      };
      
      // Save with a small delay to avoid excessive database calls
      const timerId = setTimeout(saveToDatabase, 1000);
      return () => clearTimeout(timerId);
    }
  }, [selectedDisks, isPersisted, isInitialLoad, setIsPersisted]);

  // Force reload when page becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("Page visibility changed to visible, checking for updates");
        
        // Check if we should sync with database
        const checkDatabaseSync = async () => {
          try {
            // Check if there are conflicts
            const hasConflicts = await PriceService.checkForDataConflicts();
            
            if (hasConflicts) {
              console.log("Data conflicts detected, refreshing from database");
              
              // Get latest data
              await PriceService.forceRefreshFromLatestSource();
            }
          } catch (error) {
            console.error("Error checking for database conflicts:", error);
          }
        };
        
        checkDatabaseSync();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return null;
}
