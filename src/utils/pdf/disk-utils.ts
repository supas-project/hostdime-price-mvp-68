
import { ComponentOption } from "@/types/component";
import { GroupedDisk } from "./types";

// Helper function to group disks by type and capacity for cleaner display
export const groupDisksByTypeAndCapacity = (disks: ComponentOption[]): GroupedDisk[] => {
  const diskGroups: { [key: string]: GroupedDisk } = {};
  
  disks.forEach(disk => {
    const key = `${disk.name}-${disk.description}`;
    
    if (diskGroups[key]) {
      diskGroups[key].quantity += 1;
    } else {
      diskGroups[key] = {
        disk: { ...disk },
        quantity: 1
      };
    }
  });
  
  return Object.values(diskGroups);
};
