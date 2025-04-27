
import { ComponentOption } from "@/types/component";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { HelpTooltip } from "@/components/help-tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { ChevronDown, ChevronUp, Server } from "lucide-react";
import { useWizard } from "@/contexts/WizardContext";

interface OSContentProps {
  options: ComponentOption[];
  selectedOption: ComponentOption | null;
  onSelectOption: (option: ComponentOption) => void;
}

export function OSContent({
  options,
  selectedOption,
  onSelectOption
}: OSContentProps) {
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const { selectedComponents } = useWizard();
  const processorInfo = selectedComponents["processador"];
  const coreCount = processorInfo?.metadata?.cores || 1;

  const windowsOptions = options.filter(opt => opt.subtype === "windows");
  const linuxOptions = options.filter(opt => opt.subtype === "linux");
  const virtualizationOptions = options.filter(opt => opt.subtype === "virtualization");
  const unixOptions = options.filter(opt => opt.subtype === "unix");

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const calculateWindowsPrice = (basePrice: number) => {
    const pairCount = Math.ceil(coreCount / 2);
    return basePrice * pairCount;
  };

  const renderOSCategory = (title: string, options: ComponentOption[], category: string) => {
    const isOpen = openCategories.includes(category);
    const hasSelectedInCategory = selectedOption && options.some(opt => opt.id === selectedOption.id);

    return (
      <Collapsible open={isOpen} onOpenChange={() => toggleCategory(category)}>
        <CollapsibleTrigger className="flex w-full items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium">{title}</h4>
              {hasSelectedInCategory && (
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  Selecionado
                </Badge>
              )}
            </div>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <RadioGroup
            value={selectedOption?.id}
            onValueChange={(value) => {
              const option = options.find(opt => opt.id === value);
              if (option) onSelectOption(option);
            }}
            className="grid gap-2"
          >
            {options.map((os) => (
              <div key={os.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={os.id} id={os.id} />
                  <Label htmlFor={os.id} className="flex flex-col">
                    <span>{os.name}</span>
                    {os.description && (
                      <span className="text-xs text-muted-foreground">{os.description}</span>
                    )}
                  </Label>
                </div>
                <Badge variant="secondary">
                  {os.metadata?.perCore 
                    ? `${formatCurrency(calculateWindowsPrice(os.price))} (${coreCount} cores)`
                    : os.price > 0 ? formatCurrency(os.price) : "Grátis"
                  }
                </Badge>
              </div>
            ))}
          </RadioGroup>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Server className="h-5 w-5 text-primary" />
        <h3 className="text-base font-medium">Sistema Operacional</h3>
        <HelpTooltip
          title="Sistema Operacional"
          description="Escolha o sistema operacional ideal para seu servidor"
          iconOnly
        />
      </div>
      
      {/* Windows sempre visível */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Windows Server</h4>
          <HelpTooltip 
            title="Licenças Windows" 
            description={`Licenças Windows são cobradas a cada 2 cores. Seu processador tem ${coreCount} cores.`}
          />
        </div>
        <RadioGroup
          value={selectedOption?.id}
          onValueChange={(value) => {
            const option = options.find(opt => opt.id === value);
            if (option) onSelectOption(option);
          }}
          className="grid gap-2"
        >
          {windowsOptions.map((os) => (
            <div key={os.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={os.id} id={os.id} />
                <Label htmlFor={os.id} className="flex flex-col">
                  <span>{os.name}</span>
                  <span className="text-xs text-muted-foreground">{os.description}</span>
                </Label>
              </div>
              <Badge variant="secondary">
                {formatCurrency(calculateWindowsPrice(os.price))}
              </Badge>
            </div>
          ))}
        </RadioGroup>
      </div>

      <Separator className="my-4" />

      {/* Linux em Collapsible */}
      {linuxOptions.length > 0 && (
        <>
          {renderOSCategory("Linux", linuxOptions, "linux")}
          <Separator className="my-4" />
        </>
      )}

      {/* Virtualização em Collapsible */}
      {virtualizationOptions.length > 0 && (
        <>
          {renderOSCategory("Plataformas de Virtualização", virtualizationOptions, "virtualization")}
          <Separator className="my-4" />
        </>
      )}

      {/* Unix em Collapsible */}
      {unixOptions.length > 0 && renderOSCategory("Unix e Outros", unixOptions, "unix")}
    </div>
  );
}
