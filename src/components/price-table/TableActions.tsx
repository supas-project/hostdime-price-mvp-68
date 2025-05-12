
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { CategoryForm } from "./forms/CategoryForm";
import { ItemForm } from "./forms/ItemForm";
import { Plus, Download, RefreshCw, FileUp } from "lucide-react";
import { PriceCategory } from "@/types/pricing";
import { HelpTooltip } from "@/components/help-tooltip";

interface TableActionsProps {
  activeTab: string;
  priceData: Record<string, PriceCategory>;
  openAddCategory: boolean;
  openAddItem: boolean;
  setOpenAddCategory: (open: boolean) => void;
  setOpenAddItem: (open: boolean) => void;
  onAddCategory: (values: any) => void;
  onAddItem: (values: any) => void;
  onExportData: () => void;
  onResetData: () => void;
}

export function TableActions({
  activeTab,
  priceData,
  openAddCategory,
  openAddItem,
  setOpenAddCategory,
  setOpenAddItem,
  onAddCategory,
  onAddItem,
  onExportData,
  onResetData
}: TableActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
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

      {activeTab && (
        <Dialog open={openAddItem} onOpenChange={setOpenAddItem}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Novo Item
              <HelpTooltip 
                title="Adicionar item"
                description={`Adiciona um novo item à categoria ${priceData[activeTab]?.name || ''}`}
              />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Adicionar Item à {priceData[activeTab]?.name}</DialogTitle>
            </DialogHeader>
            <ItemForm onSubmit={onAddItem} defaultType={activeTab} />
          </DialogContent>
        </Dialog>
      )}

      <Button 
        variant="outline" 
        size="sm" 
        onClick={onExportData}
        title="Exportar dados como JSON"
      >
        <Download className="mr-2 h-4 w-4" />
        Exportar JSON
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            title="Restaurar dados para os valores padrão"
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
            <AlertDialogAction onClick={onResetData}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
