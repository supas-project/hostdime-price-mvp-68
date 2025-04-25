
import { ServerComponent } from "@/types/component";

export const connectivityComponents: ServerComponent = {
  id: "connectivity",
  type: "Conectividade",
  friendlyName: "Opções de Conectividade",
  description: "Configure a porta de rede e bloco IP do seu servidor",
  icon: "ethernet-port",
  options: [
    {
      id: "network-1gbps",
      type: "Conectividade",
      subtype: "porta",
      name: "Porta 1 Gbps",
      description: "Porta de rede com velocidade de 1 Gbps",
      price: 50
    },
    {
      id: "network-10gbps",
      type: "Conectividade",
      subtype: "porta",
      name: "Porta 10 Gbps",
      description: "Porta de rede de alta velocidade (10 Gbps)",
      price: 200
    },
    {
      id: "ip-30",
      type: "Conectividade",
      subtype: "ip",
      name: "Bloco /30 (4 IPs)",
      description: "4 endereços IP (1 utilizável)",
      price: 140
    },
    {
      id: "ip-29",
      type: "Conectividade",
      subtype: "ip",
      name: "Bloco /29 (8 IPs)",
      description: "8 endereços IP (5 utilizáveis)",
      price: 280
    },
    {
      id: "ip-28",
      type: "Conectividade",
      subtype: "ip",
      name: "Bloco /28 (16 IPs)",
      description: "16 endereços IP (13 utilizáveis)",
      price: 640
    },
    {
      id: "ip-27",
      type: "Conectividade",
      subtype: "ip",
      name: "Bloco /27 (32 IPs)",
      description: "32 endereços IP (29 utilizáveis)",
      price: 1440
    },
    {
      id: "ip-26",
      type: "Conectividade",
      subtype: "ip",
      name: "Bloco /26 (64 IPs)",
      description: "64 endereços IP (61 utilizáveis)",
      price: 3200
    },
    {
      id: "ip-25",
      type: "Conectividade",
      subtype: "ip",
      name: "Bloco /25 (128 IPs)",
      description: "128 endereços IP (125 utilizáveis)",
      price: 7680
    },
    {
      id: "ip-24",
      type: "Conectividade",
      subtype: "ip",
      name: "Bloco /24 (256 IPs)",
      description: "256 endereços IP (253 utilizáveis)",
      price: 17920
    }
  ]
};
