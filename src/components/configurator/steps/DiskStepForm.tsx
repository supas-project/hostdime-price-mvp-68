
import { useState } from "react";
import { ChassisOption, DiskOption } from "@/types/server-config";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Plus, Minus, HardDrive, HelpCircle, Trash2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatCurrency } from "@/lib/utils";
import { mockDisks } from "@/services/priceService";

interface DiskStepFormProps {
  selectedChassis: ChassisOption | null;
  disks: Array<{
    option: DiskOption;
    quantity: number;
  }>;
  onUpdateDisks: (disks: Array<{
    option: DiskOption;
    quantity: number;
  }>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function DiskStepForm({
  selectedChassis,
  disks,
  onUpdateDisks,
  onNext,
  onPrev
}: DiskStepFormProps) {
  const [selectedDisk, setSelectedDisk] = useState<DiskOption | null>(null);
  const [diskQuantity, setDiskQuantity] = useState(1);
  
  const diskOptions = mockDisks;
  
  const handleSelectDisk = (disk: DiskOption) => {
    setSelectedDisk(disk);
    setDiskQuantity(1);
  };
  
  const handleIncrementQuantity = () => {
    if (selectedChassis && disks.length + diskQuantity < selectedChassis.diskSlots) {
      setDiskQuantity(prev => prev + 1);
    }
  };
  
  const handleDecrementQuantity = () => {
    if (diskQuantity > 1) {
      setDiskQuantity(prev => prev - 1);
    }
  };
  
  const handleAddDisk = () => {
    if (!selectedDisk) return;
    
    onUpdateDisks([
      ...disks,
      {
        option: selectedDisk,
        quantity: diskQuantity
      }
    ]);
    
    // Reset selection
    setSelectedDisk(null);
    setDiskQuantity(1);
  };
  
  const handleRemoveDisk = (index: number) => {
    const updatedDisks = [...disks];
    updatedDisks.splice(index, 1);
    onUpdateDisks(updatedDisks);
  };
  
  const usedSlots = disks.reduce((sum, disk) => sum + disk.quantity, 0);
  const availableSlots = selectedChassis ? selectedChassis.diskSlots - usedSlots : 0;
  
  return (
    <div className="space-y-6">
      <div>
        <p className="text-lg">Configure os discos de armazenamento</p>
        <p className="text-muted-foreground text-sm mt-1">
          Selecione até {selectedChassis?.diskSlots} discos para o seu servidor.
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-5 w-5 ml-1">
                  <HelpCircle className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Escolha discos SSD para aplicações que necessitam de rápido acesso aos dados,
                  NVMe para máxima performance, ou HDD para armazenamento econômico de grande volume.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </p>
      </div>
      
      {selectedChassis && (
        <div className="flex items-center justify-between bg-card border border-border rounded-lg p-3">
          <div className="flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-muted-foreground" />
            <span>Slots disponíveis:</span>
          </div>
          <div>
            <span className="font-medium">{availableSlots}</span> de {selectedChassis.diskSlots}
          </div>
        </div>
      )}
      
      {/* Lista de discos já adicionados */}
      {disks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Discos selecionados</CardTitle>
            <CardDescription>Discos que serão instalados no seu servidor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {disks.map((disk, index) => (
                <div key={index} className="flex justify-between items-center bg-background/50 p-3 rounded-lg">
                  <div>
                    <p className="font-medium">
                      {disk.quantity}x {disk.option.size}GB {disk.option.type}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {disk.option.brand} - {disk.option.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-medium text-primary">
                      {formatCurrency(disk.option.price * disk.quantity)}
                    </p>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive"
                      onClick={() => handleRemoveDisk(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Seleção de novos discos */}
      {availableSlots > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {diskOptions.map((disk) => (
              <Card 
                key={disk.id}
                className={`cursor-pointer transition-all hover:border-primary hover:shadow-md ${
                  selectedDisk?.id === disk.id 
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
                onClick={() => handleSelectDisk(disk)}
              >
                <CardContent className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium mb-1">{disk.size}GB {disk.type}</h3>
                      <CardDescription>{disk.brand} - {disk.description}</CardDescription>
                    </div>
                    
                    <div className="font-bold text-primary">
                      {formatCurrency(disk.price)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {selectedDisk && (
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex flex-wrap items-center gap-4 justify-between">
                <div>
                  <p className="font-medium">{selectedDisk.size}GB {selectedDisk.type}</p>
                  <p className="text-sm text-muted-foreground">{selectedDisk.description}</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleDecrementQuantity}
                    disabled={diskQuantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  
                  <div className="w-10 text-center">
                    <p className="text-lg font-medium">{diskQuantity}</p>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleIncrementQuantity}
                    disabled={diskQuantity >= availableSlots}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  
                  <div className="ml-2">
                    <p className="text-sm text-muted-foreground">
                      Total: {formatCurrency(selectedDisk.price * diskQuantity)}
                    </p>
                  </div>
                  
                  <Button onClick={handleAddDisk}>
                    Adicionar disco
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8 bg-card border border-border rounded-lg">
          <HardDrive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Limite máximo de discos atingido</p>
          <p className="text-muted-foreground mt-1">
            Você atingiu o limite de {selectedChassis?.diskSlots} slots de disco para este chassi.
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
          disabled={disks.length === 0}
        >
          Próximo
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
