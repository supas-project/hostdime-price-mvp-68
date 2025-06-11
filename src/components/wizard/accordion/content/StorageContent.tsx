import React, { useEffect } from "react";
import { ComponentOption } from "@/types/component";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HardDrive, Database, AlertCircle } from "lucide-react";
import { useComponentOptions } from "@/hooks/use-component-options";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { PriceService } from "@/services/price-service";
import { InternalStoragePanel } from "@/components/storage/InternalStoragePanel";
import { ExternalStoragePanel } from "@/components/storage/ExternalStoragePanel";

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

  // Loading state with skeleton
  if (isLoading) {
    return (
      <Card className="p-4 sm:p-6 bg-[#1e1e1e]">
        <div className="space-y-4">
          <Skeleton className="h-10 w-full bg-[#2a2a2a]" />
          <div className="space-y-4">
            <Skeleton className="h-32 w-full bg-[#2a2a2a]" />
            <Skeleton className="h-20 w-full bg-[#2a2a2a]" />
          </div>
        </div>
      </Card>
    );
  }

  // Error state with alert
  if (hasError) {
    return (
      <Card className="p-4 sm:p-6 bg-[#1e1e1e]">
        <Alert variant="destructive" className="bg-red-900/20 border-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {errorInternal && errorExternal 
              ? "Erro ao carregar opções de armazenamento interno e externo."
              : errorInternal 
                ? "Erro ao carregar armazenamento interno."
                : "Erro ao carregar armazenamento externo."
            }
          </AlertDescription>
        </Alert>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-6 bg-[#1e1e1e]">
      <Tabs defaultValue="internal" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-[#2a2a2a] border-[#3a3a3a]">
          <TabsTrigger 
            value="internal" 
            className="data-[state=active]:bg-[#f58220] data-[state=active]:text-white text-gray-300 hover:text-white transition-colors"
          >
            <HardDrive className="w-4 h-4 mr-2" />
            Armazenamento Interno
          </TabsTrigger>
          <TabsTrigger 
            value="external"
            className="data-[state=active]:bg-[#f58220] data-[state=active]:text-white text-gray-300 hover:text-white transition-colors"
          >
            <Database className="w-4 h-4 mr-2" />
            Armazenamento Externo
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="internal" className="mt-4 space-y-4">
          <div className="text-sm text-gray-400 mb-4">
            Configure os discos internos do seu servidor (SSD, NVMe, HDD)
          </div>
          <InternalStoragePanel 
            onSelectDisk={(disk, quantity) => {
              // Converter PricedDiskOption para ComponentOption
              const componentOption: ComponentOption = {
                id: disk.id,
                name: `${disk.type.toUpperCase()} ${disk.capacity}`,
                price: disk.price,
                type: 'disco',
                subtype: disk.type,
                isHardware: true,
                specs: disk.specs ? [
                  `Tipo: ${disk.type.toUpperCase()}`,
                  `Capacidade: ${disk.capacity}`,
                  `Velocidade de Leitura: ${disk.specs.readSpeed}`,
                  `Velocidade de Escrita: ${disk.specs.writeSpeed}`,
                  `IOPS: ${disk.specs.iops}`
                ].filter(spec => !spec.includes('N/A')) : undefined
              };
              onSelectStorageItem(componentOption, 'internal');
            }}
          />
        </TabsContent>
        
        <TabsContent value="external" className="mt-4 space-y-4">
          <div className="text-sm text-gray-400 mb-4">
            Configure soluções de armazenamento externo e backup
          </div>
          <ExternalStoragePanel 
            options={externalOptions || []}
            onSelectStorageItem={(option) => onSelectStorageItem(option, 'external')}
          />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
