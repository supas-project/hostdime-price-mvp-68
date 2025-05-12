
import { ServerComponent } from "@/types/component";

export const memoryComponents: ServerComponent = {
  id: "memory",
  type: "Memória",
  friendlyName: "Memória RAM",
  description: "Escolha a quantidade de memória RAM",
  icon: "memory",
  options: [
    {
      id: "64",
      type: "memoria",
      name: "64GB RAM",
      description: "Memória RAM DDR4 ECC Registered",
      price: 480,
      isHardware: true,
      specs: ["Memória RAM DDR4 de alta performance"]
    }
  ]
};
