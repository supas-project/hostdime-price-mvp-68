
import { ServerConfiguration } from "@/types/component";
import { dataCenterComponents } from "./datacenter-components";
import { contractComponents } from "./contract-components";
import { cpuComponents } from "./cpu-components";
import { memoryComponents } from "./memory-components";
import { storageComponents } from "./storage-components";
import { connectivityComponents } from "./connectivity-components";
import { osComponents } from "./os-components";
import { customServicesComponent } from "./custom-services-component";

export * from "@/types/component";

export const serverData: ServerConfiguration = {
  categoria: "Servidor Dedicado",
  componentes: [
    {
      ...dataCenterComponents,
      icon: "Database"
    },
    {
      ...contractComponents,
      icon: "Clock"
    },
    {
      ...cpuComponents,
      icon: "Cpu"
    },
    {
      ...memoryComponents,
      icon: "MemoryStick"
    },
    {
      ...storageComponents,
      icon: "HardDrive"
    },
    {
      ...connectivityComponents,
      icon: "Network"
    },
    {
      ...osComponents,
      icon: "Server"
    },
    customServicesComponent
  ]
};
