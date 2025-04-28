
import { Card } from "@/components/ui/card";
import { ComponentOption } from "@/types/component";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Server } from "lucide-react";
import { HelpTooltip } from "@/components/help-tooltip";
import { formatCurrency } from "@/lib/utils";
import { useComponentOptions } from "@/hooks/use-component-options";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useEffect } from "react";

interface OSContentProps {
  options?: ComponentOption[];
  selectedOption: ComponentOption | null;
  onSelectOption: (option: ComponentOption) => void;
}

export function OSContent({ selectedOption, onSelectOption }: OSContentProps) {
  const { options, isLoading, error } = useComponentOptions('os');

  // Notificar sobre erros
  useEffect(() => {
    if (error) {
      toast.error("Erro ao carregar sistemas operacionais", {
        description: "Não foi possível carregar a lista de sistemas operacionais disponíveis."
      });
    }
  }, [error]);
  
  // Mostrar estado de carregamento
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-[#f58220]" />
            <div className="text-base font-medium text-white">Sistema Operacional</div>
          </div>
          <Skeleton className="h-10 w-full bg-[#2a2a2a]" />
          <Skeleton className="h-4 w-2/3 bg-[#2a2a2a]" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Server className="h-5 w-5 text-[#f58220]" />
          <label className="text-base font-medium text-white flex items-center gap-2">
            Sistema Operacional
            <HelpTooltip
              title="Sobre: Sistemas Operacionais"
              description="Escolha o sistema operacional para seu servidor. A escolha impacta na compatibilidade com softwares e na facilidade de administração."
              iconOnly
            />
          </label>
        </div>

        <Select 
          value={selectedOption?.id || ""}
          onValueChange={(value) => {
            const option = options.find(opt => opt.id === value);
            if (option) onSelectOption(option);
          }}
        >
          <SelectTrigger className="w-full bg-[#1e1e1e] border-[#2a2a2a] text-white hover:border-[#f58220] transition-colors">
            <SelectValue placeholder="Escolha o sistema operacional" />
          </SelectTrigger>
          <SelectContent className="bg-[#1e1e1e] border-[#2a2a2a]">
            {options.map((option) => (
              <SelectItem
                key={option.id}
                value={option.id}
                className="flex items-center justify-between py-2 px-3 hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] cursor-pointer text-white"
              >
                <div className="flex justify-between items-center w-full gap-4">
                  <div className="flex items-center gap-2">
                    <span>{option.name}</span>
                    {option.specs && option.specs.length > 0 && (
                      <HelpTooltip
                        title={option.name}
                        description={option.specs.join('\n')}
                        iconOnly
                      />
                    )}
                  </div>
                  <span className="text-[#f58220] font-medium whitespace-nowrap">
                    {option.price === 0 ? "Grátis" : formatCurrency(option.price)}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
}
