
import { RAIDOption } from "@/types/server-config";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowRight, ArrowLeft, HardDrive, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { mockRAIDs } from "@/services/priceService";

interface RaidStepFormProps {
  raidConfig: {
    enabled: boolean;
    option: RAIDOption | null;
  };
  disks: Array<{
    option: any;
    quantity: number;
  }>;
  onUpdateRaid: (raid: {
    enabled: boolean;
    option: RAIDOption | null;
  }) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function RaidStepForm({
  raidConfig,
  disks,
  onUpdateRaid,
  onNext,
  onPrev
}: RaidStepFormProps) {
  const totalDisks = disks.reduce((sum, disk) => sum + disk.quantity, 0);
  const raidOptions = mockRAIDs.filter(raid => raid.minDisks <= totalDisks);
  
  const handleToggleRaid = (enabled: boolean) => {
    onUpdateRaid({
      enabled,
      option: enabled ? raidConfig.option : null
    });
  };
  
  const handleSelectRaidType = (raidId: string) => {
    const selectedRaid = mockRAIDs.find(raid => raid.id === raidId) || null;
    onUpdateRaid({
      ...raidConfig,
      option: selectedRaid
    });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <p className="text-lg">Configuração de RAID</p>
        <p className="text-muted-foreground text-sm mt-1">
          Configure a redundância dos seus discos com RAID.
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-5 w-5 ml-1">
                  <HelpCircle className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p>
                  RAID (Redundant Array of Independent Disks) permite combinar múltiplos discos para 
                  aumentar a performance ou criar redundância para segurança dos dados.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </p>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="raid-toggle" className="flex flex-col gap-1">
              <span>Ativar RAID</span>
              <span className="font-normal text-sm text-muted-foreground">
                Redundância para segurança dos dados
              </span>
            </Label>
            <Switch
              id="raid-toggle"
              checked={raidConfig.enabled}
              onCheckedChange={handleToggleRaid}
            />
          </div>
        </CardContent>
      </Card>
      
      {raidConfig.enabled && (
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Label htmlFor="raid-type">Selecione o tipo de RAID</Label>
                <Select 
                  value={raidConfig.option?.id || ""} 
                  onValueChange={handleSelectRaidType}
                >
                  <SelectTrigger id="raid-type">
                    <SelectValue placeholder="Escolha o tipo de RAID" />
                  </SelectTrigger>
                  <SelectContent>
                    {raidOptions.map(raid => (
                      <SelectItem key={raid.id} value={raid.id}>
                        RAID {raid.type} - {raid.description}
                      </SelectItem>
                    ))}
                    {raidOptions.length === 0 && (
                      <SelectItem value="disabled" disabled>
                        Precisa de mais discos para RAID
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                
                {raidConfig.option && (
                  <div className="bg-muted/30 p-4 rounded-lg mt-4">
                    <h4 className="font-medium mb-2">RAID {raidConfig.option.type}</h4>
                    <p className="text-sm text-muted-foreground">{raidConfig.option.description}</p>
                    <p className="text-sm mt-2">
                      Mínimo de discos necessários: <span className="font-medium">{raidConfig.option.minDisks}</span>
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {totalDisks < 2 && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-yellow-400">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                <p className="font-medium">Discos insuficientes</p>
              </div>
              <p className="text-sm mt-1">
                Para configurar RAID, você precisa de pelo menos 2 discos. Volte à etapa anterior e adicione mais discos.
              </p>
            </div>
          )}
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
          disabled={raidConfig.enabled && !raidConfig.option}
        >
          Próximo
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
