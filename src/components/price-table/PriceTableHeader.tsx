
import { HardDrive } from "lucide-react";
import { LoginDialog } from "@/components/login-dialog";
import { SyncIndicator } from "@/components/price-table/SyncIndicator";
import { ContractSelect } from "@/components/price-table/ContractSelect";

interface PriceTableHeaderProps {
  lastSyncTime: Date | null;
  contractDuration: string;
  onContractChange: (value: string) => void;
}

export function PriceTableHeader({ 
  lastSyncTime, 
  contractDuration, 
  onContractChange 
}: PriceTableHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-md bg-primary/10 text-primary">
          <HardDrive className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Tabela de Preços</h1>
          <p className="text-muted-foreground">Gerencie os preços dos componentes para servidores</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4 flex-wrap">
        <ContractSelect 
          value={contractDuration}
          onChange={onContractChange}
        />
        <SyncIndicator lastSyncTime={lastSyncTime} />
        <LoginDialog />
      </div>
    </div>
  );
}
