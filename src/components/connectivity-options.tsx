
import { useState, useEffect } from "react";
import { ComponentOption } from "@/types/component";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QuantitySelector } from "./quantity-selector";
import { Database, Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useConnectivity } from "@/hooks/useConnectivity";

interface ConnectivityOptionsProps {
  options: ComponentOption[];
  selectedItems: { [key: string]: { option: ComponentOption, quantity: number } };
  onUpdateItems: (items: { [key: string]: { option: ComponentOption, quantity: number } }) => void;
}

// Interface para os cabeçalhos de seção
interface SectionHeader {
  id: string;
  name: string;
  price: number;
  isHeader: boolean;
}

// Type guard to check if an option is a section header
const isSectionHeader = (option: ComponentOption | SectionHeader): option is SectionHeader => {
  return 'isHeader' in option && option.isHeader === true;
};

export function ConnectivityOptions({ 
  options, 
  selectedItems, 
  onUpdateItems 
}: ConnectivityOptionsProps) {
  const [selectedOption, setSelectedOption] = useState<string>("");
  
  // Usar hook de conectividade para garantir dados sincronizados
  const { connectivityOptions, isLoading } = useConnectivity();
  
  // Usar as opções sincronizadas se estiverem disponíveis
  const finalOptions = connectivityOptions.length > 0 
    ? connectivityOptions.filter((option, index, self) => 
        // Filtrar duplicatas baseado no ID
        index === self.findIndex(o => o.id === option.id)
      )
    : options.filter((option, index, self) =>
        index === self.findIndex(o => o.id === option.id)
      );
  
  // Debug para verificar as opções e itens selecionados
  useEffect(() => {
    console.log("ConnectivityOptions: Received", options.length, "options");
    console.log("ConnectivityOptions: Using", finalOptions.length, "final options (duplicates removed)");
    console.log("ConnectivityOptions: Current selected items:", Object.keys(selectedItems).length);
    
    // Separar por tipo para debug
    const portOptions = finalOptions.filter(opt => opt.subtype === "porta");
    const ipOptions = finalOptions.filter(opt => opt.subtype === "ip");
    const otherOptions = finalOptions.filter(opt => opt.subtype !== "porta" && opt.subtype !== "ip");
    
    console.log(`ConnectivityOptions: port=${portOptions.length}, ip=${ipOptions.length}, other=${otherOptions.length}`);
  }, [options, finalOptions, selectedItems]);
  
  const handleAddItem = () => {
    if (!selectedOption) return;
    
    const option = finalOptions.find(opt => opt.id === selectedOption);
    if (!option) return;
    
    const newItems = { ...selectedItems };
    
    // If item exists, increment quantity
    if (newItems[option.id]) {
      newItems[option.id].quantity += 1;
    } else {
      // Otherwise add new item
      newItems[option.id] = {
        option,
        quantity: 1
      };
    }
    
    onUpdateItems(newItems);
    setSelectedOption("");
  };
  
  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    const newItems = { ...selectedItems };
    
    if (quantity <= 0) {
      delete newItems[itemId];
    } else {
      newItems[itemId].quantity = quantity;
    }
    
    onUpdateItems(newItems);
  };
  
  const handleRemoveItem = (itemId: string) => {
    const newItems = { ...selectedItems };
    delete newItems[itemId];
    onUpdateItems(newItems);
  };
  
  // Separar opções por tipo (eliminando duplicatas)
  const portOptions = Array.from(
    new Set(finalOptions.filter(opt => opt.subtype === 'porta').map(opt => opt.id))
  ).map(id => finalOptions.find(opt => opt.id === id)).filter(Boolean) as ComponentOption[];
  
  const ipOptions = Array.from(
    new Set(finalOptions.filter(opt => opt.subtype === 'ip').map(opt => opt.id))
  ).map(id => finalOptions.find(opt => opt.id === id)).filter(Boolean) as ComponentOption[];
  
  const otherOptions = Array.from(
    new Set(finalOptions.filter(opt => opt.subtype !== 'porta' && opt.subtype !== 'ip').map(opt => opt.id))
  ).map(id => finalOptions.find(opt => opt.id === id)).filter(Boolean) as ComponentOption[];
  
  // Combinar opções para seletores, organizadas por tipo
  const organizedOptions: (ComponentOption | SectionHeader)[] = [
    ...(portOptions.length > 0 ? [{ id: 'port-header', name: '-- Velocidade de Porta --', price: 0, isHeader: true } as SectionHeader] : []),
    ...portOptions,
    ...(ipOptions.length > 0 ? [{ id: 'ip-header', name: '-- Blocos de IP --', price: 0, isHeader: true } as SectionHeader] : []),
    ...ipOptions,
    ...(otherOptions.length > 0 ? [{ id: 'other-header', name: '-- Outros --', price: 0, isHeader: true } as SectionHeader] : []),
    ...otherOptions
  ];
  
  return (
    <Card className="p-4">
      <CardHeader className="p-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          Opções de Conectividade
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-2 space-y-6">
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">
            <p>Carregando opções de conectividade...</p>
          </div>
        ) : (
          <>
            {/* Add new item */}
            <div className="flex gap-2">
              <Select value={selectedOption} onValueChange={setSelectedOption}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione uma opção" />
                </SelectTrigger>
                <SelectContent>
                  {organizedOptions.map((option) => (
                    isSectionHeader(option) ? (
                      <SelectItem key={option.id} value={option.id} disabled className="text-xs font-medium text-muted-foreground">
                        {option.name}
                      </SelectItem>
                    ) : (
                      <SelectItem key={option.id} value={option.id}>
                        <div className="flex justify-between items-center w-full">
                          <span>{option.name}</span>
                          <span className="text-primary ml-2">
                            {formatCurrency(option.price)}
                          </span>
                        </div>
                      </SelectItem>
                    )
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="outline"
                size="icon" 
                onClick={handleAddItem}
                disabled={!selectedOption || (selectedOption ? isSectionHeader(organizedOptions.find(opt => opt.id === selectedOption) || {} as ComponentOption) : false)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Selected items */}
            {Object.keys(selectedItems).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(selectedItems).map(([itemId, {option, quantity}]) => (
                  <div 
                    key={itemId}
                    className="flex items-center justify-between border rounded-lg p-3 bg-muted/10"
                  >
                    <div>
                      <div className="font-medium">{option.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {option.subtype === 'porta' ? 'Velocidade de Porta' : 
                         option.subtype === 'ip' ? 'Bloco de IP' : 
                         option.subtype || 'Conectividade'}
                      </div>
                      <div className="text-sm text-muted-foreground">{formatCurrency(option.price)} / unidade</div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <QuantitySelector
                        value={quantity}
                        onChange={(value) => handleUpdateQuantity(itemId, value)}
                        min={1}
                        max={99}
                      />
                      
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleRemoveItem(itemId)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-between pt-2 text-sm font-medium">
                  <span>Total:</span>
                  <span>
                    {formatCurrency(
                      Object.values(selectedItems).reduce(
                        (sum, {option, quantity}) => sum + (option.price * quantity), 0
                      )
                    )}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p>Adicione opções de conectividade</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
