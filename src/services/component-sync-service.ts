import { PriceService } from "./price-service";

/**
 * Inicializa os serviços e sincroniza dados
 */
export const initializeServices = () => {
  console.log("Inicializando serviços e sincronizando dados...");
  
  try {
    // Inicializar o serviço de preços para garantir que temos as estruturas básicas
    PriceService.initialize();
    
    // Verificar se já existem dados na tabela de preços
    const priceData = PriceService.getAllData();
    const hasCpuData = priceData.cpu && priceData.cpu.items.length > 0;
    const hasMemoryData = priceData.memory && priceData.memory.items.length > 0;
    const hasDiskData = priceData.disk && priceData.disk.items.length > 0;
    
    // Se não há dados, inicializar com os dados padrão
    if (!hasCpuData || !hasMemoryData || !hasDiskData) {
      console.log("Inicializando dados da tabela de preços...");
      ComponentSyncService.initializePriceData();
    } else {
      console.log("Dados da tabela de preços já existem. Sincronizando...");
    }
  } catch (error) {
    console.error("Erro durante inicialização de serviços:", error);
  }
};

// Exportar o service por padrão
export default {
  initializeServices
};
