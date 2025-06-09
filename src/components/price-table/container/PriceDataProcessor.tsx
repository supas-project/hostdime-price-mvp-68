
import { useEffect } from "react";

interface PriceDataProcessorProps {
  priceData: any;
  setPriceData: (data: any) => void;
}

export function PriceDataProcessor({ priceData, setPriceData }: PriceDataProcessorProps) {
  // Effect para garantir que o priceData seja processado após ser carregado
  useEffect(() => {
    if (priceData) {
      console.log("PriceDataProcessor: Processing loaded price data");
      
      // Verificar todas as categorias para garantir que os items são arrays
      const fixedData = {...priceData};
      let needsUpdate = false;
      
      Object.keys(fixedData).forEach(key => {
        if (!fixedData[key]) {
          console.warn(`PriceDataProcessor: Category ${key} is undefined, removing it`);
          delete fixedData[key];
          needsUpdate = true;
          return;
        }
        
        if (!fixedData[key].items) {
          console.warn(`PriceDataProcessor: Category ${key} has no items property, adding empty array`);
          fixedData[key].items = [];
          needsUpdate = true;
        } else if (!Array.isArray(fixedData[key].items)) {
          console.warn(`PriceDataProcessor: Items is not an array for category ${key}, fixing...`);
          fixedData[key].items = Array.isArray(fixedData[key].items) ? fixedData[key].items : [];
          needsUpdate = true;
        }
        
        // Verificar se há itens undefined na array de items
        if (Array.isArray(fixedData[key].items)) {
          const filteredItems = fixedData[key].items.filter(item => item !== undefined && item !== null);
          if (filteredItems.length !== fixedData[key].items.length) {
            console.warn(`PriceDataProcessor: Found undefined/null items in category ${key}, removing them`);
            fixedData[key].items = filteredItems;
            needsUpdate = true;
          }
        }
      });
      
      // Forçar atualização do estado apenas se necessário
      if (needsUpdate) {
        console.log("PriceDataProcessor: Updating price data with fixed arrays");
        setPriceData({...fixedData});
      }
      
      // Verificar se temos dados em storage e external_storage
      if (fixedData.storage && fixedData.storage.items.length === 0 && 
          fixedData.external_storage && fixedData.external_storage.items.length === 0) {
        console.warn("PriceDataProcessor: Both storage categories are empty, consider refreshing data");
      }
    }
  }, [priceData, setPriceData]);

  return null; // This is a logic-only component
}
