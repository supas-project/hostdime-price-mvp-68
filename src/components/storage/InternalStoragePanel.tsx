
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { PriceService } from "@/services/price-service";
import { useDataSyncHandler } from "@/hooks/storage/useDataSyncHandler";
import { PricedDiskOption } from "@/types/storage";
import { getDiskOptions } from "@/services/price/operations/data-retrieval";

interface SyncButtonProps {
  onSync: () => Promise<void>;
  isSyncing: boolean;
}

function SyncButton({ onSync, isSyncing }: SyncButtonProps) {
  return (
    <div className="mt-4">
      <Button 
        onClick={onSync} 
        disabled={isSyncing}
        variant="outline"
        className="w-full"
      >
        {isSyncing ? "Sincronizando..." : "Sincronizar dados com servidor"}
      </Button>
      <p className="text-xs text-center mt-1 text-muted-foreground">
        Isso substituirá quaisquer modificações locais
      </p>
    </div>
  );
}

interface InternalStoragePanelProps {
  selectedDisks: { disk: PricedDiskOption; quantity: number }[];
  setSelectedDisks: (disks: { disk: PricedDiskOption; quantity: number }[]) => void;
}

export function InternalStoragePanel({ selectedDisks, setSelectedDisks }: InternalStoragePanelProps) {
  const [diskOptions, setDiskOptions] = useState<PricedDiskOption[]>([]);
  const [selectedDisk, setSelectedDisk] = useState<PricedDiskOption | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPersisted, setIsPersisted] = useState(true);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  // Explicit check if user email is admin@hostdime.com.br
  const isAdmin = user?.email === "admin@hostdime.com.br";

  // Load disk options on mount
  useEffect(() => {
    const loadDisks = async () => {
      try {
        setIsLoading(true);
        
        // Use dedicated function for getting disk options
        const options = await getDiskOptions();
        
        if (options && options.length > 0) {
          console.log(`Carregados ${options.length} discos internos`);
          setDiskOptions(options);
          // Notificar usuário sobre discos carregados
          toast.success(`${options.length} opções de disco carregadas`);
        } else {
          console.warn("No internal disks found in price table");
          toast.warning("Nenhum disco interno encontrado", {
            description: "Tente sincronizar com o servidor ou adicione discos na tabela de preços."
          });
        }
      } catch (error) {
        console.error("Error loading internal disks:", error);
        toast.error("Erro ao carregar discos internos", {
          description: "Não foi possível carregar as opções de disco. Tente novamente mais tarde."
        });
      } finally {
        setIsLoading(false);
        setIsInitialLoad(false);
      }
    };
    
    loadDisks();
  }, []);

  // Persist selections to database
  const persistSelectionsToDatabase = async (disks: { disk: PricedDiskOption; quantity: number }[]) => {
    try {
      console.log("Saving disk selections to database:", disks.length);
      
      // Get existing price data
      const allData = await PriceService.getAllData();
      
      // Make sure we have the discos_internos category
      if (!allData.discos_internos) {
        allData.discos_internos = {
          id: 'discos_internos',
          name: 'Discos Internos',
          items: []
        };
      }
      
      // Convert selected disks to price items
      const diskItems = disks.map(item => ({
        id: item.disk.id,
        name: `${item.disk.type.toUpperCase()} ${item.disk.capacity}`,
        description: `${item.disk.type.toUpperCase()} disk with ${item.disk.capacity} capacity`,
        price: item.disk.price * item.quantity,
        type: item.disk.type, // Usar o tipo do disco diretamente (nvme, ssd, hdd)
        subtype: "disk",
        metadata: {
          quantity: item.quantity,
          type: item.disk.type, // Garantir que o tipo está no metadata também
          // Add raid property if it exists in the original disk
          ...(item.disk.raid !== undefined && { raid: item.disk.raid }),
          // Add capacity for future reference
          capacity: item.disk.capacity,
          // Add specs data
          readSpeed: item.disk.specs?.readSpeed,
          writeSpeed: item.disk.specs?.writeSpeed,
          iops: item.disk.specs?.iops,
          recommended: item.disk.specs?.recommended
        },
        specs: [
          `Capacidade: ${item.disk.capacity}`,
          `Tipo: ${item.disk.type.toUpperCase()}`
        ]
      }));
      
      // Update items in the category
      allData.discos_internos.items = diskItems;
      
      // Save to database
      await PriceService.saveData(allData);
      console.log("Disk selections saved to database:", diskItems.length);
      setIsPersisted(true);
      setHasLocalChanges(false);
      
      // Disparar evento customizado para notificar outras partes da aplicação
      const event = new CustomEvent('storage-selection-updated', {
        detail: { disks: diskItems }
      });
      window.dispatchEvent(event);
      
    } catch (error) {
      console.error("Error saving disk selections to database:", error);
      toast.error("Erro ao salvar discos", {
        description: "Não foi possível salvar as alterações no banco de dados. Tente novamente mais tarde."
      });
    }
  };

  // Refresh data from database
  const refreshData = async () => {
    try {
      console.log("Refreshing disk data from database");
      setIsLoading(true);
      
      // Use dedicated function for getting disk options
      const refreshedOptions = await getDiskOptions();
      
      if (refreshedOptions && refreshedOptions.length > 0) {
        setDiskOptions(refreshedOptions);
        
        // Update selected disks to match any that exist in the refreshed options
        const updatedSelections = refreshedOptions
          .filter(disk => disk.metadata?.quantity && disk.metadata.quantity > 0)
          .map(disk => ({
            disk,
            quantity: disk.metadata?.quantity || 1
          }));
          
        if (updatedSelections.length > 0) {
          setSelectedDisks(updatedSelections);
        }
        
        toast.success(`${refreshedOptions.length} opções de disco atualizadas`);
      } else {
        toast.warning("Nenhum disco interno encontrado após atualização");
      }
    } catch (error) {
      console.error("Error refreshing disk data:", error);
      toast.error("Erro ao atualizar dados de disco", {
        description: "Não foi possível atualizar os dados de disco. Tente novamente mais tarde."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Sync data with database
  const handleSyncData = async () => {
    setIsSyncing(true);
    try {
      console.log("Syncing disk data with database");
      
      // Force refresh from the latest source
      await PriceService.forceRefreshFromLatestSource();
      
      // Refresh data
      await refreshData();
      
      toast.success("Dados sincronizados com sucesso", {
        description: "Os dados foram sincronizados com sucesso."
      });
    } catch (error) {
      console.error("Error syncing disk data:", error);
      toast.error("Erro ao sincronizar dados de disco", {
        description: "Não foi possível sincronizar os dados de disco. Tente novamente mais tarde."
      });
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Handle data synchronization
  useDataSyncHandler({
    selectedDisks,
    hasLocalChanges,
    persistSelectionsToDatabase,
    refreshData
  });

  // Add disk to selection
  const handleAddDisk = () => {
    if (!selectedDisk) {
      toast.error("Selecione um disco para adicionar");
      return;
    }

    if (quantity <= 0) {
      toast.error("A quantidade deve ser maior que zero");
      return;
    }

    // Check if disk already exists
    const existingDisk = selectedDisks.find(item => item.disk.id === selectedDisk.id);
    if (existingDisk) {
      toast.error("Este disco já foi adicionado");
      return;
    }

    // Adiciona o disco selecionado
    const updatedDisks = [...selectedDisks, { disk: selectedDisk, quantity }];
    setSelectedDisks(updatedDisks);
    
    // Disparar evento customizado para visualização compartilhada 
    const selectionEvent = new CustomEvent('storage-selection', { 
      detail: {
        disk: selectedDisk,
        quantity: quantity,
        type: 'internal'
      }
    });
    window.dispatchEvent(selectionEvent);
    
    setSelectedDisk(null);
    setQuantity(1);
    setIsPersisted(false);
    setHasLocalChanges(true);
    toast.success("Disco adicionado com sucesso");
  };

  // Handle quantity change
  const handleQuantityChange = (diskId: string, newQuantity: number) => {
    // Verificar se a nova quantidade é válida
    if (newQuantity < 1) {
      toast.error("A quantidade deve ser maior que zero");
      return;
    }
    
    const updatedDisks = selectedDisks.map(item => {
      if (item.disk.id === diskId) {
        // Disparar evento customizado para visualização compartilhada
        const selectionEvent = new CustomEvent('storage-selection', { 
          detail: {
            disk: item.disk,
            quantity: newQuantity,
            type: 'internal'
          }
        });
        window.dispatchEvent(selectionEvent);
        
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    
    setSelectedDisks(updatedDisks);
    setIsPersisted(false);
    setHasLocalChanges(true);
  };

  // Handle remove disk
  const handleRemoveDisk = (diskId: string) => {
    // Encontrar o disco a ser removido para o evento
    const diskToRemove = selectedDisks.find(item => item.disk.id === diskId);
    
    if (diskToRemove) {
      // Disparar evento customizado para notificar remoção
      const selectionEvent = new CustomEvent('storage-selection', { 
        detail: {
          disk: diskToRemove.disk,
          quantity: 0, // Zero indica remoção
          type: 'internal'
        }
      });
      window.dispatchEvent(selectionEvent);
    }
    
    setSelectedDisks(selectedDisks.filter(item => item.disk.id !== diskId));
    setIsPersisted(false);
    setHasLocalChanges(true);
    toast.success("Disco removido com sucesso");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Discos Internos</CardTitle>
        <CardDescription>Selecione os discos internos para o servidor.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="disk">Disco</Label>
            <Select 
              value={selectedDisk?.id} 
              onValueChange={(value) => {
                const disk = diskOptions.find(disk => disk.id === value);
                setSelectedDisk(disk || null);
              }}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? "Carregando..." : "Selecione um disco"} />
              </SelectTrigger>
              <SelectContent>
                {diskOptions.length === 0 && !isLoading && (
                  <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                    Nenhum disco disponível
                  </div>
                )}
                {diskOptions.map((disk) => (
                  <SelectItem key={disk.id} value={disk.id}>
                    {disk.name || `${disk.type.toUpperCase()} ${disk.capacity}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="quantity">Quantidade</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              disabled={isLoading}
            />
          </div>
        </div>
        <Button 
          onClick={handleAddDisk} 
          disabled={!selectedDisk || isLoading}
          variant="default"
          className="bg-[#f58220] hover:bg-[#e67615] text-white"
        >
          Adicionar Disco
        </Button>
        <Separator />
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-t-primary rounded-full animate-spin"></div>
              <div>Carregando discos...</div>
            </div>
          </div>
        ) : selectedDisks.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            Nenhum disco selecionado. Adicione discos à configuração.
          </div>
        ) : (
          <ul className="list-none pl-0">
            {selectedDisks.map((item) => (
              <li key={item.disk.id} className="grid grid-cols-4 items-center gap-4 py-2">
                <div className="col-span-2">{item.disk.name || `${item.disk.type.toUpperCase()} ${item.disk.capacity}`}</div>
                <div>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item.disk.id, Number(e.target.value))}
                    className="w-20"
                  />
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleRemoveDisk(item.disk.id)}>Remover</Button>
              </li>
            ))}
          </ul>
        )}
        {isAdmin && (
          <SyncButton onSync={handleSyncData} isSyncing={isSyncing} />
        )}
      </CardContent>
    </Card>
  );
}
