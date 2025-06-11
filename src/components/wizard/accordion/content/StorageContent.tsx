import React, { useEffect } from "react";
import { ComponentOption } from "@/types/component";
import { Card } from "@/components/ui/card";
import { HardDrive, Database } from "lucide-react";
import { useComponentOptions } from "@/hooks/use-component-options";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { PriceService } from "@/services/price-service";
import { InternalStoragePanel } from "@/components/wizard/steps/storage/internal-storage-panel";
import { ExternalStoragePanel } from "@/components/wizard/steps/storage/external-storage-panel";

interface StorageContentProps {
  onSelectStorageItem: (storageOption: ComponentOption, storageType: 'internal' | 'external') => void;
}

export function StorageContent({ onSelectStorageItem }: StorageContentProps) {
  const { 
    options: internalOptions, 
    isLoading: isLoadingInternal, 
    error: errorInternal, 
    refreshOptions: refreshInternal 
  } = useComponentOptions('disco');
  
  const { 
    options: externalOptions, 
    isLoading: isLoadingExternal, 
    error: errorExternal, 
    refreshOptions: refreshExternal 
  } = useComponentOptions('external_storage');

  // Add listeners for price data changes
  useEffect(() => {
    const handlePriceDataChange = () => {
      console.log("[StorageContent] Price data changed, refreshing storage options");
      refreshInternal();
      refreshExternal();
    };
    
    PriceService.addDataChangeListener(handlePriceDataChange);
    
    return () => {
      PriceService.removeDataChangeListener(handlePriceDataChange);
    };
  }, [refreshInternal, refreshExternal]);

  // Notify about errors
  useEffect(() => {
    if (errorInternal) {
      toast.error("Erro ao carregar armazenamento interno", {
        description: "Não foi possível carregar as opções de armazenamento interno."
      });
    }
    if (errorExternal) {
      toast.error("Erro ao carregar armazenamento externo", {
        description: "Não foi possível carregar as opções de armazenamento externo."
      });
    }
  }, [errorInternal, errorExternal]);

  const isLoading = isLoadingInternal || isLoadingExternal;
  const hasError = errorInternal || errorExternal;

  if (isLoading) {
    return (
      <div className="w-full overflow-x-hidden space-y-4">
        <Card className="p-4 sm:p-6 bg-[#1e1e1e]">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-[#f58220]" />
              <div className="text-base font-medium text-white">Armazenamento Interno</div>
            </div>
            <Skeleton className="h-20 w-full bg-[#2a2a2a]" />
          </div>
        </Card>
        
        <Card className="p-4 sm:p-6 bg-[#1e1e1e]">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-[#f58220]" />
              <div className="text-base font-medium text-white">Armazenamento Externo</div>
            </div>
            <Skeleton className="h-20 w-full bg-[#2a2a2a]" />
          </div>
        </Card>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="w-full overflow-x-hidden space-y-4">
        <Card className="p-4 sm:p-6 bg-[#1e1e1e]">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-[#f58220]" />
              <div className="text-base font-medium text-white">Armazenamento</div>
            </div>
            <div className="text-sm text-red-400">
              Erro ao carregar opções de armazenamento. Tente novamente.
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-hidden space-y-4">
      <InternalStoragePanel 
        options={internalOptions || []}
        onSelectStorageItem={(option) => onSelectStorageItem(option, 'internal')}
      />
      
      <ExternalStoragePanel 
        options={externalOptions || []}
        onSelectStorageItem={(option) => onSelectStorageItem(option, 'external')}
      />
    </div>
  );
}
