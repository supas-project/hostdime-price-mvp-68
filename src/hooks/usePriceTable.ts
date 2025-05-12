
import { useState, useEffect } from "react";
import { PriceData, PriceItem, PriceCategory } from "@/types/pricing";
import { PriceService } from "@/services/price-service";
import { useToast } from "@/hooks/use-toast";

export function usePriceTable() {
  const [priceData, setPriceData] = useState<PriceData>({});
  const [activeTab, setActiveTab] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);
  const [displayMode, setDisplayMode] = useState<"table" | "card">("table");
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [contractDuration, setContractDuration] = useState<string>("0");
  
  const { toast } = useToast();

  // Carrega os dados iniciais
  const loadPriceData = () => {
    try {
      setIsLoading(true);
      const data = PriceService.getAllData();
      
      // Mark hardware components
      Object.values(data).forEach(category => {
        category.items = category.items.map(item => {
          // Mark hardware components based on category or type
          const isHardwareCategory = ["Processador", "Memória", "Armazenamento", "Chassi", "Interface de Rede"].includes(item.type);
          if (isHardwareCategory) {
            return { ...item, isHardware: true };
          }
          return item;
        });
      });
      
      setPriceData(data);
      setLastSyncTime(new Date());
      
      if (!activeTab && Object.keys(data).length > 0) {
        setActiveTab(Object.keys(data)[0]);
      }
    } catch (error) {
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar a tabela de preços.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Configura listeners para mudanças nos dados
  useEffect(() => {
    loadPriceData();
    
    // Adicionar listener para mudanças de dados
    const handleDataChange = (data: PriceData) => {
      setPriceData(data);
      setLastSyncTime(new Date());
    };
    
    PriceService.addDataChangeListener(handleDataChange);
    
    return () => {
      PriceService.removeDataChangeListener(handleDataChange);
    };
  }, []);

  // Garante que uma tab esteja ativa quando os dados são carregados
  useEffect(() => {
    if (Object.keys(priceData).length > 0 && !activeTab) {
      setActiveTab(Object.keys(priceData)[0]);
    }
  }, [priceData, activeTab]);

  // Toggle para colapsar/expandir categorias
  const toggleCategoryCollapse = (categoryId: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Filtrar itens com base no termo de busca
  const filterItems = (items: PriceItem[]): PriceItem[] => {
    if (!searchTerm) return items;
    const lowerSearch = searchTerm.toLowerCase();
    
    return items.filter(item => 
      item.name.toLowerCase().includes(lowerSearch) || 
      item.description.toLowerCase().includes(lowerSearch) ||
      (item.subtype && item.subtype.toLowerCase().includes(lowerSearch)) ||
      (item.specs && item.specs.some(spec => spec.toLowerCase().includes(lowerSearch)))
    );
  };

  return {
    priceData,
    setPriceData,
    activeTab,
    setActiveTab,
    isLoading,
    lastSyncTime,
    searchTerm,
    setSearchTerm,
    sortOrder,
    setSortOrder,
    displayMode,
    setDisplayMode,
    collapsedCategories,
    toggleCategoryCollapse,
    filterItems,
    loadPriceData,
    contractDuration,
    setContractDuration
  };
}
