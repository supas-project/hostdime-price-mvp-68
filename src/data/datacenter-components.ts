
import { ServerComponent } from "@/types/component";

export const dataCenterComponents: ServerComponent = {
  id: "datacenter",
  type: "DataCenter",
  friendlyName: "Data Center",
  description: "Escolha a localização do seu servidor",
  icon: "server",
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
};
