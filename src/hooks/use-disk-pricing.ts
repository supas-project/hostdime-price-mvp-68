
import { useEffect, useState } from 'react';
import { diskPricing } from '@/data/storage-pricing';

interface DiskPrice {
  id: string;
  name: string;
  price: number;
  type: string;
  capacity: number;
}

export function useDiskPricing() {
  const [diskPrices, setDiskPrices] = useState<DiskPrice[]>([]);
  
  useEffect(() => {
    // Convert storage pricing from data to usable format
    const prices: DiskPrice[] = Object.entries(diskPricing).map(([id, price]) => {
      // Parse the ID to get type and capacity
      // Format is "type-capacity" e.g. "nvme-500"
      const [type, capacityStr] = id.split('-');
      const capacity = parseInt(capacityStr, 10);
      
      return {
        id,
        name: `${type.toUpperCase()} ${capacity}GB`,
        price,
        type,
        capacity
      };
    });
    
    setDiskPrices(prices);
  }, []);
  
  return { diskPrices };
}
