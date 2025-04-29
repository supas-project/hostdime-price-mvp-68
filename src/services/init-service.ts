
import ComponentSyncService from "./component-sync-service";
import { PriceService } from "./price-service";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

/**
 * Inicializa os serviços e sincroniza dados
 */
export const initializeServices = async () => {
  console.log("Inicializando serviços e sincronizando dados...");
  
  try {
    // Verificar conexão com Supabase
    try {
      // Testar se o cliente Supabase está funcionando corretamente
      const { data, error } = await supabase.auth.getSession();
      if (!error) {
        console.log("Conexão com Supabase estabelecida com sucesso");
      } else {
        console.warn("Aviso: Erro ao conectar com Supabase:", error.message);
      }
    } catch (supabaseError) {
      console.warn("Aviso: Erro ao conectar com Supabase. Usando modo offline.", supabaseError);
    }
    
    // Inicializar o serviço de preços para garantir que temos as estruturas básicas
    PriceService.initialize();
    
    // Verificar se já existem dados na tabela de preços
    const priceData = PriceService.getAllData();
    const hasCpuData = priceData.cpu && priceData.cpu.items.length > 0;
    const hasMemoryData = priceData.memory && priceData.memory.items.length > 0;
    const hasDiskData = priceData.disk && priceData.disk.items.length > 0;
    const hasOsData = priceData.os && priceData.os.items.length > 0;
    const hasStorageData = priceData.storage && priceData.storage.items.length > 0;
    
    // Se não há dados, inicializar com os dados padrão
    if (!hasCpuData || !hasMemoryData || !hasDiskData || !hasOsData || !hasStorageData) {
      console.log("Inicializando dados da tabela de preços...");
      
      // Inicializar apenas as categorias que não têm dados
      if (!hasCpuData) ComponentSyncService.syncCpuData();
      if (!hasMemoryData) ComponentSyncService.syncMemoryData();
      if (!hasDiskData) ComponentSyncService.syncDiskData();
      if (!hasOsData) ComponentSyncService.syncOSData();
      if (!hasStorageData) ComponentSyncService.syncStorageData();
      
      toast.success("Dados iniciais carregados com sucesso");
    } else {
      console.log("Dados da tabela de preços já existem. Sincronização não necessária.");
    }
  } catch (error) {
    console.error("Erro durante inicialização de serviços:", error);
    toast.error("Erro durante a inicialização de serviços");
  }
};

// Exportar o service por padrão
export default {
  initializeServices
};
