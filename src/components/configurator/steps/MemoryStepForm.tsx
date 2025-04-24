import { useState } from "react";
import { MemoryOption, ChassisOption } from "@/types/server-config";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, Plus, Minus, MemoryStick, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatCurrency } from "@/lib/utils";

interface MemoryStepFormProps {
  selectedChassis: ChassisOption | null;
  memoryConfig: {
    option: MemoryOption | null;
    quantity: number;
  };
  onUpdateMemory: (memory: { option: MemoryOption | null; quantity: number }) => void;
  onNext: () => void;
  onPrev: () => void;
}

// Dados mockados de memória
const memoryOptions: MemoryOption[] = [
  {
    id: "mem-1",
    type: "DDR4",
    size: 8,
    description: "8GB DDR4 2666MHz",
    price: 120,
    compatibleChassis: ["chassis-1", "chassis-2", "chassis-3", "chassis-4"]
  },
  {
    id: "mem-2",
    type: "DDR4",
    size: 16,
    description: "16GB DDR4 2933MHz",
    price: 240,
    compatibleChassis: ["chassis-1", "chassis-2", "chassis-3", "chassis-4"]
  },
  {
    id: "mem-3",
    type: "DDR4",
    size: 32,
    description: "32GB DDR4 3200MHz",
    price: 480,
    compatibleChassis: ["chassis-2", "chassis-3", "chassis-4"]
  },
  {
    id: "mem-4",
    type: "DDR4",
    size: 64,
    description: "64GB DDR4 3200MHz",
    price: 960,
    compatibleChassis: ["chassis-3", "chassis-4"]
  }
];

export function MemoryStepForm({
  selectedChassis,
  memoryConfig,
  onUpdateMemory,
  onNext,
  onPrev
}: MemoryStepFormProps) {
  // Filtra as opções de memória compatíveis com o chassi selecionado
  const compatibleMemory = memoryOptions.filter(mem => 
    selectedChassis && mem.compatibleChassis.includes(selectedChassis.id)
  );
  
  const handleSelectMemory = (memory: MemoryOption) => {
    // Se já estava selecionada, mantém a quantidade
    // Se não estava selecionada, inicia com quantidade 1
    const quantity = memory.id === memoryConfig.option?.id
      ? memoryConfig.quantity
      : 1;
    
    onUpdateMemory({ option: memory, quantity });
  };
  
  const incrementQuantity = () => {
    if (!memoryConfig.option || !selectedChassis) return;
    
    // Limitar pela quantidade de slots disponíveis no chassi
    if (memoryConfig.quantity < selectedChassis.memorySlots) {
      onUpdateMemory({
        option: memoryConfig.option,
        quantity: memoryConfig.quantity + 1
      });
    }
  };
  
  const decrementQuantity = () => {
    if (!memoryConfig.option) return;
    
    if (memoryConfig.quantity > 1) {
      onUpdateMemory({
        option: memoryConfig.option,
        quantity: memoryConfig.quantity - 1
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <p className="text-lg">Escolha a memória RAM</p>
        <p className="text-muted-foreground text-sm mt-1">
          Selecione o tipo e quantidade de memória RAM.
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-5 w-5 ml-1">
                  <HelpCircle className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  A quantidade de RAM determina quantos dados seu servidor pode processar simultaneamente.
                  Mais RAM permite mais aplicações rodando ao mesmo tempo.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {compatibleMemory.map((memory) => (
          <Card 
            key={memory.id}
            className={`cursor-pointer transition-all hover:border-primary hover:shadow-md ${
              memoryConfig.option?.id === memory.id 
                ? "border-primary bg-primary/5"
                : "border-border"
            }`}
            onClick={() => handleSelectMemory(memory)}
          >
            <CardContent className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium mb-1">{memory.size}GB {memory.type}</h3>
                  <CardDescription>{memory.description}</CardDescription>
                </div>
                
                <div className="font-bold text-primary">
                  {formatCurrency(memory.price)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {memoryConfig.option && (
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="font-medium mb-4">Quantidade de módulos de memória</p>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={decrementQuantity}
              disabled={memoryConfig.quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            
            <div className="w-16 text-center">
              <p className="text-xl font-medium">{memoryConfig.quantity}</p>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={incrementQuantity}
              disabled={!selectedChassis || memoryConfig.quantity >= selectedChassis.memorySlots}
            >
              <Plus className="h-4 w-4" />
            </Button>
            
            <div className="ml-4 text-muted-foreground">
              <p>
                {selectedChassis && (
                  <>
                    {memoryConfig.quantity} de {selectedChassis.memorySlots} slots disponíveis
                  </>
                )}
              </p>
              <p>
                Total: {formatCurrency(memoryConfig.option.price * memoryConfig.quantity)}
              </p>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mt-4">
            Total de memória: <span className="font-medium">{memoryConfig.option.size * memoryConfig.quantity}GB</span>
          </p>
        </div>
      )}

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
          disabled={!memoryConfig.option || memoryConfig.quantity === 0}
        >
          Próximo
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
