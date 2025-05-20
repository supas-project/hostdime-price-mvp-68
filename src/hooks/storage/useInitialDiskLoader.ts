
import { useState, useEffect } from "react";
import { PricedDiskOption } from "@/types/storage";

export function useInitialDiskLoader(
  setSelectedDisks: React.Dispatch<React.SetStateAction<{ disk: PricedDiskOption; quantity: number }[]>>
) {
  // Tracking state for initial loading
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const [isDataRefreshed, setIsDataRefreshed] = useState<boolean>(false);

  useEffect(() => {
    if (isInitialLoad) {
      // Apenas definir as flags de inicialização sem carregar discos
      // Isto impede que os discos sejam carregados no resumo automaticamente
      setIsInitialLoad(false);
      setIsDataRefreshed(true);
      
      // Removemos a lógica de recuperação automática do localStorage
      // Isso garantirá que nenhum disco apareça no resumo até que o usuário explicitamente faça uma seleção
      
      console.log("Initial disk loader completed without auto-loading disks");
    }
  }, [isInitialLoad, setSelectedDisks]);

  return { isInitialLoad, setIsInitialLoad, isDataRefreshed, setIsDataRefreshed };
}
