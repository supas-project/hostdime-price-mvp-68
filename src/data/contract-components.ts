
import { ServerComponent } from "@/types/component";

export const contractComponents: ServerComponent = {
  id: "contract",
  type: "Contrato",
  friendlyName: "Duração do Contrato",
  description: "Escolha a duração do seu contrato para obter descontos",
  icon: "clock",
  options: [
    {
      id: "contract-0",
      type: "Contrato",
      name: "Sem contrato",
      description: "Pagamento mensal sem compromisso",
      price: 0,
      metadata: {
        discount: 0
      },
      subtype: "0" // Duração em meses
    },
    {
      id: "contract-12",
      type: "Contrato",
      name: "12 meses",
      description: "Contrato anual com desconto",
      price: 0,
      metadata: {
        discount: 5
      },
      subtype: "12" // Duração em meses
    },
    {
      id: "contract-24",
      type: "Contrato",
      name: "24 meses",
      description: "Contrato de dois anos com desconto",
      price: 0,
      metadata: {
        discount: 10
      },
      subtype: "24" // Duração em meses
    },
    {
      id: "contract-36",
      type: "Contrato",
      name: "36 meses",
      description: "Contrato de três anos com desconto",
      price: 0,
      metadata: {
        discount: 15
      },
      subtype: "36" // Duração em meses
    },
    {
      id: "contract-48",
      type: "Contrato",
      name: "48 meses",
      description: "Contrato de quatro anos com desconto máximo",
      price: 0,
      metadata: {
        discount: 20
      },
      subtype: "48" // Duração em meses
    },
    {
      id: "contract-60",
      type: "Contrato",
      name: "60 meses",
      description: "Contrato de cinco anos com desconto máximo",
      price: 0,
      metadata: {
        discount: 25
      },
      subtype: "60" // Duração em meses
    }
  ]
};
