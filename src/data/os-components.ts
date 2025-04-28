
import { ServerComponent } from "@/types/component";

export const osComponents: ServerComponent = {
  id: "os",
  type: "SistemaOperacional",
  friendlyName: "Sistema Operacional",
  description: "Escolha o sistema operacional para seu servidor",
  icon: "Server",
  options: [
    {
      id: "os-1",
      type: "SistemaOperacional",
      name: "Windows Server 2022 Standard",
      price: 140.00,
      description: "Sistema operacional Windows Server com suporte completo",
      specs: [
        "Licença mensal",
        "Suporte incluído",
        "Atualizações automáticas"
      ]
    },
    {
      id: "os-2",
      type: "SistemaOperacional",
      name: "Ubuntu Server 22.04 LTS",
      price: 0,
      description: "Sistema operacional Linux Ubuntu Server LTS",
      specs: [
        "Licença gratuita",
        "Suporte comunitário",
        "Atualizações por 5 anos"
      ]
    },
    {
      id: "os-3",
      type: "SistemaOperacional",
      name: "CentOS Stream 9",
      price: 0,
      description: "Sistema operacional Linux CentOS Stream",
      specs: [
        "Licença gratuita",
        "Ciclo contínuo de atualizações",
        "Compatível com RHEL"
      ]
    }
  ]
};
