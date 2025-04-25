
import { ServerComponent } from "@/types/component";

export const cpuComponents: ServerComponent = {
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
};
