
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { HardDrive, Server } from 'lucide-react';

interface SelectedDiskTypeInfoProps {
  selectedDiskType: "nvme" | "ssd" | "hdd" | undefined;
}

export function SelectedDiskTypeInfo({ selectedDiskType }: SelectedDiskTypeInfoProps) {
  if (!selectedDiskType) return null;

  const diskInfo = {
    nvme: {
      title: "NVMe (Non-Volatile Memory Express)",
      description: "Discos de alta performance para cargas de trabalho críticas, com velocidades de leitura/escrita extremamente rápidas e baixa latência.",
      icon: Server
    },
    ssd: {
      title: "SSD (Solid State Drive)",
      description: "Discos com bom equilíbrio entre performance e custo, ideais para ambientes de produção e bancos de dados.",
      icon: HardDrive
    },
    hdd: {
      title: "HDD (Hard Disk Drive)",
      description: "Discos com maior capacidade e menor custo, adequados para armazenamento de arquivos, backups e cargas de trabalho não críticas.",
      icon: HardDrive
    }
  };

  const info = diskInfo[selectedDiskType];

  return (
    <Alert variant="default" className="bg-muted/50 border-muted-foreground/20">
      <info.icon className="h-4 w-4" />
      <AlertTitle>{info.title}</AlertTitle>
      <AlertDescription>{info.description}</AlertDescription>
    </Alert>
  );
}
