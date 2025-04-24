
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
          name: "Intel Core i5",
          description: "4 núcleos, 3.5 GHz - Ideal para sites e aplicações leves",
          price: 120
        },
        {
          id: "cpu-2",
          type: "Processador",
          name: "Intel Core i7",
          description: "8 núcleos, 4.0 GHz - Ideal para aplicações de médio porte",
          price: 230
        },
        {
          id: "cpu-3",
          type: "Processador",
          name: "Intel Xeon",
          description: "16 núcleos, 4.5 GHz - Ideal para aplicações empresariais",
          price: 450
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
