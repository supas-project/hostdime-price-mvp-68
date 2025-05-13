
import { HardDrive, Database } from 'lucide-react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface TabHeaderProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function TabHeader({ activeTab, onTabChange }: TabHeaderProps) {
  return (
    <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6 bg-background/5 backdrop-blur-lg border border-[#2a2a2a] rounded-lg overflow-hidden">
      <TabsTrigger 
        value="internal"
        onClick={() => onTabChange("internal")}
        className={cn(
          "relative py-2.5 sm:py-3 px-2 sm:px-3 text-sm sm:text-base transition-all duration-300",
          "data-[state=active]:bg-[#f58220] data-[state=active]:text-white",
          "min-h-[44px] touch-target"
        )}
      >
        <HardDrive className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
        <span className="whitespace-nowrap text-xs sm:text-sm">Discos Internos</span>
      </TabsTrigger>
      <TabsTrigger 
        value="external"
        onClick={() => onTabChange("external")}
        className={cn(
          "relative py-2.5 sm:py-3 px-2 sm:px-3 text-sm sm:text-base transition-all duration-300",
          "data-[state=active]:bg-[#f58220] data-[state=active]:text-white",
          "min-h-[44px] touch-target"
        )}
      >
        <Database className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
        <span className="whitespace-nowrap text-xs sm:text-sm">Storage Externo</span>
      </TabsTrigger>
    </TabsList>
  );
}
