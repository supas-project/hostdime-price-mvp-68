
import { Label } from "@/components/ui/label";
import { ComponentOption } from "@/types/component";
import { formatCurrency } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EthernetPort, Network } from "lucide-react";
import { QuantitySelector } from "@/components/quantity-selector";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { PriceService } from "@/services/price-service";

interface ConnectivityContentProps {
  options: ComponentOption[];
  connectivityItems: { [key: string]: { option: ComponentOption; quantity: number } };
  onUpdateConnectivityItems: (items: { [key: string]: { option: ComponentOption; quantity: number } }) => void;
}

export function ConnectivityContent({
  options,
  connectivityItems,
  onUpdateConnectivityItems,
}: ConnectivityContentProps) {
  const portOptions = options.filter((opt) => opt.subtype === "porta");
  const ipOptions = options.filter((opt) => opt.subtype === "ip");
  
  // Efeito para garantir que os dados de conectividade estejam sincronizados
  useEffect(() => {
    // Verificamos se precisamos sincronizar os dados
    const networkCategory = PriceService.getCategory('network');
    const ipCategory = PriceService.getCategory('ip');
    
    if ((!networkCategory || networkCategory.items.length === 0) || 
        (!ipCategory || ipCategory.items.length === 0)) {
      // Se alguma categoria estiver vazia, tentamos sincronizar
      try {
        const ComponentSyncService = require('@/services/component-sync-service').default;
        ComponentSyncService.syncConnectivityData();
      } catch (error) {
        console.error("Erro ao sincronizar dados de conectividade:", error);
      }
    }
  }, []);

  const handlePortSelect = (portId: string | null) => {
    if (!portId) {
      // Handle port deselection
      const newItems = { ...connectivityItems };
      const portItem = Object.entries(newItems).find(([_, item]) => item.option.subtype === "porta");
      if (portItem) {
        delete newItems[portItem[0]];
      }
      onUpdateConnectivityItems(newItems);
      return;
    }

    const port = portOptions.find((opt) => opt.id === portId);
    if (!port) return;

    const newItems = { ...connectivityItems };
    // Keep only IP items when changing port
    Object.keys(newItems).forEach(key => {
      if (newItems[key].option.subtype === "porta") {
        delete newItems[key];
      }
    });

    newItems[port.id] = { option: port, quantity: 1 };
    onUpdateConnectivityItems(newItems);
    toast.success("Velocidade da porta atualizada");
  };

  const handlePortQuantityChange = (portId: string, quantity: number) => {
    const newItems = { ...connectivityItems };
    if (newItems[portId]) {
      newItems[portId].quantity = quantity;
      onUpdateConnectivityItems(newItems);
    }
  };

  const handleIpSelect = (ipId: string | null) => {
    if (!ipId) {
      // Handle IP deselection
      const newItems = { ...connectivityItems };
      const ipItem = Object.entries(newItems).find(([_, item]) => item.option.subtype === "ip");
      if (ipItem) {
        delete newItems[ipItem[0]];
      }
      onUpdateConnectivityItems(newItems);
      return;
    }

    const ip = ipOptions.find((opt) => opt.id === ipId);
    if (!ip) return;

    const newItems = { ...connectivityItems };
    // Remove any existing IP selections
    Object.keys(newItems).forEach(key => {
      if (newItems[key].option.subtype === "ip") {
        delete newItems[key];
      }
    });

    newItems[ip.id] = { option: ip, quantity: 1 };
    onUpdateConnectivityItems(newItems);
    toast.success("Bloco de IPs atualizado");
  };

  const selectedPort = Object.values(connectivityItems).find(
    (item) => item.option.subtype === "porta"
  );

  const selectedIp = Object.values(connectivityItems).find(
    (item) => item.option.subtype === "ip"
  );

  return (
    <div className="space-y-6 overflow-x-hidden w-full">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary text-sm font-medium">
          <EthernetPort className="h-4 w-4 flex-shrink-0" />
          <span className="break-words">Velocidade da Porta</span>
        </div>
        <div className="grid gap-4">
          <Select 
            value={selectedPort?.option.id || ""} 
            onValueChange={handlePortSelect}
          >
            <SelectTrigger className="w-full min-h-[40px] text-xs sm:text-sm py-2 px-2.5 sm:py-2.5 sm:px-4">
              <SelectValue placeholder="Selecione a velocidade da porta" />
            </SelectTrigger>
            <SelectContent className="z-[51]">
              {portOptions.map((port) => (
                <SelectItem key={port.id} value={port.id} className="py-2 sm:py-2.5">
                  <div className="flex justify-between items-center w-full gap-2 sm:gap-4 text-xs sm:text-sm">
                    <span>{port.name}</span>
                    <span className="text-primary font-medium whitespace-nowrap">
                      {formatCurrency(port.price)}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedPort && (
            <div className="flex items-center justify-between p-2.5 sm:p-3 bg-muted/30 rounded-lg">
              <p className="text-xs sm:text-sm">
                {selectedPort.option.name}
                <span className="text-primary font-medium ml-2">
                  {formatCurrency(selectedPort.option.price)}
                </span>
              </p>
              <QuantitySelector
                value={selectedPort.quantity}
                onChange={(value) => handlePortQuantityChange(selectedPort.option.id, value)}
                min={1}
                max={10}
              />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary text-sm font-medium">
          <Network className="h-4 w-4 flex-shrink-0" />
          <span className="break-words">Bloco de IPs</span>
        </div>
        <Select 
          value={selectedIp?.option.id || ""} 
          onValueChange={handleIpSelect}
        >
          <SelectTrigger className="w-full min-h-[40px] text-xs sm:text-sm py-2 px-2.5 sm:py-2.5 sm:px-4">
            <SelectValue placeholder="Selecione um bloco de IPs" />
          </SelectTrigger>
          <SelectContent className="z-[51]">
            {ipOptions.map((ip) => (
              <SelectItem key={ip.id} value={ip.id} className="py-2 sm:py-2.5">
                <div className="flex justify-between items-center w-full gap-2 sm:gap-4 text-xs sm:text-sm">
                  <span>{ip.name}</span>
                  <span className="text-primary font-medium whitespace-nowrap">
                    {formatCurrency(ip.price)}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedIp && (
          <p className="text-xs sm:text-sm text-muted-foreground break-words">
            {selectedIp.option.description}
          </p>
        )}
      </div>
    </div>
  );
}
