
import { useState, useEffect, useCallback } from "react";
import { PriceService } from "@/services/price-service";
import { PricedDiskOption } from "@/types/storage";
import { toast } from "sonner";

export function useDiskDataLoader(selectedDiskType?: "nvme" | "ssd" | "hdd") {
  const [availableDisks, setAvailableDisks] = useState<PricedDiskOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadAttempted, setLoadAttempted] = useState(false);

  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("[useDiskDataLoader] Loading disk options...");
      
      // Use the PriceService.getDiskOptions method
      const diskOptions = await PriceService.getDiskOptions();
      
      setAvailableDisks(diskOptions);
      console.log(`[useDiskDataLoader] Successfully loaded ${diskOptions.length} disk options`);
      
      if (diskOptions.length === 0) {
        console.log("[useDiskDataLoader] No disk options found");
      } else {
        // Log a sample disk option for debugging
        console.log("[useDiskDataLoader] Sample disk option:", diskOptions[0]);
      }
    } catch (error) {
      console.error("[useDiskDataLoader] Error loading disk options:", error);
      toast.error("Erro ao carregar opções de disco", {
        description: "Verifique os dados no banco de dados."
      });
    } finally {
      setIsLoading(false);
      setLoadAttempted(true);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Filter disks based on selected type
  const filteredDisks = selectedDiskType 
    ? availableDisks.filter(disk => disk.type === selectedDiskType)
    : availableDisks;

  return { 
    availableDisks: filteredDisks, 
    isLoading, 
    refreshData, 
    loadAttempted 
  };
}
