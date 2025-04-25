import { Label } from "@/components/ui/label";
import { ComponentOption } from "@/types/component";
import { formatCurrency } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EthernetPort, Network } from "lucide-react";
import { QuantitySelector } from "@/components/quantity-selector";
import { toast } from "sonner";

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
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary text-sm font-medium">
          <EthernetPort className="h-4 w-4" />
          Velocidade da Porta
        </div>
        <div className="grid gap-4">
          <RadioGroup
            value={selectedPort?.option.id}
            onValueChange={handlePortSelect}
            className="flex flex-col gap-4"
          >
            {portOptions.map((port) => (
              <div key={port.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={port.id} id={port.id} />
                  <Label htmlFor={port.id} className="text-sm flex items-center gap-4">
                    <span>{port.name}</span>
                    <span className="text-primary font-medium">
                      {formatCurrency(port.price)}
                    </span>
                  </Label>
                </div>
                {selectedPort?.option.id === port.id && (
                  <QuantitySelector
                    value={selectedPort.quantity}
                    onChange={(value) => handlePortQuantityChange(port.id, value)}
                    min={1}
                    max={10}
                  />
                )}
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary text-sm font-medium">
          <Network className="h-4 w-4" />
          Bloco de IPs
        </div>
        <Select 
          value={selectedIp?.option.id || ""} 
          onValueChange={handleIpSelect}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione um bloco de IPs" />
          </SelectTrigger>
          <SelectContent>
            {ipOptions.map((ip) => (
              <SelectItem key={ip.id} value={ip.id}>
                <div className="flex justify-between items-center w-full gap-4">
                  <span>{ip.name}</span>
                  <span className="text-primary font-medium">
                    {formatCurrency(ip.price)}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedIp && (
          <p className="text-sm text-muted-foreground">
            {selectedIp.option.description}
          </p>
        )}
      </div>
    </div>
  );
}
