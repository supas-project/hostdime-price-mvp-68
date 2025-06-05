
import { ComponentOption } from "@/types/component";
import { ComponentSelector } from "@/components/component-selector";
import { CoreSelector } from "./CoreSelector";
import { useMemo, useState, useEffect } from "react";
import { HelpTooltip } from "@/components/help-tooltip";
import { useWizard } from "@/contexts/WizardContext";
import { findMatchingComponent } from "@/utils/component-matching";
import { toast } from "sonner";

interface OSSelectorProps {
  options: ComponentOption[];
  selectedOption: ComponentOption | null;
  onSelectOption: (option: ComponentOption) => void;
}

export function OSSelector({
  options,
  selectedOption,
  onSelectOption
}: OSSelectorProps) {
  const { selectedComponents } = useWizard();
  const [localSelectedId, setLocalSelectedId] = useState<string>(selectedOption?.id || "");
  const [windowsLicenses, setWindowsLicenses] = useState<{
    [key: string]: { option: ComponentOption; coreCount: number }
  }>({});

  // Synchronize selected option when it changes
  useEffect(() => {
    if (selectedOption) {
      const matchingComponent = findMatchingComponent(selectedOption, options);
      setLocalSelectedId(matchingComponent?.id || selectedOption.id);
    } else {
      setLocalSelectedId("");
    }
  }, [selectedOption, options]);

  const formattedOptions = useMemo(() => {
    if (options.length === 0) {
      return [];
    }
    
    // Return all options as a flat array since ComponentSelector doesn't support groups
    return options;
  }, [options]);

  const handleValueChange = (value: string) => {
    const option = options.find(opt => opt.id === value);
    
    if (option) {
      setLocalSelectedId(value);
      
      // Se for Windows Server, adicionar à lista de licenças para configuração
      if (option.subtype === "windows" && option.metadata?.perCore) {
        const licenseKey = `${option.id}-license`;
        setWindowsLicenses(prev => ({
          ...prev,
          [licenseKey]: {
            option: option,
            coreCount: 2 // Valor inicial mínimo
          }
        }));
        
        // Criar uma cópia da opção com preço calculado para 2 cores
        const licensesNeeded = Math.ceil(2 / 2); // 1 licença para 2 cores
        const calculatedPrice = option.price * licensesNeeded;
        const optionWithCalculatedPrice = {
          ...option,
          price: calculatedPrice,
          metadata: {
            ...option.metadata,
            cores: 2,
            licensesNeeded: licensesNeeded,
            unitPrice: option.price
          }
        };
        
        onSelectOption(optionWithCalculatedPrice);
        
        toast.success("Windows Server Adicionado", {
          description: "Configure a quantidade de cores necessárias abaixo.",
          duration: 3000,
        });
      } else {
        // Para outros SOs, comportamento normal
        onSelectOption(option);
      }
    }
  };

  const handleCoreCountChange = (licenseKey: string, newCoreCount: number) => {
    setWindowsLicenses(prev => {
      const updated = {
        ...prev,
        [licenseKey]: {
          ...prev[licenseKey],
          coreCount: newCoreCount
        }
      };
      
      // Atualizar a opção selecionada com o novo preço
      const license = updated[licenseKey];
      if (license) {
        const licensesNeeded = Math.ceil(newCoreCount / 2);
        const calculatedPrice = license.option.price * licensesNeeded;
        const optionWithCalculatedPrice = {
          ...license.option,
          price: calculatedPrice,
          metadata: {
            ...license.option.metadata,
            cores: newCoreCount,
            licensesNeeded: licensesNeeded,
            unitPrice: license.option.price
          }
        };
        
        onSelectOption(optionWithCalculatedPrice);
      }
      
      return updated;
    });
  };

  const handleRemoveLicense = (licenseKey: string) => {
    setWindowsLicenses(prev => {
      const updated = { ...prev };
      delete updated[licenseKey];
      return updated;
    });
    
    // Se não há mais licenças Windows, limpar seleção
    if (Object.keys(windowsLicenses).length === 1) {
      setLocalSelectedId("");
      // Limpar seleção chamando onSelectOption com uma opção vazia
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <HelpTooltip
          title="Sistema Operacional"
          description="Escolha o sistema operacional ideal para seu servidor. O Windows Server permite configurar a quantidade de cores para cálculo automático do licenciamento."
          iconOnly
        />
      </div>
      
      {options.length === 0 ? (
        <div className="text-sm text-muted-foreground py-2">
          Nenhuma opção de sistema operacional disponível. Entre em contato com o suporte.
        </div>
      ) : (
        <>
          <ComponentSelector
            label="Sistema Operacional"
            options={formattedOptions}
            value={localSelectedId}
            onChange={handleValueChange}
            tooltip="Escolha o sistema operacional ideal para seu servidor"
            highlightSelection={true}
          />
          
          {/* Lista de licenças Windows configuradas */}
          {Object.keys(windowsLicenses).length > 0 && (
            <div className="space-y-3">
              <div className="text-sm font-medium text-muted-foreground">
                Licenças Windows Server Configuradas:
              </div>
              {Object.entries(windowsLicenses).map(([licenseKey, license]) => (
                <CoreSelector
                  key={licenseKey}
                  option={license.option}
                  coreCount={license.coreCount}
                  onCoreCountChange={(count) => handleCoreCountChange(licenseKey, count)}
                  onRemove={() => handleRemoveLicense(licenseKey)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
