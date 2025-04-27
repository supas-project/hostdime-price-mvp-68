
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { HelpTooltip } from "@/components/help-tooltip";
import { Shield, HardDrive, Zap, Server } from "lucide-react";
import { RaidType } from "@/types/raid";
import { PricedDiskOption } from "@/types/storage";
import { RAID_INFO, calculateRaidCapacity } from "@/utils/raid-calculator";
import { cn } from "@/lib/utils";
import { Toggle } from "@/components/ui/toggle";

interface SimpleRaidCalculatorProps {
  selectedDisk: PricedDiskOption;
  quantity: number;
  onRaidTypeChange: (type: RaidType, isHardware: boolean) => void;
}

export function SimpleRaidCalculator({ 
  selectedDisk, 
  quantity, 
  onRaidTypeChange 
}: SimpleRaidCalculatorProps) {
  const [raidType, setRaidType] = useState<RaidType>("none");
  const [isHardwareRaid, setIsHardwareRaid] = useState(false);
  const [calculation, setCalculation] = useState<ReturnType<typeof calculateRaidCapacity> | null>(null);

  const isValidRaidConfiguration = (type: RaidType): boolean => {
    return quantity >= RAID_INFO[type].minDisks;
  };

  useEffect(() => {
    if (raidType && isValidRaidConfiguration(raidType)) {
      const result = calculateRaidCapacity([selectedDisk], quantity, raidType, isHardwareRaid);
      setCalculation(result);
    } else {
      setCalculation(null);
    }
  }, [raidType, quantity, selectedDisk, isHardwareRaid]);

  const handleRaidTypeChange = (value: RaidType) => {
    setRaidType(value);
    onRaidTypeChange(value, isHardwareRaid);
  };
  
  const handleRaidImplementationChange = (isHardware: boolean) => {
    setIsHardwareRaid(isHardware);
    onRaidTypeChange(raidType, isHardware);
  };

  const availableRaidTypes = Object.entries(RAID_INFO).filter(
    ([type]) => isValidRaidConfiguration(type as RaidType)
  );

  if (quantity < 2) return null;

  return (
    <div className="space-y-4 mt-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">RAID</span>
          <HelpTooltip
            title="Configuração RAID"
            description="RAID permite combinar múltiplos discos para melhor performance e/ou proteção de dados. Cada tipo oferece diferentes benefícios."
            iconOnly
          />
        </div>
        
        <div className="flex items-center gap-3">
          <span className={cn(
            "text-xs", 
            !isHardwareRaid ? "text-primary" : "text-muted-foreground"
          )}>
            Software
          </span>
          <Toggle 
            pressed={isHardwareRaid} 
            onPressedChange={handleRaidImplementationChange}
            className="relative px-3 py-1"
            aria-label="Hardware RAID"
          >
            <HardDrive className={cn(
              "h-4 w-4 mr-2", 
              isHardwareRaid ? "text-primary" : "text-muted-foreground"
            )} />
            <span>Hardware</span>
          </Toggle>
          <HelpTooltip
            title="Tipo de RAID"
            description="Hardware RAID utiliza um controlador dedicado para melhor performance, enquanto Software RAID usa recursos do sistema."
            iconOnly
          />
        </div>
      </div>

      <Select value={raidType} onValueChange={handleRaidTypeChange}>
        <SelectTrigger className="bg-[#1e1e1e] border-[#2a2a2a] text-white hover:border-[#f58220] transition-colors">
          <SelectValue placeholder="Selecione o tipo de RAID" />
        </SelectTrigger>
        <SelectContent className="z-[51] bg-[#1e1e1e] border-[#2a2a2a]">
          <SelectItem value="none">Sem RAID</SelectItem>
          {availableRaidTypes
            .filter(([type]) => type !== "none") // Não mostrar "none" duas vezes
            .map(([type, info]) => (
              <SelectItem key={type} value={type}>
                RAID {type} - {info.description}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      {calculation && raidType !== "none" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Card className="p-4 bg-[#1e1e1e] border-[#2a2a2a]">
            <div className="flex items-center gap-2 mb-2">
              <HardDrive className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Capacidade</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Total: {calculation.totalCapacity}GB
            </p>
            <p className="text-xs text-muted-foreground">
              Utilizável: {calculation.usableCapacity}GB
            </p>
          </Card>

          <Card className="p-4 bg-[#1e1e1e] border-[#2a2a2a]">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Proteção</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {calculation.protection}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {isHardwareRaid ? 'Hardware RAID' : 'Software RAID'}
            </p>
          </Card>

          <Card className="p-4 bg-[#1e1e1e] border-[#2a2a2a]">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Performance</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Leitura: {calculation.performance.read}
            </p>
            <p className="text-xs text-muted-foreground">
              Escrita: {calculation.performance.write}
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
