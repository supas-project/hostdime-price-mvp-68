
interface DataValidatorProps {
  priceData: any;
}

export function DataValidator({ priceData }: DataValidatorProps) {
  if (priceData) {
    console.log("DataValidator: Available categories:", Object.keys(priceData).join(", "));
    
    // Verificar todas as categorias para garantir que estão estruturadas corretamente
    Object.keys(priceData).forEach(cat => {
      const category = priceData[cat];
      if (!category) {
        console.error(`DataValidator: Category ${cat} is undefined`);
        return;
      }
      
      if (!Array.isArray(category.items)) {
        console.error(`DataValidator: Category ${cat} has invalid items property:`, category.items);
      } else {
        console.log(`DataValidator: Category ${cat} has ${category.items.length} items`);
      }
    });
    
    // Verificar storage e external_storage especificamente
    if (priceData.storage) {
      if (Array.isArray(priceData.storage.items)) {
        console.log("DataValidator: Storage category items:", priceData.storage.items.length);
        if (priceData.storage.items.length > 0) {
          console.log("Storage items:", priceData.storage.items.map(item => `${item.id}: ${item.name}`).join(', '));
        }
      } else {
        console.error("DataValidator: Storage category items is not an array:", priceData.storage.items);
      }
    } else {
      console.log("DataValidator: Storage category not found");
    }
    
    if (priceData.external_storage) {
      if (Array.isArray(priceData.external_storage.items)) {
        console.log("DataValidator: External storage category items:", priceData.external_storage.items.length);
        if (priceData.external_storage.items.length > 0) {
          console.log("External Storage items:", priceData.external_storage.items.map(item => `${item.id}: ${item.name}`).join(', '));
        }
      } else {
        console.error("DataValidator: External storage category items is not an array:", priceData.external_storage.items);
      }
    } else {
      console.log("DataValidator: External storage category not found");
    }
  }

  return null; // This is a logic-only component
}
