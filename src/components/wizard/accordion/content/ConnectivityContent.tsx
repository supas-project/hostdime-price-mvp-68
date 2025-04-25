
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ComponentOption } from "@/types/component";
import { formatCurrency } from "@/lib/utils";
import { EthernetPort, Wifi } from "lucide-react";

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
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <EthernetPort className="h-5 w-5 text-primary" />
            Velocidade da Porta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedPort?.id}
            onValueChange={handlePortSelect}
            className="grid grid-cols-2 gap-4"
          >
            {portOptions.map((port) => (
              <Label
                key={port.id}
                className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <RadioGroupItem value={port.id} id={port.id} className="sr-only" />
                <span className="text-base font-medium">{port.name}</span>
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(port.price)}
                </span>
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Wifi className="h-5 w-5 text-primary" />
            Bloco de IPs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedIp?.id} onValueChange={handleIpSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um bloco de IPs" />
            </SelectTrigger>
            <SelectContent>
              {ipOptions.map((ip) => (
                <SelectItem key={ip.id} value={ip.id}>
                  <div className="flex justify-between items-center w-full">
                    <span>{ip.name}</span>
                    <span className="text-primary ml-2">
                      {formatCurrency(ip.price)}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedIp && (
            <p className="text-sm text-muted-foreground mt-2">
              {selectedIp.description}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
