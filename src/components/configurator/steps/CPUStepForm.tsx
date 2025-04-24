
import { useState, useEffect } from "react";
import { CPUOption } from "@/types/server-config";
import { 
  Card, 
  CardContent, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Cpu, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatCurrency } from "@/lib/utils";

interface CPUStepFormProps {
  selectedCPU: CPUOption | null;
  onUpdateCPU: (cpu: CPUOption) => void;
  onNext: () => void;
  onPrev: () => void;
}

// Dados mockados de CPUs
const cpuOptions: CPUOption[] = [
  {
    id: "cpu-1",
    model: "Intel Xeon E-2224",
    description: "CPU básica para aplicações leves",
    cores: 4,
    ghz: 3.4,
    price: 280
  },
  {
    id: "cpu-2",
    model: "Intel Xeon E-2288G",
    description: "CPU intermediária com bom custo-benefício",
    cores: 8,
    ghz: 3.7,
    price: 580
  },
  {
    id: "cpu-3",
    model: "Intel Xeon Silver 4210",
    description: "CPU avançada para cargas pesadas",
    cores: 10,
    ghz: 2.2,
    price: 980
  },
  {
    id: "cpu-4",
    model: "Intel Xeon Gold 6230",
    description: "CPU premium para aplicações críticas",
    cores: 20,
    ghz: 2.1,
    price: 1920
  }
];

export function CPUStepForm({
  selectedCPU,
  onUpdateCPU,
  onNext,
  onPrev
}: CPUStepFormProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-lg">Escolha seu processador</p>
        <p className="text-muted-foreground text-sm mt-1">
          Selecione o processador ideal para sua aplicação.
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-5 w-5 ml-1">
                  <HelpCircle className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  O processador é o "cérebro" do servidor. Quanto mais núcleos e maior a frequência (GHz),
                  mais rápido o servidor processará informações.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cpuOptions.map((cpu) => (
          <Card 
            key={cpu.id}
            className={`cursor-pointer transition-all hover:border-primary hover:shadow-md ${
              selectedCPU?.id === cpu.id 
                ? "border-primary bg-primary/5"
                : "border-border"
            }`}
            onClick={() => onUpdateCPU(cpu)}
          >
            <CardContent className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium mb-1">{cpu.model}</h3>
                  <CardDescription>{cpu.description}</CardDescription>
                  
                  <div className="mt-4 flex items-center gap-4">
                    <div className="flex items-center">
                      <Cpu className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="text-sm">{cpu.cores} núcleos</span>
                    </div>
                    <div className="text-sm">{cpu.ghz} GHz</div>
                  </div>
                </div>
                
                <div className="font-bold text-primary">
                  {formatCurrency(cpu.price)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between">
        <Button 
          variant="outline"
          onClick={onPrev}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Anterior
        </Button>
        <Button 
          onClick={onNext}
          disabled={!selectedCPU}
        >
          Próximo
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
