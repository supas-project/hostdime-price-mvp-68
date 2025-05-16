import { PriceService } from "./price-service";
import { diskData } from "@/data/disk-data";
import { cpuComponents } from "@/data/cpu-components";
import { memoryComponents } from "@/data/memory-components";
import { connectivityComponents } from "@/data/connectivity-components";
import { toast } from "sonner";

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

      // Adicionar dados de sistema operacional
      ComponentSyncService.syncOSData();
      
      // Adicionar dados de conectividade
      ComponentSyncService.syncConnectivityData();
      
      console.log("Dados da tabela de preços inicializados com sucesso!");
      toast.success("Dados da tabela de preços inicializados com sucesso");
    } catch (error) {
      console.error("Erro ao inicializar dados da tabela de preços:", error);
      toast.error("Erro ao inicializar dados da tabela de preços");
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
            item.name.toLowerCase() === cpu.name.toLowerCase()
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
          console.warn(`Erro ao adicionar CPU ${cpu.name}:`, err);
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
            item.name.toLowerCase() === memory.name.toLowerCase()
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
          console.warn(`Erro ao adicionar memória ${memory.name}:`, err);
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
  },
  
  /**
   * Sincroniza dados de sistemas operacionais com a tabela de preços
   */
  syncOSData: () => {
    try {
      // Verificar se a categoria já existe
      let osCategory = PriceService.getCategory('os');
      
      if (!osCategory) {
        // Criar categoria se não existir
        osCategory = PriceService.addCategory({
          name: 'Sistemas Operacionais',
          items: []
        });
      }
      
      // Dados de sistemas operacionais padrão
      const osList = [
        {
          name: "Windows Server 2022 Standard",
          price: 140.00,
          specs: [
            "Licença mensal",
            "Suporte incluído",
            "Atualizações automáticas"
          ],
          description: "Sistema operacional Windows Server 2022 com suporte completo"
        },
        {
          name: "Ubuntu Server 22.04 LTS",
          price: 0,
          specs: [
            "Licença gratuita",
            "Suporte comunitário",
            "Atualizações por 5 anos"
          ],
          description: "Sistema operacional Linux Ubuntu Server LTS"
        },
        {
          name: "CentOS Stream 9",
          price: 0,
          specs: [
            "Licença gratuita",
            "Ciclo contínuo de atualizações",
            "Compatível com RHEL"
          ],
          description: "Sistema operacional Linux CentOS Stream"
        },
        {
          name: "Windows Server 2019 Standard",
          price: 120.00,
          specs: [
            "Licença mensal",
            "Suporte incluído",
            "Atualizações de segurança"
          ],
          description: "Sistema operacional Windows Server 2019 com suporte completo"
        }
      ];
      
      // Adicionar sistemas operacionais
      osList.forEach(os => {
        try {
          // Verificar se o item já existe
          const existingItems = osCategory?.items.filter(item => 
            item.name.toLowerCase() === os.name.toLowerCase()
          ) || [];
          
          if (existingItems.length === 0 && osCategory) {
            // Adicionar novo item
            PriceService.addItem('os', {
              name: os.name,
              description: os.description,
              price: os.price,
              specs: os.specs,
              type: 'SistemaOperacional'
            });
          }
        } catch (err) {
          console.warn(`Erro ao adicionar sistema operacional ${os.name}:`, err);
        }
      });
      
      console.log("Dados de sistemas operacionais sincronizados com sucesso!");
    } catch (error) {
      console.error("Erro ao sincronizar dados de sistemas operacionais:", error);
    }
  },
  
  /**
   * Sincroniza dados de conectividade com a tabela de preços
   */
  syncConnectivityData: () => {
    try {
      // 1. Sincronizar itens para categoria de Interface de Rede (network)
      let networkCategory = PriceService.getCategory('network');
      
      if (!networkCategory) {
        // Criar categoria se não existir
        networkCategory = PriceService.addCategory({
          name: 'Interface de Rede',
          items: []
        });
      }
      
      // 2. Sincronizar itens para categoria de Bloco de IPs (ip)
      let ipCategory = PriceService.getCategory('ip');
      
      if (!ipCategory) {
        // Criar categoria se não existir
        ipCategory = PriceService.addCategory({
          name: 'Bloco de IPs',
          items: []
        });
      }
      
      // Filtramos os componentes de conectividade por subtype
      const portOptions = connectivityComponents.options.filter(opt => opt.subtype === "porta");
      const ipOptions = connectivityComponents.options.filter(opt => opt.subtype === "ip");
      
      // Adicionar itens de porta à categoria network
      portOptions.forEach(port => {
        try {
          // Verificar se o item já existe
          const existingItems = networkCategory?.items.filter(item => 
            item.name.toLowerCase() === port.name.toLowerCase()
          ) || [];
          
          if (existingItems.length === 0 && networkCategory) {
            // Adicionar novo item
            PriceService.addItem('network', {
              name: port.name,
              description: port.description || `Porta de rede ${port.name}`,
              price: port.price,
              specs: [],
              type: "Conectividade",
              subtype: "porta",
              tags: ["Hardware"]
            });
          }
        } catch (err) {
          console.warn(`Erro ao adicionar porta de rede ${port.name}:`, err);
        }
      });
      
      // Adicionar itens de IP à categoria ip
      ipOptions.forEach(ip => {
        try {
          // Verificar se o item já existe
          const existingItems = ipCategory?.items.filter(item => 
            item.name.toLowerCase() === ip.name.toLowerCase()
          ) || [];
          
          if (existingItems.length === 0 && ipCategory) {
            // Adicionar novo item
            PriceService.addItem('ip', {
              name: ip.name,
              description: ip.description || `Bloco de IPs ${ip.name}`,
              price: ip.price,
              specs: [],
              type: "Conectividade",
              subtype: "ip"
            });
          }
        } catch (err) {
          console.warn(`Erro ao adicionar bloco de IP ${ip.name}:`, err);
        }
      });
      
      // Opcionalmente, também sincronizamos com a categoria geral de conectividade
      let connectivityCategory = PriceService.getCategory('connectivity');
      
      if (!connectivityCategory) {
        // Criar categoria se não existir
        connectivityCategory = PriceService.addCategory({
          name: 'Conectividade',
          items: []
        });
      }
      
      // Adicionar todos os itens de conectividade (combinando portas e IPs)
      connectivityComponents.options.forEach(conn => {
        try {
          // Verificar se o item já existe
          const existingItems = connectivityCategory?.items.filter(item => 
            item.name.toLowerCase() === conn.name.toLowerCase()
          ) || [];
          
          if (existingItems.length === 0 && connectivityCategory) {
            // Adicionar novo item
            PriceService.addItem('connectivity', {
              name: conn.name,
              description: conn.description,
              price: conn.price,
              specs: [],
              type: "Conectividade",
              subtype: conn.subtype,
              tags: conn.subtype === "porta" ? ["Hardware"] : []
            });
          }
        } catch (err) {
          console.warn(`Erro ao adicionar item de conectividade ${conn.name}:`, err);
        }
      });
      
      console.log("Dados de conectividade sincronizados com sucesso!");
    } catch (error) {
      console.error("Erro ao sincronizar dados de conectividade:", error);
    }
  }
};

export default ComponentSyncService;
