
import { useState } from "react";
import { CustomService } from "@/types/wizard";
import { toast } from "sonner";

export function useCustomServices() {
  const [customServices, setCustomServices] = useState<CustomService[]>([]);

  const addCustomService = (service: CustomService) => {
    setCustomServices(prev => {
      const updated = [...prev, service];
      // Mantido apenas este toast por ser uma ação menos frequente
      toast.success("Serviço adicional incluído", {
        description: service.name
      });
      return updated;
    });
  };

  const removeCustomService = (serviceId: string) => {
    setCustomServices(prev => {
      const serviceToRemove = prev.find(service => service.id === serviceId);
      const updated = prev.filter(service => service.id !== serviceId);
      
      // Mantido apenas este toast por ser uma ação menos frequente
      if (serviceToRemove) {
        toast.success("Serviço adicional removido", {
          description: serviceToRemove.name
        });
      }
      
      return updated;
    });
  };

  return {
    customServices,
    setCustomServices,
    addCustomService,
    removeCustomService
  };
}
