
import { HardDrive, Database } from 'lucide-react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TabHeaderProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function TabHeader({ activeTab, onTabChange }: TabHeaderProps) {
  return (
    <TabsList className="grid w-full grid-cols-2 mb-6 bg-background/5 backdrop-blur-lg border border-[#2a2a2a] rounded-lg overflow-hidden">
      <TabsTrigger 
        value="internal"
        className="relative py-3 data-[state=active]:bg-[#f58220] data-[state=active]:text-white transition-all duration-300"
      >
        <HardDrive className="w-4 h-4 mr-2" />
        Discos Internos
      </TabsTrigger>
      <TabsTrigger 
        value="external"
        className="relative py-3 data-[state=active]:bg-[#f58220] data-[state=active]:text-white transition-all duration-300"
      >
        <Database className="w-4 h-4 mr-2" />
        Storage Externo
      </TabsTrigger>
    </TabsList>
  );
}
