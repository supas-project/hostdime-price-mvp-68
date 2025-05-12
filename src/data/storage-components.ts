
import { ServerComponent } from "@/types/component";

export const storageComponents: ServerComponent = {
  id: "storage",
  type: "Armazenamento",
  friendlyName: "Armazenamento",
  description: "Escolha o tipo e capacidade de armazenamento",
  icon: "HardDrive",
  options: [] // As opções são dinâmicas e serão marcadas como hardware na seleção
};
