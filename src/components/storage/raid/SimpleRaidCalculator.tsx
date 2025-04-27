import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Shield, Cpu, Server, HardDrive, Zap, CircleCheck, CircleX } from "lucide-react";
import { RaidType } from "@/types/raid";
import { PricedDiskOption } from "@/types/storage";
import { RAID_INFO, calculateRaidCapacity } from "@/utils/raid-calculator";
import { cn } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  const [showDetails, setShowDetails] = useState(false);

  const isValidRaidConfiguration = (type: RaidType): boolean => {
    if (!selectedDisk || quantity < 2) return false;
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
    if (value === raidType) return; // Evita re-renders desnecessários
    setRaidType(value);
    onRaidTypeChange(value, isHardwareRaid);
  };
  
  const handleRaidImplementationChange = (value: string) => {
    const isHardware = value === "hardware";
    setIsHardwareRaid(isHardware);
    onRaidTypeChange(raidType, isHardware);
  };

  if (quantity < 2) return null;

  return (
    <div className="animate-fade-in">
      <Card className="bg-[#1e1e1e] border-[#2a2a2a] p-3">
        {/* Header com título e toggle de implementação */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#f58220]" />
            <HoverCard>
              <HoverCardTrigger className="text-sm font-medium hover:text-[#f58220] transition-colors">
                Configuração RAID
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <p className="text-sm">
                  RAID combina múltiplos discos para proteger seus dados e melhorar a performance. 
                  Escolha o tipo ideal para seu caso de uso.
                </p>
              </HoverCardContent>
            </HoverCard>
          </div>
          
          <ToggleGroup
            type="single"
            value={isHardwareRaid ? "hardware" : "software"}
            onValueChange={handleRaidImplementationChange}
            className="bg-background border rounded-md"
            aria-label="Tipo de implementação RAID"
          >
            <ToggleGroupItem 
              value="software" 
              size="sm" 
              className="flex items-center gap-1.5 px-3 py-1.5 data-[state=on]:bg-[#f58220]/10 data-[state=on]:text-[#f58220]"
              aria-label="Software RAID"
            >
              <Cpu className="h-3.5 w-3.5" />
              <span className="text-xs">Software</span>
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="hardware" 
              size="sm" 
              className="flex items-center gap-1.5 px-3 py-1.5 data-[state=on]:bg-[#f58220]/10 data-[state=on]:text-[#f58220]"
              aria-label="Hardware RAID"
            >
              <Server className="h-3.5 w-3.5" />
              <span className="text-xs">Hardware</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* RAID Type Selector */}
        <Select 
          value={raidType} 
          onValueChange={handleRaidTypeChange}
          disabled={!selectedDisk || quantity < 2}
        >
          <SelectTrigger className="bg-[#1e1e1e] border-[#2a2a2a] text-white hover:border-[#f58220] transition-colors">
            <SelectValue placeholder="Escolha o tipo de proteção RAID" />
          </SelectTrigger>
          <SelectContent className="z-[51] bg-[#1e1e1e] border-[#2a2a2a]">
            {Object.entries(RAID_INFO)
              .filter(([type, info]) => quantity >= info.minDisks)
              .map(([type, info]) => (
                <SelectItem key={type} value={type} className="py-1.5">
                  <div className="flex items-center gap-2">
                    {info.dataProtectionLevel === "nenhuma" ? (
                      <CircleX className="h-3.5 w-3.5 text-red-500" />
                    ) : (
                      <CircleCheck className="h-3.5 w-3.5 text-green-500" />
                    )}
                    <span className="font-medium">
                      {type === "none" ? "Sem RAID" : `RAID ${type}`}
                    </span>
                  </div>
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        {/* Results Card */}
        {calculation && calculation.raidInfo && (
          <Card className="mt-3 p-2.5 bg-[#1e1e1e] border-[#2a2a2a] animate-fade-in">
            <div className="space-y-2">
              {/* Protection Status */}
              <div className={cn(
                "p-2 rounded-lg border text-sm",
                getProtectionColor(calculation.raidInfo.dataProtectionLevel)
              )}>
                <h4 className="font-medium flex items-center gap-1.5 text-sm">
                  <Shield className="h-3.5 w-3.5" />
                  {calculation.raidInfo.protection}
                </h4>
              </div>

              {/* Key Information Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-[#f58220]" />
                    <span className="font-medium">Capacidade</span>
                  </div>
                  <div className="text-xs text-muted-foreground pl-5">
                    <div>Útil: {calculation.usableCapacity}GB</div>
                    <div>Total: {calculation.totalCapacity}GB</div>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#f58220]" />
                    <span className="font-medium">Performance</span>
                  </div>
                  <div className="text-xs pl-5">
                    <div className={getPerformanceColor(calculation.performance.read)}>
                      Leitura: {calculation.performance.read}
                    </div>
                    <div className={getPerformanceColor(calculation.performance.write)}>
                      Gravação: {calculation.performance.write}
                    </div>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-[#f58220]" />
                    <span className="font-medium">Recomendado</span>
                  </div>
                  <p className="text-xs text-muted-foreground pl-5 line-clamp-2">
                    {calculation.raidInfo.usageRecommendation}
                  </p>
                </div>
              </div>

              {/* Pros and Cons Collapsible */}
              <Collapsible open={showDetails} onOpenChange={setShowDetails}>
                <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-[#f58220] transition-colors">
                  {showDetails ? "Ocultar detalhes" : "Ver mais detalhes"}
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <h5 className="text-xs font-medium text-green-500">Vantagens</h5>
                      <ul className="text-xs space-y-0.5">
                        {calculation.raidInfo.advantages.map((adv, index) => (
                          <li key={index} className="flex items-start gap-1">
                            <span className="text-green-500 mt-0.5">✓</span>
                            <span className="flex-1">{adv}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-1">
                      <h5 className="text-xs font-medium text-red-500">Desvantagens</h5>
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
                </CollapsibleContent>
              </Collapsible>
            </div>
          </Card>
        )}
      </Card>
    </div>
  );
}

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
