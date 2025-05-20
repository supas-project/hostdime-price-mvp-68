
import { HardDrive } from "lucide-react";

export function DiskPanelRecommendation() {
  return (
    <div className="bg-[#191919] border border-[#f5822040] rounded-lg p-4 text-sm text-white/80">
      <p className="flex items-center gap-2">
        <HardDrive size={16} className="text-[#f58220]" />
        Recomendamos 2 discos SSD (um para sistema e outro para dados) ou 1 disco NVMe para máximo desempenho.
      </p>
    </div>
  );
}
