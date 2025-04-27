
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { Plus, Trash } from "lucide-react";
import { toast } from "sonner";
import { useWizard } from "@/contexts/WizardContext";
import { ComponentOption } from "@/types/component";

interface CustomServicesContentProps {
  onAddCustomService?: (service: ComponentOption) => void;
}

export function CustomServicesContent({ onAddCustomService }: CustomServicesContentProps) {
  const { addCustomService, customServices, removeCustomService } = useWizard();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);

  const handleAddService = () => {
    if (!name) {
      toast.error("Por favor, insira um nome para o serviço");
      return;
    }
    
    if (unitPrice <= 0) {
      toast.error("Por favor, insira um preço válido");
      return;
    }

    const newService: ComponentOption = {
      id: `custom-service-${Date.now()}`,
      type: "ServicoPersonalizado",
      name,
      description: description || `Serviço personalizado: ${name}`,
      price: unitPrice * quantity,
      specs: [
        `Nome: ${name}`,
        description ? `Descrição: ${description}` : "",
        `Quantidade: ${quantity}`,
        `Preço unitário: ${formatCurrency(unitPrice)}`
      ].filter(Boolean),
      metadata: {
        unitPrice,
        quantity
      }
    };

    if (onAddCustomService) {
      onAddCustomService(newService);
    } else {
      addCustomService(newService);
    }

    // Reset the form
    setName("");
    setDescription("");
    setQuantity(1);
    setUnitPrice(0);
    
    toast.success("Serviço personalizado adicionado");
  };

  const handleRemoveService = (serviceId: string) => {
    removeCustomService(serviceId);
    toast.success("Serviço personalizado removido");
  };

  return (
    <div className="space-y-6">
      <Card className="bg-muted/10">
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="service-name">Nome do Serviço *</Label>
              <Input 
                id="service-name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Ex: Suporte Premium"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="service-description">Descrição (opcional)</Label>
              <Input 
                id="service-description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Ex: Suporte técnico 24/7"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="service-quantity">Quantidade</Label>
              <Input 
                id="service-quantity" 
                type="number" 
                min={1} 
                value={quantity} 
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="service-price">Preço Unitário (R$) *</Label>
              <Input 
                id="service-price" 
                type="number" 
                min={0} 
                step={0.01} 
                value={unitPrice} 
                onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)} 
              />
            </div>
          </div>
          
          <div className="pt-2">
            <Button 
              onClick={handleAddService}
              className="w-full flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Adicionar Serviço
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {customServices.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Serviços Adicionados</h4>
          
          <div className="space-y-2">
            {customServices.map((service) => (
              <div 
                key={service.id} 
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
              >
                <div>
                  <p className="font-medium">{service.name}</p>
                  {service.description && <p className="text-sm text-muted-foreground">{service.description}</p>}
                  <p className="text-xs text-muted-foreground">
                    Quantidade: {service.metadata?.quantity} × {formatCurrency(service.metadata?.unitPrice || 0)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{formatCurrency(service.price)}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleRemoveService(service.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
