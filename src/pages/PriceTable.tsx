import { useState, useEffect, useRef } from "react";
import { Table, TableBody, TableCaption } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileUp, Save, Plus, Download, UploadCloud, 
  Trash2, FileJson, Files, RefreshCw 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PriceTableHeader } from "@/components/price-table/TableHeader";
import { TableContent } from "@/components/price-table/TableContent";
import { PriceData, PriceCategory, PriceItem } from "@/types/pricing";
import { useAuth } from "@/contexts/AuthContext";
import { PriceService } from "@/services/price-service";
import { LoginDialog } from "@/components/login-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Form, FormField, FormItem, FormLabel, FormControl, 
  FormDescription, FormMessage 
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Form schemas
const categoryFormSchema = z.object({
  name: z.string().min(3, { message: "Nome da categoria deve ter pelo menos 3 caracteres" }),
});

const itemFormSchema = z.object({
  name: z.string().min(3, { message: "Nome do item deve ter pelo menos 3 caracteres" }),
  description: z.string().min(3, { message: "Descrição deve ter pelo menos 3 caracteres" }),
  price: z.coerce.number().min(0, { message: "Preço deve ser maior ou igual a zero" }),
  type: z.string().min(1, { message: "Tipo é obrigatório" }),
  subtype: z.string().optional(),
  specs: z.string().optional().transform(val => val ? val.split('\n') : []),
});

const importFormSchema = z.object({
  dataType: z.enum(["json", "csv"]),
  data: z.string().min(5, { message: "Dados inválidos ou muito curtos" }),
});

export default function PriceTable() {
  const [priceData, setPriceData] = useState<PriceData>({});
  const [activeTab, setActiveTab] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [openAddItem, setOpenAddItem] = useState(false);
  const [openAddCategory, setOpenAddCategory] = useState(false);
  const [openImportData, setOpenImportData] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated, isAdmin } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form setup
  const categoryForm = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
    },
  });

  const itemForm = useForm<z.infer<typeof itemFormSchema>>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      type: "",
      subtype: "",
      specs: "",
    },
  });

  const importForm = useForm<z.infer<typeof importFormSchema>>({
    resolver: zodResolver(importFormSchema),
    defaultValues: {
      dataType: "json",
      data: "",
    },
  });

  // Load data on initial render
  useEffect(() => {
    loadPriceData();
  }, []);

  // Set initial active tab when data is loaded
  useEffect(() => {
    if (Object.keys(priceData).length > 0 && !activeTab) {
      setActiveTab(Object.keys(priceData)[0]);
    }
  }, [priceData, activeTab]);

  // Load price data from service
  const loadPriceData = () => {
    try {
      setIsLoading(true);
      const data = PriceService.getAllData();
      setPriceData(data);
      
      // Set first category as active if none selected
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

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    
    try {
      const content = await file.text();
      
      // Determine file type and parse accordingly
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

  // Add new category
  const handleAddCategory = (values: z.infer<typeof categoryFormSchema>) => {
    try {
      const newCategory = PriceService.addCategory({
        name: values.name,
        items: [] // Adicionando o campo items que faltava
      });
      
      setPriceData(prev => ({
        ...prev,
        [newCategory.id]: newCategory
      }));
      
      setActiveTab(newCategory.id);
      setOpenAddCategory(false);
      categoryForm.reset();
      
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

  // Add new item to active category
  const handleAddItem = (values: z.infer<typeof itemFormSchema>) => {
    if (!activeTab) {
      toast({
        title: "Erro ao adicionar item",
        description: "Nenhuma categoria selecionada.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Se specs vier como string, converta para array
      const specs = typeof values.specs === 'string' ? [values.specs] : values.specs || [];
      
      // Garanta que todos os campos obrigatórios estejam presentes
      const itemData: Omit<PriceItem, 'id'> = {
        name: values.name,
        description: values.description,
        price: values.price,
        type: values.type || activeTab,
        specs: specs,
        subtype: values.subtype,
        metadata: {}
      };
      
      const newItem = PriceService.addItem(activeTab, itemData);
      
      setPriceData(prev => ({
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          items: [...prev[activeTab].items, newItem]
        }
      }));
      
      setOpenAddItem(false);
      itemForm.reset();
      
      toast({
        title: "Item adicionado",
        description: `O item ${newItem.name} foi adicionado com sucesso.`
      });
    } catch (error) {
      toast({
        title: "Erro ao adicionar item",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    }
  };

  // Delete a category
  const handleDeleteCategory = (categoryId: string) => {
    try {
      PriceService.deleteCategory(categoryId);
      
      setPriceData(prev => {
        const updatedData = { ...prev };
        delete updatedData[categoryId];
        
        // Set a new active tab if the deleted one was active
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

  // Delete an item
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

  // Reset data to defaults
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

  // Import data from text input
  const handleImportData = (values: z.infer<typeof importFormSchema>) => {
    try {
      let updatedData: PriceData;
      
      if (values.dataType === 'json') {
        updatedData = PriceService.importFromJSON(values.data);
      } else {
        updatedData = PriceService.importFromCSV(values.data);
      }
      
      setPriceData(updatedData);
      setOpenImportData(false);
      importForm.reset();
      
      toast({
        title: "Dados importados",
        description: "Os dados foram importados com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro ao importar dados",
        description: error instanceof Error ? error.message : "Formato inválido ou dados corrompidos.",
        variant: "destructive"
      });
    }
  };

  // Export data to JSON
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

  // Set form values for the current category when adding an item
  useEffect(() => {
    if (openAddItem && activeTab) {
      itemForm.setValue('type', activeTab);
    }
  }, [openAddItem, activeTab]);

  return (
    <div className="container py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Tabela de Preços</h1>
          <p className="text-muted-foreground">Gerencie os preços dos componentes para servidores</p>
        </div>
        
        <div className="flex items-center gap-2">
          <LoginDialog />
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 shadow-lg">
        <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
          {isAdmin && (
            <div className="flex flex-wrap gap-2">
              <Dialog open={openAddCategory} onOpenChange={setOpenAddCategory}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Categoria
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Nova Categoria</DialogTitle>
                  </DialogHeader>
                  <Form {...categoryForm}>
                    <form onSubmit={categoryForm.handleSubmit(handleAddCategory)} className="space-y-4 pt-4">
                      <FormField
                        control={categoryForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome da Categoria</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Memória, Processador, etc" {...field} />
                            </FormControl>
                            <FormDescription>
                              Nome da categoria que aparecerá na tabela de preços
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end pt-2">
                        <Button type="submit">Adicionar Categoria</Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>

              {activeTab && (
                <Dialog open={openAddItem} onOpenChange={setOpenAddItem}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Novo Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Adicionar Item à {priceData[activeTab]?.name}</DialogTitle>
                    </DialogHeader>
                    <Form {...itemForm}>
                      <form onSubmit={itemForm.handleSubmit(handleAddItem)} className="space-y-4 pt-4">
                        <FormField
                          control={itemForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome</FormLabel>
                              <FormControl>
                                <Input placeholder="Nome do item" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={itemForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Descrição</FormLabel>
                              <FormControl>
                                <Input placeholder="Descrição breve do item" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={itemForm.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Preço (R$)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="0" 
                                  step="0.01" 
                                  placeholder="0.00" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={itemForm.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo</FormLabel>
                              <FormControl>
                                <Input placeholder="Tipo do componente" {...field} />
                              </FormControl>
                              <FormDescription>
                                Usado para integração com o configurador
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={itemForm.control}
                          name="subtype"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subtipo (opcional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Subtipo do componente" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={itemForm.control}
                          name="specs"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Especificações (opcional)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Adicione especificações técnicas (uma por linha)" 
                                  className="min-h-[100px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormDescription>
                                Cada linha será um item da lista de especificações
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end pt-2">
                          <Button type="submit">Adicionar Item</Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              )}

              <Dialog open={openImportData} onOpenChange={setOpenImportData}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Importar Dados
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Importar Dados</DialogTitle>
                  </DialogHeader>
                  <Form {...importForm}>
                    <form onSubmit={importForm.handleSubmit(handleImportData)} className="space-y-4 pt-4">
                      <FormField
                        control={importForm.control}
                        name="dataType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Formato</FormLabel>
                            <div className="flex gap-4">
                              <label className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  value="json"
                                  checked={field.value === 'json'}
                                  onChange={() => field.onChange('json')}
                                  className="h-4 w-4"
                                />
                                <span>JSON</span>
                              </label>
                              <label className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  value="csv"
                                  checked={field.value === 'csv'}
                                  onChange={() => field.onChange('csv')}
                                  className="h-4 w-4"
                                />
                                <span>CSV</span>
                              </label>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={importForm.control}
                        name="data"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dados</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder={field.value === 'json' 
                                  ? '{"categoria": {"id": "categoria", "name": "Nome", "items": []}}'
                                  : 'category,name,description,price\nProcessadores,Intel i7,Processador Intel i7,1299.00'
                                }
                                className="min-h-[200px] font-mono"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              {field.value === 'json' 
                                ? 'Cole dados em formato JSON válido'
                                : 'Cole dados em formato CSV (separado por vírgulas)'
                              }
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end pt-2">
                        <Button type="submit">Importar</Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>

              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportData}
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar JSON
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Restaurar Padrões
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Restaurar dados padrão?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação irá redefinir a tabela de preços para os valores iniciais. 
                      Todos os dados personalizados serão perdidos.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleResetData}>Confirmar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
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

        {Object.keys(priceData).length > 0 ? (
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4 flex flex-wrap">
              {Object.values(priceData).map((category) => (
                <div key={category.id} className="flex items-center">
                  <TabsTrigger value={category.id} className="relative">
                    {category.name}
                    <span className="ml-2 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                      {category.items.length}
                    </span>
                  </TabsTrigger>
                  
                  {isAdmin && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0 ml-1 rounded-full"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Todos os itens desta categoria serão excluídos.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteCategory(category.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              ))}
            </TabsList>

            {Object.values(priceData).map((category) => (
              <TabsContent key={category.id} value={category.id}>
                <div className="rounded-xl overflow-hidden border border-border">
                  <Table>
                    {category.items.length === 0 && (
                      <TableCaption>Nenhum item cadastrado nesta categoria</TableCaption>
                    )}
                    <PriceTableHeader showActions={isAdmin} />
                    <TableBody>
                      <TableContent 
                        category={category} 
                        onDelete={isAdmin ? handleDeleteItem : undefined} 
                      />
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            ))}
          </Tabs>
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
      </div>
    </div>
  );
}
