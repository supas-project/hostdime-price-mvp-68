export interface ComponentOption {
  id: string;
  name: string;
  description: string;
  price: number;
  specs?: string[];
  type: string;
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
    }
  ]
};
