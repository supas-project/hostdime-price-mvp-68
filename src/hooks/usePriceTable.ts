
import { useState, useEffect } from "react";
import { PriceData, PriceItem } from "@/types/pricing";
import { PriceService } from "@/services/price-service";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export function usePriceTable() {
  const [priceData, setPriceData] = useState<PriceData>({});
  const [activeTab, setActiveTab] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);
  const [displayMode, setDisplayMode] = useState<"table" | "card">("table");
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [contractDuration, setContractDuration] = useState<string>("0"); // Add contractDuration state
  
  const { toast } = useToast();

  // Load initial data
  const loadPriceData = async () => {
    try {
      setIsLoading(true);
      const data = await PriceService.getAllData();
      
      // Process items to ensure they have the appropriate tags
      Object.values(data).forEach(category => {
        category.items = category.items.map(item => {
          // Create tags array if it doesn't exist
          if (!item.tags) {
            item.tags = [];
          }
          
          // For backward compatibility: if isHardware is true but "Hardware" tag is missing, add it
          const isHardwareCategory = ["cpu", "memory", "disk", "storage", "chassis", "network"].includes(item.type.toLowerCase());
          
          if ((isHardwareCategory || item.isHardware) && !item.tags.includes("Hardware")) {
            item.tags.push("Hardware");
            item.isHardware = true;
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
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Configure listeners for data changes
  useEffect(() => {
    loadPriceData();
    
    // Add listener for data changes
    const handleDataChange = (data: PriceData) => {
      setPriceData(data);
      setLastSyncTime(new Date());
    };
    
    PriceService.addDataChangeListener(handleDataChange);
    
    return () => {
      PriceService.removeDataChangeListener(handleDataChange);
    };
  }, []);

  // Add real-time subscription to database changes
  useEffect(() => {
    const setupRealtimeSubscription = async () => {
      try {
        // Subscribe to changes in price_data table
        const channel = supabase
          .channel('price_data_changes')
          .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'price_data' 
          }, () => {
            // When we detect a change, reload the data
            loadPriceData();
          })
          .subscribe();
          
        // Also subscribe to updates table for notifications
        const updatesSub = supabase
          .channel('price_data_updates_changes')
          .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'price_data_updates' 
          }, () => {
            loadPriceData();
          })
          .subscribe();
          
        // Cleanup function
        return () => {
          supabase.removeChannel(channel);
          supabase.removeChannel(updatesSub);
        };
      } catch (error) {
        console.error("Erro ao configurar subscrição em tempo real:", error);
      }
    };
    
    setupRealtimeSubscription();
  }, []);

  // Ensure that a tab is active when data is loaded
  useEffect(() => {
    if (Object.keys(priceData).length > 0 && !activeTab) {
      setActiveTab(Object.keys(priceData)[0]);
    }
  }, [priceData, activeTab]);

  // Toggle to collapse/expand categories
  const toggleCategoryCollapse = (categoryId: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Filter items based on search term
  const filterItems = (items: PriceItem[]): PriceItem[] => {
    if (!searchTerm) return items;
    const lowerSearch = searchTerm.toLowerCase();
    
    return items.filter(item => 
      item.name.toLowerCase().includes(lowerSearch) || 
      item.description.toLowerCase().includes(lowerSearch) ||
      (item.subtype && item.subtype.toLowerCase().includes(lowerSearch)) ||
      (item.specs && item.specs.some(spec => spec.toLowerCase().includes(lowerSearch))) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(lowerSearch)))
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
