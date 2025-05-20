
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
      
      // Get all data from PriceService
      const allData = await PriceService.getAllData();
      
      // Make sure the disk category exists and has items
      if (!allData.disk || !Array.isArray(allData.disk.items) || allData.disk.items.length === 0) {
        console.log("[useDiskDataLoader] No disk category or items found");
        setAvailableDisks([]);
        return;
      }
      
      console.log("[useDiskDataLoader] Found disk items:", allData.disk.items.length);
      
      // Use the PriceService's getDiskOptions method to get formatted disk options
      const diskOptions = await PriceService.getDiskOptions();
      
      console.log("[useDiskDataLoader] Received disk options:", diskOptions.length);
      
      setAvailableDisks(diskOptions);
      
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

  // Add a listener for storage-data-updated events
  useEffect(() => {
    const handleStorageDataUpdated = () => {
      console.log("[useDiskDataLoader] Storage data updated event received, refreshing data");
      refreshData();
    };
    
    window.addEventListener('storage-data-updated', handleStorageDataUpdated);
    
    return () => {
      window.removeEventListener('storage-data-updated', handleStorageDataUpdated);
    };
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
