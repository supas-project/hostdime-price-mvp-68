
import React, { useState, useEffect } from "react";
import { ComponentOption } from "@/types/component";
import { ComponentSelector } from "@/components/component-selector";
import { CoreSelector } from "./CoreSelector";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, HelpCircle } from "lucide-react";
import { HelpTooltip } from "@/components/help-tooltip";
import { toast } from "sonner";

interface MultipleOSSelectorProps {
  options: ComponentOption[];
  selectedOSItems: { [key: string]: { option: ComponentOption; quantity: number; cores?: number } };
  onUpdateOSItems: (items: { [key: string]: { option: ComponentOption; quantity: number; cores?: number } }) => void;
}

export function MultipleOSSelector({
  options,
  selectedOSItems,
  onUpdateOSItems
}: MultipleOSSelectorProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState("");

  // Agrupar opções por subtipo
  const groupedOptions = React.useMemo(() => {
    const windowsOptions = options.filter(opt => opt.subtype === "windows");
    const linuxOptions = options.filter(opt => opt.subtype === "linux");
    const virtualizationOptions = options.filter(opt => opt.subtype === "virtualization");
    const unixOptions = options.filter(opt => opt.subtype === "unix");

    return [
      {
        group: "Windows",
        options: windowsOptions,
        tooltip: "Windows Server com licenciamento por cores"
      },
      {
        group: "Linux",
        options: linuxOptions
      },
      {
        group: "Virtualização",
        options: virtualizationOptions
      },
      {
        group: "Unix e Outros",
        options: unixOptions
      }
    ].filter(group => group.options.length > 0);
  }, [options]);

  const handleAddOS = () => {
    const option = groupedOptions
      .flatMap(group => group.options)
      .find(opt => opt.id === selectedOptionId);
    
    if (!option) return;

    const itemKey = `os-${option.id}-${Date.now()}`;
    
    if (option.subtype === "windows" && option.metadata?.perCore) {
      // Para Windows Server, criar com 2 cores iniciais
      const newItems = {
        ...selectedOSItems,
        [itemKey]: {
          option: option,
          quantity: 1,
          cores: 2
        }
      };
      
      onUpdateOSItems(newItems);
      toast.success("Windows Server Adicionado", {
        description: "Configure a quantidade de cores necessárias.",
        duration: 3000,
      });
    } else {
      // Para outros SOs, comportamento normal
      const newItems = {
        ...selectedOSItems,
        [itemKey]: {
          option: option,
          quantity: 1
        }
      };
      
      onUpdateOSItems(newItems);
      toast.success("Sistema Operacional Adicionado", {
        description: `${option.name} foi adicionado com sucesso.`,
        duration: 3000,
      });
    }

    setSelectedOptionId("");
    setShowAddForm(false);
  };

  const handleRemoveOS = (itemKey: string) => {
    const newItems = { ...selectedOSItems };
    delete newItems[itemKey];
    onUpdateOSItems(newItems);
    
    toast.success("Sistema Operacional Removido", {
      duration: 2000,
    });
  };

  const handleCoreCountChange = (itemKey: string, newCoreCount: number) => {
    const item = selectedOSItems[itemKey];
    if (!item) return;

    const newItems = {
      ...selectedOSItems,
      [itemKey]: {
        ...item,
        cores: newCoreCount
      }
    };
    
    onUpdateOSItems(newItems);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-white">Sistemas Operacionais</h3>
          <HelpTooltip
            title="Sistemas Operacionais"
            description="Adicione um ou mais sistemas operacionais para seu servidor. O Windows Server permite configurar a quantidade de cores para cálculo automático do licenciamento."
            iconOnly
          />
        </div>
        
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          variant="outline"
          size="sm"
          className="border-[#f58220] text-[#f58220] hover:bg-[#f58220] hover:text-white"
        >
          <Plus className="h-4 w-4 mr-1" />
          Adicionar SO
        </Button>
      </div>

      {/* Lista de SOs selecionados */}
      {Object.keys(selectedOSItems).length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">
            Sistemas Operacionais Configurados:
          </h4>
          {Object.entries(selectedOSItems).map(([itemKey, item]) => {
            if (item.option.subtype === "windows" && item.option.metadata?.perCore) {
              return (
                <CoreSelector
                  key={itemKey}
                  option={item.option}
                  coreCount={item.cores || 2}
                  onCoreCountChange={(count) => handleCoreCountChange(itemKey, count)}
                  onRemove={() => handleRemoveOS(itemKey)}
                />
              );
            } else {
              return (
                <Card key={itemKey} className="p-4 border-2 border-primary/20 bg-primary/5">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.option.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {item.option.description}
                      </p>
                      {item.option.price > 0 && (
                        <p className="text-sm font-semibold text-primary mt-1">
                          R$ {item.option.price.toFixed(2)}/mês
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveOS(itemKey)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Plus className="h-4 w-4 rotate-45" />
                    </Button>
                  </div>
                </Card>
              );
            }
          })}
        </div>
      )}

      {/* Formulário para adicionar novo SO */}
      {showAddForm && (
        <Card className="p-4 border-2 border-[#f58220]/30 bg-[#f58220]/5">
          <div className="space-y-4">
            <h4 className="font-medium text-white">Adicionar Sistema Operacional</h4>
            
            <ComponentSelector
              label=""
              options={groupedOptions.flatMap(group => group.options)}
              value={selectedOptionId}
              onChange={setSelectedOptionId}
              tooltip="Escolha o sistema operacional"
              groupedOptions={groupedOptions}
            />
            
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAddForm(false);
                  setSelectedOptionId("");
                }}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleAddOS}
                disabled={!selectedOptionId}
                className="bg-[#f58220] hover:bg-[#f58220]/90"
              >
                Adicionar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {Object.keys(selectedOSItems).length === 0 && !showAddForm && (
        <Card className="p-6 text-center border-2 border-dashed border-muted-foreground/30">
          <HelpCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-3">
            Nenhum sistema operacional selecionado
          </p>
          <Button
            onClick={() => setShowAddForm(true)}
            variant="outline"
            size="sm"
            className="border-[#f58220] text-[#f58220] hover:bg-[#f58220] hover:text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar Primeiro SO
          </Button>
        </Card>
      )}
    </div>
  );
}
