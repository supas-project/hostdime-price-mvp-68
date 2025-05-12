
import { diskPricing } from "@/data/storage-pricing";
import { StoragePricing } from "@/types/storage";

export function useStoragePricing() {
  /**
   * Gets the price for a specific disk type and capacity
   * @param type The disk type ('nvme', 'ssd', or 'hdd')
   * @param capacity The capacity in GB
   * @returns The price or undefined if not found
   */
  const getDiskPrice = (type: string, capacity: number): number | undefined => {
    // Convert capacity to GB if in TB
    const capacityGB = capacity >= 1 && capacity <= 10 ? capacity * 1000 : capacity;
    
    // Try to find exact match
    const key = `${type.toLowerCase()}-${capacityGB}` as keyof StoragePricing;
    
    if (diskPricing[key] !== undefined) {
      return diskPricing[key];
    }
    
    // Find closest capacity match if no exact match
    const capacityOptions = Object.keys(diskPricing)
      .filter(k => k.startsWith(`${type.toLowerCase()}-`))
      .map(k => ({
        key: k,
        capacity: parseInt(k.split('-')[1], 10)
      }))
      .sort((a, b) => a.capacity - b.capacity);
    
    if (capacityOptions.length === 0) return undefined;
    
    // Find the closest capacity option
    let closestOption = capacityOptions[0];
    let minDiff = Math.abs(capacityGB - closestOption.capacity);
    
    for (let i = 1; i < capacityOptions.length; i++) {
      const diff = Math.abs(capacityGB - capacityOptions[i].capacity);
      if (diff < minDiff) {
        minDiff = diff;
        closestOption = capacityOptions[i];
      }
    }
    
    return diskPricing[closestOption.key as keyof StoragePricing];
  };

  /**
   * Calculates storage pricing based on RAID configuration
   * @param diskType The disk type
   * @param diskCapacity The capacity per disk in GB
   * @param diskCount Number of disks
   * @param raidLevel RAID level (0, 1, 5, 10)
   * @returns The total price
   */
  const calculateRaidStoragePrice = (
    diskType: string,
    diskCapacity: number,
    diskCount: number,
    raidLevel: number | string
  ): number => {
    const singleDiskPrice = getDiskPrice(diskType, diskCapacity) || 0;
    return singleDiskPrice * diskCount;
  };

  return {
    getDiskPrice,
    calculateRaidStoragePrice
  };
}
