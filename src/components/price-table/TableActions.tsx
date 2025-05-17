
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CategoryForm } from "./forms/CategoryForm";
import { ItemForm } from "./forms/ItemForm";
import { Plus, Download } from "lucide-react";
import { PriceCategory, PriceItem } from "@/types/pricing";
import { HelpTooltip } from "@/components/help-tooltip";

interface TableActionsProps {
  activeTab: string;
  priceData: Record<string, PriceCategory>;
  openAddCategory: boolean;
  openAddItem: boolean;
  openEditItem: boolean;
  itemToEdit?: PriceItem;
  setOpenAddCategory: (open: boolean) => void;
  setOpenAddItem: (open: boolean) => void;
  setOpenEditItem: (open: boolean) => void;
  setItemToEdit: (item?: PriceItem) => void;
  onAddCategory: (values: any) => void;
  onAddItem: (values: any) => void;
  onEditItem: (values: any, itemId?: string) => void;
  onExportData: () => void;
  onResetData: () => void;
}

export function TableActions({
  activeTab,
  priceData,
  openAddCategory,
  openAddItem,
  openEditItem,
  itemToEdit,
  setOpenAddCategory,
  setOpenAddItem,
  setOpenEditItem,
  setItemToEdit,
  onAddCategory,
  onAddItem,
  onEditItem,
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
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Adicionar Item à {priceData[activeTab]?.name}</DialogTitle>
              </DialogHeader>
              <ItemForm onSubmit={onAddItem} defaultType={activeTab} />
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

      {/* Opção "Restaurar Padrões" removida conforme solicitado */}
    </div>;
}
