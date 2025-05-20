
import { useState, useEffect } from "react";
import { PricedDiskOption } from "@/types/storage";
import { DiskTypeSelector } from "./disk-selection/DiskTypeSelector";
import { DiskCapacitySelector } from "./disk-selection/DiskCapacitySelector";
import { SelectedDiskDisplay } from "./disk-selection/SelectedDiskDisplay";
import { OtherDisksDisplay } from "./disk-selection/OtherDisksDisplay";
import { EmptyDiskState } from "./disk-selection/EmptyDiskState";
import { SelectedDiskTypeInfo } from "./disk-selection/SelectedDiskTypeInfo";
import { useDiskManagement } from "@/hooks/storage/useDiskManagement";
import { useDiskDataLoader } from "@/hooks/storage/useDiskDataLoader";
import { toast } from "sonner";
import { PriceService } from "@/services/price-service";

interface InternalStoragePanelProps {
  onSelectDisk?: (disk: PricedDiskOption, quantity: number) => void;
}

export function InternalStoragePanel({ onSelectDisk }: InternalStoragePanelProps) {
  // Use our custom hooks
  const {
    selectedDiskType,
    selectedCapacity,
    selectedDisks,
    visibleDisks,
    handleTypeSelect,
    handleCapacitySelect,
    handleQuantityChange,
    handleRemoveDisk
  } = useDiskManagement({ onSelectDisk });

  // Load disk data using the data loader hook
  const { availableDisks, isLoading } = useDiskDataLoader(selectedDiskType);

  // Check for saved disk data in the database on initial load
  useEffect(() => {
    const loadSelectedDisksFromDatabase = async () => {
      try {
        // Check if we already have disks in local storage
        const localDisks = localStorage.getItem('selected_disks');
        if (localDisks && JSON.parse(localDisks).length > 0) {
          return; // Already have local data, no need to load from database
        }

        console.log("Checking for previously saved disk selections in database");
        const data = await PriceService.getAllData();
        
        if (data && data.discos_internos && data.discos_internos.items && data.discos_internos.items.length > 0) {
          console.log("Found saved disk selections in database:", data.discos_internos.items.length);
          
          // TODO: If needed, convert and restore disk selections from database
        }
      } catch (error) {
        console.error("Error loading disk selections from database:", error);
      }
    };
    
    loadSelectedDisksFromDatabase();
  }, []);

  // Add visibility state handler for leaving/returning to page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // When page becomes visible again, refresh data
        console.log("Page visibility changed to visible, refreshing disk data");
        PriceService.forceRefreshFromLatestSource()
          .then(() => {
            console.log("Disk data refreshed from latest source");
          })
          .catch(error => {
            console.error("Error refreshing disk data:", error);
          });
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 gap-4">
        <DiskTypeSelector
          selectedType={selectedDiskType}
          onTypeSelect={handleTypeSelect}
        />
        <DiskCapacitySelector
          selectedCapacity={selectedCapacity}
          onCapacitySelect={handleCapacitySelect}
          availableDisks={availableDisks}
          disabled={!selectedDiskType || isLoading}
          isLoading={isLoading}
        />
      </div>

      <SelectedDiskTypeInfo selectedDiskType={selectedDiskType} />

      {visibleDisks.length > 0 ? (
        <div className="space-y-4">
          {visibleDisks.map((item) => (
            <div key={item.disk.id} className="animate-fade-in">
              <SelectedDiskDisplay
                disk={item.disk}
                quantity={item.quantity}
                onQuantityChange={(qty) => handleQuantityChange(item.disk.id, qty)}
                onRemove={() => handleRemoveDisk(item.disk.id)}
              />
            </div>
          ))}
        </div>
      ) : (
        <EmptyDiskState 
          selectedDiskType={selectedDiskType}
          selectedDisks={selectedDisks}
        />
      )}

      <OtherDisksDisplay 
        selectedDisks={selectedDisks}
        selectedDiskType={selectedDiskType}
        onSelectDiskType={handleTypeSelect}
      />
    </div>
  );
}
