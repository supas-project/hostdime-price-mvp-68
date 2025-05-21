import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { PriceCategory } from "@/types/pricing";
import { cn } from "@/lib/utils";
interface CategoryTabsProps {
  categories: PriceCategory[];
  isAdmin: boolean;
  onDeleteCategory: (categoryId: string) => void;
}
export function CategoryTabs({
  categories,
  isAdmin,
  onDeleteCategory
}: CategoryTabsProps) {
  const [tabsOffset, setTabsOffset] = useState(0);
  const maxOffset = Math.max(0, categories.length - getVisibleTabsCount());
  function getVisibleTabsCount() {
    // Estimar quantas abas podem ser mostradas com base na largura da tela
    if (typeof window === 'undefined') return 3; // Fallback para SSR

    const width = window.innerWidth;
    if (width < 640) return 2; // Mobile
    if (width < 768) return 3; // Small tablets
    if (width < 1024) return 4; // Tablets/Small laptops
    return 6; // Desktops
  }
  const handleNext = () => {
    setTabsOffset(prev => Math.min(prev + 1, maxOffset));
  };
  const handlePrev = () => {
    setTabsOffset(prev => Math.max(prev - 1, 0));
  };
  const visibleCategories = categories.slice(tabsOffset, tabsOffset + getVisibleTabsCount());
  const showNavButtons = categories.length > getVisibleTabsCount();
  return <div className="relative flex items-center mb-4">
      {showNavButtons && tabsOffset > 0 && <Button variant="outline" size="icon" className="absolute left-0 z-10 mr-1 h-7 w-7 rounded-full bg-background shadow-sm border-border" onClick={handlePrev}>
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Categorias anteriores</span>
        </Button>}
      
      <div className={cn("overflow-hidden flex-grow px-4", showNavButtons && tabsOffset > 0 && "ml-4", showNavButtons && tabsOffset < maxOffset && "mr-4")}>
        <TabsList className="flex w-full justify-start overflow-x-auto scrollbar-none">
          {visibleCategories.map(category => <div key={category.id} className="flex items-center">
              <TabsTrigger value={category.id} className="relative whitespace-nowrap py-0 my-0 mx-0 text-sm font-thin text-left rounded-none px-[7px]">
                {category.name}
                <span className="ml-2 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                  {category.items.length}
                </span>
              </TabsTrigger>
              
              {isAdmin && <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-1 rounded-full opacity-60 hover:opacity-100">
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
                      <AlertDialogAction onClick={() => onDeleteCategory(category.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>}
            </div>)}
        </TabsList>
      </div>
      
      {showNavButtons && tabsOffset < maxOffset && <Button variant="outline" size="icon" className="absolute right-0 z-10 ml-1 h-7 w-7 rounded-full bg-background shadow-sm border-border" onClick={handleNext}>
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Mais categorias</span>
        </Button>}
    </div>;
}