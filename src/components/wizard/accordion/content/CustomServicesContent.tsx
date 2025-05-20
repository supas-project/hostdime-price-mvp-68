
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { Plus, Trash, Server, DollarSign, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { useWizard } from "@/contexts/WizardContext";
import { ComponentOption } from "@/types/component";
import { HelpTooltip } from "@/components/help-tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

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
    } else if (addCustomService) {
      addCustomService(newService);
    }

    setName("");
    setDescription("");
    setQuantity(1);
    setUnitPrice(0);
    
    toast.success("Serviço personalizado adicionado");
  };

  const handleRemoveService = (serviceId: string) => {
    if (removeCustomService) {
      removeCustomService(serviceId);
      toast.success("Serviço personalizado removido");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="bg-card">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-medium">Adicionar Serviço</h3>
              <HelpTooltip
                title="Serviços Personalizados"
                description="Adicione serviços adicionais ao seu servidor, como licenças, monitoramento, backup ou qualquer outro serviço necessário."
                iconOnly
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="service-name" className="flex items-center gap-2">
                Nome do Serviço
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="service-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Backup Gerenciado"
                className="bg-background"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="service-description" className="flex items-center gap-2">
                Descrição
                <HelpTooltip
                  title="Descrição do Serviço"
                  description="Adicione detalhes sobre o serviço, como especificações, termos ou observações importantes."
                  iconOnly
                />
              </Label>
              <Input
                id="service-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Backup diário com retenção de 30 dias"
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="service-quantity" className="flex items-center gap-2">
                Quantidade
                <HelpTooltip
                  title="Quantidade"
                  description="Quantidade de unidades do serviço a serem incluídas."
                  iconOnly
                />
              </Label>
              <Input
                id="service-quantity"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="service-price" className="flex items-center gap-2">
                Preço Unitário (R$)
                <span className="text-destructive">*</span>
                <HelpTooltip
                  title="Preço Unitário"
                  description="Valor mensal por unidade do serviço. O valor total será calculado multiplicando pelo quantidade."
                  iconOnly
                />
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="service-price"
                  type="number"
                  min={0}
                  step={0.01}
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                  className="pl-9 bg-background"
                />
              </div>
            </div>
          </div>

          <Button
            onClick={handleAddService}
            className="w-full flex items-center justify-center gap-2 mt-4"
          >
            <Plus className="w-4 h-4" />
            Adicionar Serviço
          </Button>
        </CardContent>
      </Card>

      {Array.isArray(customServices) && customServices.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                <h4 className="text-lg font-medium">Serviços Adicionados</h4>
              </div>
              <Badge variant="outline">
                {customServices.length} {customServices.length === 1 ? "serviço" : "serviços"}
              </Badge>
            </div>

            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {customServices.map((service) => (
                  <Card key={service.id} className="bg-muted/30">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h5 className="font-medium">{service.name}</h5>
                          {service.description && (
                            <p className="text-sm text-muted-foreground">{service.description}</p>
                          )}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{service.metadata?.quantity || 1}x</span>
                            <span>{formatCurrency(service.metadata?.unitPrice || service.price)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-medium text-primary">{formatCurrency(service.price)}</p>
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
