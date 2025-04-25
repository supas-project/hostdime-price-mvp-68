
import { StorageStep } from "@/components/wizard/steps/storage/storage-step";
import { ComponentOption } from "@/types/component";

interface StorageContentProps {
  onSelectStorageItem: (storageOption: ComponentOption, storageType: 'internal' | 'external') => void;
}

export function StorageContent({ onSelectStorageItem }: StorageContentProps) {
  return <StorageStep onSelectStorageItem={onSelectStorageItem} />;
}
