
import { ComponentOption } from "@/types/component";
import { ComponentSelector } from "@/components/component-selector";
import { useMemo } from "react";
import { HelpTooltip } from "@/components/help-tooltip";
import { useWizard } from "@/contexts/WizardContext";

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

  const formattedOptions = useMemo(() => {
    const windowsOptions = options
      .filter(opt => opt.subtype === "windows")
      .map(opt => ({
        ...opt,
        price: opt.metadata?.perCore ? opt.price * Math.ceil(coreCount / 2) : opt.price
      }));

    const linuxOptions = options.filter(opt => opt.subtype === "linux");
    const virtualizationOptions = options.filter(opt => opt.subtype === "virtualization");
    const unixOptions = options.filter(opt => opt.subtype === "unix");

    return [
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
  }, [options, coreCount]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <HelpTooltip
          title="Sistema Operacional"
          description="Escolha o sistema operacional ideal para seu servidor. O Windows Server possui licenciamento por core, enquanto as outras opções são gratuitas."
          iconOnly
        />
      </div>
      
      <ComponentSelector
        label="Sistema Operacional"
        options={formattedOptions.flatMap(group => group.options)}
        value={selectedOption?.id || ""}
        onChange={(value) => {
          const option = options.find(opt => opt.id === value);
          if (option) onSelectOption(option);
        }}
        tooltip="Escolha o sistema operacional ideal para seu servidor"
        highlightSelection={true}
        groupedOptions={formattedOptions}
      />
    </div>
  );
}
