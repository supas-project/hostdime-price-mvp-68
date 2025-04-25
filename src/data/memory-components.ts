
import { ServerComponent } from "@/types/component";

export const memoryComponents: ServerComponent = {
  id: "memory",
  type: "Memória",
  friendlyName: "Memória RAM",
  description: "Escolha a quantidade de memória RAM",
  icon: "memory-stick",
  options: [
    {
      id: "ram-1",
      type: "Memória",
      name: "Memória RAM",
      description: "Selecione a quantidade de memória",
      price: 60
    }
  ]
};
