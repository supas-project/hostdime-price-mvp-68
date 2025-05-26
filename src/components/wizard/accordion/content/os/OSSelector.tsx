
import { ComponentOption } from "@/types/component";
import { ComponentSelector } from "@/components/component-selector";
import { useMemo, useState, useEffect } from "react";
import { HelpTooltip } from "@/components/help-tooltip";
import { useWizard } from "@/contexts/WizardContext";
import { findMatchingComponent } from "@/utils/component-matching";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const processorInfo = selectedComponents["processador"];
  const coreCount = processorInfo?.metadata?.cores || 1;
  
  const [localSelectedId, setLocalSelectedId] = useState<string>(selectedOption?.id || "");
  
  // Log information about options for debugging
  useEffect(() => {
    console.log("OSSelector received options:", options);
    console.log("Current processor:", processorInfo);
    console.log("Core count:", coreCount);
    if (options.length === 0) {
      console.info("No operating system options available in OSSelector");
    } else {
      console.info(`Found ${options.length} OS options`);
    }
  }, [options, processorInfo, coreCount]);
  
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
    
    // Exibe todos os itens se não estiverem agrupados por subtipo
    if (!options.some(opt => opt.subtype)) {
      return [{
        group: "Sistemas Operacionais",
        options: options
      }];
    }
    
    const windowsOptions = options
      .filter(opt => opt.subtype === "windows")
      .map(opt => {
        // NOVA LÓGICA: Calcular preço baseado nos cores para Windows Server
        if (opt.metadata?.perCore && processorInfo?.metadata?.cores) {
          const licensesNeeded = Math.ceil(coreCount / 2); // Windows Server licencia a cada 2 cores
          const calculatedPrice = opt.price * licensesNeeded;
          
          console.log(`[OSSelector] Calculando preço Windows Server: ${opt.price} x ${licensesNeeded} licenças = ${calculatedPrice}`);
          
          return {
            ...opt,
            price: calculatedPrice,
            description: `${opt.description} (${licensesNeeded} licenças para ${coreCount} cores)`,
            specs: [
              `Licenças necessárias: ${licensesNeeded} (a cada 2 cores)`,
              `Cores do processador: ${coreCount}`,
              `Preço por licença: R$ ${opt.price.toFixed(2)}`,
              ...(opt.specs?.slice(1) || [])
            ]
          };
        }
        return opt;
      });

    const linuxOptions = options.filter(opt => opt.subtype === "linux");
    const virtualizationOptions = options.filter(opt => opt.subtype === "virtualization");
    const unixOptions = options.filter(opt => opt.subtype === "unix");

    return [
      {
        group: "Windows",
        options: windowsOptions,
        tooltip: processorInfo?.metadata?.cores 
          ? `Licenças Windows são cobradas a cada 2 cores. Seu processador tem ${coreCount} cores, necessitando ${Math.ceil(coreCount / 2)} licenças.`
          : `Licenças Windows são cobradas a cada 2 cores. Selecione um processador primeiro para cálculo automático.`
      },
      {
        group: "Linux",
        options: linuxOptions
      },
      {
        group: "Virtualização",
        options: virtualizationOptions
      },
      {
        group: "Unix e Outros",
        options: unixOptions
      }
    ].filter(group => group.options.length > 0);
  }, [options, coreCount, processorInfo]);

  const handleValueChange = (value: string) => {
    setLocalSelectedId(value);
    const option = formattedOptions
      .flatMap(group => group.options)
      .find(opt => opt.id === value);
    
    if (option) {
      // Se for Windows Server com licenciamento por core, notificar sobre o cálculo
      if (option.metadata?.perCore && processorInfo?.metadata?.cores) {
        const licensesNeeded = Math.ceil(coreCount / 2);
        toast.success("Licenciamento Windows Server Calculado", {
          description: `Calculado automaticamente: ${licensesNeeded} licenças para ${coreCount} cores (R$ ${option.price.toFixed(2)})`,
          duration: 4000,
        });
      }
      
      onSelectOption(option);
    }
  };

  // Mostrar aviso se não há processador selecionado e há opções Windows
  const hasWindowsOptions = options.some(opt => opt.subtype === "windows" && opt.metadata?.perCore);
  const showProcessorWarning = hasWindowsOptions && !processorInfo?.metadata?.cores;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <HelpTooltip
          title="Sistema Operacional"
          description="Escolha o sistema operacional ideal para seu servidor. O Windows Server possui licenciamento por core, sendo calculado automaticamente baseado no processador selecionado."
          iconOnly
        />
      </div>
      
      {showProcessorWarning && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
          <div className="font-medium text-yellow-800 mb-1">
            ⚠️ Atenção: Licenciamento Windows Server
          </div>
          <div className="text-yellow-700">
            Para calcular automaticamente o preço das licenças Windows Server, selecione primeiro um processador na categoria anterior.
          </div>
        </div>
      )}
      
      {options.length === 0 ? (
        <div className="text-sm text-muted-foreground py-2">
          Nenhuma opção de sistema operacional disponível. Entre em contato com o suporte.
        </div>
      ) : (
        <ComponentSelector
          label="Sistema Operacional"
          options={formattedOptions.flatMap(group => group.options)}
          value={localSelectedId}
          onChange={handleValueChange}
          tooltip="Escolha o sistema operacional ideal para seu servidor"
          highlightSelection={true}
          groupedOptions={formattedOptions}
        />
      )}
    </div>
  );
}
