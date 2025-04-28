
import { Button } from "@/components/ui/button";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Trash2 } from "lucide-react";
import { PriceCategory } from "@/types/pricing";

interface CategoryTabsProps {
  categories: PriceCategory[];
  isAdmin: boolean;
  onDeleteCategory: (categoryId: string) => void;
}

export function CategoryTabs({ categories, isAdmin, onDeleteCategory }: CategoryTabsProps) {
  return (
    <TabsList className="mb-4 flex flex-wrap">
      {categories.map((category) => (
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
                    onClick={() => onDeleteCategory(category.id)}
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
  );
}
