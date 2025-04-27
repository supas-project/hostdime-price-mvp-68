
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

  const getPerformanceColor = (level: string) => {
    switch (level) {
      case "excelente": return "text-green-500";
      case "boa": return "text-blue-500";
      case "moderada": return "text-yellow-500";
      case "baixa": return "text-red-500";
      default: return "text-muted-foreground";
    }
  };

  const getProtectionColor = (level: string) => {
    switch (level) {
      case "excelente": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "boa": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "básica": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "nenhuma": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (quantity < 2) return null;

  return (
    <div className="space-y-4 mt-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Configuração RAID</span>
          <HelpTooltip
            title="O que é RAID?"
            description="RAID permite combinar múltiplos discos para melhorar a proteção dos dados e/ou a performance do sistema."
            iconOnly
          />
        </div>
        
        <div className="flex items-center gap-3">
          <Toggle 
            pressed={isHardwareRaid} 
            onPressedChange={handleRaidImplementationChange}
            className="relative px-3 py-1"
            aria-label="Hardware RAID"
          >
            <Server className={cn(
              "h-4 w-4 mr-2",
              isHardwareRaid ? "text-primary" : "text-muted-foreground"
            )} />
            <span>Hardware RAID</span>
          </Toggle>
          <HelpTooltip
            title="Hardware vs Software RAID"
            description="Hardware RAID usa um controlador dedicado para melhor performance, enquanto Software RAID usa os recursos do sistema."
            iconOnly
          />
        </div>
      </div>

      <Select value={raidType} onValueChange={handleRaidTypeChange}>
        <SelectTrigger className="bg-[#1e1e1e] border-[#2a2a2a] text-white hover:border-[#f58220] transition-colors">
          <SelectValue placeholder="Escolha o tipo de RAID" />
        </SelectTrigger>
        <SelectContent className="z-[51] bg-[#1e1e1e] border-[#2a2a2a]">
          {Object.entries(RAID_INFO)
            .filter(([type, info]) => quantity >= info.minDisks)
            .map(([type, info]) => (
              <SelectItem key={type} value={type}>
                {type === "none" ? "Sem RAID" : `RAID ${type} - ${info.description}`}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      {calculation && calculation.raidInfo && (
        <div className="space-y-4">
          <Card className="p-4 bg-[#1e1e1e] border-[#2a2a2a]">
            <div className="flex flex-col gap-4">
              {/* Status Summary */}
              <div className={cn(
                "p-3 rounded-lg border",
                getProtectionColor(calculation.raidInfo.dataProtectionLevel)
              )}>
                <h4 className="font-medium mb-2">Nível de Proteção: {calculation.raidInfo.protection}</h4>
                <p className="text-sm">{calculation.raidInfo.description}</p>
              </div>

              {/* Key Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <HardDrive className="w-4 h-4 text-primary" />
                    <span className="font-medium">Capacidade</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total: {calculation.totalCapacity}GB
                    <br />
                    Utilizável: {calculation.usableCapacity}GB
                    <br />
                    <span className="text-xs">
                      ({calculation.raidInfo.capacityEfficiency}% de eficiência)
                    </span>
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="font-medium">Performance</span>
                  </div>
                  <p className="text-sm">
                    <span className={cn("font-medium", getPerformanceColor(calculation.performance.read))}>
                      Leitura: {calculation.performance.read}
                    </span>
                    <br />
                    <span className={cn("font-medium", getPerformanceColor(calculation.performance.write))}>
                      Gravação: {calculation.performance.write}
                    </span>
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Server className="w-4 h-4 text-primary" />
                    <span className="font-medium">Recomendado para:</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {calculation.raidInfo.usageRecommendation}
                  </p>
                </div>
              </div>

              {/* Pros and Cons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <h5 className="text-sm font-medium text-green-500 mb-2">Vantagens</h5>
                  <ul className="text-sm space-y-1">
                    {calculation.raidInfo.advantages.map((adv, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-500">✓</span> {adv}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-red-500 mb-2">Desvantagens</h5>
                  <ul className="text-sm space-y-1">
                    {calculation.raidInfo.disadvantages.map((disadv, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-red-500">✗</span> {disadv}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
