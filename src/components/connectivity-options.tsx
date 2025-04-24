import { useState } from "react";
import { ComponentOption } from "@/data/server-components";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QuantitySelector } from "./quantity-selector";
import { Trash2, Plus, Network } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ConnectivityOptionsProps {
  options: ComponentOption[];
  selectedItems: { [key: string]: { option: ComponentOption, quantity: number } };
  onUpdateItems: (items: { [key: string]: { option: ComponentOption, quantity: number } }) => void;
}

export function ConnectivityOptions({ 
  options, 
  selectedItems, 
  onUpdateItems 
}: ConnectivityOptionsProps) {
  const [selectedOption, setSelectedOption] = useState<string>("");
  
  const handleAddItem = () => {
    if (!selectedOption) return;
    
    const option = options.find(opt => opt.id === selectedOption);
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
  
  return (
    <Card className="p-4">
      <CardHeader className="p-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Network className="h-5 w-5 text-primary" />
          Opções de Conectividade
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-2 space-y-6">
        {/* Add new item */}
        <div className="flex gap-2">
          <Select value={selectedOption} onValueChange={setSelectedOption}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione uma opção" />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  <div className="flex justify-between items-center w-full">
                    <span>{option.name}</span>
                    <span className="text-primary ml-2">
                      {formatCurrency(option.price)}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            variant="outline"
            size="icon" 
            onClick={handleAddItem}
            disabled={!selectedOption}
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
      </CardContent>
    </Card>
  );
}
