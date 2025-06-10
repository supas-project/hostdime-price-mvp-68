
import { useState, useEffect } from 'react';
import { ComponentOption } from '@/types/component';
import { connectivityComponents } from '@/data/connectivity-components';

export function useConnectivity() {
  const [portOptions, setPortOptions] = useState<ComponentOption[]>([]);
  const [ipOptions, setIpOptions] = useState<ComponentOption[]>([]);
  const [connectivityOptions, setConnectivityOptions] = useState<ComponentOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Use static data from connectivity-components
    const allOptions = connectivityComponents.options;
    
    setPortOptions(allOptions.filter(opt => opt.subtype === 'porta'));
    setIpOptions(allOptions.filter(opt => opt.subtype === 'ip'));
    setConnectivityOptions(allOptions);
    setIsLoading(false);
  }, []);

  return {
    portOptions,
    ipOptions,
    connectivityOptions,
    isLoading
  };
}
