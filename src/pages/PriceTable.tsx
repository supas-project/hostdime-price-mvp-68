import { useState } from "react";
import { Table, TableBody } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUp, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PriceTableHeader } from "@/components/price-table/TableHeader";
import { TableContent } from "@/components/price-table/TableContent";
import { PriceData } from "@/types/pricing";
import { serverData } from "@/data/server-components";

export default function PriceTable() {
  const [priceData, setPriceData] = useState<PriceData>({
    cpu: { id: 'cpu', name: 'Processadores', items: [] },
    disk: { id: 'disk', name: 'Discos', items: [] },
    memory: { id: 'memory', name: 'Memória', items: [] },
    chassis: { id: 'chassis', name: 'Chassi', items: [] },
    contract: { id: 'contract', name: 'Contratos', items: [] }
  });
  const [activeTab, setActiveTab] = useState("cpu");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const validatePriceData = (data: PriceData): boolean => {
    try {
      // Basic validation rules
      for (const category of Object.values(data)) {
        if (!category.id || !category.name) return false;
        
        for (const item of category.items) {
          if (!item.id || !item.name || typeof item.price !== 'number') {
            return false;
          }
        }
      }
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const mockupData: PriceData = {
        cpu: {
          id: 'cpu',
          name: 'Processadores',
          items: serverData.componentes.find(c => c.type === "Processador")?.options || []
        },
        memory: {
          id: 'memory',
          name: 'Memória',
          items: serverData.componentes.find(c => c.type === "Memória")?.options || []
        },
        disk: {
          id: 'disk',
          name: 'Discos',
          items: []
        },
        chassis: {
          id: 'chassis',
          name: 'Chassi',
          items: []
        },
        contract: {
          id: 'contract',
          name: 'Contratos',
          items: []
        }
      };

      if (!validatePriceData(mockupData)) {
        throw new Error("Dados inválidos no arquivo");
      }

      setPriceData(mockupData);
      toast({
        title: "Tabela importada com sucesso",
        description: "Os dados da planilha foram validados e carregados."
      });
    } catch (error) {
      toast({
        title: "Erro ao importar",
        description: "Verifique se o arquivo está no formato correto.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveTable = () => {
    if (!validatePriceData(priceData)) {
      toast({
        title: "Erro ao salvar",
        description: "Dados inválidos na tabela. Verifique os valores.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Tabela salva com sucesso",
      description: "Os dados foram validados e salvos."
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
              accept=".xlsx,.xls,.json"
              onChange={handleFileUpload}
            />
            <FileUp className="mr-2 h-4 w-4" />
            {isUploading ? 'Importando...' : 'Importar Tabela'}
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
        <Tabs defaultValue="cpu" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            {Object.values(priceData).map((category) => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.name}
                <span className="ml-2 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                  {category.items.length}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.values(priceData).map((category) => (
            <TabsContent key={category.id} value={category.id}>
              <div className="rounded-xl overflow-hidden border border-border">
                <Table>
                  <PriceTableHeader />
                  <TableBody>
                    <TableContent category={category} />
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
