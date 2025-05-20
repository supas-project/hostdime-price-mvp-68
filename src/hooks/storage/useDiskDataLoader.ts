
import { useEffect, useState } from "react";
import { PricedDiskOption } from "@/types/storage";
import { PriceService } from "@/services/price-service";
import { toast } from "sonner";

export function useDiskDataLoader(selectedDiskType?: "nvme" | "ssd" | "hdd" | undefined) {
  const [availableDisks, setAvailableDisks] = useState<PricedDiskOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadAttempted, setLoadAttempted] = useState(false);

  // Function to refresh disk data
  const refreshData = async () => {
    try {
      console.log('[useDiskDataLoader] Refreshing disk data...');
      setIsLoading(true);
      
      // Get fresh disk data from service
      const disks = await PriceService.getDiskOptions();
      console.log('[useDiskDataLoader] Loaded disk options:', disks);
      
      if (disks.length === 0) {
        console.warn('[useDiskDataLoader] No disk options found');
      }
      
      // Filter disks by type if needed
      const filteredDisks = selectedDiskType
        ? disks.filter(disk => disk.type === selectedDiskType)
        : disks;
        
      console.log(`[useDiskDataLoader] Filtered to ${filteredDisks.length} ${selectedDiskType || 'all'} disks`);
      
      // Check for required properties
      const validDisks = filteredDisks.filter(disk => {
        const isValid = disk.id && disk.type && disk.capacity && disk.price;
        if (!isValid) {
          console.warn('[useDiskDataLoader] Invalid disk found:', disk);
        }
        return isValid;
      });
      
      setAvailableDisks(validDisks);
      setLoadAttempted(true);
    } catch (error) {
      console.error('[useDiskDataLoader] Error loading disk data:', error);
      toast.error("Erro ao carregar opções de disco", {
        description: "Não foi possível obter as opções de disco disponíveis."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load disk data on mount or when selected type changes
  useEffect(() => {
    refreshData();
  }, [selectedDiskType]);
  
  // Listen for storage data updates
  useEffect(() => {
    const handleStorageDataUpdated = () => {
      console.log('[useDiskDataLoader] Storage data updated event received, refreshing...');
      refreshData();
    };
    
    window.addEventListener('storage-data-updated', handleStorageDataUpdated);
    return () => {
      window.removeEventListener('storage-data-updated', handleStorageDataUpdated);
    };
  }, []);

  return {
    availableDisks,
    isLoading,
    refreshData,
    loadAttempted
  };
}
