import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StorageSpecs } from "./external/StorageSpecs";
import { StorageTier } from "@/types/storage";
import { formatCurrency } from "@/lib/utils";

interface ExternalStoragePanelProps {
  onSelect: (option: StorageTier) => void;
  selectedTier?: string;
}

export function ExternalStoragePanel({ onSelect, selectedTier }: ExternalStoragePanelProps) {
  const [activeTab, setActiveTab] = useState<string>("standard");
  
  const storageTiers: Record<string, StorageTier[]> = {
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

  const handleTierSelect = (tier: StorageTier) => {
    onSelect(tier);
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
            <TabsTrigger value="standard">Standard</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="premium">Premium</TabsTrigger>
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
