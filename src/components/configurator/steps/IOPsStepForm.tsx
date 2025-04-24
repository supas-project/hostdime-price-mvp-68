
import { useState } from "react";
import { IOPsBlockOption } from "@/types/server-config";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription 
} from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Plus, Minus, Database, HelpCircle, Trash2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatCurrency } from "@/lib/utils";
import { mockIOPsBlocks } from "@/services/priceService";

interface IOPsStepFormProps {
  iopsBlocks: Array<{
    option: IOPsBlockOption;
    quantity: number;
  }>;
  onUpdateIOPs: (iops: Array<{
    option: IOPsBlockOption;
    quantity: number;
  }>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function IOPsStepForm({
  iopsBlocks,
  onUpdateIOPs,
  onNext,
  onPrev
}: IOPsStepFormProps) {
  const [selectedBlock, setSelectedBlock] = useState<IOPsBlockOption | null>(null);
  const [quantity, setQuantity] = useState(1);
  
  const iopsOptions = mockIOPsBlocks;
  
  const handleSelectBlock = (block: IOPsBlockOption) => {
    setSelectedBlock(block);
    // Se já existir um bloco deste tipo, carrega a quantidade
    const existingBlock = iopsBlocks.find(b => b.option.id === block.id);
    setQuantity(existingBlock?.quantity || 1);
  };
  
  const handleIncrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };
  
  const handleDecrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };
  
  const handleAddBlock = () => {
    if (!selectedBlock) return;
    
    // Verifica se já existe um bloco do mesmo tipo
    const existingBlockIndex = iopsBlocks.findIndex(b => 
      b.option.id === selectedBlock.id
    );
    
    if (existingBlockIndex >= 0) {
      // Atualiza um bloco existente
      const updatedBlocks = [...iopsBlocks];
      updatedBlocks[existingBlockIndex] = {
        option: selectedBlock,
        quantity
      };
      onUpdateIOPs(updatedBlocks);
    } else {
      // Adiciona um novo bloco
      onUpdateIOPs([
        ...iopsBlocks,
        {
          option: selectedBlock,
          quantity
        }
      ]);
    }
    
    // Reset selection
    setSelectedBlock(null);
    setQuantity(1);
  };
  
  const handleRemoveBlock = (index: number) => {
    const updatedBlocks = [...iopsBlocks];
    updatedBlocks.splice(index, 1);
    onUpdateIOPs(updatedBlocks);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <p className="text-lg">Blocos de IOPs</p>
        <p className="text-muted-foreground text-sm mt-1">
          Adicione blocos de IOPs para melhorar o desempenho de I/O do seu servidor.
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-5 w-5 ml-1">
                  <HelpCircle className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p>
                  IOPs (Input/Output Operations Per Second) são as operações de leitura e escrita 
                  que seu servidor pode processar por segundo. Adicionar blocos de IOPs melhora o 
                  desempenho de bancos de dados e aplicações com alta demanda de I/O.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </p>
      </div>
      
      {/* Lista de blocos já adicionados */}
      {iopsBlocks.length > 0 && (
        <Card>
          <CardContent className="pt-6 space-y-3">
            {iopsBlocks.map((block, index) => (
              <div key={index} className="flex justify-between items-center bg-background/50 p-3 rounded-lg">
                <div>
                  <p className="font-medium">
                    {block.quantity}x {block.option.type}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {block.option.description}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-medium text-primary">
                    {formatCurrency(block.option.pricePerBlock * block.quantity)}
                  </p>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive"
                    onClick={() => handleRemoveBlock(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      
      {/* Seleção de novos blocos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {iopsOptions.map((block) => (
          <Card 
            key={block.id}
            className={`cursor-pointer transition-all hover:border-primary hover:shadow-md ${
              selectedBlock?.id === block.id 
                ? "border-primary bg-primary/5"
                : "border-border"
            }`}
            onClick={() => handleSelectBlock(block)}
          >
            <CardContent className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium mb-1">{block.type}</h3>
                  <CardDescription>{block.description}</CardDescription>
                </div>
                
                <div className="font-bold text-primary">
                  {formatCurrency(block.pricePerBlock)}/bloco
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {selectedBlock && (
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex flex-wrap items-center gap-4 justify-between">
            <div>
              <p className="font-medium">{selectedBlock.type}</p>
              <p className="text-sm text-muted-foreground">{selectedBlock.description}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={handleDecrementQuantity}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <div className="w-10 text-center">
                <p className="text-lg font-medium">{quantity}</p>
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={handleIncrementQuantity}
              >
                <Plus className="h-4 w-4" />
              </Button>
              
              <div className="ml-2">
                <p className="text-sm text-muted-foreground">
                  Total: {formatCurrency(selectedBlock.pricePerBlock * quantity)}
                </p>
              </div>
              
              <Button onClick={handleAddBlock}>
                {iopsBlocks.some(b => b.option.id === selectedBlock.id)
                  ? 'Atualizar quantidade'
                  : 'Adicionar blocos'
                }
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-6">
        <Button 
          variant="outline"
          onClick={onPrev}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Anterior
        </Button>
        <Button onClick={onNext}>
          Próximo
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
