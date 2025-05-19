
import { useState, useEffect } from 'react';
import { StorageType } from '../types/storage-types';
import { loadStorageTypes } from '../services/storage-service';

// Use "export type" for re-exporting types when isolatedModules is enabled
export type { StorageType } from '../types/storage-types';

export function useStorageTypes() {
  const [storageTypes, setStorageTypes] = useState<StorageType[]>([]);

  useEffect(() => {
    const fetchStorageTypes = async () => {
      const types = await loadStorageTypes();
      setStorageTypes(types);
    };

    fetchStorageTypes();
  }, []);

  return storageTypes;
}
