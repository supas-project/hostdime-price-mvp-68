
import { useState, useEffect } from 'react';
import { ComponentOption } from '@/types/component';
import { serverData } from '@/data/server-components';
import { useAuth } from '@/hooks/auth';

interface UseComponentDataProps {
  componentId: string;
}

/**
 * Unified component data hook using centralized auth
 */
export function useComponentData({ componentId }: UseComponentDataProps) {
  const [options, setOptions] = useState<ComponentOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<ComponentOption | null>(null);
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (!isAuthenticated) {
      console.log("User not authenticated, skipping component data load");
      return;
    }
    
    const component = serverData.componentes.find(c => c.id === componentId);
    if (component) {
      setOptions(component.options);
    } else {
      console.warn(`Component with id ${componentId} not found`);
      setOptions([]);
    }
  }, [componentId, isAuthenticated]);

  const handleSelect = (option: ComponentOption) => {
    setSelectedOption(option);
  };

  return {
    options,
    selectedOption,
    handleSelect
  };
}
