
export interface ComponentOption {
  id: string;
  name: string;
  description: string;
  price: number;
  specs?: string[];
  type: string;
  metadata?: {
    discount?: number;
    features?: string[];
    badge?: string;
  };
}

export interface ServerComponent {
  id: string;
  type: string;
  friendlyName: string;
  description: string;
  icon: string;
  options: ComponentOption[];
}

export interface ServerConfiguration {
  categoria: string;
  componentes: ServerComponent[];
}

export const serverData: ServerConfiguration = {
  categoria: "Servidor Dedicado",
  componentes: [
    {
      id: "cpu",
      type: "Processador",
      friendlyName: "Processador",
      description: "Escolha o processador ideal para suas necessidades",
      icon: "cpu",
      options: [
        {
          id: "cpu-1",
          type: "Processador",
          name: "Intel Xeon E5-2620v3 6-Core 2.4 GHz (15 cores)",
          description: "Processador ideal para cargas de trabalho moderadas",
          price: 450.00
        },
        {
          id: "cpu-2",
          type: "Processador",
          name: "Intel Xeon Silver 4210 10-Core 2.2 GHz (10 cores)",
          description: "Excelente para aplicações empresariais",
          price: 730.00
        },
        {
          id: "cpu-3",
          type: "Processador",
          name: "Intel Xeon Gold 6248R 24-Core 3.0 GHz (24 cores)",
          description: "Alto desempenho para cargas intensivas",
          price: 1600.00
        },
        {
          id: "cpu-4",
          type: "Processador",
          name: "AMD EPYC 7352 24-Core 2.3 GHz (24 cores)",
          description: "Ótima relação custo-benefício",
          price: 1300.00
        },
        {
          id: "cpu-5",
          type: "Processador",
          name: "AMD EPYC 7502 32-Core 2.5 GHz (32 cores)",
          description: "Ideal para virtualização e cargas pesadas",
          price: 2200.00
        },
        {
          id: "cpu-6",
          type: "Processador",
          name: "AMD EPYC 7742 64-Core 2.25 GHz (64 cores)",
          description: "Máximo desempenho para aplicações críticas",
          price: 4300.00
        }
      ]
    },
    {
      id: "memory",
      type: "Memória",
      friendlyName: "Memória RAM",
      description: "Escolha a quantidade de memória RAM",
      icon: "memory",
      options: [
        {
          id: "ram-1",
          type: "Memória",
          name: "Memória RAM",
          description: "Selecione a quantidade de memória",
          price: 60
        }
      ]
    },
    {
      id: "storage",
      type: "Armazenamento",
      friendlyName: "Armazenamento",
      description: "Escolha o tipo e capacidade de armazenamento",
      icon: "hard-drive",
      options: [
        {
          id: "storage-1",
          type: "Armazenamento",
          name: "SSD 500GB",
          description: "SSD rápido e confiável",
          price: 90
        },
        {
          id: "storage-2",
          type: "Armazenamento",
          name: "SSD 1TB",
          description: "Mais espaço para seus dados",
          price: 150
        },
        {
          id: "storage-3",
          type: "Armazenamento",
          name: "NVMe 1TB",
          description: "Performance extrema para aplicações exigentes",
          price: 320
        }
      ]
    },
    {
      id: "datacenter",
      type: "DataCenter",
      friendlyName: "Data Center",
      description: "Escolha a localização do seu servidor",
      icon: "database",
      options: [
        {
          id: "dc-jp",
          type: "DataCenter",
          name: "João Pessoa (Nordeste)",
          description: "Data center localizado no Nordeste do Brasil",
          price: 0,
          metadata: {
            features: [
              "Certificação Tier III",
              "Green Data Center",
              "Baixa latência regional"
            ],
            badge: "Recomendado"
          }
        },
        {
          id: "dc-sp",
          type: "DataCenter",
          name: "São Paulo (Sudeste)",
          description: "Data center localizado no Sudeste do Brasil",
          price: 0,
          metadata: {
            features: [
              "Certificação Tier III",
              "Baixa latência nacional",
              "Alta conectividade"
            ]
          }
        },
        {
          id: "dc-orl",
          type: "DataCenter",
          name: "Orlando (EUA)",
          description: "Data center localizado na Flórida, Estados Unidos",
          price: 20,
          metadata: {
            features: [
              "Certificação Tier IV",
              "Conexão global rápida",
              "Tráfego internacional"
            ],
            badge: "Internacional"
          }
        }
      ]
    },
    {
      id: "contract",
      type: "Contrato",
      friendlyName: "Duração do Contrato",
      description: "Escolha a duração do seu contrato para obter descontos",
      icon: "link",
      options: [
        {
          id: "contract-0",
          type: "Contrato",
          name: "Sem contrato",
          description: "Pagamento mensal sem compromisso",
          price: 0,
          metadata: {
            discount: 0
          }
        },
        {
          id: "contract-12",
          type: "Contrato",
          name: "12 meses",
          description: "Contrato anual com desconto",
          price: 0,
          metadata: {
            discount: 5
          }
        },
        {
          id: "contract-24",
          type: "Contrato",
          name: "24 meses",
          description: "Contrato de dois anos com desconto",
          price: 0,
          metadata: {
            discount: 10
          }
        },
        {
          id: "contract-36",
          type: "Contrato",
          name: "36 meses",
          description: "Contrato de três anos com desconto",
          price: 0,
          metadata: {
            discount: 15
          }
        },
        {
          id: "contract-48",
          type: "Contrato",
          name: "48 meses",
          description: "Contrato de quatro anos com desconto máximo",
          price: 0,
          metadata: {
            discount: 20
          }
        }
      ]
    },
    {
      id: "connectivity",
      type: "Conectividade",
      friendlyName: "Opções de Conectividade",
      description: "Configure as opções de rede do seu servidor",
      icon: "network",
      options: [
        {
          id: "network-1gbps",
          type: "Conectividade",
          name: "Porta 1 Gbps",
          description: "Porta de rede com velocidade de 1 Gbps",
          price: 50
        },
        {
          id: "network-10gbps",
          type: "Conectividade",
          name: "Porta 10 Gbps",
          description: "Porta de rede de alta velocidade (10 Gbps)",
          price: 200
        },
        {
          id: "ip-4",
          type: "Conectividade",
          name: "Bloco /30 (4 IPs)",
          description: "4 endereços IP (1 utilizável)",
          price: 10
        },
        {
          id: "ip-8",
          type: "Conectividade",
          name: "Bloco /29 (8 IPs)",
          description: "8 endereços IP (5 utilizáveis)",
          price: 20
        },
        {
          id: "ip-16",
          type: "Conectividade",
          name: "Bloco /28 (16 IPs)",
          description: "16 endereços IP (13 utilizáveis)",
          price: 35
        }
      ]
    }
  ]
};
