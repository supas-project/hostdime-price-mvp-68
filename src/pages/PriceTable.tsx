
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUp, FileText, Save, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PriceData {
  id: string;
  name: string;
  description: string;
  price: number;
  specs?: string[];
}

interface PriceCategoryData {
  id: string;
  name: string;
  items: PriceData[];
}

export default function PriceTable() {
  const [priceData, setPriceData] = useState<{[key: string]: PriceCategoryData}>({
    cpu: { id: 'cpu', name: 'Processadores', items: [] },
    disk: { id: 'disk', name: 'Discos', items: [] },
    memory: { id: 'memory', name: 'Memória', items: [] },
    chassis: { id: 'chassis', name: 'Chassi', items: [] },
    contract: { id: 'contract', name: 'Contratos', items: [] }
  });
  const [activeTab, setActiveTab] = useState("cpu");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    // Mock file upload and parse - in a real app, this would parse actual XLSX data
    setTimeout(() => {
      // Mockup data that would come from XLSX parsing
      const mockupData = {
        cpu: {
          id: 'cpu',
          name: 'Processadores',
          items: [
            { id: 'cpu1', name: 'Intel Core i5', description: '4 núcleos, 3.5GHz', price: 120 },
            { id: 'cpu2', name: 'Intel Core i7', description: '8 núcleos, 4.0GHz', price: 230 },
            { id: 'cpu3', name: 'Intel Xeon', description: '16 núcleos, 4.5GHz', price: 450 }
          ]
        },
        disk: {
          id: 'disk',
          name: 'Discos',
          items: [
            { id: 'disk1', name: 'SSD 500GB', description: 'Leitura: 550MB/s', price: 90 },
            { id: 'disk2', name: 'SSD 1TB', description: 'Leitura: 550MB/s', price: 150 },
            { id: 'disk3', name: 'NVMe 500GB', description: 'Leitura: 3500MB/s', price: 180 }
          ]
        },
        memory: {
          id: 'memory',
          name: 'Memória',
          items: [
            { id: 'ram1', name: '8GB DDR4', description: '2666MHz', price: 60 },
            { id: 'ram2', name: '16GB DDR4', description: '3200MHz', price: 120 },
            { id: 'ram3', name: '32GB DDR4', description: '3600MHz', price: 240 }
          ]
        },
        chassis: {
          id: 'chassis',
          name: 'Chassi',
          items: [
            { id: 'case1', name: 'Rack 1U', description: '4 slots, até 64GB RAM', price: 200 },
            { id: 'case2', name: 'Rack 2U', description: '8 slots, até 128GB RAM', price: 350 }
          ]
        },
        contract: {
          id: 'contract',
          name: 'Contratos',
          items: [
            { id: 'cont1', name: '12 meses', description: 'Payback: 9 meses', price: 0 },
            { id: 'cont2', name: '24 meses', description: 'Payback: 7 meses', price: 0 }
          ]
        }
      };
      
      setPriceData(mockupData);
      setIsUploading(false);
      
      toast({
        title: "Tabela importada com sucesso",
        description: "Os dados da planilha foram carregados."
      });
    }, 1500);
  };

  const handleSaveTable = () => {
    // Mock save operation - in a real app, this would save data to backend
    toast({
      title: "Tabela salva com sucesso",
      description: "Os dados foram salvos e estão disponíveis para uso."
    });
  };

  return (
    <div className="container py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tabela de Preços</h1>
          <p className="text-muted-foreground">Gerencie os preços dos componentes para servidores</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="relative" disabled={isUploading}>
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
            />
            <FileUp className="mr-2 h-4 w-4" />
            {isUploading ? 'Importando...' : 'Importar Tabela (.xlsx)'}
          </Button>
          
          <Button 
            onClick={handleSaveTable} 
            disabled={Object.values(priceData).every(category => category.items.length === 0)}
          >
            <Save className="mr-2 h-4 w-4" />
            Salvar Tabela
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 shadow-lg">
        <Tabs defaultValue="cpu" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4 flex overflow-auto">
            {Object.entries(priceData).map(([key, category]) => (
              <TabsTrigger key={key} value={key} className="flex items-center">
                {category.name}
                <div className="ml-2 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                  {category.items.length}
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(priceData).map(([key, category]) => (
            <TabsContent key={key} value={key} className="pt-2">
              <div className="rounded-xl overflow-hidden border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Nome</TableHead>
                      <TableHead className="w-[400px]">Descrição</TableHead>
                      <TableHead>Preço</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {category.items.length > 0 ? (
                      category.items.map(item => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {item.description}
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full">
                                      <HelpCircle className="h-3 w-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Especificações detalhadas</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                          <TableCell>{item.price.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          })}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                          <FileText className="w-12 h-12 mx-auto mb-2 opacity-20" />
                          <p>Importe uma tabela para visualizar os dados</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
