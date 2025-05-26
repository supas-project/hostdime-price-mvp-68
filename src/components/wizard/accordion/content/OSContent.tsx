
import React, { useEffect, useState } from "react";
import { ComponentOption } from "@/types/component";
import { Card } from "@/components/ui/card";
import { OSSelector } from "./os/OSSelector";
import { findMatchingComponent } from "@/utils/component-matching";
import { useComponentOptions } from "@/hooks/use-component-options";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { PriceService } from "@/services/price-service";
import { useWizard } from "@/contexts/WizardContext";

interface OSContentProps {
  // Make options optional by adding the ? modifier
  options?: ComponentOption[];
  selectedOption: ComponentOption | null;
  onSelectOption: (option: ComponentOption) => void;
}

export function OSContent({ 
  options: propOptions, // Rename to avoid conflict with the hook's options
  selectedOption, 
  onSelectOption 
}: OSContentProps) {
  // Use propOptions if provided, otherwise fetch from the price service
  const { options, isLoading, error } = useComponentOptions('os');
  const { selectedComponents } = useWizard();
  const [finalOptions, setFinalOptions] = useState<ComponentOption[]>([]);
  const [localSelectedId, setLocalSelectedId] = useState<string>(selectedOption?.id || "");
  
  const processorInfo = selectedComponents["processador"];
  
  useEffect(() => {
    // Set final options based on propOptions or fetched options
    if (propOptions?.length) {
      setFinalOptions(propOptions);
    } else if (options?.length) {
      setFinalOptions(options);
    }
  }, [propOptions, options]);
  
  useEffect(() => {
    // Try to load data from the price service, but don't show errors if not authenticated
    const updateFromPriceTable = async () => {
      try {
        const { data: session } = await PriceService.supabase.auth.getSession();
        if (!session.session) {
          console.log("User not authenticated, skipping OS data refresh");
          return;
        }
        
        await PriceService.forceRefreshFromLatestSource().catch(error => {
          // Only log authentication errors, don't display them to users
          if (!error.message.includes("Authentication")) {
            console.error("Erro ao carregar dados de SO da tabela de preços:", error);
          }
        });
      } catch (error) {
        // Silent fail - just for logging purposes
        console.log("Error during OS data refresh:", error);
      }
    };
    
    updateFromPriceTable();
    
    // Log information about options for debugging
    console.log("OSContent options from useComponentOptions:", finalOptions);
    console.log("OSContent processor info:", processorInfo);
    
    if (finalOptions.length === 0 && !isLoading) {
      console.warn("Nenhuma opção de SO disponível. Verificando opções alternativas.");
    }
  }, [finalOptions.length, processorInfo]);
  
  // Synchronize local state with props when selectedOption changes
  useEffect(() => {
    if (selectedOption) {
      // Find the matching option in available options
      const matchingOption = findMatchingComponent(selectedOption, finalOptions);
      setLocalSelectedId(matchingOption?.id || selectedOption.id);
    } else {
      setLocalSelectedId("");
    }
  }, [selectedOption, finalOptions]);
  
  // Show loading state
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
          selectedOption={finalOptions.find(opt => opt.id === localSelectedId) || null}
          onSelectOption={onSelectOption}
        />
      </div>
    </Card>
  );
}
