
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { HelpTooltip } from "@/components/help-tooltip";
import { Shield, Cpu, Server, HardDrive, Zap } from "lucide-react";
import { RaidType } from "@/types/raid";
import { PricedDiskOption } from "@/types/storage";
import { RAID_INFO, calculateRaidCapacity } from "@/utils/raid-calculator";
import { cn } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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
  
  const handleRaidImplementationChange = (value: string) => {
    const isHardware = value === "hardware";
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
    <div className="space-y-3 mt-4 animate-fade-in">
      {/* Header Section - More compact */}
      <div className="flex items-center justify-between bg-background/50 rounded-lg p-2">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Configuração RAID</span>
          <HelpTooltip
            title="O que é RAID?"
            description="RAID combina múltiplos discos para: 1) Proteger seus dados contra falhas 2) Melhorar a velocidade de leitura/gravação 3) Equilibrar capacidade e segurança. Escolha com base na sua necessidade principal."
            iconOnly
          />
        </div>
        
        <ToggleGroup
          type="single"
          value={isHardwareRaid ? "hardware" : "software"}
          onValueChange={handleRaidImplementationChange}
          className="bg-background border rounded-md"
        >
          <ToggleGroupItem value="software" size="sm" className="px-2 py-1.5">
            <Cpu className="h-3.5 w-3.5" />
            <HelpTooltip
              title="RAID via Software"
              description="Implementado pelo sistema operacional. Mais flexível, mas usa recursos do processador."
              iconOnly
            />
          </ToggleGroupItem>
          <ToggleGroupItem value="hardware" size="sm" className="px-2 py-1.5">
            <Server className="h-3.5 w-3.5" />
            <HelpTooltip
              title="RAID via Hardware"
              description="Controladora dedicada. Melhor performance, menor uso do processador."
              iconOnly
            />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* RAID Selection - More descriptive */}
      <Select value={raidType} onValueChange={handleRaidTypeChange}>
        <SelectTrigger className="bg-[#1e1e1e] border-[#2a2a2a] text-white hover:border-[#f58220] transition-colors">
          <SelectValue placeholder="Escolha o tipo de proteção RAID" />
        </SelectTrigger>
        <SelectContent className="z-[51] bg-[#1e1e1e] border-[#2a2a2a]">
          {Object.entries(RAID_INFO)
            .filter(([type, info]) => quantity >= info.minDisks)
            .map(([type, info]) => (
              <SelectItem key={type} value={type}>
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">
                    {type === "none" ? "Sem RAID" : `RAID ${type}`}
                  </span>
                  <span className="text-xs text-muted-foreground line-clamp-1">
                    {info.description}
                  </span>
                </div>
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      {calculation && calculation.raidInfo && (
        <Card className="p-3 bg-[#1e1e1e] border-[#2a2a2a]">
          <div className="flex flex-col gap-3">
            {/* Status Summary - More compact */}
            <div className={cn(
              "p-2 rounded-lg border text-sm",
              getProtectionColor(calculation.raidInfo.dataProtectionLevel)
            )}>
              <h4 className="font-medium mb-1 flex items-center gap-1">
                <Shield className="h-3.5 w-3.5" />
                Nível de Proteção: {calculation.raidInfo.protection}
              </h4>
              <p className="text-xs leading-relaxed">{calculation.raidInfo.description}</p>
            </div>

            {/* Key Information - Grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-primary" />
                  <span className="font-medium">Capacidade</span>
                </div>
                <div className="text-xs text-muted-foreground pl-5">
                  <div>Total: {calculation.totalCapacity}GB</div>
                  <div>Utilizável: {calculation.usableCapacity}GB</div>
                  <div className="text-[11px]">
                    ({calculation.raidInfo.capacityEfficiency}% de eficiência)
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  <span className="font-medium">Performance</span>
                </div>
                <div className="text-xs pl-5">
                  <div className={cn("", getPerformanceColor(calculation.performance.read))}>
                    Leitura: {calculation.performance.read}
                  </div>
                  <div className={cn("", getPerformanceColor(calculation.performance.write))}>
                    Gravação: {calculation.performance.write}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-primary" />
                  <span className="font-medium">Recomendado para:</span>
                </div>
                <p className="text-xs text-muted-foreground pl-5 leading-relaxed">
                  {calculation.raidInfo.usageRecommendation}
                </p>
              </div>
            </div>

            {/* Pros and Cons - More compact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
              <div className="space-y-0.5">
                <h5 className="text-xs font-medium text-green-500 mb-1">Vantagens</h5>
                <ul className="text-xs space-y-0.5">
                  {calculation.raidInfo.advantages.map((adv, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span className="flex-1">{adv}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-0.5">
                <h5 className="text-xs font-medium text-red-500 mb-1">Desvantagens</h5>
                <ul className="text-xs space-y-0.5">
                  {calculation.raidInfo.disadvantages.map((disadv, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <span className="text-red-500 mt-0.5">✗</span>
                      <span className="flex-1">{disadv}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
