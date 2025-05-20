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
import { PricedDiskOption } from "@/types/storage";
import { SyncButton } from "../disk-selection/SyncButton";
import { useDataSyncHandler } from "@/hooks/storage/useDataSyncHandler";

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
  const { user } = useAuth();
  
  // Explicit check if user email is admin@hostdime.com.br
  const isAdmin = user?.email === "admin@hostdime.com.br";

  // Load disk options on mount
  useEffect(() => {
    const loadDisks = async () => {
      try {
        const category = await PriceService.getCategory('discos_internos');
        if (category && Array.isArray(category.items)) {
          const options = category.items.map(item => {
            // Corrija o erro de tipo convertendo explicitamente para booleano
            const hasRaid = Boolean(item.metadata?.raid);
            
            return {
              id: item.id,
              name: item.name,
              description: item.description,
              price: item.price,
              type: item.type,
              subtype: item.subtype,
              capacity: item.metadata?.capacity || 'N/A',
              raid: hasRaid,
            } as PricedDiskOption;
          });
          setDiskOptions(options);
        } else {
          console.warn("No internal disks found in price table");
        }
      } catch (error) {
        console.error("Error loading internal disks:", error);
        toast.error("Erro ao carregar discos internos", {
          description: "Não foi possível carregar as opções de disco. Tente novamente mais tarde."
        });
      } finally {
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
        type: 'disk',
        subtype: item.disk.type,
        metadata: {
          quantity: item.quantity
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
      
      // Get existing price data
      const allData = await PriceService.getAllData();
      
      // Make sure we have the discos_internos category
      if (allData.discos_internos && Array.isArray(allData.discos_internos.items)) {
        // Convert price items to disk options
        const diskItems = allData.discos_internos.items.map(item => {
          // Corrija o erro de tipo convertendo explicitamente para booleano
          const hasRaid = Boolean(item.metadata?.raid);
          
          return {
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            type: item.type,
            subtype: item.subtype,
            capacity: item.metadata?.capacity || 'N/A',
            raid: hasRaid,
          } as PricedDiskOption;
        });
        
        // Update selected disks
        setSelectedDisks(diskItems.map(disk => ({
          disk,
          quantity: 1
        })));
      }
    } catch (error) {
      console.error("Error refreshing disk data:", error);
      toast.error("Erro ao atualizar dados de disco", {
        description: "Não foi possível atualizar os dados de disco. Tente novamente mais tarde."
      });
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

    setSelectedDisks(prev => [...prev, { disk: selectedDisk, quantity }]);
    setSelectedDisk(null);
    setQuantity(1);
    setIsPersisted(false);
    setHasLocalChanges(true);
    toast.success("Disco adicionado com sucesso");
  };

  // Handle quantity change
  const handleQuantityChange = (diskId: string, newQuantity: number) => {
    setSelectedDisks(prev => prev.map(item => {
      if (item.disk.id === diskId) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
    setIsPersisted(false);
    setHasLocalChanges(true);
  };

  // Handle remove disk
  const handleRemoveDisk = (diskId: string) => {
    setSelectedDisks(prev => prev.filter(item => item.disk.id !== diskId));
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
            <Select onValueChange={(value) => {
              const disk = diskOptions.find(disk => disk.id === value);
              setSelectedDisk(disk || null);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um disco" />
              </SelectTrigger>
              <SelectContent>
                {diskOptions.map((disk) => (
                  <SelectItem key={disk.id} value={disk.id}>{disk.name}</SelectItem>
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
            />
          </div>
        </div>
        <Button onClick={handleAddDisk} disabled={!selectedDisk}>Adicionar Disco</Button>
        <Separator />
        <ul className="list-none pl-0">
          {selectedDisks.map((item) => (
            <li key={item.disk.id} className="grid grid-cols-4 items-center gap-4 py-2">
              <div className="col-span-2">{item.disk.name}</div>
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
        {isAdmin && (
          <SyncButton onSync={handleSyncData} isSyncing={isSyncing} />
        )}
      </CardContent>
    </Card>
  );
}
