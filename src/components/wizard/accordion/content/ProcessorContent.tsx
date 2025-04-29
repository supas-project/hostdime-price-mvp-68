
import { ComponentOption } from "@/types/component";
import { Card } from "@/components/ui/card";
import { Server, Star, Check } from "lucide-react";
import { HelpTooltip } from "@/components/help-tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { useComponentOptions } from "@/hooks/use-component-options";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProcessorContentProps {
  selectedOption: ComponentOption | null;
  onSelectOption: (option: ComponentOption) => void;
}

export function ProcessorContent({ 
  selectedOption, 
  onSelectOption 
}: ProcessorContentProps) {
  const { options, isLoading, error } = useComponentOptions('cpu');

  // Notify about errors
  useEffect(() => {
    if (error) {
      toast.error("Erro ao carregar processadores", {
        description: "Não foi possível carregar a lista de processadores disponíveis."
      });
    }
  }, [error]);

  // Show loading state
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-[#f58220]" />
            <div className="text-base font-medium text-white">Processador</div>
          </div>
          <Skeleton className="h-10 w-full bg-[#2a2a2a]" />
          <Skeleton className="h-4 w-2/3 bg-[#2a2a2a]" />
        </div>
      </Card>
    );
  }

  // Find best value CPU
  const getBestValueCPU = () => {
    if (!options || options.length === 0) return null;
    
    // Calculate performance per dollar (simplified)
    const withRatio = options.map(cpu => {
      // Extract core count from specs (or name as fallback)
      const coreSpec = cpu.specs?.find(spec => spec.includes("Cores:") || spec.includes("núcleos"));
      let cores = 0;
      
      if (coreSpec) {
        const match = coreSpec.match(/(\d+)/);
        if (match) cores = parseInt(match[1], 10);
      } else {
        // Try to extract core count from name as fallback
        const nameMatch = cpu.name.match(/(\d+)\s*(?:núcleos|cores)/i);
        if (nameMatch) cores = parseInt(nameMatch[1], 10);
      }
      
      // Avoid division by zero
      const ratio = cores > 0 ? (cores / cpu.price) : 0;
      return { ...cpu, ratio };
    });
    
    // Sort by ratio and take the top one
    withRatio.sort((a, b) => b.ratio - a.ratio);
    return withRatio[0]?.id || null;
  };
  
  const bestValueId = getBestValueCPU();

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Server className="h-5 w-5 text-[#f58220]" />
          <label className="text-base font-medium text-white flex items-center gap-2">
            Processador
            <HelpTooltip
              title="Sobre: Processadores"
              description="Escolha o processador que melhor atende suas necessidades de processamento. Mais núcleos significa melhor desempenho em aplicações que podem utilizar processamento paralelo."
              iconOnly
            />
          </label>
        </div>
        
        <div className="bg-primary/5 p-3 rounded-md border border-primary/10 mb-2">
          <h3 className="text-sm font-medium mb-1 flex items-center">
            <Star className="h-4 w-4 text-primary mr-1" />
            Recomendações por uso
          </h3>
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-primary/10"
              onClick={() => {
                const option = options.find(opt => opt.name.includes("Basic") || opt.name.includes("2 núcleos"));
                if (option) onSelectOption(option);
              }}
            >
              Websites simples
            </Badge>
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-primary/10"
              onClick={() => {
                const option = options.find(opt => opt.name.includes("Standard") || opt.name.includes("4 núcleos"));
                if (option) onSelectOption(option);
              }}
            >
              Aplicações web
            </Badge>
            <Badge 
              variant="outline"
              className="cursor-pointer hover:bg-primary/10"
              onClick={() => {
                const option = options.find(opt => opt.name.includes("Advanced") || opt.name.includes("8 núcleos") || opt.name.includes("Pro"));
                if (option) onSelectOption(option);
              }}
            >
              Banco de dados
            </Badge>
            <Badge 
              variant="outline"
              className="cursor-pointer hover:bg-primary/10"
              onClick={() => {
                const option = options.find(opt => opt.name.includes("16 núcleos") || opt.price > 300);
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
            <SelectValue placeholder="Escolha o processador ideal para você" />
          </SelectTrigger>
          <SelectContent className="bg-[#1e1e1e] border-[#2a2a2a] max-h-[280px]">
            <ScrollArea className="h-[220px]">
              {options.map((option) => (
                <SelectItem
                  key={option.id}
                  value={option.id}
                  className={cn(
                    "flex items-center justify-between py-2 px-3 hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] cursor-pointer text-white relative",
                    option.id === bestValueId && "border-l-2 border-[#f58220]"
                  )}
                >
                  <div className="flex justify-between items-center w-full gap-4">
                    <div className="flex items-center gap-2">
                      <span className="truncate">{option.name}</span>
                      {option.specs && (
                        <HelpTooltip
                          title={option.name}
                          description={option.specs.join('\n')}
                          iconOnly
                        />
                      )}
                      {option.id === bestValueId && (
                        <Badge className="bg-[#f58220] hover:bg-[#f58220] text-xs flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          <span className="text-[10px]">Melhor custo-benefício</span>
                        </Badge>
                      )}
                    </div>
                    <span className="text-[#f58220] font-medium whitespace-nowrap">
                      {formatCurrency(option.price)}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </ScrollArea>
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
}
