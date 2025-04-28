import { PriceService } from "./price-service";
import { diskData } from "@/data/disk-data";
import { cpuComponents } from "@/data/cpu-components";
import { memoryComponents } from "@/data/memory-components";

/**
 * Serviço responsável por sincronizar dados entre componentes e a tabela de preços
 */
const ComponentSyncService = {
  /**
   * Inicializa os dados da tabela de preços com dados padrão
   */
  initializePriceData: () => {
    console.log("Inicializando dados da tabela de preços...");
    
    try {
      // Adicionar dados de CPUs
      ComponentSyncService.syncCpuData();
      
      // Adicionar dados de memória
      ComponentSyncService.syncMemoryData();
      
      // Adicionar dados de discos usando o método próprio do serviço
      ComponentSyncService.syncDiskData();
      
      // Adicionar dados de storage usando o método próprio do serviço
      ComponentSyncService.syncStorageData();
      
      console.log("Dados da tabela de preços inicializados com sucesso!");
    } catch (error) {
      console.error("Erro ao inicializar dados da tabela de preços:", error);
    }
  },
  
  /**
   * Sincroniza dados de CPUs com a tabela de preços
   */
  syncCpuData: () => {
    try {
      // Verificar se a categoria já existe
      let cpuCategory = PriceService.getCategory('cpu');
      
      if (!cpuCategory) {
        // Criar categoria se não existir
        cpuCategory = PriceService.addCategory({
          name: 'Processadores',
          items: []
        });
      }
      
      // Adicionar itens de CPU à categoria
      cpuComponents.options.forEach(cpu => {
        try {
          // Verificar se o item já existe
          const existingItems = cpuCategory?.items.filter(item => 
            item.id === cpu.id
          ) || [];
          
          if (existingItems.length === 0 && cpuCategory) {
            // Adicionar novo item - Remover id do objeto
            PriceService.addItem('cpu', {
              name: cpu.name,
              description: cpu.description || `Processador ${cpu.name}`,
              price: cpu.price,
              specs: cpu.specs || [],
              type: cpu.type || 'Processador'
            });
          }
        } catch (err) {
          console.warn(`Erro ao adicionar CPU ${cpu.id}:`, err);
        }
      });
      
      console.log("Dados de CPUs sincronizados com sucesso!");
    } catch (error) {
      console.error("Erro ao sincronizar dados de CPUs:", error);
    }
  },
  
  /**
   * Sincroniza dados de memória com a tabela de preços
   */
  syncMemoryData: () => {
    try {
      // Verificar se a categoria já existe
      let memoryCategory = PriceService.getCategory('memory');
      
      if (!memoryCategory) {
        // Criar categoria se não existir
        memoryCategory = PriceService.addCategory({
          name: 'Memória',
          items: []
        });
      }
      
      // Adicionar itens de memória à categoria
      memoryComponents.options.forEach(memory => {
        try {
          // Verificar se o item já existe
          const existingItems = memoryCategory?.items.filter(item => 
            item.id === memory.id
          ) || [];
          
          if (existingItems.length === 0 && memoryCategory) {
            // Adicionar novo item - Remover id do objeto
            PriceService.addItem('memory', {
              name: memory.name,
              description: memory.description || `Memória ${memory.name}`,
              price: memory.price,
              specs: memory.specs || [],
              type: "Memória"
            });
          }
        } catch (err) {
          console.warn(`Erro ao adicionar memória ${memory.id}:`, err);
        }
      });
      
      console.log("Dados de memória sincronizados com sucesso!");
    } catch (error) {
      console.error("Erro ao sincronizar dados de memória:", error);
    }
  },
  
  /**
   * Sincroniza dados de discos com a tabela de preços
   */
  syncDiskData: () => {
    try {
      // Verificar se a categoria já existe
      let diskCategory = PriceService.getCategory('disk');
      
      if (!diskCategory) {
        // Criar categoria se não existir
        diskCategory = PriceService.addCategory({
          name: 'Discos',
          items: []
        });
      }
      
      // Adicionar itens de disco à categoria
      diskData.forEach(disk => {
        try {
          let specs: string[] = [];
          
          // Converter specs de objeto para array de strings
          if (disk.specs) {
            if (Array.isArray(disk.specs)) {
              specs = disk.specs;
            } else {
              if (disk.specs.readSpeed) specs.push(`Leitura: ${disk.specs.readSpeed}`);
              if (disk.specs.writeSpeed) specs.push(`Escrita: ${disk.specs.writeSpeed}`);
              if (disk.specs.iops) specs.push(`IOPS: ${disk.specs.iops}`);
              if (disk.specs.recommended && Array.isArray(disk.specs.recommended)) {
                specs.push(`Recomendado para: ${disk.specs.recommended.join(', ')}`);
              }
            }
          }
          
          // Verificar se o item já existe
          const existingItems = diskCategory?.items.filter(item => 
            item.name.toLowerCase().includes(disk.type) && 
            item.name.toLowerCase().includes(disk.capacity.toLowerCase())
          ) || [];
          
          if (existingItems.length === 0 && diskCategory) {
            // Adicionar novo item
            PriceService.addItem('disk', {
              name: `${disk.type.toUpperCase()} ${disk.capacity}`,
              description: `Disco ${disk.type.toUpperCase()} de ${disk.capacity}`,
              price: disk.price,
              specs: specs,
              type: 'Armazenamento',
              subtype: disk.type
            });
          }
        } catch (err) {
          console.warn(`Erro ao adicionar disco ${disk.id}:`, err);
        }
      });
      
      console.log("Dados de discos sincronizados com sucesso!");
    } catch (error) {
      console.error("Erro ao sincronizar dados de discos:", error);
    }
  },
  
  /**
   * Sincroniza dados de storage com a tabela de preços
   */
  syncStorageData: () => {
    try {
      // Verificar se a categoria já existe
      let storageCategory = PriceService.getCategory('storage');
      
      if (!storageCategory) {
        // Criar categoria se não existir
        storageCategory = PriceService.addCategory({
          name: 'Storage',
          items: []
        });
      }
      
      // Dados de storage padrão
      const storageTypes = [
        {
          name: "Storage Standard",
          pricePerGB: 0.15,
          specs: [
            "IOPS: Até 3.000",
            "Throughput: 125 MB/s",
            "Throughput adicional: R$ 0.10 por GB/mês",
            "Throughput máximo: 500 MB/s"
          ],
          description: "Ideal para armazenamento geral e backups"
        },
        {
          name: "Storage Performance",
          pricePerGB: 0.30,
          specs: [
            "IOPS: Até 6.000",
            "Throughput: 250 MB/s",
            "Throughput adicional: R$ 0.15 por GB/mês",
            "Throughput máximo: 750 MB/s"
          ],
          description: "Recomendado para bancos de dados e aplicações de média demanda"
        },
        {
          name: "Storage Premium",
          pricePerGB: 0.45,
          specs: [
            "IOPS: Até 16.000",
            "Throughput: 500 MB/s",
            "Throughput adicional: R$ 0.25 por GB/mês",
            "Throughput máximo: 1000 MB/s"
          ],
          description: "Para cargas de trabalho intensivas e aplicações críticas"
        },
        {
          name: "Storage Snapshot",
          pricePerGB: 0.05,
          specs: [
            "Backup pontual"
          ],
          description: "Backup pontual de volumes de armazenamento"
        }
      ];
      
      // Adicionar tipos de storage
      storageTypes.forEach(storage => {
        try {
          // Verificar se o item já existe
          const existingItems = storageCategory?.items.filter(item => 
            item.name.toLowerCase() === storage.name.toLowerCase()
          ) || [];
          
          if (existingItems.length === 0 && storageCategory) {
            // Adicionar novo item
            PriceService.addItem('storage', {
              name: storage.name,
              description: storage.description,
              price: storage.pricePerGB,
              specs: storage.specs,
              type: 'Storage'
            });
          }
        } catch (err) {
          console.warn(`Erro ao adicionar storage ${storage.name}:`, err);
        }
      });
      
      console.log("Dados de storage sincronizados com sucesso!");
    } catch (error) {
      console.error("Erro ao sincronizar dados de storage:", error);
    }
  }
};

export default ComponentSyncService;
