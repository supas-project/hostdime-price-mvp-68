
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CategoryForm } from "./forms/CategoryForm";
import { ItemForm } from "./forms/ItemForm";
import { BulkItemImport } from "./forms/BulkItemImport";
import { Plus, Download, RefreshCw, Upload } from "lucide-react";
import { PriceCategory, PriceItem } from "@/types/pricing";
import { HelpTooltip } from "@/components/help-tooltip";
import { useState } from "react";
interface TableActionsProps {
  activeTab: string;
  priceData: Record<string, PriceCategory>;
  openAddCategory: boolean;
  openAddItem: boolean;
  openEditItem: boolean;
  openBulkImport: boolean;
  itemToEdit?: PriceItem;
  setOpenAddCategory: (open: boolean) => void;
  setOpenAddItem: (open: boolean) => void;
  setOpenEditItem: (open: boolean) => void;
  setOpenBulkImport: (open: boolean) => void;
  setItemToEdit: (item?: PriceItem) => void;
  onAddCategory: (values: any) => void;
  onAddItem: (values: any) => void;
  onEditItem: (values: any, itemId?: string) => void;
  onBulkImport: (items: PriceItem[]) => Promise<{
    success: boolean;
    message: string;
    importedCount: number;
  }>;
  onExportData: () => void;
  onResetData: () => void;
}
export function TableActions({
  activeTab,
  priceData,
  openAddCategory,
  openAddItem,
  openEditItem,
  openBulkImport,
  itemToEdit,
  setOpenAddCategory,
  setOpenAddItem,
  setOpenEditItem,
  setOpenBulkImport,
  setItemToEdit,
  onAddCategory,
  onAddItem,
  onEditItem,
  onBulkImport,
  onExportData,
  onResetData
}: TableActionsProps) {
  // Handler para fechar o diálogo de edição e limpar o item
  const handleCloseEditDialog = () => {
    setOpenEditItem(false);
    // Pequeno delay para evitar animações estranhas
    setTimeout(() => {
      setItemToEdit(undefined);
    }, 300);
  };

  // Handler para submissão do formulário de edição
  const handleEditSubmit = (values: any, itemId?: string) => {
    onEditItem(values, itemId);
    handleCloseEditDialog();
  };
  return <div className="flex flex-wrap gap-2">
      <Dialog open={openAddCategory} onOpenChange={setOpenAddCategory}>
        <DialogTrigger asChild>
          <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Nova Categoria
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Nova Categoria</DialogTitle>
          </DialogHeader>
          <CategoryForm onSubmit={onAddCategory} />
        </DialogContent>
      </Dialog>

      {activeTab && <>
          <Dialog open={openAddItem} onOpenChange={setOpenAddItem}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Novo Item
                <HelpTooltip title="Adicionar item" description={`Adiciona um novo item à categoria ${priceData[activeTab]?.name || ''}`} />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg px-[43px] py-0 mx-0 my-0">
              <DialogHeader>
                <DialogTitle>Adicionar Item à {priceData[activeTab]?.name}</DialogTitle>
              </DialogHeader>
              <ItemForm onSubmit={onAddItem} defaultType={activeTab} />
            </DialogContent>
          </Dialog>
          
          <Dialog open={openBulkImport} onOpenChange={setOpenBulkImport}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                Importar Múltiplos
                <HelpTooltip title="Importar itens em massa" description={`Adiciona múltiplos itens à categoria ${priceData[activeTab]?.name || ''} via JSON`} />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Importar Itens em Massa para {priceData[activeTab]?.name}</DialogTitle>
              </DialogHeader>
              <BulkItemImport categoryId={activeTab} onImport={onBulkImport} onClose={() => setOpenBulkImport(false)} />
            </DialogContent>
          </Dialog>

          <Dialog open={openEditItem} onOpenChange={open => {
        if (!open) handleCloseEditDialog();
      }}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Editar Item na {priceData[activeTab]?.name}</DialogTitle>
              </DialogHeader>
              {itemToEdit && <ItemForm onSubmit={handleEditSubmit} item={itemToEdit} isEditing={true} />}
            </DialogContent>
          </Dialog>
        </>}

      <Button variant="outline" size="sm" onClick={onExportData} title="Exportar dados como JSON">
        <Download className="mr-2 h-4 w-4" />
        Exportar JSON
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" onClick={() => {}} className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600">
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
            <AlertDialogAction onClick={onResetData}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
}
