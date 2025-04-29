
import { Card } from "@/components/ui/card";
import { ComponentOption } from "@/types/component";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MemoryStick, Star, Check } from "lucide-react";
import { HelpTooltip } from "@/components/help-tooltip";
import { formatCurrency } from "@/lib/utils";
import { useComponentOptions } from "@/hooks/use-component-options";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MemoryContentProps {
  selectedOption: ComponentOption | null;
  onSelectOption: (option: ComponentOption) => void;
}

export function MemoryContent({ selectedOption, onSelectOption }: MemoryContentProps) {
  const { options, isLoading, error } = useComponentOptions('memory');

  // Notify about errors
  useEffect(() => {
    if (error) {
      toast.error("Erro ao carregar opções de memória", {
        description: "Não foi possível carregar a lista de memória disponível."
      });
    }
  }, [error]);
  
  // Show loading state
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <MemoryStick className="h-5 w-5 text-[#f58220]" />
            <div className="text-base font-medium text-white">Memória</div>
          </div>
          <Skeleton className="h-10 w-full bg-[#2a2a2a]" />
          <Skeleton className="h-4 w-2/3 bg-[#2a2a2a]" />
        </div>
      </Card>
    );
  }

  // Get recommended memory based on common use cases
  const getRecommendation = (useCase: string): string => {
    switch(useCase) {
      case "basic":
        // Find memory around 8-16GB
        return options.find(m => m.name.includes("8GB") || m.name.includes("16GB"))?.id || options[0]?.id;
      case "standard":
        // Find memory around 32GB
        return options.find(m => m.name.includes("32GB"))?.id || options[1]?.id;
      case "advanced":
        // Find memory around 64GB
        return options.find(m => m.name.includes("64GB"))?.id || options[2]?.id;
      case "pro":
        // Find highest memory option
        return options[options.length - 1]?.id;
      default:
        return options[0]?.id;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <MemoryStick className="h-5 w-5 text-[#f58220]" />
          <label className="text-base font-medium text-white flex items-center gap-2">
            Memória
            <HelpTooltip
              title="Sobre: Memória"
              description="Escolha a quantidade de memória RAM para seu servidor. Mais memória permite executar mais aplicações simultâneas ou processar volumes maiores de dados."
              iconOnly
            />
          </label>
        </div>

        <div className="bg-primary/5 p-3 rounded-md border border-primary/10 mb-2">
          <h3 className="text-sm font-medium mb-1 flex items-center">
            <Star className="h-4 w-4 text-primary mr-1" />
            Escolha por caso de uso
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Badge 
              variant="outline" 
              className={cn("cursor-pointer hover:bg-primary/10 justify-center",
                selectedOption?.id === getRecommendation("basic") && "bg-primary/20 border-primary")}
              onClick={() => {
                const option = options.find(opt => opt.id === getRecommendation("basic"));
                if (option) onSelectOption(option);
              }}
            >
              Websites pequenos
            </Badge>
            <Badge 
              variant="outline"
              className={cn("cursor-pointer hover:bg-primary/10 justify-center",
                selectedOption?.id === getRecommendation("standard") && "bg-primary/20 border-primary")}
              onClick={() => {
                const option = options.find(opt => opt.id === getRecommendation("standard"));
                if (option) onSelectOption(option);
              }}
            >
              Banco de dados pequenos
            </Badge>
            <Badge 
              variant="outline"
              className={cn("cursor-pointer hover:bg-primary/10 justify-center",
                selectedOption?.id === getRecommendation("advanced") && "bg-primary/20 border-primary")}
              onClick={() => {
                const option = options.find(opt => opt.id === getRecommendation("advanced"));
                if (option) onSelectOption(option);
              }}
            >
              Aplicações complexas
            </Badge>
            <Badge 
              variant="outline"
              className={cn("cursor-pointer hover:bg-primary/10 justify-center",
                selectedOption?.id === getRecommendation("pro") && "bg-primary/20 border-primary")}
              onClick={() => {
                const option = options.find(opt => opt.id === getRecommendation("pro"));
                if (option) onSelectOption(option);
              }}
            >
              Alta performance
            </Badge>
          </div>
        </div>

        <Select 
          value={selectedOption?.id || ""}
          onValueChange={(value) => {
            const option = options.find(opt => opt.id === value);
            if (option) onSelectOption(option);
          }}
        >
          <SelectTrigger className="w-full bg-[#1e1e1e] border-[#2a2a2a] text-white hover:border-[#f58220] transition-colors">
            <SelectValue placeholder="Escolha a memória ideal para você" />
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
                    {option.id === getRecommendation("standard") && (
                      <Badge className="bg-[#f58220] hover:bg-[#f58220] text-xs flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        <span className="text-[10px]">Recomendado</span>
                      </Badge>
                    )}
                  </div>
                  <span className="text-[#f58220] font-medium whitespace-nowrap">
                    {formatCurrency(option.price)}
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
