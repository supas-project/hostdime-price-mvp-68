
import { ComponentOption, ServerComponent } from "@/types/component";
import { PriceItem, PriceCategory } from "@/types/pricing";
import { PriceService } from "./price-service";

// Mapeamento entre categorias de preço e tipos de componentes
export const CATEGORY_MAPPINGS = {
  cpu: "Processador",
  memory: "Memória",
  disk: "Armazenamento",
  network: "Conectividade",
  ip: "Conectividade",
  os: "SistemaOperacional"
};

// Regra de preços para memória RAM
export const RAM_PRICING_RULES = [
  { maxCapacity: 256, increment: 16 },
  { maxCapacity: 768, increment: 32 },
  { maxCapacity: 2048, increment: 64 }
];

export const ComponentSyncService = {
  /**
   * Transforma um item de preço em opção de componente
   */
  transformPriceItemToComponentOption(priceItem: PriceItem, category: string): ComponentOption {
    switch (category) {
      case 'cpu':
        return this.transformProcessorItem(priceItem);
      case 'memory':
        return this.transformMemoryItem(priceItem);
      case 'disk':
        return this.transformDiskItem(priceItem);
      case 'os':
        return this.transformOSItem(priceItem);
      case 'network':
        return this.transformNetworkItem(priceItem);
      case 'ip':
        return this.transformIPItem(priceItem);
      default:
        // Transformação genérica para outros tipos
        return {
          id: priceItem.id,
          name: priceItem.name,
          description: priceItem.description || "",
          price: priceItem.price,
          type: CATEGORY_MAPPINGS[category as keyof typeof CATEGORY_MAPPINGS] || category,
          specs: priceItem.specs || [],
          subtype: priceItem.subtype
        };
    }
  },

  /**
   * Transforma um item de processador
   */
  transformProcessorItem(priceItem: PriceItem): ComponentOption {
    // Extrair informações do nome do processador (cores, modelo)
    const coreMatch = priceItem.name.match(/(\d+)-Core/);
    const cores = coreMatch ? parseInt(coreMatch[1]) : 1;

    return {
      id: priceItem.id,
      name: priceItem.name,
      description: priceItem.description || `${priceItem.name} para servidores de alto desempenho`,
      price: priceItem.price,
      type: "Processador",
      specs: priceItem.specs || this.generateProcessorSpecs(priceItem.name),
      metadata: {
        cores: cores,
        features: [
          `${cores} Cores / ${cores * 2} Threads`
        ]
      }
    };
  },

  /**
   * Gera especificações para processadores baseado no nome
   */
  generateProcessorSpecs(processorName: string): string[] {
    const coreMatch = processorName.match(/(\d+)-Core/);
    const cores = coreMatch ? parseInt(coreMatch[1]) : 1;
    const specs = [`${cores} Cores / ${cores * 2} Threads`];
    
    // Extrair velocidade do clock se disponível
    const clockMatch = processorName.match(/(\d+\.\d+)\s*Ghz/i);
    if (clockMatch) {
      specs.push(`Clock base: ${clockMatch[1]} GHz`);
    }
    
    // Verificar se tem HyperThreading
    if (processorName.includes("w/HT")) {
      specs.push("Intel Hyper-Threading");
    }
    
    // Adicionar informações de cache aproximadas baseadas no número de cores
    specs.push(`Cache: ${Math.min(cores * 2.5, 45).toFixed(1)}MB`);
    
    return specs;
  },

  /**
   * Transforma um item de memória
   */
  transformMemoryItem(priceItem: PriceItem): ComponentOption {
    const capacityMatch = priceItem.name.match(/(\d+)GB/i);
    const capacity = capacityMatch ? parseInt(capacityMatch[1]) : 8;
    const type = priceItem.name.includes("DDR4") ? "DDR4" : "DDR3";
    
    // Determinar tipo de memória ECC baseado na capacidade
    const memoryType = capacity >= 64 ? "DDR4 ECC Load Reduced DIMM" : "DDR4 ECC Registered";

    return {
      id: priceItem.id,
      type: "memoria",
      name: `${capacity}GB RAM`,
      description: `Memória RAM ${memoryType}`,
      price: priceItem.price,
      specs: [
        `${capacity}GB Total`,
        `Tipo: ${memoryType}`,
        `Velocidade: 3200 MHz`,
        `Quad Channel`,
        `Error Correction Code (ECC)`
      ]
    };
  },

  /**
   * Transforma um item de disco
   */
  transformDiskItem(priceItem: PriceItem): ComponentOption {
    // Classificar tipo de disco
    let diskType = "hdd";
    if (priceItem.name.toLowerCase().includes("nvme")) {
      diskType = "nvme";
    } else if (priceItem.name.toLowerCase().includes("ssd")) {
      diskType = "ssd";
    }
    
    // Extrair capacidade
    const capacityMatches = priceItem.name.match(/(\d+)TB|(\d+)GB/i);
    let capacity = "";
    
    if (capacityMatches) {
      if (capacityMatches[1]) {
        capacity = `${capacityMatches[1]}TB`;
      } else if (capacityMatches[2]) {
        capacity = `${capacityMatches[2]}GB`;
      }
    }
    
    // Determinar se é enterprise ou enterprise plus
    const tier = priceItem.name.toLowerCase().includes("plus") ? "Enterprise Plus" : "Enterprise";

    // Gerar especificações baseadas no tipo de disco
    let specs: string[] = [
      `Capacidade: ${capacity}`,
      `Tipo: ${diskType.toUpperCase()}`
    ];
    
    // Adicionar IOPS e throughput estimados com base no tipo
    if (diskType === "nvme") {
      specs.push(`IOPS: até ${tier.includes("Plus") ? "900K" : "500K"}`);
      specs.push(`Throughput: até ${tier.includes("Plus") ? "6500MB/s" : "3500MB/s"}`);
    } else if (diskType === "ssd") {
      specs.push(`IOPS: até ${tier.includes("Plus") ? "120K" : "80K"}`);
      specs.push(`Throughput: até ${tier.includes("Plus") ? "550MB/s" : "520MB/s"}`);
    } else {
      specs.push(`IOPS: até ${tier.includes("Plus") ? "250" : "180"}`);
      specs.push(`Throughput: até ${tier.includes("Plus") ? "220MB/s" : "180MB/s"}`);
    }
    
    return {
      id: `${diskType}-${capacity}-${tier.toLowerCase().replace(" ", "-")}`,
      type: "Armazenamento",
      subtype: "Disco Interno",
      name: `${diskType.toUpperCase()} ${capacity} ${tier}`,
      description: `${diskType.toUpperCase()} ${capacity} ${tier}`,
      price: priceItem.price,
      specs: specs,
      metadata: {
        features: specs,
        unitPrice: priceItem.price
      }
    };
  },

  /**
   * Transforma um item de sistema operacional
   */
  transformOSItem(priceItem: PriceItem): ComponentOption {
    // Verificar se é Windows (precificado por core)
    const isWindows = priceItem.name.toLowerCase().includes("windows");
    const isDataCenter = priceItem.name.toLowerCase().includes("data center");
    
    return {
      id: priceItem.id,
      type: "SistemaOperacional",
      subtype: isWindows ? "windows" : "linux",
      name: priceItem.name,
      description: priceItem.description || priceItem.name,
      price: priceItem.price,
      specs: priceItem.specs || [],
      metadata: {
        perCore: isWindows,
        features: isWindows ? [
          `Licenciamento por 2 cores`,
          isDataCenter ? "Virtualização ilimitada" : "Até 2 VMs"
        ] : ["Licença gratuita"]
      }
    };
  },

  /**
   * Transforma um item de interface de rede
   */
  transformNetworkItem(priceItem: PriceItem): ComponentOption {
    // Extrair velocidade da interface
    const speedMatch = priceItem.name.match(/(\d+)\s*Gbps/i);
    const speed = speedMatch ? parseInt(speedMatch[1]) : 1;
    
    return {
      id: `network-${speed}g`,
      type: "Conectividade",
      subtype: "porta",
      name: `${speed} Gbps`,
      description: `Interface de rede ${speed} Gbps`,
      price: priceItem.price,
      specs: [
        `Velocidade: ${speed} Gbps`,
        `${speed === 10 ? "Suporte a LACP" : ""}`,
        `${speed === 10 ? "Jumbo frames" : ""}`
      ]
    };
  },

  /**
   * Transforma um item de bloco de IPs
   */
  transformIPItem(priceItem: PriceItem): ComponentOption {
    // Extrair informações do bloco de IPs
    const blockMatch = priceItem.name.match(/\/(\d+)/);
    const block = blockMatch ? blockMatch[1] : "30";
    
    // Extrair número de IPs utilizáveis
    const usableMatch = priceItem.description?.match(/(\d+)/);
    const usableIPs = usableMatch ? parseInt(usableMatch[1]) : 2;
    
    return {
      id: `ip-block-${block}`,
      type: "Conectividade",
      subtype: "ip",
      name: `Bloco IPv4 /${block}`,
      description: `${usableIPs} IPs utilizáveis`,
      price: priceItem.price,
      specs: [
        `Total de IPs: ${Math.pow(2, 32 - parseInt(block))}`,
        `IPs utilizáveis: ${usableIPs}`,
        `Suporte a rDNS`
      ]
    };
  },

  /**
   * Sincroniza todos os componentes do servidor com dados da tabela de preços
   */
  syncServerComponents(): ServerComponent[] {
    const components: ServerComponent[] = [];
    const priceData = PriceService.getAllData();
    
    // Para cada categoria mapeada
    Object.entries(CATEGORY_MAPPINGS).forEach(([category, componentType]) => {
      if (!priceData[category]) return;
      
      // Obter dados da categoria
      const categoryData = priceData[category];
      
      // Criar componente de servidor
      const serverComponent: ServerComponent = {
        id: category,
        type: componentType,
        friendlyName: categoryData.name,
        description: `Escolha ${categoryData.name.toLowerCase()} ideal para seu servidor`,
        icon: this.getCategoryIcon(category),
        options: categoryData.items.map(item => this.transformPriceItemToComponentOption(item, category))
      };
      
      components.push(serverComponent);
    });
    
    return components;
  },

  /**
   * Retorna o ícone apropriado para uma categoria
   */
  getCategoryIcon(category: string): string {
    switch (category) {
      case 'cpu': return 'Cpu';
      case 'memory': return 'MemoryStick';
      case 'disk': return 'HardDrive';
      case 'network': return 'Network';
      case 'os': return 'Server';
      default: return 'Database';
    }
  },
  
  /**
   * Inicializa as categorias e itens de preço
   */
  initializePriceData(): void {
    this.initializeProcessors();
    this.initializeMemory();
    this.initializeDisks();
    this.initializeStorage();
    this.initializeNetwork();
    this.initializeIPs();
    this.initializeOS();
  },

  /**
   * Inicializa os processadores na tabela de preços
   */
  initializeProcessors(): void {
    const processorsData = [
      { name: "10-Core Xeon E5-2660 v2 2.2 Ghz w/HT", price: 700.00 },
      { name: "10-Core Xeon E5-2660 v3 2.6 Ghz w/HT", price: 700.00 },
      { name: "10-Core Xeon Silver 4114 2.20Ghz w/HT", price: 800.00 },
      { name: "10-Core Xeon Silver 4210 2.2 GHz w/HT", price: 800.00 },
      { name: "10-Core Xeon® E5-2650L v2 1.7GHz", price: 500.00 },
      { name: "12-Core Xeon E5-2650 v4 2.2 GHz w/HT", price: 1000.00 },
      { name: "12-Core Xeon E5-2673 v3 2.40Ghz w/HT", price: 500.00 },
      { name: "12-Core Xeon Gold 5118 2.3 GHz w/HT", price: 2000.00 },
      { name: "12-Core Xeon Silver 4116 2.1Ghz w/HT", price: 500.00 },
      { name: "14-Core Xeon E5-2680 v4 2.4GHz w/HT", price: 700.00 },
      { name: "14-Core Xeon E5-2697 v3 2,60 GHz w/HT", price: 600.00 },
      { name: "16-Core Xeon Gold 6130 2.1Ghz w/HT", price: 1500.00 },
      { name: "16-Core Xeon Silver 4216 2.1 GHz w/HT", price: 800.00 },
      { name: "18-Core Xeon E5-2686 v4 2.3 GHz w/HT", price: 1200.00 },
      { name: "18-core Xeon E5-2699 v3 2.3 Ghz w/HT", price: 1200.00 },
      { name: "20-Core Xeon 2673 V4 2.3Ghz (3.3 Turbo)", price: 0 },
      { name: "20-Core Xeon Gold 6230 2.1Ghz w/HT", price: 3500.00 },
      { name: "4-Core E3-1230 v5 3.4Ghz w/HT", price: 100.00 },
      { name: "4-Core E3-1231 v3 3.4Ghz w/HT", price: 100.00 },
      { name: "22-Core E5-2699 v4 2.2Ghz w/HT", price: 0.00 },
      { name: "4-Core E3-1271 v3 3.6Ghz w/HT", price: 100.00 },
      { name: "4-Core Xeon E3-1270 3.4Ghz w/HT", price: 200.00 },
      { name: "4-Core Xeon E5530 2.4GHz", price: 200.00 },
      { name: "6-Core Xeon E5-2620 v2 2.1GHz w/HT", price: 200.00 },
      { name: "6-Core Xeon L5640 2.26GHz w/HT", price: 200.00 },
      { name: "8-Core Xeon E5-2450L 1.80Ghz w/HT", price: 418.00 },
      { name: "8-Core Xeon E5-2470 2.30GHz w/HT", price: 800.00 },
      { name: "8-Core Xeon E5-2620 v4 2.1 GHz w/HT", price: 500.00 },
      { name: "8-Core Xeon E5-2650 v2 2.6 GHz w/HT", price: 400.00 }
    ];
    
    // Verificar se a categoria já existe
    try {
      let cpuCategory = PriceService.getCategory('cpu');
      if (!cpuCategory) {
        PriceService.addCategory({
          name: "Processadores",
          items: []
        });
      }
      
      // Adicionar processadores
      processorsData.forEach((procData, index) => {
        try {
          PriceService.addItem('cpu', {
            name: procData.name,
            description: `Processador server-grade de alta performance`,
            price: procData.price,
            type: "Processador",
            specs: this.generateProcessorSpecs(procData.name)
          });
        } catch (error) {
          console.error(`Erro ao adicionar processador ${procData.name}:`, error);
        }
      });
    } catch (error) {
      console.error("Erro ao inicializar processadores:", error);
    }
  },

  /**
   * Inicializa a memória RAM na tabela de preços
   */
  initializeMemory(): void {
    const memoryData = [
      { name: "8GB DDR4", price: 300.00 },
      { name: "16GB DDR4", price: 150.00 },
      { name: "32GB DDR4", price: 250.00 },
      { name: "64GB DDR4", price: 450.00 }
    ];
    
    try {
      let memoryCategory = PriceService.getCategory('memory');
      if (!memoryCategory) {
        PriceService.addCategory({
          name: "Memória RAM",
          items: []
        });
      }
      
      // Adicionar opções de memória
      memoryData.forEach((memData) => {
        try {
          PriceService.addItem('memory', {
            name: memData.name,
            description: `Memória RAM server-grade de alta performance`,
            price: memData.price,
            type: "memoria",
            specs: [`Tipo: DDR4 ECC`, `Velocidade: 3200 MHz`]
          });
        } catch (error) {
          console.error(`Erro ao adicionar memória ${memData.name}:`, error);
        }
      });
    } catch (error) {
      console.error("Erro ao inicializar memórias:", error);
    }
  },

  /**
   * Inicializa os discos na tabela de preços
   */
  initializeDisks(): void {
    const diskData = [
      { name: "1TB Nvme Enterprise (Kingston nv2)", price: 400.00 },
      { name: "1TB Nvme Enterprise Plus (Kingston KC3000)", price: 699.00 },
      { name: "2TB Nvme Enterprise (Kingston Nv2)", price: 900.00 },
      { name: "2TB Nvme Enterprise Plus (kingston KC3000)", price: 1600.00 },
      { name: "4TB Nvme Enterprise (Kingston NV2)", price: 1849.00 },
      { name: "4TB Nvme Enterprise Plus (Kingston KC3000)", price: 3200.00 },
      { name: "128GB SSD - 2.5\"", price: 150.00 },
      { name: "240GB SSD - 2.5\"", price: 180.00 },
      { name: "480GB SSD - 2.5\"", price: 480.00 },
      { name: "1TB SSD - 2.5\" Enterprise(Crucial)", price: 439.00 },
      { name: "960GB SSD - 2.5\" Enterprise Plus(Kingston)", price: 1100.00 },
      { name: "2TB SSD - 2.5\" Enterprise(Crucial)", price: 800.00 },
      { name: "1.92TB SSD - 2.5\" Enterprise Plus (Kingston)", price: 2000.00 },
      { name: "4TB SSD - 2.5\" Enterprise (Crucial)", price: 2200.00 },
      { name: "4TB SSD - 2.5\" Enterprise Plus(Intel)", price: 3700.00 },
      { name: "8TB SSD - 2.5\" Enterprise", price: 5300.00 },
      { name: "7.68TB SSD - 2.5\" Enterprise Plus (Kingston)", price: 5390.00 },
      { name: "1TB HDD 2.5\"", price: 400.00 },
      { name: "2TB HDD 2.5\"", price: 540.00 },
      { name: "1TB HDD - 3.5\"", price: 400.00 },
      { name: "2TB HDD - 3.5\"", price: 439.00 },
      { name: "4TB HDD - 3.5\"", price: 596.00 },
      { name: "8TB HDD - 3.5\"", price: 974.00 },
      { name: "12TB HDD - 3.5\"", price: 1500.00 },
      { name: "16TB HDD - 3.5\"", price: 1500.00 },
      { name: "18TB HDD - 3.5\"", price: 3000.00 }
    ];
    
    try {
      let diskCategory = PriceService.getCategory('disk');
      if (!diskCategory) {
        PriceService.addCategory({
          name: "Discos",
          items: []
        });
      }
      
      // Adicionar opções de discos
      diskData.forEach((diskItem) => {
        try {
          // Determinar o tipo de disco
          let diskType = "hdd";
          if (diskItem.name.toLowerCase().includes("nvme")) {
            diskType = "nvme";
          } else if (diskItem.name.toLowerCase().includes("ssd")) {
            diskType = "ssd";
          }
          
          // Obter a capacidade
          let capacity = "";
          const capacityMatches = diskItem.name.match(/(\d+)TB|(\d+\.?\d*)TB|(\d+)GB/i);
          if (capacityMatches) {
            if (capacityMatches[1]) capacity = `${capacityMatches[1]}TB`;
            else if (capacityMatches[2]) capacity = `${capacityMatches[2]}TB`;
            else if (capacityMatches[3]) capacity = `${capacityMatches[3]}GB`;
          }
          
          // Determinar se é enterprise ou enterprise plus
          const isPlus = diskItem.name.toLowerCase().includes("plus");
          
          // Gerar especificações baseado no tipo
          const specs = [
            `Tipo: ${diskType.toUpperCase()}`,
            `Capacidade: ${capacity}`,
            `Fator de forma: ${diskItem.name.includes("3.5") ? "3.5\"" : "2.5\""}`
          ];
          
          if (diskType === "nvme") {
            specs.push(`IOPS: ${isPlus ? "até 900K" : "até 500K"}`);
            specs.push(`Velocidade de leitura: ${isPlus ? "até 7000MB/s" : "até 3500MB/s"}`);
            specs.push(`Velocidade de escrita: ${isPlus ? "até 6000MB/s" : "até 2800MB/s"}`);
          } else if (diskType === "ssd") {
            specs.push(`IOPS: ${isPlus ? "até 120K" : "até 80K"}`);
            specs.push(`Velocidade de leitura: ${isPlus ? "até 550MB/s" : "até 520MB/s"}`);
            specs.push(`Velocidade de escrita: ${isPlus ? "até 520MB/s" : "até 490MB/s"}`);
          } else {
            specs.push(`IOPS: ${isPlus ? "até 250" : "até 180"}`);
            specs.push(`Velocidade: ${isPlus ? "até 220MB/s" : "até 180MB/s"}`);
            specs.push(`Cache: ${isPlus ? "256MB" : "128MB"}`);
          }
          
          PriceService.addItem('disk', {
            name: diskItem.name,
            description: `${capacity} ${diskType.toUpperCase()} ${isPlus ? "Enterprise Plus" : "Enterprise"}`,
            price: diskItem.price,
            type: "Armazenamento",
            subtype: diskType,
            specs: specs
          });
        } catch (error) {
          console.error(`Erro ao adicionar disco ${diskItem.name}:`, error);
        }
      });
    } catch (error) {
      console.error("Erro ao inicializar discos:", error);
    }
  },

  /**
   * Inicializa as opções de storage na tabela de preços
   */
  initializeStorage(): void {
    const storageData = [
      { name: "Storage Standard", price: 0.35, iops: "3K", throughput: "125" },
      { name: "Storage Performance", price: 0.60, iops: "6K", throughput: "250" },
      { name: "Storage Premium", price: 0.80, iops: "12K", throughput: "500" },
      { name: "Storage Ultra", price: 1.10, iops: "16K", throughput: "600", throughputAdd: 1.80, maxThroughput: "1000" },
      { name: "Storage Edge", price: 1.30, iops: "32K", throughput: "1000", throughputAdd: 1.80, maxThroughput: "1800" },
      { name: "Snapshots", price: 0.30, description: "Snapshots de storage (preço por GB/Mês)" }
    ];
    
    try {
      let storageCategory = PriceService.getCategory('storage');
      if (!storageCategory) {
        PriceService.addCategory({
          name: "Storage",
          items: []
        });
      }
      
      // Adicionar opções de storage
      storageData.forEach((storageItem) => {
        try {
          const specs = [
            `Preço por GB: R$ ${storageItem.price.toFixed(2)}`,
          ];
          
          if (storageItem.iops) {
            specs.push(`IOPS: ${storageItem.iops}`);
          }
          
          if (storageItem.throughput) {
            specs.push(`Throughput: ${storageItem.throughput}MB/s`);
          }
          
          if (storageItem.throughputAdd) {
            specs.push(`Throughput adicional: R$ ${storageItem.throughputAdd.toFixed(2)} por MB/s`);
            specs.push(`Throughput máximo: ${storageItem.maxThroughput}MB/s`);
          }
          
          PriceService.addItem('storage', {
            name: storageItem.name,
            description: storageItem.description || `Storage em rede de alta performance (${storageItem.iops} IOPS)`,
            price: storageItem.price,
            type: "Storage",
            specs: specs,
            subtype: storageItem.name.replace("Storage ", "").toLowerCase()
          });
        } catch (error) {
          console.error(`Erro ao adicionar storage ${storageItem.name}:`, error);
        }
      });
    } catch (error) {
      console.error("Erro ao inicializar storage:", error);
    }
  },

  /**
   * Inicializa as opções de rede na tabela de preços
   */
  initializeNetwork(): void {
    const networkData = [
      { name: "1 Gbps", price: 50.00 },
      { name: "10 Gbps", price: 200.00 }
    ];
    
    try {
      let networkCategory = PriceService.getCategory('network');
      if (!networkCategory) {
        PriceService.addCategory({
          name: "Interface de Rede",
          items: []
        });
      }
      
      // Adicionar opções de interface de rede
      networkData.forEach((netItem) => {
        try {
          const speed = parseInt(netItem.name);
          const specs = [
            `Velocidade: ${netItem.name}`,
            `Banda ilimitada`,
            `${speed === 10 ? "Suporte a LACP" : ""}`,
            `${speed === 10 ? "Jumbo frames" : ""}`
          ].filter(Boolean);
          
          PriceService.addItem('network', {
            name: netItem.name,
            description: `Interface de rede ${netItem.name}`,
            price: netItem.price,
            type: "Conectividade",
            subtype: "porta",
            specs: specs
          });
        } catch (error) {
          console.error(`Erro ao adicionar interface de rede ${netItem.name}:`, error);
        }
      });
    } catch (error) {
      console.error("Erro ao inicializar interfaces de rede:", error);
    }
  },

  /**
   * Inicializa as opções de blocos IP na tabela de preços
   */
  initializeIPs(): void {
    const ipData = [
      { block: "/30", total: 4, usable: 2, price: 140.00 },
      { block: "/29", total: 8, usable: 6, price: 280.00 },
      { block: "/28", total: 16, usable: 14, price: 640.00 },
      { block: "/27", total: 32, usable: 30, price: 1440.00 },
      { block: "/26", total: 64, usable: 62, price: 3200.00 },
      { block: "/25", total: 128, usable: 126, price: 7680.00 },
      { block: "/24", total: 256, usable: 254, price: 17920.00 }
    ];
    
    try {
      let ipCategory = PriceService.getCategory('ip');
      if (!ipCategory) {
        PriceService.addCategory({
          name: "Bloco de IPs",
          items: []
        });
      }
      
      // Adicionar opções de blocos IP
      ipData.forEach((ipItem) => {
        try {
          PriceService.addItem('ip', {
            name: `Bloco IPv4 ${ipItem.block}`,
            description: `${ipItem.usable} IPs utilizáveis`,
            price: ipItem.price,
            type: "Conectividade",
            subtype: "ip",
            specs: [
              `Total de IPs: ${ipItem.total}`,
              `IPs utilizáveis: ${ipItem.usable}`,
              `Suporte a rDNS`
            ]
          });
        } catch (error) {
          console.error(`Erro ao adicionar bloco IP ${ipItem.block}:`, error);
        }
      });
    } catch (error) {
      console.error("Erro ao inicializar blocos IP:", error);
    }
  },

  /**
   * Inicializa os sistemas operacionais na tabela de preços
   */
  initializeOS(): void {
    const osData = [
      { 
        name: "Windows Server Standard 2019", 
        price: 29.08, 
        specs: ["Licenciamento por 2 cores", "Até 2 VMs"], 
        perCore: true 
      },
      { 
        name: "Windows Server DataCenter 2019", 
        price: 201.96, 
        specs: ["Licenciamento por 2 cores", "Virtualização ilimitada"], 
        perCore: true 
      },
      { 
        name: "CentOS 7", 
        price: 0.00, 
        specs: ["Sistema operacional Linux gratuito"] 
      },
      { 
        name: "Ubuntu Server 22.04 LTS", 
        price: 0.00, 
        specs: ["Sistema operacional Linux gratuito", "Suporte longo prazo (LTS)"] 
      },
      { 
        name: "Debian 12", 
        price: 0.00, 
        specs: ["Sistema operacional Linux gratuito", "Estabilidade comprovada"] 
      },
      { 
        name: "Rocky Linux 9", 
        price: 0.00, 
        specs: ["Sistema operacional Linux gratuito", "Alternativa ao CentOS"] 
      }
    ];
    
    try {
      let osCategory = PriceService.getCategory('os');
      if (!osCategory) {
        PriceService.addCategory({
          name: "Sistemas Operacionais",
          items: []
        });
      }
      
      // Adicionar sistemas operacionais
      osData.forEach((osItem) => {
        try {
          const isWindows = osItem.name.toLowerCase().includes('windows');
          PriceService.addItem('os', {
            name: osItem.name,
            description: isWindows 
              ? `Sistema operacional Microsoft com licenciamento por core`
              : `Sistema operacional Linux gratuito`,
            price: osItem.price,
            type: "SistemaOperacional",
            subtype: isWindows ? "windows" : "linux",
            specs: osItem.specs,
            metadata: {
              perCore: osItem.perCore || false
            }
          });
        } catch (error) {
          console.error(`Erro ao adicionar sistema operacional ${osItem.name}:`, error);
        }
      });
    } catch (error) {
      console.error("Erro ao inicializar sistemas operacionais:", error);
    }
  }
};

export default ComponentSyncService;
