
import { useState } from "react";
import { DataCenterLocation } from "@/types/server-config";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter
} from "@/components/ui/card";
import { MapPin, Server, Database } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface LocationStepFormProps {
  selectedLocation: DataCenterLocation | null;
  onUpdateLocation: (location: DataCenterLocation) => void;
  onNext: () => void;
}

// Dados mocados para os data centers
const datacenters: DataCenterLocation[] = [
  {
    id: "joao-pessoa",
    name: "João Pessoa",
    description: "Data center principal no Brasil com conectividade de alta velocidade",
    icon: "pin"
  },
  {
    id: "sao-paulo",
    name: "São Paulo",
    description: "Data center com alta capacidade e conexões internacionais",
    icon: "database"
  },
  {
    id: "orlando",
    name: "Orlando",
    description: "Data center internacional com baixa latência para América do Norte",
    icon: "server"
  }
];

export function LocationStepForm({ 
  selectedLocation,
  onUpdateLocation,
  onNext
}: LocationStepFormProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "pin":
        return <MapPin className="h-8 w-8" />;
      case "database":
        return <Database className="h-8 w-8" />;
      case "server":
        return <Server className="h-8 w-8" />;
      default:
        return <Server className="h-8 w-8" />;
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <p className="text-lg">Onde você deseja hospedar seu servidor?</p>
        <p className="text-muted-foreground text-sm mt-1">
          Escolha a localização do data center mais adequada para suas necessidades.
        </p>
      </div>
      
      <TooltipProvider>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {datacenters.map((dc) => (
            <Tooltip key={dc.id}>
              <TooltipTrigger asChild>
                <Card 
                  className={`cursor-pointer transition-all hover:border-primary hover:shadow-md ${
                    selectedLocation?.id === dc.id 
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                  onClick={() => onUpdateLocation(dc)}
                >
                  <CardContent className="pt-6 flex flex-col items-center text-center gap-4">
                    <div className={`p-3 rounded-full ${
                      selectedLocation?.id === dc.id 
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {getIcon(dc.icon)}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">{dc.name}</h3>
                      <CardDescription className="mt-1">
                        {dc.description}
                      </CardDescription>
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clique para selecionar {dc.name}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>

      <div className="flex justify-end">
        <Button 
          onClick={onNext}
          disabled={!selectedLocation}
        >
          Próximo
        </Button>
      </div>
    </div>
  );
}
