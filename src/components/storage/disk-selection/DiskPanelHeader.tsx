
import { SyncButton } from "./SyncButton";

interface DiskPanelHeaderProps {
  onSyncData: () => Promise<void>;
  isSyncingData: boolean;
}

export function DiskPanelHeader({ onSyncData, isSyncingData }: DiskPanelHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-medium">Discos Internos</h3>
      <SyncButton onSync={onSyncData} isSyncing={isSyncingData} />
    </div>
  );
}
