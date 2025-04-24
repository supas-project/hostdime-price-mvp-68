
export interface DiskOption {
  id: string;
  type: string;
  capacity: string;
  price: number;
  specs: {
    readSpeed: string;
    writeSpeed: string;
    iops: string;
  };
  recommended: string[];
}

export const diskData: DiskOption[] = [
  {
    id: "nvme-500",
    type: "nvme",
    capacity: "500GB",
    price: 89.90,
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
    price: 169.90,
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
    price: 49.90,
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
    price: 89.90,
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
    price: 29.90,
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
    price: 49.90,
    specs: {
      readSpeed: "150 MB/s",
      writeSpeed: "150 MB/s",
      iops: "150",
    },
    recommended: ["Backups", "Arquivos", "Armazenamento geral"]
  }
];
