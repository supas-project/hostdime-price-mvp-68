
import React, { useState } from 'react';
import { HardDrive, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectedDiskTypeInfoProps {
  selectedDiskType: 'nvme' | 'ssd' | 'hdd' | undefined;
}

export function SelectedDiskTypeInfo({ selectedDiskType }: SelectedDiskTypeInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!selectedDiskType) return null;

  const diskInfo = {
    nvme: {
      title: 'NVMe (Non-Volatile Memory Express)',
      description: 'Discos de altíssima velocidade com latência mínima, ideais para bancos de dados, cache e aplicações que exigem alto desempenho I/O.'
    },
    ssd: {
      title: 'SSD (Solid State Drive)',
      description: 'Discos de estado sólido com boa velocidade e sem partes móveis, adequados para sistemas operacionais, aplicações e websites.'
    },
    hdd: {
      title: 'HDD (Hard Disk Drive)',
      description: 'Discos com maior capacidade e menor custo, adequados para armazenamento de arquivos, backups e cargas de trabalho não críticas.'
    }
  };

  const info = diskInfo[selectedDiskType];

  return (
    <div className="rounded-lg border border-[#2a2a2a] bg-[#1e1e1e]/50 p-4">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <HardDrive className="h-5 w-5 text-primary" />
          <span className="font-medium">{info.title}</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      
      {isExpanded && (
        <div className="mt-2 text-sm text-muted-foreground border-t border-[#2a2a2a] pt-2">
          {info.description}
        </div>
      )}
    </div>
  );
}
