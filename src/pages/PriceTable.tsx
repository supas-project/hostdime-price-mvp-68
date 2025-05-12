import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCaption } from "@/components/ui/table";
import { FileUp, HardDrive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PriceTableHeader } from "@/components/price-table/TableHeader";
import { TableContent } from "@/components/price-table/TableContent";
import { TableActions } from "@/components/price-table/TableActions";
import { CategoryTabs } from "@/components/price-table/CategoryTabs";
import { SyncIndicator } from "@/components/price-table/SyncIndicator";
import { PriceData, PriceCategory, PriceItem } from "@/types/pricing";
import { useAuth } from "@/contexts/AuthContext";
import { PriceService } from "@/services/price-service";
import { LoginDialog } from "@/components/login-dialog";
import { TableControls } from "@/components/price-table/TableControls";
import { CategoryHeader } from "@/components/price-table/CategoryHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";

export default function PriceTable() {
  const [priceData, setPriceData] = useState<PriceData>({});
  const [activeTab, setActiveTab] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [openAddItem, setOpenAddItem] = useState(false);
  const [openAddCategory, setOpenAddCategory] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [displayMode, setDisplayMode] = useState<"table" | "card">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const { isAuthenticated, isAdmin } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadPriceData();
    
    // Adicionar listener para mudanças de dados
    const handleDataChange = (data: PriceData) => {
      setPriceData(data);
      setLastSyncTime(new Date());
    };
    
    PriceService.addDataChangeListener(handleDataChange);
    
    return () => {
      PriceService.removeDataChangeListener(handleDataChange);
    };
  }, []);

  useEffect(() => {
    if (Object.keys(priceData).length > 0 && !activeTab) {
      setActiveTab(Object.keys(priceData)[0]);
    }
  }, [priceData, activeTab]);

  const loadPriceData = () => {
    try {
      setIsLoading(true);
      const data = PriceService.getAllData();
      setPriceData(data);
      setLastSyncTime(new Date());
      
      if (!activeTab && Object.keys(data).length > 0) {
        setActiveTab(Object.keys(data)[0]);
      }
    } catch (error) {
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar a tabela de preços.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    
    try {
      const content = await file.text();
      
      if (file.name.endsWith('.json')) {
        setPriceData(PriceService.importFromJSON(content));
      } else if (file.name.endsWith('.csv')) {
        setPriceData(PriceService.importFromCSV(content));
      } else {
        throw new Error("Formato de arquivo não suportado. Use JSON ou CSV.");
      }
      
      toast({
        title: "Dados importados com sucesso",
        description: "Os dados foram validados e carregados."
      });
    } catch (error) {
      toast({
        title: "Erro ao importar",
        description: error instanceof Error ? error.message : "Verifique se o arquivo está no formato correto.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAddCategory = (values: any) => {
    try {
      const newCategory = PriceService.addCategory({
        name: values.name,
        items: []
      });
      
      setPriceData(prev => ({
        ...prev,
        [newCategory.id]: newCategory
      }));
      
      setActiveTab(newCategory.id);
      setOpenAddCategory(false);
      
      toast({
        title: "Categoria adicionada",
        description: `A categoria ${newCategory.name} foi adicionada com sucesso.`
      });
    } catch (error) {
      toast({
        title: "Erro ao adicionar categoria",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    }
  };

  const handleAddItem = (values: any) => {
    if (!activeTab) {
      toast({
        title: "Erro ao adicionar item",
        description: "Nenhuma categoria selecionada.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const itemData = {
        name: values.name,
        description: values.description,
        price: values.price,
        type: values.type || activeTab,
        subtype: values.subtype,
        specs: Array.isArray(values.specs) ? values.specs : [],
        metadata: {}
      };
      
      // Apenas adiciona o item ao serviço, o listener já atualiza o estado
      PriceService.addItem(activeTab, itemData);
      
      // Fecha o modal
      setOpenAddItem(false);
      
      toast({
        title: "Item adicionado",
        description: `O item ${values.name} foi adicionado com sucesso.`
      });
    } catch (error) {
      toast({
        title: "Erro ao adicionar item",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    try {
      PriceService.deleteCategory(categoryId);
      
      setPriceData(prev => {
        const updatedData = { ...prev };
        delete updatedData[categoryId];
        
        if (activeTab === categoryId) {
          const categories = Object.keys(updatedData);
          if (categories.length > 0) {
            setActiveTab(categories[0]);
          } else {
            setActiveTab("");
          }
        }
        
        return updatedData;
      });
      
      toast({
        title: "Categoria excluída",
        description: "A categoria foi excluída com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir categoria",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteItem = (itemId: string) => {
    if (!activeTab) return;
    
    try {
      PriceService.deleteItem(activeTab, itemId);
      
      setPriceData(prev => ({
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          items: prev[activeTab].items.filter(item => item.id !== itemId)
        }
      }));
      
      toast({
        title: "Item excluído",
        description: "O item foi excluído com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir item",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    }
  };

  const handleExportData = () => {
    try {
      const data = PriceService.getAllData();
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'price-table-export.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Dados exportados",
        description: "Os dados foram exportados com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro ao exportar dados",
        description: "Não foi possível exportar os dados.",
        variant: "destructive"
      });
    }
  };

  const handleResetData = () => {
    const data = PriceService.resetData();
    setPriceData(data);
    
    if (Object.keys(data).length > 0) {
      setActiveTab(Object.keys(data)[0]);
    }
    
    toast({
      title: "Dados resetados",
      description: "A tabela de preços foi restaurada para o estado inicial."
    });
  };

  // Function to toggle category collapse state
  const toggleCategoryCollapse = (categoryId: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Filter items based on search term
  const filterItems = (items: PriceItem[]): PriceItem[] => {
    if (!searchTerm) return items;
    const lowerSearch = searchTerm.toLowerCase();
    
    return items.filter(item => 
      item.name.toLowerCase().includes(lowerSearch) || 
      item.description.toLowerCase().includes(lowerSearch) ||
      (item.subtype && item.subtype.toLowerCase().includes(lowerSearch)) ||
      (item.specs && item.specs.some(spec => spec.toLowerCase().includes(lowerSearch)))
    );
  };

  return (
    <div className="container py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-primary/10 text-primary">
            <HardDrive className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Tabela de Preços</h1>
            <p className="text-muted-foreground">Gerencie os preços dos componentes para servidores</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <SyncIndicator lastSyncTime={lastSyncTime} />
          <LoginDialog />
        </div>
      </div>

      <Card className="border border-border rounded-xl shadow-lg overflow-hidden">
        <CardHeader className="pb-0">
          <div className="flex flex-wrap justify-between items-center gap-2">
            {isAdmin && (
              <TableActions
                activeTab={activeTab}
                priceData={priceData}
                openAddCategory={openAddCategory}
                openAddItem={openAddItem}
                setOpenAddCategory={setOpenAddCategory}
                setOpenAddItem={setOpenAddItem}
                onAddCategory={handleAddCategory}
                onAddItem={handleAddItem}
                onExportData={handleExportData}
                onResetData={handleResetData}
              />
            )}

            <div className="flex gap-2 ml-auto">
              {isAdmin && (
                <Button variant="outline" className="relative" disabled={isLoading}>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept=".xlsx,.xls,.json,.csv"
                    onChange={handleFileUpload}
                  />
                  <FileUp className="mr-2 h-4 w-4" />
                  {isLoading ? 'Importando...' : 'Importar Arquivo'}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {Object.keys(priceData).length > 0 ? (
            <>
              <TableControls 
                displayMode={displayMode}
                onDisplayModeChange={setDisplayMode}
                onSearchChange={setSearchTerm}
                onSortChange={setSortOrder}
                sortOrder={sortOrder}
              />

              <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
                <CategoryTabs
                  categories={Object.values(priceData)}
                  isAdmin={isAdmin}
                  onDeleteCategory={handleDeleteCategory}
                />

                {Object.values(priceData).map((category) => {
                  const filteredItems = filterItems(category.items);
                  const isCollapsed = collapsedCategories[category.id] || false;
                  
                  return (
                    <TabsContent key={category.id} value={category.id}>
                      <Collapsible open={!isCollapsed}>
                        <CategoryHeader 
                          category={{...category, items: filteredItems}}
                          isCollapsed={isCollapsed}
                          onToggleCollapse={() => toggleCategoryCollapse(category.id)}
                        />
                        
                        <CollapsibleContent>
                          {displayMode === "card" ? (
                            <TableContent 
                              category={{...category, items: filteredItems}} 
                              onDelete={isAdmin ? handleDeleteItem : undefined}
                              onEdit={isAdmin ? handleAddItem : undefined}
                              displayMode="card"
                              sortOrder={sortOrder}
                            />
                          ) : (
                            <div className="rounded-xl overflow-hidden border border-border">
                              <Table>
                                {filteredItems.length === 0 && (
                                  <TableCaption>
                                    {searchTerm 
                                      ? "Nenhum resultado encontrado para a busca" 
                                      : "Nenhum item cadastrado nesta categoria"}
                                  </TableCaption>
                                )}
                                <PriceTableHeader showActions={isAdmin} />
                                <TableBody>
                                  <TableContent 
                                    category={{...category, items: filteredItems}} 
                                    onDelete={isAdmin ? handleDeleteItem : undefined}
                                    onEdit={isAdmin ? handleAddItem : undefined}
                                    sortOrder={sortOrder}
                                  />
                                </TableBody>
                              </Table>
                            </div>
                          )}
                        </CollapsibleContent>
                      </Collapsible>
                    </TabsContent>
                  );
                })}
              </Tabs>
            </>
          ) : (
            <div className="p-8 text-center">
              <h3 className="text-lg font-medium mb-2">Nenhuma categoria cadastrada</h3>
              <p className="text-muted-foreground mb-4">
                {isAdmin 
                  ? "Comece adicionando uma nova categoria ou importe dados existentes."
                  : "Entre como administrador para gerenciar a tabela de preços."
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
