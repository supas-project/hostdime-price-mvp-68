
import React, { useEffect, useState } from "react";
import { ComponentOption } from "@/types/component";
import { Card } from "@/components/ui/card";
import { OSSelector } from "./os/OSSelector";
import { useComponentOptions } from "@/hooks/use-component-options";
import { Skeleton } from "@/components/ui/skeleton";
import { PriceService } from "@/services/price-service";

interface OSContentProps {
  options?: ComponentOption[];
  selectedOption: ComponentOption | null;
  onSelectOption: (option: ComponentOption) => void;
}

export function OSContent({ 
  options: propOptions,
  selectedOption, 
  onSelectOption 
}: OSContentProps) {
  const { options, isLoading } = useComponentOptions('os');
  const [finalOptions, setFinalOptions] = useState<ComponentOption[]>([]);
  
  useEffect(() => {
    if (propOptions?.length) {
      setFinalOptions(propOptions);
    } else if (options?.length) {
      setFinalOptions(options);
    }
  }, [propOptions, options]);
  
  useEffect(() => {
    const updateFromPriceTable = async () => {
      try {
        const { data: session } = await PriceService.supabase.auth.getSession();
        if (!session.session) {
          console.log("User not authenticated, skipping OS data refresh");
          return;
        }
        
        await PriceService.forceRefreshFromLatestSource().catch(error => {
          if (!error.message.includes("Authentication")) {
            console.error("Erro ao carregar dados de SO da tabela de preços:", error);
          }
        });
      } catch (error) {
        console.log("Error during OS data refresh:", error);
      }
    };
    
    updateFromPriceTable();
  }, []);
  
  if (isLoading && !propOptions) {
    return (
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="text-base font-medium text-white">Sistema Operacional</div>
          </div>
          <Skeleton className="h-10 w-full bg-[#2a2a2a]" />
          <Skeleton className="h-4 w-2/3 bg-[#2a2a2a]" />
        </div>
      </Card>
    );
  }
  
  if (finalOptions.length === 0) {
    return (
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          <div className="text-base font-medium text-white">Sistema Operacional</div>
          <p className="text-sm text-muted-foreground">
            Nenhum sistema operacional disponível. Por favor, certifique-se de que existem opções cadastradas na tabela de preços.
          </p>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="p-4 sm:p-6 overflow-hidden">
      <div className="w-full overflow-x-hidden">
        <OSSelector
          options={finalOptions}
          selectedOption={selectedOption}
          onSelectOption={onSelectOption}
        />
      </div>
    </Card>
  );
}
