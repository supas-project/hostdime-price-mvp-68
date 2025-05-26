
import React, { useEffect, useState } from "react";
import { ComponentOption } from "@/types/component";
import { Card } from "@/components/ui/card";
import { MultipleOSSelector } from "./os/MultipleOSSelector";
import { useComponentOptions } from "@/hooks/use-component-options";
import { Skeleton } from "@/components/ui/skeleton";
import { PriceService } from "@/services/price-service";
import { useWizard } from "@/contexts/WizardContext";

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
  const { selectedComponents } = useWizard();
  const [finalOptions, setFinalOptions] = useState<ComponentOption[]>([]);
  const [osItems, setOSItems] = useState<{ [key: string]: { option: ComponentOption; quantity: number; cores?: number } }>({});
  
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

  const handleUpdateOSItems = (items: { [key: string]: { option: ComponentOption; quantity: number; cores?: number } }) => {
    setOSItems(items);
    
    // Calcular o primeiro item para compatibilidade com o sistema existente
    const firstItem = Object.values(items)[0];
    if (firstItem) {
      let optionToSend = firstItem.option;
      
      // Para Windows Server com cores, calcular o preço total
      if (firstItem.option.subtype === "windows" && firstItem.option.metadata?.perCore && firstItem.cores) {
        const licensesNeeded = Math.ceil(firstItem.cores / 2);
        const calculatedPrice = firstItem.option.price * licensesNeeded;
        
        optionToSend = {
          ...firstItem.option,
          price: calculatedPrice,
          metadata: {
            ...firstItem.option.metadata,
            cores: firstItem.cores,
            licensesNeeded: licensesNeeded,
            unitPrice: firstItem.option.price
          }
        };
      }
      
      onSelectOption(optionToSend);
    } else {
      // Se não há itens, enviar opção vazia
      const emptyOption: ComponentOption = {
        id: "",
        name: "",
        description: "",
        price: 0,
        type: "os"
      };
      onSelectOption(emptyOption);
    }
  };
  
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
        <MultipleOSSelector
          options={finalOptions}
          selectedOSItems={osItems}
          onUpdateOSItems={handleUpdateOSItems}
        />
      </div>
    </Card>
  );
}
