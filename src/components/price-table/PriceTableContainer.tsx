import { useAuth } from "@/contexts/AuthContext";
import { useFileHandling } from "@/hooks/useFileHandling";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { PriceTablePage } from "./PriceTablePage";
import { systemComponentsService } from "@/services/system-components-service";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { ComponentOption } from "@/types/component";

// Tipagem para dados agrupados por categoria
interface CategoryData {
  items: ComponentOption[];
  name: string;
  description?: string;
}

interface GroupedPriceData {
  [category: string]: CategoryData;
}

interface PriceTableContainerProps {
  disabled?: boolean;
}

export default function PriceTableContainer({ disabled = false }: PriceTableContainerProps) {
  const { isAuthenticated, isAdmin } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [priceData, setPriceData] = useState<GroupedPriceData | null>(null);
  const [activeTab, setActiveTab] = useState<string>("cpu");
  const [isLoading, setIsLoading] = useState(true);
  const [hasUpdates, setHasUpdates] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const {
    isLoading: fileLoading,
    fileInputRef,
    handleFileUpload
  } = useFileHandling((data: GroupedPriceData) => {
    setPriceData(data);
    setHasUpdates(true);
  });

  // Função para agrupar componentes por categoria
  const groupComponentsByCategory = (components: ComponentOption[]): GroupedPriceData => {
    const grouped: GroupedPriceData = {};
    
    components.forEach(component => {
      if (!component?.type) return;
      
      const category = component.type.toLowerCase();
      
      if (!grouped[category]) {
        grouped[category] = {
          items: [],
          name: getCategoryDisplayName(category),
          description: getCategoryDescription(category)
        };
      }
      
      grouped[category].items.push(component);
    });
    
    return grouped;
  };

  // Função para obter nome de exibição da categoria
  const getCategoryDisplayName = (category: string): string => {
    const categoryNames: Record<string, string> = {
      cpu: "Processadores",
      memory: "Memória RAM", 
      disco: "Armazenamento Interno",
      external_storage: "Armazenamento Externo",
      operating_system: "Sistemas Operacionais",
      control_panel: "Painéis de Controle",
      connectivity: "Conectividade",
      backup: "Backup",
      security: "Segurança"
    };
    
    return categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1);
  };

  // Função para obter descrição da categoria
  const getCategoryDescription = (category: string): string => {
    const descriptions: Record<string, string> = {
      cpu: "Processadores disponíveis para servidores",
      memory: "Opções de memória RAM",
      disco: "Discos internos (SSD, NVMe, HDD)",
      external_storage: "Soluções de armazenamento externo",
      operating_system: "Sistemas operacionais suportados",
      control_panel: "Painéis de controle disponíveis",
      connectivity: "Opções de conectividade e rede",
      backup: "Soluções de backup",
      security: "Ferramentas de segurança"
    };
    
    return descriptions[category] || `Componentes da categoria ${category}`;
  };

  // Função para carregar dados dos componentes
  const loadPriceData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      console.log("PriceTableContainer: Loading components from hd_hardwares table");
      
      // Buscar todos os componentes da tabela hd_hardwares
      const components = await systemComponentsService.getAllComponents();
      
      console.log(`PriceTableContainer: Loaded ${components.length} components`);
      
      // Agrupar componentes por categoria
      const groupedData = groupComponentsByCategory(components);
      
      // Log das categorias encontradas
      Object.keys(groupedData).forEach(category => {
        console.log(`PriceTableContainer: Category ${category} has ${groupedData[category].items.length} items`);
      });
      
      setPriceData(groupedData);
      setLastSyncTime(new Date());
      setHasUpdates(false);
      
      // Definir aba ativa para a primeira categoria disponível
      const availableCategories = Object.keys(groupedData);
      if (availableCategories.length > 0 && !availableCategories.includes(activeTab)) {
        setActiveTab(availableCategories[0]);
      }
      
    } catch (error) {
      console.error("PriceTableContainer: Error loading components:", error);
      toast.error("Erro ao carregar componentes", {
        description: "Não foi possível carregar os dados da tabela de preços.",
        icon: <AlertCircle className="h-5 w-5" />
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para sincronizar dados
  const handleSyncData = async (): Promise<void> => {
    await loadPriceData();
  };

  // Função para atualizar dados
  const handleRefreshData = async (): Promise<void> => {
    await loadPriceData();
  };

  // Função para resetar dados (recarregar do banco)
  const handleResetData = async (): Promise<void> => {
    await loadPriceData();
  };

  // Ações da tabela
  const tableActions = {
    addItem: (category: string, item: ComponentOption) => {
      if (!priceData || disabled) return;
      
      const updatedData = { ...priceData };
      if (!updatedData[category]) {
        updatedData[category] = {
          items: [],
          name: getCategoryDisplayName(category)
        };
      }
      
      updatedData[category].items.push(item);
      setPriceData(updatedData);
      setHasUpdates(true);
    },
    
    updateItem: (category: string, itemId: string, updatedItem: ComponentOption) => {
      if (!priceData || disabled) return;
      
      const updatedData = { ...priceData };
      if (updatedData[category]) {
        const itemIndex = updatedData[category].items.findIndex(item => item.id === itemId);
        if (itemIndex >= 0) {
          updatedData[category].items[itemIndex] = updatedItem;
          setPriceData(updatedData);
          setHasUpdates(true);
        }
      }
    },
    
    deleteItem: (category: string, itemId: string) => {
      if (!priceData || disabled) return;
      
      const updatedData = { ...priceData };
      if (updatedData[category]) {
        updatedData[category].items = updatedData[category].items.filter(item => item.id !== itemId);
        setPriceData(updatedData);
        setHasUpdates(true);
      }
    }
  };

  // Estado da tabela de preços
  const priceTableState = {
    priceData,
    setPriceData,
    activeTab,
    setActiveTab,
    tableActions,
    isLoading,
    hasUpdates,
    handleSyncData,
    loadPriceData,
    lastSyncTime
  };

  // Inicialização dos dados
  useEffect(() => {
    async function initialize() {
      if (isAuthenticated) {
        try {
          console.log("PriceTableContainer: Initializing component data");
          await loadPriceData();
          setIsInitialized(true);
        } catch (error) {
          console.error("PriceTableContainer: Error initializing:", error);
          setIsInitialized(true);
        }
      }
    }
    
    initialize();
  }, [isAuthenticated]);

  // Combinação de estados de loading
  const combinedLoading = isLoading || fileLoading || !isInitialized;

  // Filtrar dados de preço (remover categoria de contrato se existir)
  const filteredPriceData = priceData ? { ...priceData } : {};
  if (filteredPriceData?.contract) {
    delete filteredPriceData.contract;
  }

  return (
    <PriceTablePage 
      priceTableState={priceTableState}
      filteredPriceData={filteredPriceData}
      fileInputRef={fileInputRef}
      handleFileUpload={handleFileUpload}
      handleRefreshData={handleRefreshData}
      hasConflicts={false}
      isLoading={combinedLoading}
      isRefreshing={isLoading}
      disabled={disabled}
    />
  );
}
