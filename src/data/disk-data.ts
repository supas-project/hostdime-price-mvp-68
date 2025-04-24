
import { DiskOption, PricedDiskOption } from "@/types/storage";
import { diskPricing } from "./storage-pricing";

const baseDisks: DiskOption[] = [
  {
    id: "nvme-500",
    type: "nvme",
    capacity: "500GB",
    specs: {
      readSpeed: "3500 MB/s",
      writeSpeed: "3000 MB/s",
      iops: "500K",
    },
    recommended: ["Bancos de dados", "Cache", "Alta performance"]
  },
  {
    id: "nvme-1000",
    type: "nvme",
    capacity: "1TB",
    specs: {
      readSpeed: "3500 MB/s",
      writeSpeed: "3000 MB/s",
      iops: "500K",
    },
    recommended: ["Bancos de dados", "Cache", "Alta performance"]
  },
  {
    id: "ssd-500",
    type: "ssd",
    capacity: "500GB",
    specs: {
      readSpeed: "550 MB/s",
      writeSpeed: "520 MB/s",
      iops: "98K",
    },
    recommended: ["Sistema operacional", "Aplicações", "Websites"]
  },
  {
    id: "ssd-1000",
    type: "ssd",
    capacity: "1TB",
    specs: {
      readSpeed: "550 MB/s",
      writeSpeed: "520 MB/s",
      iops: "98K",
    },
    recommended: ["Sistema operacional", "Aplicações", "Websites"]
  },
  {
    id: "hdd-1000",
    type: "hdd",
    capacity: "1TB",
    specs: {
      readSpeed: "150 MB/s",
      writeSpeed: "150 MB/s",
      iops: "150",
    },
    recommended: ["Backups", "Arquivos", "Armazenamento geral"]
  },
  {
    id: "hdd-2000",
    type: "hdd",
    capacity: "2TB",
    specs: {
      readSpeed: "150 MB/s",
      writeSpeed: "150 MB/s",
      iops: "150",
    },
    recommended: ["Backups", "Arquivos", "Armazenamento geral"]
  }
];

export const diskData: PricedDiskOption[] = baseDisks.map(disk => ({
  ...disk,
  price: diskPricing[disk.id]
}));
