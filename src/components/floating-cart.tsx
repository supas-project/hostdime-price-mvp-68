
import { ComponentOption } from "@/data/server-components";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { SummaryCart } from "./summary-cart";
import { useMobile } from "@/hooks/use-mobile";

interface FloatingCartProps {
  selectedComponents: { [key: string]: ComponentOption };
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onComplete: () => void;
}

export function FloatingCart(props: FloatingCartProps) {
  const isMobile = useMobile();

  if (isMobile) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="lg" className="rounded-full shadow-lg">
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SummaryCart {...props} />
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  return (
    <div className="md:sticky md:top-24 h-fit animate-fade-in">
      <SummaryCart {...props} />
    </div>
  );
}
