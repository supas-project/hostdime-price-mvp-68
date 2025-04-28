
import { ServerComponent } from "@/types/component";

export const cpuComponents: ServerComponent = {
  id: "cpu",
  type: "Processador",
  friendlyName: "Processador",
  description: "Escolha o processador ideal para suas necessidades",
  icon: "Cpu",
  options: [
    {
      id: "cpu-1",
      type: "Processador",
      name: "Intel Xeon E5-2620v3 (15 cores)",
      price: 450.00,
      description: "Processador ideal para cargas de trabalho moderadas",
      specs: [
        "Modelo: Intel Xeon E5-2620v3",
        "Clock Base: 2.4 GHz",
        "Turbo Boost: Até 3.2 GHz",
        "Cores: 15 cores físicos",
        "Threads: 30 threads",
        "Cache: 15MB L3",
        "TDP: 85W"
      ]
    },
    {
      id: "cpu-2",
      type: "Processador",
      name: "Intel Xeon Silver 4210 (10 cores)",
      price: 730.00,
      description: "Excelente para aplicações empresariais",
      specs: [
        "Modelo: Intel Xeon Silver 4210",
        "Clock Base: 2.2 GHz",
        "Turbo Boost: Até 3.2 GHz",
        "Cores: 10 cores físicos",
        "Threads: 20 threads",
        "Cache: 13.75MB",
        "TDP: 85W"
      ]
    },
    {
      id: "cpu-3",
      type: "Processador",
      name: "Intel Xeon Gold 6248R (24 cores)",
      price: 1600.00,
      description: "Alto desempenho para cargas intensivas",
      specs: [
        "Modelo: Intel Xeon Gold 6248R",
        "Clock Base: 3.0 GHz",
        "Turbo Boost: Até 4.0 GHz",
        "Cores: 24 cores físicos",
        "Threads: 48 threads",
        "Cache: 35.75MB",
        "TDP: 205W"
      ]
    },
    {
      id: "cpu-4",
      type: "Processador",
      name: "AMD EPYC 7352 (24 cores)",
      price: 1300.00,
      description: "Ótima relação custo-benefício",
      specs: [
        "Modelo: AMD EPYC 7352",
        "Clock Base: 2.3 GHz",
        "Turbo Boost: Até 3.2 GHz",
        "Cores: 24 cores físicos",
        "Threads: 48 threads",
        "Cache: 128MB L3",
        "TDP: 155W"
      ]
    },
    {
      id: "cpu-5",
      type: "Processador",
      name: "AMD EPYC 7502 (32 cores)",
      price: 2200.00,
      description: "Ideal para virtualização e cargas pesadas",
      specs: [
        "Modelo: AMD EPYC 7502",
        "Clock Base: 2.5 GHz",
        "Turbo Boost: Até 3.35 GHz",
        "Cores: 32 cores físicos",
        "Threads: 64 threads",
        "Cache: 128MB L3",
        "TDP: 180W"
      ]
    },
    {
      id: "cpu-6",
      type: "Processador",
      name: "AMD EPYC 7742 (64 cores)",
      price: 4300.00,
      description: "Máximo desempenho para aplicações críticas",
      specs: [
        "Modelo: AMD EPYC 7742",
        "Clock Base: 2.25 GHz",
        "Turbo Boost: Até 3.4 GHz",
        "Cores: 64 cores físicos",
        "Threads: 128 threads",
        "Cache: 256MB L3",
        "TDP: 225W"
      ]
    }
  ]
};
