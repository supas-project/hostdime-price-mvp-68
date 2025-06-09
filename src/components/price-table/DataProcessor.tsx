
import { PriceData } from "@/types/pricing";

export function processDataForDuplicates(priceData: PriceData): PriceData {
  const processedPriceData = { ...priceData };
  
  ["connectivity", "port_speed", "ip_blocks"].forEach(categoryId => {
    if (processedPriceData[categoryId] && Array.isArray(processedPriceData[categoryId].items)) {
      const originalLength = processedPriceData[categoryId].items.length;
      
      const uniqueIds = new Set<string>();
      processedPriceData[categoryId].items = processedPriceData[categoryId].items.filter(item => {
        if (!item || !item.id) return false;
        if (uniqueIds.has(item.id)) return false;
        uniqueIds.add(item.id);
        return true;
      });
      
      const newLength = processedPriceData[categoryId].items.length;
      if (newLength < originalLength) {
        console.log(`[DataProcessor] Removed ${originalLength - newLength} duplicate items from ${categoryId}`);
      }
    }
  });
  
  return processedPriceData;
}

interface DataProcessorProps {
  priceData: PriceData;
  children: (processedData: PriceData) => React.ReactNode;
}

export function DataProcessor({ priceData, children }: DataProcessorProps) {
  const processedData = processDataForDuplicates(priceData);
  return <>{children(processedData)}</>;
}
