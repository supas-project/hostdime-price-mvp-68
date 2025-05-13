
import { ComponentOption } from "@/types/component";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { SummaryCart } from "./summary-cart";
import { useIsMobile } from "@/hooks/use-mobile";
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
  
  // Count selected components to show in badge
  const componentCount = Object.keys(props.selectedComponents).length;

  if (isMobile) {
    return (
      <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              size="lg" 
              className="rounded-full shadow-lg flex items-center gap-2"
              style={{ zIndex: 1030 }}
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Ver Resumo</span>
              {componentCount > 0 && (
                <Badge variant="secondary" className="ml-1 bg-white text-primary">
                  {componentCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] z-[1050]" style={{ zIndex: 1050 }}>
            <div className="pt-4 max-h-[75vh] overflow-y-auto">
              <SummaryCart {...props} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  return (
    <div className="w-full md:sticky md:top-24 h-fit animate-fade-in">
      <SummaryCart {...props} />
    </div>
  );
}
