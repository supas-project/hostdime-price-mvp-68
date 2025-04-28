import { ServerComponent } from "@/types/component";

export const memoryComponents: ServerComponent = {
  id: "memory",
  type: "Memória",
  friendlyName: "Memória RAM",
  description: "Escolha a quantidade de memória RAM",
  icon: "memory",
  options: [
    {
      id: "ram-base",
      type: "memoria",
      name: "Memória RAM",
      description: "Selecione a quantidade de memória",
      price: 60,
      specs: ["Memória RAM DDR4 de alta performance"]
    }
  ]
};

