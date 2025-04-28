
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StorageSpecs } from "./external/StorageSpecs";
import { StorageTier } from "@/types/storage";
import { formatCurrency } from "@/lib/utils";

interface ExternalStoragePanelProps {
  onSelect?: (option: StorageTier) => void;
  selectedTier?: string;
  onSelectStorage?: (type: string, capacity: number, price: number) => void;
  storageTypes?: {
    [key: string]: { 
      name: string;
      pricePerGB: number;
      iops: string;
      throughput: string;
      description: string;
      throughputAdd?: number;
      maxThroughput?: string;
    }
  };
}

export function ExternalStoragePanel({ 
  onSelect, 
  selectedTier,
  onSelectStorage,
  storageTypes = {}
}: ExternalStoragePanelProps) {
  const [activeTab, setActiveTab] = useState<string>("standard");
  
  // Default storage tiers if none provided through props
  const defaultStorageTiers: Record<string, StorageTier[]> = {
    standard: [
      {
        name: "Standard 100GB",
        price: 29.90,
        iops: "Até 3.000 IOPS",
        throughput: "125 MB/s",
        description: "Ideal para armazenamento geral e backups"
      },
      {
        name: "Standard 500GB",
        price: 99.90,
        iops: "Até 3.000 IOPS",
        throughput: "125 MB/s",
        description: "Ideal para armazenamento geral e backups"
      },
      {
        name: "Standard 1TB",
        price: 189.90,
        iops: "Até 3.000 IOPS",
        throughput: "125 MB/s",
        description: "Ideal para armazenamento geral e backups"
      }
    ],
    performance: [
      {
        name: "Performance 100GB",
        price: 49.90,
        iops: "Até 6.000 IOPS",
        throughput: "250 MB/s",
        description: "Recomendado para bancos de dados e aplicações de média demanda"
      },
      {
        name: "Performance 500GB",
        price: 159.90,
        iops: "Até 6.000 IOPS",
        throughput: "250 MB/s",
        description: "Recomendado para bancos de dados e aplicações de média demanda"
      },
      {
        name: "Performance 1TB",
        price: 299.90,
        iops: "Até 6.000 IOPS",
        throughput: "250 MB/s",
        description: "Recomendado para bancos de dados e aplicações de média demanda"
      }
    ],
    premium: [
      {
        name: "Premium 100GB",
        price: 79.90,
        iops: "Até 16.000 IOPS",
        throughput: "500 MB/s",
        description: "Para cargas de trabalho intensivas e aplicações críticas"
      },
      {
        name: "Premium 500GB",
        price: 259.90,
        iops: "Até 16.000 IOPS",
        throughput: "500 MB/s",
        description: "Para cargas de trabalho intensivas e aplicações críticas"
      },
      {
        name: "Premium 1TB",
        price: 499.90,
        iops: "Até 16.000 IOPS",
        throughput: "500 MB/s",
        description: "Para cargas de trabalho intensivas e aplicações críticas"
      }
    ]
  };

  // Process storage types from props to create tiers
  const processedStorageTiers: Record<string, StorageTier[]> = {};
  if (Object.keys(storageTypes).length > 0) {
    // Convert from storageTypes format to tiers format
    Object.entries(storageTypes).forEach(([key, type]) => {
      processedStorageTiers[key] = [
        {
          name: `${type.name} 100GB`,
          price: type.pricePerGB * 100,
          iops: type.iops,
          throughput: type.throughput,
          description: type.description
        },
        {
          name: `${type.name} 500GB`,
          price: type.pricePerGB * 500,
          iops: type.iops,
          throughput: type.throughput,
          description: type.description
        },
        {
          name: `${type.name} 1TB`,
          price: type.pricePerGB * 1000,
          iops: type.iops,
          throughput: type.throughput,
          description: type.description
        }
      ];
    });
  }
  
  // Use processed tiers if available, otherwise default
  const storageTiers = Object.keys(processedStorageTiers).length > 0 
    ? processedStorageTiers 
    : defaultStorageTiers;

  const handleTierSelect = (tier: StorageTier) => {
    if (onSelect) {
      onSelect(tier);
    }
    
    // Also support the onSelectStorage prop for backward compatibility
    if (onSelectStorage) {
      // Extract capacity from name (e.g., "Standard 100GB" -> 100)
      const capacityMatch = tier.name.match(/(\d+)GB|(\d+)TB/i);
      let capacity = 0;
      
      if (capacityMatch) {
        if (capacityMatch[1]) {
          capacity = parseInt(capacityMatch[1]);
        } else if (capacityMatch[2]) {
          // Convert TB to GB
          capacity = parseInt(capacityMatch[2]) * 1000;
        }
      }
      
      // Extract type from name (e.g., "Standard 100GB" -> "Standard")
      const typeMatch = tier.name.match(/^(\w+)/);
      const type = typeMatch ? typeMatch[1] : "Standard";
      
      onSelectStorage(type, capacity, tier.price);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Armazenamento Externo</CardTitle>
        <CardDescription>
          Adicione volumes de armazenamento externo para seus dados
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="standard" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            {Object.keys(storageTiers).map(key => (
              <TabsTrigger key={key} value={key}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {Object.entries(storageTiers).map(([key, tiers]) => (
            <TabsContent key={key} value={key} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tiers.map((tier) => (
                  <div 
                    key={tier.name}
                    className={`cursor-pointer transition-all ${
                      selectedTier === tier.name ? 'ring-2 ring-primary rounded-xl' : ''
                    }`}
                    onClick={() => handleTierSelect(tier)}
                  >
                    <StorageSpecs
                      iops={tier.iops}
                      throughput={tier.throughput}
                      price={tier.price}
                      description={tier.description}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
