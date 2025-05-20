
import { useState, useEffect, useCallback } from "react";
import { PricedDiskOption } from "@/types/storage";
import { getDiskOptions } from "@/services/price/operations/data-retrieval";

export function useDiskDataLoader(selectedDiskType: "nvme" | "ssd" | "hdd" | undefined) {
  const [availableDisks, setAvailableDisks] = useState<PricedDiskOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadAttempted, setLoadAttempted] = useState<boolean>(false);

  const refreshData = useCallback(async () => {
    if (!selectedDiskType) {
      setAvailableDisks([]);
      return;
    }

    setIsLoading(true);
    try {
      // Get all disk options from the price service
      const disks = await getDiskOptions();
      
      // Filter disks based on selected type
      const filteredDisks = disks.filter(disk => disk.type === selectedDiskType);
      setAvailableDisks(filteredDisks);
      setLoadAttempted(true);
    } catch (error) {
      console.error(`Error loading ${selectedDiskType} disks:`, error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDiskType]);

  useEffect(() => {
    refreshData();
  }, [refreshData, selectedDiskType]);

  return { availableDisks, isLoading, refreshData, loadAttempted };
}
