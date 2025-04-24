
export interface ComponentOption {
  id: string;
  name: string;
  description: string;
  price: number;
  specs?: string[];
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
      type: "CPU",
      friendlyName: "Processador",
      description: "Escolha o cérebro do seu servidor",
      icon: "cpu",
      options: [
        {
          id: "cpu-1",
          name: "Intel Core i5",
          description: "Processador Básico (4 núcleos)",
          price: 120,
          specs: ["4 Cores", "3.5 GHz", "Ideal para sites e aplicações leves"]
        },
        {
          id: "cpu-2",
          name: "Intel Core i7",
          description: "Processador Intermediário (8 núcleos)",
          price: 230,
          specs: ["8 Cores", "4.0 GHz", "Ideal para aplicações de médio porte"]
        },
        {
          id: "cpu-3",
          name: "Intel Xeon",
          description: "Processador Avançado (16 núcleos)",
          price: 450,
          specs: ["16 Cores", "4.5 GHz", "Ideal para aplicações empresariais"]
        }
      ]
    },
    {
      id: "memory",
      type: "Memória",
      friendlyName: "Memória RAM",
      description: "Escolha quanto seu servidor consegue processar de uma vez",
      icon: "memory",
      options: [
        {
          id: "ram-1",
          name: "8GB DDR4",
          description: "Memória Básica",
          price: 60,
          specs: ["8GB DDR4", "2666 MHz", "Ideal para sites pequenos"]
        },
        {
          id: "ram-2",
          name: "16GB DDR4",
          description: "Memória Intermediária",
          price: 120,
          specs: ["16GB DDR4", "3200 MHz", "Ideal para aplicações web"]
        },
        {
          id: "ram-3",
          name: "32GB DDR4",
          description: "Memória Avançada",
          price: 240,
          specs: ["32GB DDR4", "3600 MHz", "Ideal para aplicações exigentes"]
        },
        {
          id: "ram-4",
          name: "64GB DDR4",
          description: "Memória Potente",
          price: 480,
          specs: ["64GB DDR4", "3600 MHz", "Ideal para bancos de dados e virtualização"]
        }
      ]
    },
    {
      id: "storage",
      type: "Disco",
      friendlyName: "Armazenamento",
      description: "Escolha onde seus dados serão guardados",
      icon: "hard-drive",
      options: [
        {
          id: "disk-1",
          name: "500GB SSD",
          description: "Armazenamento Básico e Rápido",
          price: 90,
          specs: ["500GB SSD", "Leitura: 550MB/s", "Escrita: 520MB/s"]
        },
        {
          id: "disk-2",
          name: "1TB SSD",
          description: "Armazenamento Intermediário e Rápido",
          price: 150,
          specs: ["1TB SSD", "Leitura: 550MB/s", "Escrita: 520MB/s"]
        },
        {
          id: "disk-3",
          name: "2TB SSD",
          description: "Armazenamento Avançado e Rápido",
          price: 290,
          specs: ["2TB SSD", "Leitura: 550MB/s", "Escrita: 520MB/s"]
        },
        {
          id: "disk-4",
          name: "500GB NVMe",
          description: "Armazenamento Super Rápido",
          price: 180,
          specs: ["500GB NVMe", "Leitura: 3500MB/s", "Escrita: 3200MB/s"]
        },
        {
          id: "disk-5",
          name: "1TB NVMe",
          description: "Armazenamento Ultra Rápido",
          price: 320,
          specs: ["1TB NVMe", "Leitura: 3500MB/s", "Escrita: 3200MB/s"]
        }
      ]
    },
    {
      id: "network",
      type: "Conectividade",
      friendlyName: "Internet",
      description: "Escolha a velocidade de conexão do seu servidor",
      icon: "connect",
      options: [
        {
          id: "net-1",
          name: "100Mbps",
          description: "Internet Básica",
          price: 40,
          specs: ["100Mbps Dedicados", "1TB de Tráfego", "1 IP Fixo"]
        },
        {
          id: "net-2",
          name: "500Mbps",
          description: "Internet Rápida",
          price: 90,
          specs: ["500Mbps Dedicados", "5TB de Tráfego", "1 IP Fixo"]
        },
        {
          id: "net-3",
          name: "1Gbps",
          description: "Internet de Alta Velocidade",
          price: 160,
          specs: ["1Gbps Dedicados", "Tráfego Ilimitado", "2 IPs Fixos"]
        }
      ]
    },
    {
      id: "extras",
      type: "Extras",
      friendlyName: "Serviços Adicionais",
      description: "Personalize seu servidor com recursos adicionais",
      icon: "settings",
      options: [
        {
          id: "extra-1",
          name: "Proteção DDoS",
          description: "Proteção contra ataques",
          price: 60,
          specs: ["Proteção até 10Gbps", "Mitigação automática", "Relatórios de ataques"]
        },
        {
          id: "extra-2",
          name: "Backup Diário",
          description: "Cópias de segurança diárias",
          price: 70,
          specs: ["Backup diário", "7 dias de retenção", "Restauração rápida"]
        },
        {
          id: "extra-3",
          name: "RAID 1",
          description: "Espelhamento de discos para segurança",
          price: 90,
          specs: ["Espelhamento de discos", "Proteção contra falhas", "Sem perda de desempenho"]
        },
        {
          id: "extra-4",
          name: "Monitoramento 24/7",
          description: "Monitoramento em tempo real",
          price: 50,
          specs: ["Alertas em tempo real", "Painel de status", "Suporte proativo"]
        }
      ]
    }
  ]
};
