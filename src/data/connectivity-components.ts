
import { ServerComponent } from "@/types/component";

export const connectivityComponents: ServerComponent = {
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
};
