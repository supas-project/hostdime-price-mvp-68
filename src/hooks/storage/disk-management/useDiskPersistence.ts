
import { useState } from "react";
import { PricedDiskOption } from "@/types/storage";
import { PriceService } from "@/services/price-service";
import { toast } from "sonner";

export function useDiskPersistence() {
  const [hasLocalChanges, setHasLocalChanges] = useState(false);

  // Function to persist selections to the database
  const persistSelectionsToDatabase = async (disks: {disk: PricedDiskOption, quantity: number}[]) => {
    try {
      console.log("[useDiskPersistence] Persisting selections to database:", disks);
      
      // Get current data from the database first
      const allData = await PriceService.getAllData();
      
      if (!allData || !allData.disk) {
        console.warn("No disk category found in database, creating one to persist selections");
        // Create category without items first
        const newCategory = await PriceService.addCategory({
          id: 'disk',
          name: 'Discos',
        });
        
        // Refresh data after creating the category
        const refreshedData = await PriceService.getAllData();
        if (!refreshedData || !refreshedData.disk) {
          console.error("Failed to create disk category");
          return;
        }
      }
      
      // Transform selected disks for storage
      const disksToStore = disks.map(item => ({
        id: item.disk.id,
        name: item.disk.name || `${item.disk.type.toUpperCase()} ${item.disk.capacity}`,
        description: item.disk.description || `${item.disk.type.toUpperCase()} disk with ${item.disk.capacity} capacity`,
        price: item.disk.price,
        type: item.disk.type,
        // Explicitly save subtype
        subtype: item.disk.type, 
        // Explicitly save capacity
        capacity: item.disk.capacity, 
        specs: [
          `Tipo: ${item.disk.type.toUpperCase()}`,
          `Capacidade: ${item.disk.capacity}`,
          `Quantidade: ${item.quantity}`
        ],
        metadata: {
          // Include all important disk metadata directly
          quantity: item.quantity,
          unitPrice: item.disk.price,
          type: item.disk.type,
          subtype: item.disk.type,
          capacity: item.disk.capacity,
          // Add performance specs in metadata
          readSpeed: item.disk.specs.readSpeed,
          writeSpeed: item.disk.specs.writeSpeed,
          iops: item.disk.specs.iops,
          recommended: item.disk.specs.recommended
        }
      }));
      
      // Get the existing data again to make sure we have the latest
      const latestData = await PriceService.getAllData();
      
      // Update the disk category
      const updatedCategory = {
        ...latestData.disk,
        items: disksToStore
      };
      
      // Update the data
      const updatedData = {
        ...latestData,
        disk: updatedCategory
      };
      
      // Save to database
      await PriceService.saveData(updatedData);
      console.log("[useDiskPersistence] Disk selections persisted to database", disksToStore);
      
      // Trigger a storage data update event to notify other components
      window.dispatchEvent(new CustomEvent('storage-data-updated'));
      
      // Also save to localStorage for redundancy
      localStorage.setItem('selectedDisks', JSON.stringify(disks));
      console.log("[useDiskPersistence] Disk selections persisted to localStorage", disks);
      
      setHasLocalChanges(false);
    } catch (error) {
      console.error("Error persisting disk selections to database:", error);
      toast.error("Erro ao salvar discos", {
        description: "Não foi possível salvar os discos no banco de dados."
      });
    }
  };

  return {
    hasLocalChanges,
    setHasLocalChanges,
    persistSelectionsToDatabase
  };
}
