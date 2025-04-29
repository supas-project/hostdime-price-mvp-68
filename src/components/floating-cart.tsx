
import { ComponentOption } from "@/types/component";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { SummaryCart } from "./summary-cart";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface FloatingCartProps {
  selectedComponents: { [key: string]: ComponentOption };
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onComplete: () => void;
}

export function FloatingCart(props: FloatingCartProps) {
  const isMobile = useIsMobile();
  
  // Count items in cart
  const itemCount = Object.keys(props.selectedComponents).length;

  if (isMobile) {
    return (
      <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              size="lg" 
              className="rounded-full shadow-lg flex items-center gap-2"
            >
              <div className="relative">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                    {itemCount}
                  </Badge>
                )}
              </div>
              <span>Ver Resumo</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <div className="pt-4">
              <SummaryCart {...props} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  return (
    <div className={cn(
      "md:sticky md:top-24 h-fit animate-fade-in transition-all duration-200 ease-in-out",
      itemCount > 0 && "scale-105"
    )}>
      <SummaryCart {...props} />
    </div>
  );
}
