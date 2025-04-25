
import { Label } from "@/components/ui/label";
import { ComponentOption } from "@/types/component";
import { formatCurrency } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EthernetPort, Network } from "lucide-react";

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

  const handlePortSelect = (portId: string) => {
    const port = portOptions.find((opt) => opt.id === portId);
    if (!port) return;

    const newItems = { ...connectivityItems };
    const currentIp = Object.values(newItems).find(
      (item) => item.option.subtype === "ip"
    );

    newItems[port.id] = { option: port, quantity: 1 };

    if (currentIp) {
      newItems[currentIp.option.id] = currentIp;
    }

    onUpdateConnectivityItems(newItems);
  };

  const handleIpSelect = (ipId: string) => {
    const ip = ipOptions.find((opt) => opt.id === ipId);
    if (!ip) return;

    const newItems = { ...connectivityItems };
    const currentPort = Object.values(newItems).find(
      (item) => item.option.subtype === "porta"
    );

    newItems[ip.id] = { option: ip, quantity: 1 };

    if (currentPort) {
      newItems[currentPort.option.id] = currentPort;
    }

    onUpdateConnectivityItems(newItems);
  };

  const selectedPort = Object.values(connectivityItems).find(
    (item) => item.option.subtype === "porta"
  )?.option;

  const selectedIp = Object.values(connectivityItems).find(
    (item) => item.option.subtype === "ip"
  )?.option;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary text-sm font-medium">
          <EthernetPort className="h-4 w-4" />
          Velocidade da Porta
        </div>
        <RadioGroup
          value={selectedPort?.id}
          onValueChange={handlePortSelect}
          className="flex gap-4"
        >
          {portOptions.map((port) => (
            <div key={port.id} className="flex items-center space-x-2">
              <RadioGroupItem value={port.id} id={port.id} />
              <Label
                htmlFor={port.id}
                className="text-sm flex items-center gap-4"
              >
                <span>{port.name}</span>
                <span className="text-primary font-medium">
                  {formatCurrency(port.price)}
                </span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary text-sm font-medium">
          <Network className="h-4 w-4" />
          Bloco de IPs
        </div>
        <Select value={selectedIp?.id} onValueChange={handleIpSelect}>
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
            {selectedIp.description}
          </p>
        )}
      </div>
    </div>
  );
}
