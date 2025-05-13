
import { ComponentOption } from "@/types/component";
import { ComponentSelector } from "@/components/component-selector";
import { useMemo, useState, useEffect } from "react";
import { HelpTooltip } from "@/components/help-tooltip";
import { useWizard } from "@/contexts/WizardContext";
import { findMatchingComponent } from "@/utils/component-matching";
import { toast } from "@/hooks/use-toast";

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
  const processorInfo = selectedComponents["processador"];
  const coreCount = processorInfo?.metadata?.cores || 1;
  
  const [localSelectedId, setLocalSelectedId] = useState<string>(selectedOption?.id || "");
  
  // Debug information - show toast if options are empty
  useEffect(() => {
    if (options.length === 0) {
      console.warn("No OS options available for selection");
    }
  }, [options]);
  
  // Synchronize selected option when it changes
  useEffect(() => {
    if (selectedOption) {
      const matchingComponent = findMatchingComponent(selectedOption, options);
      setLocalSelectedId(matchingComponent?.id || selectedOption.id);
    }
  }, [selectedOption, options]);

  const formattedOptions = useMemo(() => {
    // Normalize subtypes - if subtype is undefined, infer from name
    const normalizedOptions = options.map(opt => {
      // If no subtype, try to infer from name
      let subtype = opt.subtype;
      if (!subtype) {
        const name = opt.name.toLowerCase();
        if (name.includes('windows')) subtype = 'windows';
        else if (name.includes('linux') || name.includes('ubuntu') || name.includes('centos')) subtype = 'linux';
        else if (name.includes('vmware') || name.includes('proxmox') || name.includes('virtualização')) subtype = 'virtualization';
        else if (name.includes('unix') || name.includes('freebsd')) subtype = 'unix';
        else subtype = 'other';
      }
      return { ...opt, subtype };
    });

    const windowsOptions = normalizedOptions
      .filter(opt => opt.subtype === "windows")
      .map(opt => ({
        ...opt,
        price: opt.metadata?.perCore ? opt.price * Math.ceil(coreCount / 2) : opt.price
      }));

    const linuxOptions = normalizedOptions.filter(opt => opt.subtype === "linux");
    const virtualizationOptions = normalizedOptions.filter(opt => opt.subtype === "virtualization");
    const unixOptions = normalizedOptions.filter(opt => (opt.subtype === "unix" || opt.subtype === "other"));

    const groups = [
      {
        group: "Windows",
        options: windowsOptions,
        tooltip: `Licenças Windows são cobradas a cada 2 cores. Seu processador tem ${coreCount} cores.`
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
    
    // Log the formatted groups for debugging
    console.log("OS formatted groups:", groups);
    
    return groups;
  }, [options, coreCount]);

  const handleValueChange = (value: string) => {
    setLocalSelectedId(value);
    const option = options.find(opt => opt.id === value);
    if (option) onSelectOption(option);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-medium">Sistema Operacional</h3>
        <HelpTooltip
          title="Sistema Operacional"
          description="Escolha o sistema operacional ideal para seu servidor. O Windows Server possui licenciamento por core, enquanto as outras opções são gratuitas."
          iconOnly
        />
      </div>
      
      {options.length === 0 ? (
        <div className="p-4 rounded-md bg-yellow-500/10 border border-yellow-500/50 text-yellow-600">
          <p>Não há sistemas operacionais disponíveis no momento. Por favor, verifique a tabela de preços.</p>
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
